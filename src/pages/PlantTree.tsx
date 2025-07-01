import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tree, TreeSpecies } from '../types';
import { treesAPI, speciesAPI } from '../services/api';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '300px',
};
const defaultCenter = { lat: 30.1798, lng: 66.9750 }; // Quetta as default
const campusCenter = { lat: 30.1798, lng: 66.9747 };
const campusBounds = {
  north: 30.1812,
  south: 30.1782,
  east: 66.9772,
  west: 66.9725,
};
const universityCenter = { lat: 30.268945428615723, lng: 66.94405317306519 };

const PlantTree: React.FC = () => {
  const navigate = useNavigate();
  const [species, setSpecies] = useState<TreeSpecies[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    species_id: '',
    latitude: '',
    longitude: '',
    planted_date: new Date().toISOString().split('T')[0],
    current_height_cm: '',
    health_status: 'healthy' as Tree['health_status'],
    notes: ''
  });

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
  });

  useEffect(() => {
    fetchSpecies();
  }, []);

  const fetchSpecies = async () => {
    try {
      const response = await speciesAPI.getAll();
      setSpecies(response);
    } catch (err) {
      setError('Failed to load tree species');
      console.error('Error fetching species:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.species_id || !formData.latitude || !formData.longitude || !formData.planted_date) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const treeData = {
        species_id: parseInt(formData.species_id),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        planted_date: formData.planted_date,
        current_height_cm: parseFloat(formData.current_height_cm) || 0,
        health_status: formData.health_status,
        notes: formData.notes
      };

      await treesAPI.create(treeData);
      navigate('/trees');
    } catch (err: any) {
      setError(err.message || 'Failed to plant tree');
    } finally {
      setLoading(false);
    }
  };

  // Handler for map click
  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    setFormData(prev => ({
      ...prev,
      latitude: e.latLng!.lat().toString(),
      longitude: e.latLng!.lng().toString(),
    }));
  };

  // Handler for manual lat/lng change (keep marker in sync)
  const handleLatLngChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange(e);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Plant a New Tree</h1>
        <p className="text-gray-600 mt-2">Add a new tree to your collection and start tracking its growth</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Tree Species */}
          <div>
            <label htmlFor="species_id" className="block text-sm font-medium text-gray-700 mb-2">
              Tree Species *
            </label>
            <select
              id="species_id"
              name="species_id"
              value={formData.species_id}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
            >
              <option value="">Select a species</option>
              {species.map((spec) => (
                <option key={spec.id} value={spec.id}>
                  {spec.name} {spec.scientific_name && `(${spec.scientific_name})`}
                </option>
              ))}
            </select>
          </div>

          {/* Google Map for Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Location *</label>
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={formData.latitude && formData.longitude ? { lat: parseFloat(formData.latitude), lng: parseFloat(formData.longitude) } : universityCenter}
                zoom={13}
                onClick={handleMapClick}
                options={{
                  streetViewControl: false,
                  mapTypeControl: false,
                }}
                mapTypeId="satellite"
              >
                {formData.latitude && formData.longitude && (
                  <Marker
                    position={{ lat: parseFloat(formData.latitude), lng: parseFloat(formData.longitude) }}
                    draggable={true}
                    onDragEnd={handleMapClick}
                  />
                )}
              </GoogleMap>
            ) : (
              <div className="text-gray-500">Loading map...</div>
            )}
          </div>

          {/* Location Fields (keep for transparency) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-2">
                Latitude *
              </label>
              <input
                type="number"
                id="latitude"
                name="latitude"
                value={formData.latitude}
                onChange={handleLatLngChange}
                step="any"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., 40.7128"
                required
              />
            </div>
            <div>
              <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-2">
                Longitude *
              </label>
              <input
                type="number"
                id="longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleLatLngChange}
                step="any"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., -74.0060"
                required
              />
            </div>
          </div>

          {/* Planting Date */}
          <div>
            <label htmlFor="planted_date" className="block text-sm font-medium text-gray-700 mb-2">
              Planting Date *
            </label>
            <input
              type="date"
              id="planted_date"
              name="planted_date"
              value={formData.planted_date}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>

          {/* Initial Height */}
          <div>
            <label htmlFor="current_height_cm" className="block text-sm font-medium text-gray-700 mb-2">
              Initial Height (cm)
            </label>
            <input
              type="number"
              id="current_height_cm"
              name="current_height_cm"
              value={formData.current_height_cm}
              onChange={handleInputChange}
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="e.g., 30.5"
            />
          </div>

          {/* Health Status */}
          <div>
            <label htmlFor="health_status" className="block text-sm font-medium text-gray-700 mb-2">
              Health Status
            </label>
            <select
              id="health_status"
              name="health_status"
              value={formData.health_status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="healthy">Healthy</option>
              <option value="needs_care">Needs Care</option>
              <option value="struggling">Struggling</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Any additional notes about the tree..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Planting Tree...' : 'Plant Tree'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/trees')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PlantTree; 