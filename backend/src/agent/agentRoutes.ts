/**
 * Zenyvra AI Agent — Routes & Controller
 *
 * POST /api/agent/chat
 *   Body: { message: string, history: Array<{role, content}> }
 *   Returns: { reply: string }
 *
 * The agent maintains conversational context via the `history` array
 * sent from the frontend with each request.
 */

import { Router, Request, Response } from 'express';
import { AgentService } from './AgentService';
import { authMiddleware } from '../infrastructure/middleware/authMiddleware';

export const createAgentRouter = () => {
  const router = Router();
  const agentService = new AgentService(process.env.GEMINI_API_KEY || '');

  // Require authentication for agent routes
  router.use(authMiddleware);

  router.post('/chat', async (req: Request, res: Response) => {
    try {
      const { message, history } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const conversationHistory = Array.isArray(history) ? history : [];

      const reply = await agentService.processMessage(conversationHistory, message);

      res.json({ reply });
    } catch (err: any) {
      console.error('[Agent Error]', err);
      res.status(500).json({
        error: 'Agent encountered an error. Please try again.',
        details: err.message,
      });
    }
  });

  return router;
};
