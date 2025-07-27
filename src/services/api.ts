import { User, Tree, TreeSpecies, TreePhoto, TreeMeasurement, CareActivity, DashboardStats, AuthResponse, LeaderboardEntry } from '../types';

const API_BASE_URL = 'http://localhost:4000/api';

// Helper function for API calls
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
}

// Authentication API
export const authAPI = {
  register: async (userData: { email: string; password: string; full_name: string; location?: string }) =>
    apiCall<{ message: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  login: async (credentials: { email: string; password: string }) =>
    apiCall<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  resetPasswordRequest: async (email: string) =>
    apiCall<{ message: string }>('/auth/reset-request', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: async (data: { email: string; token: string; new_password: string }) =>
    apiCall<{ message: string }>('/auth/reset', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// User API
export const userAPI = {
  getProfile: () => apiCall<User>('/user/profile'),
  
  updateProfile: (data: Partial<User>) =>
    apiCall<User>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  changePassword: (data: { current_password: string; new_password: string }) =>
    apiCall<{ message: string }>('/user/password', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getLeaderboard: () => apiCall<LeaderboardEntry[]>('/user/leaderboard'),

  // Avatar upload endpoint is not implemented in backend, so we comment it out to avoid errors
  // uploadAvatar: async (file: File) => {
  //   const formData = new FormData();
  //   formData.append('avatar', file);
  //   const token = localStorage.getItem('token');
  //   const response = await fetch(`${API_BASE_URL}/user/me/avatar`, {
  //     method: 'POST',
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //     },
  //     body: formData,
  //   });
  //   if (!response.ok) {
  //     const error = await response.json();
  //     throw new Error(error.error || 'Upload failed');
  //   }
  //   return response.json();
  // },

  deleteAccount: () =>
    apiCall<{ message: string }>('/user/account', {
      method: 'DELETE',
    }),
};

// Species API
export const speciesAPI = {
  getAll: () => apiCall<TreeSpecies[]>('/species'),
  getById: (id: number) => apiCall<TreeSpecies>(`/species/${id}`),
};

// Trees API
export const treesAPI = {
  getAll: () => apiCall<Tree[]>('/trees'),
  getById: (id: number) => apiCall<Tree>(`/trees/${id}`),
  
  create: (treeData: Omit<Tree, 'id' | 'user_id' | 'created_at' | 'updated_at'>) =>
    apiCall<Tree>('/trees', {
      method: 'POST',
      body: JSON.stringify(treeData),
    }),

  update: (id: number, data: Partial<Tree>) =>
    apiCall<Tree>(`/trees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiCall<{ message: string }>(`/trees/${id}`, {
      method: 'DELETE',
    }),
};

// Growth Tracking API
export const growthAPI = {
  addMeasurement: (treeId: number, data: Omit<TreeMeasurement, 'id' | 'tree_id' | 'created_at'>) =>
    apiCall<TreeMeasurement>(`/growth/${treeId}/measurements`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMeasurements: (treeId: number) =>
    apiCall<TreeMeasurement[]>(`/growth/${treeId}/measurements`),

  addPhoto: async (treeId: number, file: File, caption?: string, photoType?: string) => {
    const formData = new FormData();
    formData.append('photo', file);
    if (caption) formData.append('caption', caption);
    if (photoType) formData.append('photo_type', photoType);

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/growth/${treeId}/photos`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  },

  getPhotos: (treeId: number) =>
    apiCall<TreePhoto[]>(`/growth/${treeId}/photos`),

  deletePhoto: (treeId: number, photoId: number) =>
    apiCall<{ message: string }>(`/growth/${treeId}/photos/${photoId}`, {
      method: 'DELETE',
    }),

  updateHealth: (treeId: number, healthStatus: Tree['health_status']) =>
    apiCall<Tree>(`/growth/${treeId}/health`, {
      method: 'PUT',
      body: JSON.stringify({ health_status: healthStatus }),
    }),
};

// Care Activities API
export const careAPI = {
  addActivity: (treeId: number, data: Omit<CareActivity, 'id' | 'tree_id' | 'created_at'>) =>
    apiCall<CareActivity>(`/care/${treeId}/activities`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getActivities: (treeId: number) =>
    apiCall<CareActivity[]>(`/care/${treeId}/activities`),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => apiCall<DashboardStats>('/dashboard/overview'),
  getStatistics: () => apiCall<any>('/dashboard/statistics'),
};

// Map API
export const mapAPI = {
  getTrees: (filters?: { health_status?: string; year?: number; species_id?: number }) => {
    const params = new URLSearchParams();
    if (filters?.health_status) params.append('health_status', filters.health_status);
    if (filters?.year) params.append('year', filters.year.toString());
    if (filters?.species_id) params.append('species_id', filters.species_id.toString());
    
    const queryString = params.toString();
    return apiCall<Tree[]>(`/map/trees${queryString ? `?${queryString}` : ''}`);
  },
  
  getTreesInArea: (bounds: { north: number; south: number; east: number; west: number }) => {
    const params = new URLSearchParams();
    params.append('north', bounds.north.toString());
    params.append('south', bounds.south.toString());
    params.append('east', bounds.east.toString());
    params.append('west', bounds.west.toString());
    
    return apiCall<Tree[]>(`/map/trees/area?${params.toString()}`);
  },
}; 