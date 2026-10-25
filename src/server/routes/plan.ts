import { Router, type Request, type Response, type NextFunction } from 'express';

import { EventInputSchema } from '../../shared/schemas';
import type { EventInput } from '../../shared/types';
import type { PlanResult } from '../services/planService';

/** The slice of the plan service this route depends on. */
export interface PlanGenerator {
  generate(input: EventInput): Promise<PlanResult>;
}

/**
 * Router for `POST /api/plan`. Validates the body with Zod (strict) and returns
 * the generated plan and its provenance. Validation failures return 400 with
 * field-level messages; unexpected errors are delegated to the error handler.
 *
 * @param planService - The plan generator.
 * @returns An Express router.
 */
export function createPlanRouter(planService: PlanGenerator): Router {
  const router = Router();

  router.post('/plan', (req: Request, res: Response, next: NextFunction) => {
    const parsed = EventInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: 'Please check the event details.',
        issues: parsed.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
      return;
    }

    planService
      .generate(parsed.data)
      .then((result) => {
        res.json({ plan: result.plan, source: result.source });
      })
      .catch(next);
  });

  return router;
}
