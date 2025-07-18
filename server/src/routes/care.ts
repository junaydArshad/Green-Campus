import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import DatabaseManager from '../database/DatabaseManager';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
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

// Utility to send email
const sendMail = async (to: string, subject: string, text: string) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for port 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text
  });
};

// Get care activities for a tree
router.get('/:treeId/activities', authenticateToken, (req: Request, res: Response) => {
  const treeId = parseInt(req.params.treeId);
  const tree = db.getTreeById(treeId);
  if (!tree) {
    return res.status(404).json({ error: 'Tree not found' });
  }
  if (tree.user_id !== (req as any).user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }
  const activities = db.getCareActivitiesByTreeId(treeId);
  res.json(activities);
});

// Add care activity
router.post('/:treeId/activities', authenticateToken, (req: Request, res: Response) => {
  const treeId = parseInt(req.params.treeId);
  const tree = db.getTreeById(treeId);
  if (!tree) {
    return res.status(404).json({ error: 'Tree not found' });
  }
  if (tree.user_id !== (req as any).user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }
  const { activity_type, activity_date, notes } = req.body;
  const activity = db.addCareActivity({
    tree_id: treeId,
    activity_type,
    activity_date,
    notes
  });
  if (!activity) {
    return res.status(400).json({ error: 'Failed to add care activity' });
  }
  res.status(201).json(activity);
});

// Admin: Notify users whose trees need watering
router.post('/notify-unwatered', async (req: Request, res: Response) => {
  // Only allow if admin (for now, simple check)
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  let isAdmin = false;
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    isAdmin = decoded.isAdmin;
  } catch {
    return res.sendStatus(403);
  }
  if (!isAdmin) return res.status(403).json({ error: 'Admin only' });

  // Get all trees with user info
  const trees = db.getAllTreesWithUserInfo();
  const now = new Date();
  let notified = 0;
  for (const tree of trees) {
    // Get last watering activity
    const activities = db.getCareActivitiesByTreeId(tree.id);
    const lastWatering = activities.find(a => a.activity_type === 'watering');
    let lastDate = lastWatering ? new Date(lastWatering.activity_date) : null;
    // Watering frequency (days)
    let freq = 7;
    if (tree.species_name && typeof tree.species_name === 'string') {
      const s = tree.species_name.toLowerCase();
      if (s.includes('willow')) freq = 3;
      else if (s.includes('oak')) freq = 7;
      else if (s.includes('maple')) freq = 5;
      else if (s.includes('pine')) freq = 10;
      else if (s.includes('cherry')) freq = 6;
    }
    let needsWater = false;
    if (!lastDate) needsWater = true;
    else {
      const days = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      if (days >= freq) needsWater = true;
    }
    if (needsWater && tree.user_email) {
      await sendMail(
        tree.user_email,
        'Your tree needs watering! 🌱',
        `Hi ${tree.user_full_name || ''},\n\nYour tree (${tree.species_name}) needs watering. Please water it as soon as possible!\n\nGreen Campus Team`
      );
      notified++;
    }
  }
  res.json({ message: `Notified ${notified} users whose trees need watering.` });
});

// Send admin message to user
router.post('/send-admin-message', async (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  let isAdmin = false;
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    isAdmin = decoded.isAdmin;
  } catch {
    return res.sendStatus(403);
  }
  if (!isAdmin) return res.status(403).json({ error: 'Admin only' });

  const { to, subject, text } = req.body;
  if (!to || !subject || !text) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    await sendMail(to, subject, text);
    res.json({ message: 'Message sent successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router; 