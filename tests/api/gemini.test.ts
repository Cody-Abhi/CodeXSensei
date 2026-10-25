import { afterEach, describe, expect, it, vi } from 'vitest';

const { generateContentMock, ctorMock } = vi.hoisted(() => ({
  generateContentMock: vi.fn(),
  ctorMock: vi.fn(),
}));

vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    models = { generateContent: generateContentMock };
    constructor(opts: unknown) {
      ctorMock(opts);
    }
  },
  Type: {
    OBJECT: 'OBJECT',
    STRING: 'STRING',
    ARRAY: 'ARRAY',
    INTEGER: 'INTEGER',
    BOOLEAN: 'BOOLEAN',
  },
}));

import {
  createGeminiClient,
  createGeminiFromEnv,
  PLAN_RESPONSE_SCHEMA,
} from '../../src/server/services/gemini';

const baseArgs = {
  system: 'sys',
  user: 'user',
  schema: PLAN_RESPONSE_SCHEMA,
  temperature: 0.3,
  maxOutputTokens: 1024,
};

afterEach(() => {
  vi.clearAllMocks();
  delete process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_MODEL;
});

describe('createGeminiClient', () => {
  it('parses JSON text and forwards config', async () => {
    generateContentMock.mockResolvedValue({ text: '{"ok":true}' });
    const client = createGeminiClient('key-123', 'gemini-2.5-flash');
    const out = await client.generateJson({ ...baseArgs, signal: new AbortController().signal });
    expect(out).toEqual({ ok: true });
    expect(ctorMock).toHaveBeenCalledWith({ apiKey: 'key-123' });
    const callArg = generateContentMock.mock.calls[0]?.[0] as {
      model: string;
      config: { responseMimeType: string };
    };
    expect(callArg.model).toBe('gemini-2.5-flash');
    expect(callArg.config.responseMimeType).toBe('application/json');
  });

  it('works without an abort signal', async () => {
    generateContentMock.mockResolvedValue({ text: '{"a":1}' });
    const client = createGeminiClient('k', 'm');
    expect(await client.generateJson(baseArgs)).toEqual({ a: 1 });
  });

  it('throws when the response has no text', async () => {
    generateContentMock.mockResolvedValue({});
    const client = createGeminiClient('k', 'm');
    await expect(client.generateJson(baseArgs)).rejects.toThrow();
  });
});

describe('createGeminiFromEnv', () => {
  it('returns null when no key is set', () => {
    expect(createGeminiFromEnv()).toBeNull();
  });

  it('returns a client when a key is set', () => {
    process.env.GEMINI_API_KEY = 'secret';
    expect(createGeminiFromEnv()).not.toBeNull();
    expect(ctorMock).toHaveBeenCalledWith({ apiKey: 'secret' });
  });
});
