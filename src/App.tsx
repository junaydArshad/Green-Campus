import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyTrees from './pages/MyTrees';
import PlantTree from './pages/PlantTree';
import TreeDetail from './pages/TreeDetail';
import Profile from './pages/Profile';
import Map from './pages/Map';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
};

// Admin Protected Route
const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('adminToken');
  return token ? <>{children}</> : <Navigate to="/admin" />;
};

// Main App Layout
const AppLayout = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Navbar />}
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/trees" element={<ProtectedRoute><MyTrees /></ProtectedRoute>} />
          <Route path="/plant" element={<ProtectedRoute><PlantTree /></ProtectedRoute>} />
          <Route path="/trees/:id" element={<ProtectedRoute><TreeDetail /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/map" element={<ProtectedRoute><Map /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </Router>
  );
}

export default App; 