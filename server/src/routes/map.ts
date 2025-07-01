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

// Get all trees for map view
router.get('/trees', authenticateToken, (req: Request, res: Response) => {
  const trees = db.getTreesByUserId((req as any).user.id);
  const mapTrees = trees.map(tree => ({
    id: tree.id,
    latitude: tree.latitude,
    longitude: tree.longitude,
    species_name: (tree as any).species_name,
    health_status: tree.health_status,
    planted_date: tree.planted_date,
    current_height_cm: tree.current_height_cm
  }));
  res.json(mapTrees);
});

// Get trees in a specific area
router.get('/trees/area', authenticateToken, (req: Request, res: Response) => {
  const { north, south, east, west } = req.query;
  const trees = db.getTreesByUserId((req as any).user.id);
  
  // Filter trees within the specified bounds
  const filteredTrees = trees.filter(tree => 
    tree.latitude <= Number(north) &&
    tree.latitude >= Number(south) &&
    tree.longitude <= Number(east) &&
    tree.longitude >= Number(west)
  );
  
  const mapTrees = filteredTrees.map(tree => ({
    id: tree.id,
    latitude: tree.latitude,
    longitude: tree.longitude,
    species_name: (tree as any).species_name,
    health_status: tree.health_status,
    planted_date: tree.planted_date,
    current_height_cm: tree.current_height_cm
  }));
  
  res.json(mapTrees);
});

export default router; 