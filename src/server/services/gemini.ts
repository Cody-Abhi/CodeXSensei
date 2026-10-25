import { GoogleGenAI, Type } from '@google/genai';

/** Arguments for a single JSON generation call. */
export interface GenerateJsonArgs {
  system: string;
  user: string;
  schema: unknown;
  temperature: number;
  maxOutputTokens: number;
  signal?: AbortSignal;
}

/**
 * Narrow client interface so the plan service can be unit-tested with a fake —
 * the real Gemini API is never called in tests (PRD §12).
 */
export interface GeminiJsonClient {
  generateJson(args: GenerateJsonArgs): Promise<unknown>;
}

/** Gemini response schema for a {@link Plan}. */
export const PLAN_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    budget: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          amountMinor: { type: Type.INTEGER },
          rationale: { type: Type.STRING },
        },
        required: ['category', 'amountMinor', 'rationale'],
      },
    },
    timeline: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          dueDate: { type: Type.STRING },
          phase: { type: Type.STRING },
          done: { type: Type.BOOLEAN },
        },
        required: ['id', 'title', 'dueDate', 'phase', 'done'],
      },
    },
    vendors: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          category: { type: Type.STRING },
          name: { type: Type.STRING },
          why: { type: Type.STRING },
          askThem: { type: Type.STRING },
          status: { type: Type.STRING, enum: ['to_find', 'contacted', 'booked'] },
          costMinor: { type: Type.INTEGER },
        },
        required: ['id', 'category', 'name', 'why', 'askThem', 'status'],
      },
    },
    ideas: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          category: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
        },
        required: ['id', 'category', 'title', 'description'],
      },
    },
  },
  required: ['summary', 'budget', 'timeline', 'vendors', 'ideas'],
};

/**
 * Wrap `@google/genai` as a {@link GeminiJsonClient}. The response is parsed
 * from the model's text, which is JSON because `responseMimeType` is set.
 *
 * @param apiKey - Server-side Gemini API key.
 * @param model - Model id (e.g. `gemini-2.5-flash`).
 * @returns A JSON client.
 */
export function createGeminiClient(apiKey: string, model: string): GeminiJsonClient {
  const ai = new GoogleGenAI({ apiKey });
  return {
    async generateJson({ system, user, schema, temperature, maxOutputTokens, signal }) {
      const response = await ai.models.generateContent({
        model,
        contents: user,
        config: {
          systemInstruction: system,
          responseMimeType: 'application/json',
          responseSchema: schema,
          temperature,
          maxOutputTokens,
          ...(signal ? { abortSignal: signal } : {}),
        },
      });
      const text = response.text ?? '';
      return JSON.parse(text);
    },
  };
}

/**
 * Build a Gemini client from the environment, or `null` when no key is set
 * (the plan service then uses the local fallback). The key stays server-side.
 *
 * @returns A client, or `null` when `GEMINI_API_KEY` is unset.
 */
export function createGeminiFromEnv(): GeminiJsonClient | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  const model = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';
  return createGeminiClient(apiKey, model);
}
