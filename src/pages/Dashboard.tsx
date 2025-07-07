import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  SparklesIcon, 
  ChartBarIcon, 
  PlusIcon, 
  MapIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import { DashboardStats, Tree } from '../types';
import { dashboardAPI } from '../services/api';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await dashboardAPI.getStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'needs_care': return 'text-yellow-600 bg-yellow-100';
      case 'struggling': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-forest-green"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button onClick={fetchStats} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back! Here's an overview of your tree planting journey.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/plant"
            className="btn-primary inline-flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Plant New Tree
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <SparklesIcon className="h-8 w-8 text-forest-green" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Trees</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.totalTrees || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ArrowTrendingUpIcon className="h-8 w-8 text-forest-green" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Carbon Offset</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.totalCarbonOffset ? `${stats.totalCarbonOffset} lbs CO2` : '0 lbs CO2'}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CalendarIcon className="h-8 w-8 text-forest-green" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">This Month</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.recentTrees?.filter(tree => {
                  const plantedDate = new Date(tree.planted_date);
                  const now = new Date();
                  return plantedDate.getMonth() === now.getMonth() && 
                         plantedDate.getFullYear() === now.getFullYear();
                }).length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Link
            to="/plant"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <PlusIcon className="h-6 w-6 text-forest-green mr-3" />
            <span className="font-medium">Plant Tree</span>
          </Link>
          <Link
            to="/trees"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <SparklesIcon className="h-6 w-6 text-forest-green mr-3" />
            <span className="font-medium">View Trees</span>
          </Link>
          <Link
            to="/map"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <MapIcon className="h-6 w-6 text-forest-green mr-3" />
            <span className="font-medium">View Map</span>
          </Link>
          <Link
            to="/leaderboard"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <TrophyIcon className="h-6 w-6 text-forest-green mr-3" />
            <span className="font-medium">Leaderboard</span>
          </Link>
          <Link
            to="/profile"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ChartBarIcon className="h-6 w-6 text-forest-green mr-3" />
            <span className="font-medium">Profile</span>
          </Link>
        </div>
      </div>

      {/* Recent Trees */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Trees</h2>
          <Link
            to="/trees"
            className="text-forest-green hover:text-green-700 font-medium"
          >
            View All
          </Link>
        </div>
        
        {stats?.recentTrees && stats.recentTrees.length > 0 ? (
          <div className="space-y-4">
            {stats.recentTrees.map((tree) => (
              <div
                key={tree.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-forest-green rounded-full flex items-center justify-center">
                    <SparklesIcon className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-900">
                      {tree.species_name || 'Unknown Species'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Planted {formatDate(tree.planted_date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(tree.health_status)}`}>
                    {tree.health_status.replace('_', ' ')}
                  </span>
                  <Link
                    to={`/trees/${tree.id}`}
                    className="text-forest-green hover:text-green-700 font-medium"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <SparklesIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No trees planted yet</p>
            <Link to="/plant" className="btn-primary">
              Plant Your First Tree
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 