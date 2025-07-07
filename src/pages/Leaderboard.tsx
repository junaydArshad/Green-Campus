import React, { useState, useEffect } from 'react';
import { LeaderboardEntry } from '../types';
import { userAPI } from '../services/api';

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await userAPI.getLeaderboard();
      setLeaderboard(data);
    } catch (err) {
      setError('Failed to load leaderboard');
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMedal = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇'; // Platinum (using gold medal for platinum)
      case 2:
        return '🥈'; // Gold (using silver medal for gold)
      case 3:
        return '🥉'; // Silver (using bronze medal for silver)
      default:
        return '🏅'; // Bronze (using sports medal for bronze)
    }
  };

  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-purple-400 to-pink-400 text-white'; // Platinum
      case 2:
        return 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'; // Gold
      case 3:
        return 'bg-gradient-to-r from-gray-300 to-gray-400 text-white'; // Silver
      default:
        return 'bg-gradient-to-r from-amber-600 to-orange-600 text-white'; // Bronze
    }
  };

  const getRankText = (rank: number) => {
    switch (rank) {
      case 1:
        return 'Platinum';
      case 2:
        return 'Gold';
      case 3:
        return 'Silver';
      default:
        return 'Bronze';
    }
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
          onClick={fetchLeaderboard}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🌳 Tree Planting Leaderboard</h1>
        <p className="text-gray-600">See who's making the biggest impact on our green campus!</p>
      </div>

      {leaderboard.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🌱</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Trees Planted Yet</h2>
          <p className="text-gray-600">Be the first to plant a tree and claim the top spot!</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-green-500 to-green-600">
            <h2 className="text-xl font-semibold text-white">Top Tree Planters</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.id}
                className={`px-6 py-4 hover:bg-gray-50 transition-colors duration-200 ${
                  index < 3 ? 'bg-gradient-to-r from-green-50 to-blue-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold ${getMedalColor(entry.rank)}`}>
                      {getMedal(entry.rank)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {entry.full_name}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMedalColor(entry.rank)}`}>
                          {getRankText(entry.rank)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {entry.location || 'Location not specified'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Rank #{entry.rank}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {entry.tree_count}
                    </div>
                    <div className="text-sm text-gray-600">
                      {entry.tree_count === 1 ? 'tree' : 'trees'} planted
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Section */}
      {leaderboard.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">🥇</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Participants</p>
                <p className="text-2xl font-bold text-gray-900">{leaderboard.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">🌳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Trees Planted</p>
                <p className="text-2xl font-bold text-gray-900">
                  {leaderboard.reduce((sum, entry) => sum + entry.tree_count, 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">⭐</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average per Person</p>
                <p className="text-2xl font-bold text-gray-900">
                  {leaderboard.length > 0 
                    ? Math.round(leaderboard.reduce((sum, entry) => sum + entry.tree_count, 0) / leaderboard.length * 10) / 10
                    : 0
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard; 