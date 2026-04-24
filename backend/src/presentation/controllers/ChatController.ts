import { Response } from 'express';
import { ChatUseCases } from '../../core/use-cases/ChatUseCases';
import { AuthRequest } from '../../infrastructure/middleware/authMiddleware';

export class ChatController {
  constructor(private chatUseCases: ChatUseCases) {}

  async getConversations(req: AuthRequest, res: Response) {
    try {
      const conversations = await this.chatUseCases.getConversations(req.userId!);
      res.json(conversations);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async getConversation(req: AuthRequest, res: Response) {
    try {
      const conversation = await this.chatUseCases.getConversation(req.params.id);
      if (!conversation) return res.status(404).json({ error: 'Not found' });
      res.json(conversation);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async createConversation(req: AuthRequest, res: Response) {
    try {
      const { title } = req.body;
      const conversation = await this.chatUseCases.createConversation(title || 'New Chat', req.userId!);
      res.status(201).json(conversation);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async deleteConversation(req: AuthRequest, res: Response) {
    try {
      await this.chatUseCases.deleteConversation(req.params.id);
      res.status(204).send();
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async sendMessage(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({ error: 'Message content is required' });
      }

      // Set headers for SSE (Server-Sent Events)
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      await this.chatUseCases.processMessage(id, content, (chunk) => {
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      });

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (err: any) {
      console.error(err);
      if (!res.headersSent) {
        res.status(500).json({ error: err.message });
      } else {
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
        res.end();
      }
    }
  }
}
