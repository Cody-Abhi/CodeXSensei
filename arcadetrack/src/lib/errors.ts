import type { ErrorCode } from './types';

const STATUS: Record<Exclude<ErrorCode, 'NETWORK'>, number> = {
  INVALID_URL: 400,
  PROFILE_PRIVATE_OR_NOT_FOUND: 404,
  FETCH_TIMEOUT: 504,
  PARSE_FAILED: 502,
  RATE_LIMITED: 429,
  UPSTREAM_ERROR: 502,
};

export class ApiError extends Error {
  readonly status: number;
  constructor(
    readonly code: Exclude<ErrorCode, 'NETWORK'>,
    message: string,
  ) {
    super(message);
    this.status = STATUS[code];
  }
}
