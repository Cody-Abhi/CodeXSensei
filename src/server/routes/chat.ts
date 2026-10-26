import { Router, type Request, type Response, type NextFunction } from 'express';

import { ChatRequestSchema } from '../../shared/schemas';
import type { ChatService } from '../services/chatService';

export function createChatRouter(chatService: ChatService): Router {
  const router = Router();

  router.post('/chat', (req: Request, res: Response, next: NextFunction) => {
    const parsed = ChatRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: 'Invalid chat request.',
        issues: parsed.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
      return;
    }

    chatService
      .chat(parsed.data.plan, parsed.data.message)
      .then((result) => {
        res.json(result);
      })
      .catch(next);
  });

  return router;
}
