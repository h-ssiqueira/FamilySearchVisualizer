export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized');
    this.name = 'UnauthorizedError';
  }
}

export class MissingTokenError extends Error {
  constructor() {
    super('No token available');
    this.name = 'MissingTokenError';
  }
}

export class NotAllowedError extends Error {
  constructor() {
    super('Request not on the allow-list');
    this.name = 'NotAllowedError';
  }
}

/** Restricted, private or missing person (HTTP 403 or 404). */
export class UnavailableError extends Error {
  readonly status: number;
  constructor(status: number) {
    super(`Unavailable (${status})`);
    this.name = 'UnavailableError';
    this.status = status;
  }
}

export class HttpError extends Error {
  readonly status: number;
  constructor(status: number) {
    super(`Unexpected HTTP status ${status}`);
    this.name = 'HttpError';
    this.status = status;
  }
}

/** Names the invalid fields only: never the values, which may be personal data. */
export class SchemaError extends Error {
  readonly paths: string[];
  constructor(paths: string[]) {
    super(`Unexpected response shape at: ${paths.join(', ') || '(root)'}`);
    this.name = 'SchemaError';
    this.paths = paths;
  }
}

/** HTTP 429 or 503: the queue must pause for `retryAfterMs` (FamilySearch throttles per user). */
export class RetryAfterError extends Error {
  readonly retryAfterMs: number;
  constructor(retryAfterMs: number) {
    super(`Throttled, retry after ${retryAfterMs} ms`);
    this.name = 'RetryAfterError';
    this.retryAfterMs = retryAfterMs;
  }
}
