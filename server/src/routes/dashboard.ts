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

// Get dashboard overview
router.get('/overview', authenticateToken, (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const trees = db.getTreesByUserId(userId);
  
  const totalTrees = trees.length;
  const healthyTrees = trees.filter(t => t.health_status === 'healthy').length;
  const needsCareTrees = trees.filter(t => t.health_status === 'needs_care').length;
  const strugglingTrees = trees.filter(t => t.health_status === 'struggling').length;
  
  // Calculate total carbon offset (simplified calculation)
  const totalCarbonOffset = trees.reduce((total, tree) => {
    // Rough estimate: 1 tree = 48 lbs CO2 per year
    const treeAge = new Date().getFullYear() - new Date(tree.planted_date).getFullYear();
    return total + (treeAge * 48);
  }, 0);
  
  res.json({
    totalTrees,
    healthyTrees,
    needsCareTrees,
    strugglingTrees,
    totalCarbonOffset,
    recentTrees: trees.slice(0, 5) // Last 5 trees
  });
});

// Get tree statistics
router.get('/statistics', authenticateToken, (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const trees = db.getTreesByUserId(userId);
  
  // Species distribution
  const speciesCount: { [key: string]: number } = {};
  trees.forEach(tree => {
    const speciesName = (tree as any).species_name || 'Unknown';
    speciesCount[speciesName] = (speciesCount[speciesName] || 0) + 1;
  });
  
  // Growth statistics
  const heights = trees.map(t => t.current_height_cm).filter(h => h > 0);
  const avgHeight = heights.length > 0 ? heights.reduce((a, b) => a + b, 0) / heights.length : 0;
  const maxHeight = Math.max(...heights, 0);
  
  res.json({
    speciesDistribution: speciesCount,
    averageHeight: avgHeight,
    maxHeight,
    totalTrees: trees.length
  });
});

export default router; 