import express from 'express';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  classifyErrorStatus,
  createApp,
  errorHandler,
  resolveClientDir,
} from '../../src/server/app';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createApp static client', () => {
  it('serves index.html for non-API routes when the client build exists', async () => {
    // Default client dir resolves to src/client in tests, which exists.
    const app = createApp();
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('id="root"');
  });

  it('routes unknown API paths to the JSON 404 handler', async () => {
    const app = createApp();
    const res = await request(app).get('/api/unknown');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });

  it('skips the static layer and 404s when the client build is absent', async () => {
    const app = createApp({ clientDir: '/no/such/client/dir' });
    const res = await request(app).get('/');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });
});

describe('error handling', () => {
  it('returns a 400 "Request error" for malformed JSON bodies', async () => {
    const app = createApp();
    const res = await request(app)
      .post('/api/health')
      .set('Content-Type', 'application/json')
      .send('{ not valid json');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Request error' });
  });

  it('returns a 500 "Internal server error" and logs for unexpected throws', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const app = express();
    app.get('/boom', () => {
      throw new Error('kaboom');
    });
    app.use(errorHandler);

    const res = await request(app).get('/boom');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Internal server error' });
    expect(consoleSpy).toHaveBeenCalledOnce();
  });
});

describe('classifyErrorStatus', () => {
  it('honours a numeric status', () => {
    expect(classifyErrorStatus({ status: 429 })).toBe(429);
  });

  it('defaults to 500 for non-numeric or missing status', () => {
    expect(classifyErrorStatus({ status: 'nope' })).toBe(500);
    expect(classifyErrorStatus(null)).toBe(500);
    expect(classifyErrorStatus(new Error('x'))).toBe(500);
  });
});

describe('resolveClientDir', () => {
  it('resolves a sibling client directory', () => {
    expect(resolveClientDir().replace(/\\/g, '/')).toMatch(/\/client$/);
  });
});
