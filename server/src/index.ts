import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import speciesRoutes from './routes/species';
import treesRoutes from './routes/trees';
import growthRoutes from './routes/growth';
import careRoutes from './routes/care';
import dashboardRoutes from './routes/dashboard';
import mapRoutes from './routes/map';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Static file serving for avatars and tree photos
app.use('/avatars', express.static(path.join(__dirname, '../data/avatars')));
app.use('/tree_photos', express.static(path.join(__dirname, '../data/tree_photos')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/species', speciesRoutes);
app.use('/api/trees', treesRoutes);
app.use('/api/growth', growthRoutes);
app.use('/api/care', careRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/map', mapRoutes);

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Green Campus backend is running!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 