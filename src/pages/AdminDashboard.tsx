import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '200px',
  height: '150px',
};

const AdminDashboard: React.FC = () => {
  const [trees, setTrees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
  });

  useEffect(() => {
    const fetchTrees = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch('https://d495-2400-adc3-906-4500-d085-f62c-aa92-831d.ngrok-free.app/api/trees/all', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to fetch trees');
        }
        const data = await res.json();
        setTrees(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTrees();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-md">
            <thead>
              <tr>
                <th className="px-4 py-2">Tree ID</th>
                <th className="px-4 py-2">Species</th>
                <th className="px-4 py-2">Planted By</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Health</th>
                <th className="px-4 py-2">Height (cm)</th>
                <th className="px-4 py-2">Planted Date</th>
                <th className="px-4 py-2">Location</th>
                <th className="px-4 py-2">Map</th>
                <th className="px-4 py-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {trees.map(tree => (
                <tr key={tree.id} className="border-t">
                  <td className="px-4 py-2 text-center">{tree.id}</td>
                  <td className="px-4 py-2">{tree.species_name} {tree.scientific_name && <span className="text-xs text-gray-500">({tree.scientific_name})</span>}</td>
                  <td className="px-4 py-2">{tree.user_full_name}</td>
                  <td className="px-4 py-2">{tree.user_email}</td>
                  <td className="px-4 py-2 text-center">{tree.health_status}</td>
                  <td className="px-4 py-2 text-center">{tree.current_height_cm}</td>
                  <td className="px-4 py-2 text-center">{tree.planted_date}</td>
                  <td className="px-4 py-2 text-center">{tree.latitude}, {tree.longitude}</td>
                  <td className="px-4 py-2">
                    {isLoaded && tree.latitude && tree.longitude && (
                      <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={{ lat: tree.latitude, lng: tree.longitude }}
                        zoom={17}
                        options={{ streetViewControl: false, mapTypeControl: false }}
                        mapTypeId="satellite"
                      >
                        <Marker position={{ lat: tree.latitude, lng: tree.longitude }} />
                      </GoogleMap>
                    )}
                  </td>
                  <td className="px-4 py-2">{tree.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 