import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { treesAPI } from '../services/api';
import { Tree } from '../types';

const MyTrees: React.FC = () => {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTrees();
  }, []);

  const fetchTrees = async () => {
    try {
      setLoading(true);
      const response = await treesAPI.getAll();
      setTrees(response);
    } catch (err) {
      setError('Failed to load trees');
      console.error('Error fetching trees:', err);
    } finally {
      setLoading(false);
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'needs_care':
        return 'bg-yellow-100 text-yellow-800';
      case 'struggling':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchTrees}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Trees</h1>
          <p className="text-gray-600 mt-2">Manage and track your planted trees</p>
        </div>
        <Link
          to="/plant"
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Plant New Tree
        </Link>
      </div>

      {trees.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No trees yet</h3>
          <p className="text-gray-600 mb-6">Start your green journey by planting your first tree!</p>
          <Link
            to="/plant"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
          >
            Plant Your First Tree
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trees.map((tree) => (
            <div
              key={tree.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{tree.species_name}</h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthStatusColor(
                      tree.health_status
                    )}`}
                  >
                    {tree.health_status.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Planted: {formatDate(tree.planted_date)}</p>
                  <p>Height: {tree.current_height_cm} cm</p>
                  {tree.notes && (
                    <p className="text-gray-500 italic">"{tree.notes}"</p>
                  )}
                </div>

                <div className="flex justify-between items-center mt-6">
                  <Link
                    to={`/trees/${tree.id}`}
                    className="text-green-600 hover:text-green-700 flex items-center gap-1"
                  >
                    <EyeIcon className="h-4 w-4" />
                    View Details
                  </Link>
                  <div className="flex gap-2">
                    <button className="text-blue-600 hover:text-blue-700">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-700">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTrees; 