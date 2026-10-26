import { describe, expect, it } from 'vitest';
import { parseProfileUrl } from '@/lib/url';

const ID = '7308881d-94e0-4843-ae8a-40753fe95f60';
const CANON = `https://www.skills.google/public_profiles/${ID}`;

describe('parseProfileUrl', () => {
  it.each([
    [`https://www.skills.google/public_profiles/${ID}`],
    [`https://skills.google/public_profiles/${ID}`],
    [`https://www.cloudskillsboost.google/public_profiles/${ID}`],
    [`https://cloudskillsboost.google/public_profiles/${ID}/`],
    [`  https://www.skills.google/public_profiles/${ID}?locale=fr#badges  `],
    [`www.skills.google/public_profiles/${ID}`],
  ])('accepts and normalizes %s', (input) => {
    expect(parseProfileUrl(input)).toEqual({ ok: true, profileId: ID, normalizedUrl: CANON });
  });

  it('lowercases the profile id', () => {
    const r = parseProfileUrl(`https://skills.google/public_profiles/${ID.toUpperCase()}`);
    expect(r).toMatchObject({ ok: true, profileId: ID });
  });

  it.each([
    [''],
    ['not a url'],
    [`http://www.skills.google/public_profiles/${ID}`],
    [`https://evil.com/public_profiles/${ID}`],
    [`https://skills.google.evil.com/public_profiles/${ID}`],
    [`https://evil.com/?u=https://skills.google/public_profiles/${ID}`],
    [`https://user:pw@skills.google/public_profiles/${ID}`],
    [`https://skills.google:8443/public_profiles/${ID}`],
    [`https://127.0.0.1/public_profiles/${ID}`],
    ['https://www.skills.google/public_profiles/not-a-uuid'],
    [`https://www.skills.google/public_profiles/${ID}/badges/1`],
    [`https://www.skills.google/paths/12`],
  ])('rejects %s', (input) => {
    expect(parseProfileUrl(input)).toEqual({ ok: false });
  });
});
