import { Router, Request, Response } from 'express';
import DatabaseManager from '../database/DatabaseManager';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
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

const upload = multer({ dest: path.join(__dirname, '../../data/tree_photos') });

// Get tree measurements
router.get('/:treeId/measurements', authenticateToken, (req: Request, res: Response) => {
  const treeId = parseInt(req.params.treeId);
  const tree = db.getTreeById(treeId);
  if (!tree) {
    return res.status(404).json({ error: 'Tree not found' });
  }
  if (tree.user_id !== (req as any).user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }
  const measurements = db.getTreeMeasurementsByTreeId(treeId);
  res.json(measurements);
});

// Add tree measurement
router.post('/:treeId/measurements', authenticateToken, (req: Request, res: Response) => {
  const treeId = parseInt(req.params.treeId);
  const tree = db.getTreeById(treeId);
  if (!tree) {
    return res.status(404).json({ error: 'Tree not found' });
  }
  if (tree.user_id !== (req as any).user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }
  const { height_cm, measurement_date, notes } = req.body;
  const measurement = db.addTreeMeasurement({
    tree_id: treeId,
    height_cm,
    measurement_date,
    notes
  });
  if (!measurement) {
    return res.status(400).json({ error: 'Failed to add measurement' });
  }
  // Update tree's current height
  db.updateTree(treeId, { current_height_cm: height_cm });
  res.status(201).json(measurement);
});

// Add photo
router.post('/:treeId/photos', authenticateToken, upload.single('photo'), (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const treeId = parseInt(req.params.treeId, 10);
  const { caption, photo_type } = req.body;
  const tree = db.getTreeById(treeId);
  if (!tree || tree.user_id !== userId) return res.status(404).json({ error: 'Tree not found' });
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });
  const photo_url = `/tree_photos/${file.filename}`;
  const photo = db.addTreePhoto({ tree_id: treeId, photo_url, caption, photo_type });
  res.json(photo);
});

// List photos
router.get('/:treeId/photos', authenticateToken, (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const treeId = parseInt(req.params.treeId, 10);
  const tree = db.getTreeById(treeId);
  if (!tree || tree.user_id !== userId) return res.status(404).json({ error: 'Tree not found' });
  const photos = db.getTreePhotosByTreeId(treeId);
  res.json(photos);
});

// Delete photo
router.delete('/:treeId/photos/:photoId', authenticateToken, (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const treeId = parseInt(req.params.treeId, 10);
  const photoId = parseInt(req.params.photoId, 10);
  
  const tree = db.getTreeById(treeId);
  if (!tree || tree.user_id !== userId) return res.status(404).json({ error: 'Tree not found' });
  
  const photo = db.getTreePhotoById(photoId);
  if (!photo || photo.tree_id !== treeId) return res.status(404).json({ error: 'Photo not found' });
  
  // Delete the physical file
  const filePath = path.join(__dirname, '../../data', photo.photo_url);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  
  // Delete from database
  db.deleteTreePhoto(photoId);
  res.json({ message: 'Photo deleted successfully' });
});

// Update health status
router.put('/:treeId/health', authenticateToken, (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const treeId = parseInt(req.params.treeId, 10);
  const { health_status } = req.body;
  const tree = db.getTreeById(treeId);
  if (!tree || tree.user_id !== userId) return res.status(404).json({ error: 'Tree not found' });
  const updated = db.updateTree(treeId, { health_status });
  res.json(updated);
});

export default router; 