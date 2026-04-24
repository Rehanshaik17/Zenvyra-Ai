import { Router } from 'express';
import { ChatController } from '../controllers/ChatController';
import { ChatUseCases } from '../../core/use-cases/ChatUseCases';
import { MongoConversationRepository } from '../../infrastructure/database/repositories/MongoConversationRepository';
import { GeminiService } from '../../infrastructure/services/GeminiService';
import { authMiddleware } from '../../infrastructure/middleware/authMiddleware';

export const createChatRouter = () => {
  const router = Router();
  
  // Dependency Injection
  const conversationRepo = new MongoConversationRepository();
  const geminiService = new GeminiService(process.env.GEMINI_API_KEY || '');
  const chatUseCases = new ChatUseCases(conversationRepo, geminiService);
  const chatController = new ChatController(chatUseCases);

  // All chat routes require authentication
  router.use(authMiddleware);

  router.get('/conversations', (req, res) => chatController.getConversations(req, res));
  router.post('/conversations', (req, res) => chatController.createConversation(req, res));
  router.get('/conversations/:id', (req, res) => chatController.getConversation(req, res));
  router.delete('/conversations/:id', (req, res) => chatController.deleteConversation(req, res));
  router.post('/conversations/:id/messages', (req, res) => chatController.sendMessage(req, res));

  return router;
};
