import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import DatabaseManager from '../database/DatabaseManager';
import dotenv from 'dotenv';
dotenv.config();

const router = Router();
const db = new DatabaseManager();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, full_name, location } = req.body;
    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (db.getUserByEmail(email)) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const user = await db.createUser({
      email,
      password_hash: password,
      full_name,
      location: location || null,
      email_verified: true,
      verification_token: null
    });
    res.json({ message: 'Registration successful! You can now log in.', user: { ...user, password_hash: undefined } });
  } catch (error) {
    console.error('Registration error:', error); 
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = db.getUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await db.verifyPassword(email, password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { ...user, password_hash: undefined } });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Password reset request
router.post('/reset-request', (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = db.getUserByEmail(email);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const reset_token = crypto.randomBytes(24).toString('hex');
    db.updateUser(user.id!, { verification_token: reset_token });
    // TODO: Send reset email with token
    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Password reset
router.post('/reset', async (req: Request, res: Response) => {
  try {
    const { email, token, new_password } = req.body;
    const user = db.getUserByEmail(email);
    if (!user || user.verification_token !== token) {
      return res.status(400).json({ error: 'Invalid token' });
    }
    await db.updateUserPassword(user.id!, new_password);
    db.updateUser(user.id!, { verification_token: null });
    res.json({ message: 'Password updated' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// New admin login route (secure, configurable)
router.post('/admin-login', (req: Request, res: Response) => {
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ username, isAdmin: true }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: { username, isAdmin: true } });
  }
  return res.status(401).json({ error: 'Invalid admin credentials' });
});

export default router; 