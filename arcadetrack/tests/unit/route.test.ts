import { describe, expect, it } from 'vitest';
import { GET } from '@/app/api/profile/route';

const call = (url: string, ip = '1.1.1.1') =>
  GET(new Request(`http://localhost/api/profile?url=${encodeURIComponent(url)}`, { headers: { 'x-forwarded-for': ip } }));

describe('GET /api/profile', () => {
  it('rejects non-Google hosts with INVALID_URL (SSRF guard)', async () => {
    const res = await call('http://169.254.169.254/latest/meta-data');
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe('INVALID_URL');
  });

  it('rejects a missing url', async () => {
    const res = await GET(new Request('http://localhost/api/profile', { headers: { 'x-forwarded-for': '2.2.2.2' } }));
    expect(res.status).toBe(400);
  });

  it('rate limits at 10 requests/min/IP', async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 11; i++) statuses.push((await call('https://evil.com', '3.3.3.3')).status);
    expect(statuses.slice(0, 10).every((s) => s === 400)).toBe(true);
    expect(statuses[10]).toBe(429);
  });
});
