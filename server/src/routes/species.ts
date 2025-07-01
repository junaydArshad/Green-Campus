import { Router, Request, Response } from 'express';
import DatabaseManager from '../database/DatabaseManager';

const router = Router();
const db = new DatabaseManager();

// Get all tree species
router.get('/', (req: Request, res: Response) => {
  const species = db.getAllTreeSpecies();
  res.json(species);
});

// Get tree species by ID
router.get('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const species = db.getTreeSpeciesById(id);
  if (!species) {
    return res.status(404).json({ error: 'Species not found' });
  }
  res.json(species);
});

export default router; 