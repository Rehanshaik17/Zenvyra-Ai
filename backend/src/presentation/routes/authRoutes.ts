import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../../infrastructure/middleware/authMiddleware';

export const createAuthRouter = () => {
  const router = Router();
  const authController = new AuthController();

  router.post('/signup', (req, res) => authController.signup(req, res));
  router.post('/login', (req, res) => authController.login(req, res));
  router.get('/me', authMiddleware, (req, res) => authController.getMe(req, res));

  return router;
};
