import express from 'express';
import cors from 'cors';
import { createChatRouter } from './presentation/routes/chatRoutes';
import { createAuthRouter } from './presentation/routes/authRoutes';

export const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Mount routes
  app.use('/api/auth', createAuthRouter());
  app.use('/api', createChatRouter());

  // Basic health check
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  return app;
};
