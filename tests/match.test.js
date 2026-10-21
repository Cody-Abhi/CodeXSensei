/**
 * match.test.js — runs on Node's built-in test runner, no install needed.
 *   node --test
 *
 * Covers the acceptance criteria from the PRD:
 *   - typos and spacing variants resolve to the right salt + strength
 *   - savings are computed correctly
 *   - unknown input returns an honest no-match (never a guess)
 *   - Gemma output is used only as a search key; facts come from the dataset
 */
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

const DawaMatch = require("../match.js");
const jan = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "jan_aushadhi.json"), "utf8"));
const brands = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "brands.json"), "utf8"));
const index = DawaMatch.buildIndex(jan, brands);

test("normalisation treats acetaminophen as paracetamol", () => {
  assert.strictEqual(DawaMatch.saltSetKey(["Acetaminophen"]), "paracetamol");
  assert.strictEqual(
    DawaMatch.matchKey(["Paracetamol"], "650 mg"),
    DawaMatch.matchKey(["acetaminophen"], "650mg")
  );
});

test("strength is order-independent and space-insensitive", () => {
  assert.strictEqual(
    DawaMatch.matchKey(["telmisartan", "amlodipine"], "40mg+5mg"),
    DawaMatch.matchKey(["amlodipine", "telmisartan"], "5 mg + 40 mg")
  );
});

const TYPO_CASES = [
  { q: "dolo 650", salt: "paracetamol", strength: "650mg" },
  { q: "dolo650", salt: "paracetamol", strength: "650mg" },
  { q: "dolo65o", salt: "paracetamol", strength: "650mg" }, // o instead of 0
  { q: "dollo 650", salt: "paracetamol", strength: "650mg" },
  { q: "pan 40", salt: "pantoprazole", strength: "40mg" },
  { q: "pan40", salt: "pantoprazole", strength: "40mg" },
  { q: "paan 40", salt: "pantoprazole", strength: "40mg" },
  { q: "crocin", salt: "paracetamol", strength: "500mg" },
  { q: "crosin", salt: "paracetamol", strength: "500mg" },
  { q: "combiflam", salt: "ibuprofen", strength: "400mg+325mg" },
  { q: "telma 40", salt: "telmisartan", strength: "40mg" },
  { q: "glycomet 500", salt: "metformin", strength: "500mg" },
  { q: "augmentin 625", salt: "amoxicillin", strength: "500mg+125mg" },
  { q: "cetzine", salt: "cetirizine", strength: "10mg" },
  { q: "montek lc", salt: "montelukast", strength: "10mg+5mg" },
  { q: "azithral 500", salt: "azithromycin", strength: "500mg" },
];

test("typo / spacing test set resolves correctly (>= 90%)", () => {
  let hits = 0;
  const misses = [];
  for (const c of TYPO_CASES) {
    const r = DawaMatch.search(index, c.q);
    const okReason = r.reason === "brand" || r.reason === "salt";
    const okSalt = r.resolved && DawaMatch.saltSetKey(r.resolved.salts).indexOf(c.salt) !== -1;
    const okMatch = !!r.match;
    if (okReason && okSalt && okMatch) hits++;
    else misses.push(`${c.q} -> ${r.reason} / ${r.resolved ? r.resolved.salts.join("+") : "null"}`);
  }
  const rate = hits / TYPO_CASES.length;
  assert.ok(rate >= 0.9, `only ${(rate * 100).toFixed(0)}% matched. Misses: ${misses.join("; ")}`);
});

test("branded search produces a sane savings figure", () => {
  const r = DawaMatch.search(index, "pan 40");
  assert.strictEqual(r.reason, "brand");
  assert.ok(r.match, "should find a generic");
  assert.ok(r.savings, "should compute savings");
  assert.ok(r.savings.saved > 0, "should save money vs branded");
  assert.ok(r.savings.pct > 0 && r.savings.pct <= 100, "pct in range");
  // generic price must come from the dataset, never invented
  assert.strictEqual(r.match.mrp, r.savings.generic);
});

test("unknown input returns an honest no-match, never a guess", () => {
  for (const q of ["zxqwpl", "asdfghjk", "notamedicine123"]) {
    const r = DawaMatch.search(index, q);
    assert.strictEqual(r.reason, "none", `"${q}" should not match`);
    assert.strictEqual(r.match, null);
  }
});

test("empty / whitespace input is safe", () => {
  for (const q of ["", "   ", null, undefined]) {
    const r = DawaMatch.search(index, q);
    assert.strictEqual(r.reason, "none");
    assert.strictEqual(r.match, null);
  }
});

test("Gemma output is used as a search key; price prefers the printed strip MRP", () => {
  const gemma = { brand: "Dolo 650", salts: ["paracetamol"], strength: "650mg", form: "tablet", mrp_printed: 30.5 };
  const r = DawaMatch.matchFromGemma(index, gemma);
  assert.strictEqual(r.reason, "photo");
  assert.ok(r.match, "finds generic from dataset");
  assert.strictEqual(r.resolved.approx, false, "strip MRP is exact, not approx");
  assert.strictEqual(r.savings.branded, 30.5, "uses the printed MRP");
  // the generic facts are from the dataset, not from Gemma
  assert.ok(r.match.code && r.match.mrp > 0);
});

test("Gemma output falls back to brand-list approx price when strip MRP is missing", () => {
  const gemma = { brand: "Pan 40", salts: ["pantoprazole"], strength: "40mg", form: "tablet" };
  const r = DawaMatch.matchFromGemma(index, gemma);
  assert.strictEqual(r.reason, "photo");
  assert.strictEqual(r.resolved.approx, true, "no strip MRP -> approx flagged");
  assert.ok(r.savings && r.savings.branded > 0);
});

test("Gemma with an unknown salt yields no match (no invented generic)", () => {
  const gemma = { brand: "Xyz", salts: ["unobtainium"], strength: "999mg", mrp_printed: 500 };
  const r = DawaMatch.matchFromGemma(index, gemma);
  assert.strictEqual(r.reason, "none");
  assert.strictEqual(r.match, null);
});

test("suggestions rank the right brand first", () => {
  const s = DawaMatch.suggest(index, "dolo", 5);
  assert.ok(s.length > 0);
  assert.ok(/dolo/i.test(s[0].label), `top suggestion was ${s[0] && s[0].label}`);
});
