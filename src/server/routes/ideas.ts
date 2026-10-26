import { Router, type Request, type Response, type NextFunction } from 'express';

import { IdeasRegenerateSchema } from '../../shared/schemas';
import type { IdeasService } from '../services/ideasService';

export function createIdeasRouter(ideasService: IdeasService): Router {
  const router = Router();

  router.post('/ideas/regenerate', (req: Request, res: Response, next: NextFunction) => {
    const parsed = IdeasRegenerateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: 'Invalid ideas request.',
        issues: parsed.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
      return;
    }

    ideasService
      .regenerate(parsed.data.eventInput, parsed.data.category)
      .then((ideas) => {
        res.json({ ideas });
      })
      .catch(next);
  });

  return router;
}
