import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import DatabaseManager from '../database/DatabaseManager';
import dotenv from 'dotenv';
dotenv.config();

const router = Router();
const db = new DatabaseManager();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

// Middleware to verify JWT token
const authenticateToken = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    (req as any).user = user;
    next();
  });
};

// Get user profile
router.get('/profile', authenticateToken, (req: Request, res: Response) => {
  const user = db.getUserById((req as any).user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ ...user, password_hash: undefined });
});

// Update user profile
router.put('/profile', authenticateToken, (req: Request, res: Response) => {
  const { full_name, location } = req.body;
  const updatedUser = db.updateUser((req as any).user.id, { full_name, location });
  if (!updatedUser) return res.status(404).json({ error: 'User not found' });
  res.json({ ...updatedUser, password_hash: undefined });
});

// Change password
router.put('/password', authenticateToken, async (req: Request, res: Response) => {
  const { current_password, new_password } = req.body;
  const user = db.getUserById((req as any).user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const valid = await db.verifyPassword(user.email, current_password);
  if (!valid) return res.status(400).json({ error: 'Current password is incorrect' });
  await db.updateUserPassword(user.id!, new_password);
  res.json({ message: 'Password updated' });
});

// Delete account
router.delete('/account', authenticateToken, (req: Request, res: Response) => {
  db.deleteUser((req as any).user.id);
  res.json({ message: 'Account deleted' });
});

export default router; 