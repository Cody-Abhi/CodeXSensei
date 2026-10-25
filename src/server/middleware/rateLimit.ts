import rateLimit, { type RateLimitRequestHandler } from 'express-rate-limit';

/**
 * Rate limiter for AI routes: N requests per minute per IP, friendly JSON 429
 * (PRD §9). The default comes from `RATE_LIMIT_PER_MIN` (fallback 20).
 *
 * @param perMinute - Allowed requests per minute per IP.
 * @returns An Express rate-limit middleware.
 */
export function createAiRateLimiter(
  perMinute: number = Number(process.env.RATE_LIMIT_PER_MIN ?? 20),
): RateLimitRequestHandler {
  return rateLimit({
    windowMs: 60_000,
    limit: perMinute,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({ error: 'Too many requests. Please wait a minute and try again.' });
    },
  });
}
