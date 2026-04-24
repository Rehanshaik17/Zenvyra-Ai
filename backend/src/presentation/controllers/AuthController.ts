import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../../infrastructure/database/models/UserModel';
import { AuthRequest } from '../../infrastructure/middleware/authMiddleware';

const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'zenyvra-fallback-secret';
  return jwt.sign({ userId }, secret, { expiresIn: '30d' });
};

export class AuthController {
  async signup(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }

      // Check if user already exists
      const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(409).json({ error: 'An account with this email already exists' });
      }

      const user = await UserModel.create({ name, email: email.toLowerCase(), password });
      const token = generateToken(user._id.toString());

      res.status(201).json({
        token,
        user: { _id: user._id, name: user.name, email: user.email },
      });
    } catch (err: any) {
      console.error('Signup error:', err);
      res.status(500).json({ error: 'Failed to create account' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = await UserModel.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = generateToken(user._id.toString());

      res.json({
        token,
        user: { _id: user._id, name: user.name, email: user.email },
      });
    } catch (err: any) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Failed to log in' });
    }
  }

  async getMe(req: AuthRequest, res: Response) {
    try {
      const user = await UserModel.findById(req.userId).select('-password');
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ _id: user._id, name: user.name, email: user.email });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  }
}
