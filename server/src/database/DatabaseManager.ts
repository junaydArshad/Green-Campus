import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface User {
  id?: number;
  email: string;
  password_hash: string;
  full_name: string;
  location?: string | null;
  email_verified: boolean;
  verification_token?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface TreeSpecies {
  id?: number;
  name: string;
  scientific_name?: string;
  description?: string;
  care_instructions?: string;
  growth_rate: 'fast' | 'medium' | 'slow';
  mature_height_feet: number;
  image_url?: string;
  created_at?: string;
}

export interface Tree {
  id?: number;
  user_id: number;
  species_id: number;
  latitude: number;
  longitude: number;
  planted_date: string;
  current_height_cm: number;
  health_status: 'healthy' | 'needs_care' | 'struggling';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TreePhoto {
  id?: number;
  tree_id: number;
  photo_url: string;
  caption?: string;
  photo_type: 'initial' | 'progress' | 'care';
  taken_at?: string;
}

export interface TreeMeasurement {
  id?: number;
  tree_id: number;
  height_cm: number;
  measurement_date: string;
  notes?: string;
  created_at?: string;
}

export interface CareActivity {
  id?: number;
  tree_id: number;
  activity_type: 'watering' | 'fertilizing' | 'pruning' | 'other';
  activity_date: string;
  notes?: string;
  created_at?: string;
}

class DatabaseManager {
  private db: Database.Database;
  private dbPath: string;

  constructor() {
    this.dbPath = path.join(__dirname, '..', '..', 'data', 'green_campus.db');
    this.db = new Database(this.dbPath);
    this.initialize();
  }

  private initialize() {
    this.createTables();
    this.createIndexes();
    this.insertSampleData();
  }

  private createTables() {
    // Users table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        location VARCHAR(255),
        email_verified BOOLEAN DEFAULT FALSE,
        verification_token VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tree species table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tree_species (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        scientific_name VARCHAR(255),
        description TEXT,
        care_instructions TEXT,
        growth_rate VARCHAR(50),
        mature_height_feet INTEGER,
        image_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Trees table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS trees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        species_id INTEGER NOT NULL,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        planted_date DATE NOT NULL,
        current_height_cm DECIMAL(5, 2) DEFAULT 0,
        health_status VARCHAR(50) DEFAULT 'healthy',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (species_id) REFERENCES tree_species (id)
      )
    `);

    // Tree photos table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tree_photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tree_id INTEGER NOT NULL,
        photo_url VARCHAR(500) NOT NULL,
        caption TEXT,
        photo_type VARCHAR(50) DEFAULT 'progress',
        taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tree_id) REFERENCES trees (id) ON DELETE CASCADE
      )
    `);

    // Tree measurements table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tree_measurements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tree_id INTEGER NOT NULL,
        height_cm DECIMAL(5, 2) NOT NULL,
        measurement_date DATE NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tree_id) REFERENCES trees (id) ON DELETE CASCADE
      )
    `);

    // Care activities table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS care_activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tree_id INTEGER NOT NULL,
        activity_type VARCHAR(50) NOT NULL,
        activity_date DATE NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tree_id) REFERENCES trees (id) ON DELETE CASCADE
      )
    `);
  }

  private createIndexes() {
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);
      CREATE INDEX IF NOT EXISTS idx_trees_user_id ON trees(user_id);
      CREATE INDEX IF NOT EXISTS idx_trees_species_id ON trees(species_id);
      CREATE INDEX IF NOT EXISTS idx_trees_location ON trees(latitude, longitude);
      CREATE INDEX IF NOT EXISTS idx_trees_planted_date ON trees(planted_date);
      CREATE INDEX IF NOT EXISTS idx_tree_photos_tree_id ON tree_photos(tree_id);
      CREATE INDEX IF NOT EXISTS idx_tree_measurements_tree_id ON tree_measurements(tree_id);
      CREATE INDEX IF NOT EXISTS idx_care_activities_tree_id ON care_activities(tree_id);
    `);
  }

  private insertSampleData() {
    // Check if sample data already exists
    const speciesCount = this.db.prepare('SELECT COUNT(*) as count FROM tree_species').get() as { count: number };
    
    if (speciesCount.count === 0) {
      const insertSpecies = this.db.prepare(`
        INSERT INTO tree_species (name, scientific_name, description, care_instructions, growth_rate, mature_height_feet) 
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      const sampleSpecies = [
        ['Oak Tree', 'Quercus', 'Strong, long-living tree perfect for urban environments', 'Water weekly, prune in winter', 'slow', 80],
        ['Maple Tree', 'Acer', 'Beautiful foliage tree with seasonal color changes', 'Regular watering, avoid overwatering', 'medium', 60],
        ['Pine Tree', 'Pinus', 'Evergreen tree that provides year-round greenery', 'Drought tolerant once established', 'medium', 70],
        ['Willow Tree', 'Salix', 'Fast-growing tree that loves water and wet soil', 'Keep soil moist, regular watering', 'fast', 40],
        ['Cherry Tree', 'Prunus', 'Flowering tree that produces beautiful spring blossoms', 'Well-draining soil, moderate watering', 'medium', 30]
      ];

      sampleSpecies.forEach(species => {
        insertSpecies.run(species);
      });
    }
  }

  // User methods
  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password_hash, 10);

    // Defensive: log and default all fields
    const email = userData.email ?? null;
    const full_name = userData.full_name ?? null;
    const location = userData.location ?? null;
    let email_verified: number;
    if (typeof userData.email_verified === 'number') {
      email_verified = userData.email_verified;
    } else {
      email_verified = userData.email_verified ? 1 : 0;
    }
    const verification_token = userData.verification_token ?? null;

    console.log('Creating user with:', { email, hashedPassword, full_name, location, email_verified, verification_token });

    const stmt = this.db.prepare(`
      INSERT INTO users (email, password_hash, full_name, location, email_verified, verification_token)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      email,
      hashedPassword,
      full_name,
      location,
      email_verified,
      verification_token
    );

    const user = this.getUserById(result.lastInsertRowid as number);
    if (!user) throw new Error('User not found');
    return user;
  }

  getUserByEmail(email: string): User | undefined {
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email) as User | undefined;
  }

  getUserById(id: number): User | undefined {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id) as User | undefined;
  }

  async verifyPassword(email: string, password: string): Promise<boolean> {
    const user = this.getUserByEmail(email);
    if (!user) return false;
    return bcrypt.compare(password, user.password_hash);
  }

  updateUser(id: number, updates: Partial<User>): User | null {
    const fields = Object.keys(updates).filter(key => key !== 'id');
    if (fields.length === 0) return this.getUserById(id) || null;
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => (updates as any)[field]);
    const stmt = this.db.prepare(`UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    stmt.run(...values, id);
    return this.getUserById(id) || null;
  }

  async updateUserPassword(id: number, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const stmt = this.db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(hashedPassword, id);
  }

  deleteUser(id: number): void {
    const stmt = this.db.prepare('DELETE FROM users WHERE id = ?');
    stmt.run(id);
  }

  // Tree species methods
  getAllTreeSpecies(): TreeSpecies[] {
    const stmt = this.db.prepare('SELECT * FROM tree_species ORDER BY name');
    return stmt.all() as TreeSpecies[];
  }

  getTreeSpeciesById(id: number): TreeSpecies | undefined {
    const stmt = this.db.prepare('SELECT * FROM tree_species WHERE id = ?');
    return stmt.get(id) as TreeSpecies | undefined;
  }

  // Tree methods
  createTree(treeData: Omit<Tree, 'id' | 'created_at' | 'updated_at'>): Tree | null {
    const stmt = this.db.prepare(`
      INSERT INTO trees (user_id, species_id, latitude, longitude, planted_date, current_height_cm, health_status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      treeData.user_id,
      treeData.species_id,
      treeData.latitude,
      treeData.longitude,
      treeData.planted_date,
      treeData.current_height_cm,
      treeData.health_status,
      treeData.notes
    );

    const tree = this.getTreeById(result.lastInsertRowid as number);
    if (!tree) throw new Error('Tree not found');
    return tree;
  }

  getTreeById(id: number): Tree | undefined {
    const stmt = this.db.prepare('SELECT * FROM trees WHERE id = ?');
    return stmt.get(id) as Tree | undefined;
  }

  getTreesByUserId(userId: number): Tree[] {
    const stmt = this.db.prepare(`
      SELECT t.*, ts.name as species_name, ts.scientific_name 
      FROM trees t 
      JOIN tree_species ts ON t.species_id = ts.id 
      WHERE t.user_id = ? 
      ORDER BY t.planted_date DESC
    `);
    return stmt.all(userId) as any[];
  }

  updateTree(id: number, updates: Partial<Tree>): Tree | undefined {
    const fields = Object.keys(updates).filter(key => key !== 'id');
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => (updates as any)[field]);
    
    const stmt = this.db.prepare(`UPDATE trees SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    stmt.run(...values, id);

    return this.getTreeById(id);
  }

  // Tree photo methods
  addTreePhoto(photoData: Omit<TreePhoto, 'id' | 'taken_at'>): TreePhoto | null {
    const stmt = this.db.prepare(`
      INSERT INTO tree_photos (tree_id, photo_url, caption, photo_type)
      VALUES (?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      photoData.tree_id,
      photoData.photo_url,
      photoData.caption,
      photoData.photo_type
    );

    const photo = this.getTreePhotoById(result.lastInsertRowid as number);
    if (!photo) throw new Error('TreePhoto not found');
    return photo;
  }

  getTreePhotoById(id: number): TreePhoto | undefined {
    const stmt = this.db.prepare('SELECT * FROM tree_photos WHERE id = ?');
    return stmt.get(id) as TreePhoto | undefined;
  }

  getTreePhotosByTreeId(treeId: number): TreePhoto[] {
    const stmt = this.db.prepare('SELECT * FROM tree_photos WHERE tree_id = ? ORDER BY taken_at DESC');
    return stmt.all(treeId) as TreePhoto[];
  }

  // Tree measurement methods
  addTreeMeasurement(measurementData: Omit<TreeMeasurement, 'id' | 'created_at'>): TreeMeasurement | null {
    const stmt = this.db.prepare(`
      INSERT INTO tree_measurements (tree_id, height_cm, measurement_date, notes)
      VALUES (?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      measurementData.tree_id,
      measurementData.height_cm,
      measurementData.measurement_date,
      measurementData.notes
    );

    const measurement = this.getTreeMeasurementById(result.lastInsertRowid as number);
    if (!measurement) throw new Error('TreeMeasurement not found');
    return measurement;
  }

  getTreeMeasurementById(id: number): TreeMeasurement | undefined {
    const stmt = this.db.prepare('SELECT * FROM tree_measurements WHERE id = ?');
    return stmt.get(id) as TreeMeasurement | undefined;
  }

  getTreeMeasurementsByTreeId(treeId: number): TreeMeasurement[] {
    const stmt = this.db.prepare('SELECT * FROM tree_measurements WHERE tree_id = ? ORDER BY measurement_date DESC');
    return stmt.all(treeId) as TreeMeasurement[];
  }

  // Care activity methods
  addCareActivity(activityData: Omit<CareActivity, 'id' | 'created_at'>): CareActivity | null {
    const stmt = this.db.prepare(`
      INSERT INTO care_activities (tree_id, activity_type, activity_date, notes)
      VALUES (?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      activityData.tree_id,
      activityData.activity_type,
      activityData.activity_date,
      activityData.notes
    );

    const activity = this.getCareActivityById(result.lastInsertRowid as number);
    if (!activity) throw new Error('CareActivity not found');
    return activity;
  }

  getCareActivityById(id: number): CareActivity | undefined {
    const stmt = this.db.prepare('SELECT * FROM care_activities WHERE id = ?');
    return stmt.get(id) as CareActivity | undefined;
  }

  getCareActivitiesByTreeId(treeId: number): CareActivity[] {
    const stmt = this.db.prepare('SELECT * FROM care_activities WHERE tree_id = ? ORDER BY activity_date DESC');
    return stmt.all(treeId) as CareActivity[];
  }

  // Add this method for admin dashboard
  getAllTreesWithUserInfo(): any[] {
    const stmt = this.db.prepare(`
      SELECT t.*, u.full_name as user_full_name, u.email as user_email, s.name as species_name, s.scientific_name
      FROM trees t
      JOIN users u ON t.user_id = u.id
      JOIN tree_species s ON t.species_id = s.id
      ORDER BY t.planted_date DESC
    `);
    return stmt.all();
  }

  close() {
    this.db.close();
  }
}

export default DatabaseManager; 