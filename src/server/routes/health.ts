import { Router, type Request, type Response } from 'express';

import { APP_VERSION } from '../../shared/version';

/** Router exposing `GET /api/health` for liveness checks. */
export const healthRouter: Router = Router();

healthRouter.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', version: APP_VERSION });
});
