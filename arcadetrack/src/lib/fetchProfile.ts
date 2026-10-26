import { z } from 'zod';
import type { ErrorCode, ProfilePayload } from './types';

const payloadSchema = z.object({
  profileId: z.string(),
  name: z.string(),
  avatar: z.string(),
  memberSince: z.string().nullable(),
  fetchedAt: z.string(),
  badges: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      imageUrl: z.string(),
      badgeUrl: z.string().optional(),
      earnedAt: z.string().nullable(),
    }),
  ),
});

export class ClientError extends Error {
  constructor(
    readonly code: ErrorCode,
    message: string,
  ) {
    super(message);
  }
}

export async function fetchProfile(url: string, opts: { refresh?: boolean } = {}): Promise<ProfilePayload> {
  const qs = new URLSearchParams({ url });
  if (opts.refresh) qs.set('refresh', '1');

  let res: Response;
  try {
    res = await fetch(`/api/profile?${qs}`);
  } catch {
    throw new ClientError('NETWORK', 'Network problem: could not reach the server.');
  }

  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const err = (body as { error?: { code?: ErrorCode; message?: string } } | null)?.error;
    throw new ClientError(err?.code ?? 'UPSTREAM_ERROR', err?.message ?? 'Unexpected server response.');
  }
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) throw new ClientError('PARSE_FAILED', 'The server returned data in an unexpected shape.');
  return parsed.data;
}
