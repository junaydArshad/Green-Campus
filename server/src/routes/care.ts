import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
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

export default router; 