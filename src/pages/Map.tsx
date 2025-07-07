import React, { useState, useEffect } from 'react';
import { Tree } from '../types';
import { mapAPI } from '../services/api';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '500px',
};
const universityCenter = { lat: 30.268945428615723, lng: 66.94405317306519 };

const Map: React.FC = () => {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
  });

  useEffect(() => {
    fetchTrees();
  }, []);

  const fetchTrees = async () => {
    try {
      setLoading(true);
      const response = await mapAPI.getTrees();
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
        return 'bg-green-500';
      case 'needs_care':
        return 'bg-yellow-500';
      case 'struggling':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tree Map</h1>
        <p className="text-gray-600 mt-2">View all your trees on an interactive map</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="rounded-lg overflow-hidden">
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={universityCenter}
                  zoom={14}
                  options={{
                    streetViewControl: false,
                    mapTypeControl: false,
                  }}
                  mapTypeId="satellite"
                >
                  {trees.map((tree) => (
                    <Marker
                      key={tree.id}
                      position={{ lat: tree.latitude, lng: tree.longitude }}
                      onClick={() => setSelectedTree(tree)}
                      icon={{
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor:
                          tree.health_status === 'healthy'
                            ? '#22c55e'
                            : tree.health_status === 'needs_care'
                            ? '#eab308'
                            : '#ef4444',
                        fillOpacity: 1,
                        strokeWeight: 1,
                        strokeColor: '#fff',
                      }}
                      title={`${tree.species_name} - ${tree.health_status}`}
                    />
                  ))}
                </GoogleMap>
              ) : (
                <div className="text-gray-500 h-96 flex items-center justify-center">Loading map...</div>
              )}
            </div>
            {/* Map legend */}
            <div className="mt-4 bg-white rounded-lg shadow-md p-3 inline-block">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Legend</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Healthy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Needs Care</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Struggling</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tree List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Trees</h2>
            {trees.length === 0 ? (
              <p className="text-gray-500 text-sm">No trees found</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {trees.map((tree) => (
                  <div
                    key={tree.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedTree?.id === tree.id
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedTree(tree)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 text-sm">{tree.species_name}</h3>
                        <p className="text-xs text-gray-600">{formatDate(tree.planted_date)}</p>
                      </div>
                      <div
                        className={`w-3 h-3 rounded-full ${getHealthStatusColor(
                          tree.health_status
                        )}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Tree Details */}
          {selectedTree && (
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tree Details</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Species</p>
                  <p className="font-medium">{selectedTree.species_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Health Status</p>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getHealthStatusColor(
                      selectedTree.health_status
                    )} text-white`}
                  >
                    {selectedTree.health_status.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Height</p>
                  <p className="font-medium">{selectedTree.current_height_cm} cm</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Planted</p>
                  <p className="font-medium">{formatDate(selectedTree.planted_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium text-xs">
                    {selectedTree.latitude.toFixed(6)}, {selectedTree.longitude.toFixed(6)}
                  </p>
                </div>
                {selectedTree.notes && (
                  <div>
                    <p className="text-sm text-gray-600">Notes</p>
                    <p className="text-sm italic">"{selectedTree.notes}"</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Map; 