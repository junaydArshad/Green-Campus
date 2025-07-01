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

// Admin: Get all trees with user info (protected)
router.get('/all', (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    if (!decoded.isAdmin) return res.status(403).json({ error: 'Access denied' });
    let trees;
    try {
      trees = db.getAllTreesWithUserInfo();
      console.log('Trees found:', trees);
    } catch (err) {
      console.error('Error in getAllTreesWithUserInfo:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (!trees || trees.length === 0) {
      return res.status(404).json({ error: 'No trees found' });
    }
    res.json(trees);
  } catch (err) {
    console.error('Error in /all endpoint:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's trees
router.get('/', authenticateToken, (req: Request, res: Response) => {
  const trees = db.getTreesByUserId((req as any).user.id);
  res.json(trees);
});

// Get specific tree
router.get('/:id', authenticateToken, (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const tree = db.getTreeById(id);
  if (!tree) {
    return res.status(404).json({ error: 'Tree not found' });
  }
  if (tree.user_id !== (req as any).user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }
  res.json(tree);
});

// Add new tree
router.post('/', authenticateToken, (req: Request, res: Response) => {
  const { species_id, latitude, longitude, planted_date, current_height_cm, health_status, notes } = req.body;
  const tree = db.createTree({
    user_id: (req as any).user.id,
    species_id,
    latitude,
    longitude,
    planted_date,
    current_height_cm: current_height_cm || 0,
    health_status: health_status || 'healthy',
    notes
  });
  if (!tree) {
    return res.status(400).json({ error: 'Failed to create tree' });
  }
  res.status(201).json(tree);
});

// Update tree
router.put('/:id', authenticateToken, (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const tree = db.getTreeById(id);
  if (!tree) {
    return res.status(404).json({ error: 'Tree not found' });
  }
  if (tree.user_id !== (req as any).user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }
  const updatedTree = db.updateTree(id, req.body);
  res.json(updatedTree);
});

// Delete tree
router.delete('/:id', authenticateToken, (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const tree = db.getTreeById(id);
  if (!tree) {
    return res.status(404).json({ error: 'Tree not found' });
  }
  if (tree.user_id !== (req as any).user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }
  // Note: Tree deletion would need to be implemented in DatabaseManager
  res.json({ message: 'Tree deleted' });
});

// Add tree photo
const upload = multer({ dest: path.join(__dirname, '../../data/tree_photos') });
router.post('/:id/photos', authenticateToken, upload.single('photo'), (req: Request, res: Response) => {
  const treeId = parseInt(req.params.id);
  const tree = db.getTreeById(treeId);
  if (!tree) {
    return res.status(404).json({ error: 'Tree not found' });
  }
  if (tree.user_id !== (req as any).user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }
  const file = (req as any).file;
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const photo = db.addTreePhoto({
    tree_id: treeId,
    photo_url: `/tree_photos/${file.filename}`,
    caption: req.body.caption,
    photo_type: req.body.photo_type || 'progress'
  });
  res.status(201).json(photo);
});

// Get tree photos
router.get('/:id/photos', authenticateToken, (req: Request, res: Response) => {
  const treeId = parseInt(req.params.id);
  const tree = db.getTreeById(treeId);
  if (!tree) {
    return res.status(404).json({ error: 'Tree not found' });
  }
  if (tree.user_id !== (req as any).user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }
  const photos = db.getTreePhotosByTreeId(treeId);
  res.json(photos);
});

export default router; 