/**
 * read-strip — DigitalOcean Function (Node 18).
 *
 * POST an image/jpeg of a PRINTED medicine strip or box. Gemma 4 (via the
 * Gemini API) reads the printed text and returns strict JSON:
 *
 *   { brand, salts: [], strength, form, mrp_printed, handwriting }
 *
 * The golden rule (enforced by the prompt and validated here): Gemma only
 * READS printed text. It never invents a drug, salt, strength or price, and
 * never gives medical advice. Its output is used by the browser only as a
 * search key into the bundled Jan Aushadhi data.
 *
 * Secrets: GEMINI_API_KEY lives only in the Function env, never in the browser.
 *
 * Deployed as a `raw` web function (see project.yml), so it receives the raw
 * request and returns { statusCode, headers, body }.
 */

"use strict";

// Target model for the "Best Use of Gemma 4" track. Overridable via env in
// case the exact published model id differs at deploy time (e.g. gemma-3-27b-it).
var MODEL = process.env.GEMMA_MODEL || "gemma-4-26b-a4b-it";
var GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models/";
var MAX_BYTES = 2 * 1024 * 1024; // 2 MB
var UPSTREAM_TIMEOUT_MS = 12000;

var PROMPT = [
  "You are reading a photograph of a PRINTED Indian medicine strip or box.",
  "Extract ONLY text that is actually printed in the image.",
  "",
  "Return a SINGLE JSON object and nothing else (no markdown, no prose), with keys:",
  '  "brand": string | null        // the brand name printed, e.g. "Dolo 650"',
  '  "salts": string[]             // active molecule names as generic salts, lowercase, e.g. ["paracetamol"]',
  '  "strength": string | null     // e.g. "650mg", or a combo "40mg+5mg", matching salts order',
  '  "form": string | null         // one of: tablet, capsule, syrup, injection, drops, cream, other',
  '  "mrp_printed": number | null  // the MRP in rupees printed on the strip, digits only, else null',
  '  "handwriting": boolean        // true ONLY if the image is a handwritten prescription',
  "",
  "Rules:",
  "- If a field is not clearly printed, use null (or [] for salts). Do NOT guess.",
  "- NEVER invent a drug name, salt, strength or price that is not printed.",
  "- Do NOT give dosage, side-effect or any medical advice.",
  "- If the image is a handwritten prescription, set handwriting=true and leave the rest null.",
  "Respond with the JSON object only.",
].join("\n");

function response(statusCode, obj, extraHeaders) {
  var headers = Object.assign(
    {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Cache-Control": "no-store",
    },
    extraHeaders || {}
  );
  return { statusCode: statusCode, headers: headers, body: JSON.stringify(obj) };
}

// Pull the raw image bytes out of the DO function args (raw web function).
function readBody(args) {
  var body = args.__ow_body;
  var headers = args.__ow_headers || {};
  var isBase64 = String(headers["content-transfer-encoding"] || "").toLowerCase() === "base64" ||
    args.__ow_isBase64Encoded === true;
  if (body == null) return null;
  if (typeof body === "string") {
    // DO base64-encodes binary bodies for raw web functions.
    return Buffer.from(body, isBase64 ? "base64" : "base64");
  }
  if (Buffer.isBuffer(body)) return body;
  return null;
}

// Extract the first balanced JSON object from a text blob (Gemma may wrap it).
function extractJson(text) {
  if (!text) return null;
  var fenced = text.replace(/```(?:json)?/gi, "").trim();
  var start = fenced.indexOf("{");
  if (start === -1) return null;
  var depth = 0;
  for (var i = start; i < fenced.length; i++) {
    var c = fenced[i];
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) {
        try { return JSON.parse(fenced.slice(start, i + 1)); }
        catch (e) { return null; }
      }
    }
  }
  return null;
}

// Normalise and validate the model output into our contract shape.
function shape(parsed) {
  if (!parsed || typeof parsed !== "object") return null;
  var salts = Array.isArray(parsed.salts)
    ? parsed.salts.map(function (s) { return String(s).trim().toLowerCase(); }).filter(Boolean)
    : [];
  var mrp = parsed.mrp_printed;
  if (typeof mrp === "string") { var n = parseFloat(mrp.replace(/[^0-9.]/g, "")); mrp = isFinite(n) ? n : null; }
  if (typeof mrp !== "number" || !isFinite(mrp) || mrp <= 0) mrp = null;
  return {
    brand: parsed.brand ? String(parsed.brand).trim() : null,
    salts: salts,
    strength: parsed.strength ? String(parsed.strength).trim() : null,
    form: parsed.form ? String(parsed.form).trim().toLowerCase() : null,
    mrp_printed: mrp,
    handwriting: parsed.handwriting === true,
  };
}

async function callGemma(base64Image, apiKey) {
  var url = GEMINI_BASE + encodeURIComponent(MODEL) + ":generateContent?key=" + encodeURIComponent(apiKey);
  var payload = {
    contents: [
      {
        role: "user",
        parts: [
          { inline_data: { mime_type: "image/jpeg", data: base64Image } },
          { text: PROMPT },
        ],
      },
    ],
    generationConfig: { temperature: 0, maxOutputTokens: 512 },
  };

  var controller = new AbortController();
  var timer = setTimeout(function () { controller.abort(); }, UPSTREAM_TIMEOUT_MS);
  var res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 429) { var e = new Error("rate-limited"); e.code = 429; throw e; }
  if (!res.ok) {
    var txt = await res.text().catch(function () { return ""; });
    var err = new Error("upstream-" + res.status + ": " + txt.slice(0, 200));
    err.code = 502;
    throw err;
  }
  var data = await res.json();
  var text =
    data &&
    data.candidates &&
    data.candidates[0] &&
    data.candidates[0].content &&
    data.candidates[0].content.parts &&
    data.candidates[0].content.parts.map(function (p) { return p.text || ""; }).join("");
  return text || "";
}

async function main(args) {
  var method = (args.__ow_method || "post").toLowerCase();
  if (method === "options") return response(204, {});
  if (method !== "post") return response(405, { error: "method-not-allowed" });

  var apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return response(500, { error: "server-misconfigured", detail: "GEMINI_API_KEY not set" });

  var bytes = readBody(args);
  if (!bytes || bytes.length === 0) return response(400, { error: "no-image" });
  if (bytes.length > MAX_BYTES) return response(413, { error: "too-big", max_bytes: MAX_BYTES });

  var base64Image = bytes.toString("base64");

  try {
    var text = await callGemma(base64Image, apiKey);
    var parsed = shape(extractJson(text));
    if (!parsed) return response(422, { error: "unreadable" });
    if (parsed.handwriting) return response(200, { handwriting: true });
    if (parsed.salts.length === 0 && !parsed.brand) return response(422, { error: "unreadable" });
    return response(200, parsed);
  } catch (err) {
    if (err.name === "AbortError") return response(504, { error: "timeout" });
    if (err.code === 429) return response(429, { error: "rate-limited" });
    return response(502, { error: "upstream-failure" });
  }
}

exports.main = main;
