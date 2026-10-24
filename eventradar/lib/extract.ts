import { GoogleGenAI } from "@google/genai";
import { extractionResultSchema, type ExtractedEvent } from "./types";
import type { MarkdownPage } from "./tinyfish";

// Gemini handles step D (extraction). Model is overridable via GEMINI_MODEL;
// gemini-2.5-flash is fast and available on the free tier.
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const MAX_TEXT_CHARS = 14_000; // cap page text to keep latency/tokens bounded
const MAX_LINKS = 60;

let _client: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set — add it to .env.local (get one at https://aistudio.google.com/apikey)"
    );
  }
  if (!_client) {
    _client = new GoogleGenAI({ apiKey });
  }
  return _client;
}

const SYSTEM = `You extract structured tech-event listings from a single web page.
Return ONLY a JSON object: {"events": Event[]}. No prose, no markdown fences.

Each Event:
{
  "name": string,
  "start_date": string|null,   // ISO YYYY-MM-DD
  "end_date": string|null,     // ISO YYYY-MM-DD
  "date_text": string,         // the raw date text exactly as printed
  "mode": "online"|"offline"|"hybrid"|null,
  "venue_or_city": string|null,
  "event_type": "hackathon"|"meetup"|"conference"|"workshop"|"other",
  "themes": string[],          // short tags/topics, [] if none
  "eligibility": string|null,
  "registration_url": string|null,
  "source_url": string|null    // canonical link to THIS event's own page
}

RULES:
- Use ONLY text present in the page. If a field is absent, return null.
- Never guess dates or eligibility. If a date is ambiguous, set start_date/end_date to null but still copy the raw text into date_text.
- Prefer a URL from the provided links list for registration_url / source_url; pick the link that points at the specific event.
- Return every distinct upcoming event you can find (aim for the listed ones), not a summary.
- If the page is an error page, a login wall, a captcha, or has no events, return {"events": []}.`;

function buildUserContent(page: MarkdownPage): string {
  const text = page.text.slice(0, MAX_TEXT_CHARS);
  const links = page.links.slice(0, MAX_LINKS);
  return [
    `PAGE URL: ${page.url}`,
    page.title ? `PAGE TITLE: ${page.title}` : "",
    "",
    "PAGE CONTENT (markdown):",
    text,
    "",
    "LINKS ON PAGE:",
    links.join("\n"),
  ]
    .filter(Boolean)
    .join("\n");
}

/** Strip accidental ```json fences and grab the outermost JSON object. */
function coerceJson(raw: string): string {
  let s = raw.trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) s = s.slice(start, end + 1);
  return s;
}

async function callModel(content: string, strictRepair = false): Promise<string> {
  const ai = getGemini();
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: content,
    config: {
      systemInstruction: strictRepair
        ? SYSTEM +
          "\n\nYour previous reply was not valid JSON. Return ONLY the JSON object."
        : SYSTEM,
      // Ask Gemini for raw JSON — no markdown fences.
      responseMimeType: "application/json",
      temperature: 0,
      maxOutputTokens: 4096,
    },
  });
  return (response.text ?? "").trim();
}

/**
 * Pipeline step D: extract events from one page. Validates with zod and retries
 * once on invalid JSON, then gives up (returns []) so a bad page is skipped
 * rather than failing the request.
 */
export async function extractFromPage(
  page: MarkdownPage
): Promise<ExtractedEvent[]> {
  if (!page.text || page.text.trim().length < 20) return [];
  const content = buildUserContent(page);

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const raw = await callModel(content, attempt > 0);
      const parsed = extractionResultSchema.safeParse(
        JSON.parse(coerceJson(raw))
      );
      if (parsed.success) {
        // Default source_url to the page URL when the model didn't supply one.
        return parsed.data.events.map((e) => ({
          ...e,
          source_url: e.source_url ?? page.url,
        }));
      }
    } catch {
      // fall through to retry / give up
    }
  }
  return [];
}
