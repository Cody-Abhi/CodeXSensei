import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import compression from 'compression';
import express, { type Express, type NextFunction, type Request, type Response } from 'express';
import helmet from 'helmet';

import { healthRouter } from './routes/health';

/** Maximum accepted JSON body size (PRD §9). */
const BODY_LIMIT = '20kb';

/**
 * Resolve the directory holding the built client (`dist/client`). When running
 * from the bundled server (`dist/server/index.js`) it sits alongside at
 * `../client`.
 *
 * @returns Absolute path to the client build directory.
 */
export function resolveClientDir(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(here, '../client');
}

/**
 * Map an unknown thrown value to an HTTP status code. Values carrying a numeric
 * `status` (e.g. body-parser errors) are honoured; everything else is 500.
 *
 * @param err - The thrown value.
 * @returns The HTTP status code to respond with.
 */
export function classifyErrorStatus(err: unknown): number {
  const status = (err as { status?: unknown } | null)?.status;
  return typeof status === 'number' ? status : 500;
}

/**
 * Centralised Express error handler. Never leaks stack traces to clients and
 * logs only server-side (5xx) errors.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const status = classifyErrorStatus(err);
  if (status >= 500) {
    console.error('Unhandled error:', err);
  }
  res.status(status).json({ error: status >= 500 ? 'Internal server error' : 'Request error' });
}

/** Terminal 404 handler returning JSON. */
export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: 'Not found' });
}

/**
 * Apply Helmet with a strict Content-Security-Policy. `upgrade-insecure-requests`
 * is intentionally omitted so the app works over plain HTTP locally and in E2E;
 * TLS is terminated by Cloud Run in production and enforced via HSTS.
 *
 * @param app - The Express application to configure.
 */
function applySecurity(app: Express): void {
  app.disable('x-powered-by');
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: false,
        directives: {
          defaultSrc: ["'self'"],
          baseUri: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:'],
          fontSrc: ["'self'", 'data:'],
          connectSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
          formAction: ["'self'"],
          manifestSrc: ["'self'"],
        },
      },
      hsts: { maxAge: 15552000, includeSubDomains: true },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      crossOriginEmbedderPolicy: false,
    }),
  );
}

/**
 * Serve the static client build with an SPA fallback, when the build directory
 * exists. Non-API GETs return `index.html`; API paths fall through to the API
 * 404 handler.
 *
 * @param app - The Express application.
 * @param clientDir - Absolute path to the built client.
 */
function serveClient(app: Express, clientDir: string): void {
  app.use(express.static(clientDir, { index: false, maxAge: '1h' }));
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api/')) {
      next();
      return;
    }
    res.sendFile(path.join(clientDir, 'index.html'));
  });
}

/**
 * Create and configure the Express application. Exported as a factory so tests
 * can exercise it with Supertest without opening a port.
 *
 * @param clientDir - Directory of the built client; defaults to the resolved
 *   `dist/client`. The static layer is skipped when the directory is absent.
 * @returns A configured Express application.
 */
export function createApp(clientDir: string = resolveClientDir()): Express {
  const app = express();

  applySecurity(app);
  app.use(compression());
  app.use(express.json({ limit: BODY_LIMIT }));

  app.use('/api', healthRouter);

  // eslint-disable-next-line security/detect-non-literal-fs-filename -- trusted path, not user input
  if (fs.existsSync(clientDir)) {
    serveClient(app, clientDir);
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
