export interface User {
  id?: number;
  email: string;
  password_hash?: string;
  full_name: string;
  location?: string;
  avatar_url?: string;
  email_verified: boolean;
  verification_token?: string;
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
  species_name?: string;
  scientific_name?: string;
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

export interface DashboardStats {
  totalTrees: number;
  healthyTrees: number;
  needsCareTrees: number;
  strugglingTrees: number;
  totalCarbonOffset: number;
  recentTrees: Tree[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
} 