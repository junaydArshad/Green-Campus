import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Tree, TreeMeasurement, TreePhoto, CareActivity } from '../types';
import { treesAPI, growthAPI, careAPI } from '../services/api';
import Modal from 'react-modal';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { TrashIcon } from '@heroicons/react/24/outline';

const mapContainerStyle = {
  width: '100%',
  height: '300px',
};

const TreeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tree, setTree] = useState<Tree | null>(null);
  const [measurements, setMeasurements] = useState<TreeMeasurement[]>([]);
  const [photos, setPhotos] = useState<TreePhoto[]>([]);
  const [activities, setActivities] = useState<CareActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showCareModal, setShowCareModal] = useState(false);

  // Form state
  const [measurementValue, setMeasurementValue] = useState('');
  const [measurementNotes, setMeasurementNotes] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoCaption, setPhotoCaption] = useState('');
  const [careType, setCareType] = useState<CareActivity['activity_type']>('watering');
  const [careDate, setCareDate] = useState('');
  const [careNotes, setCareNotes] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [deletingPhoto, setDeletingPhoto] = useState<number | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
  });

  useEffect(() => {
    if (id) {
      fetchTreeData();
    }
  }, [id]);

  const fetchTreeData = async () => {
    try {
      setLoading(true);
      const treeId = parseInt(id!);
      
      const [treeData, measurementsData, photosData, activitiesData] = await Promise.all([
        treesAPI.getById(treeId),
        growthAPI.getMeasurements(treeId),
        growthAPI.getPhotos(treeId),
        careAPI.getActivities(treeId)
      ]);

      setTree(treeData);
      setMeasurements(measurementsData);
      setPhotos(photosData);
      setActivities(activitiesData);
    } catch (err) {
      setError('Failed to load tree data');
      console.error('Error fetching tree data:', err);
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

  // Get watering frequency based on tree species
  const getWateringFrequency = (speciesName?: string) => {
    if (!speciesName) return 7; // Default to weekly
    
    const species = speciesName.toLowerCase();
    if (species.includes('willow')) return 3; // Willow needs frequent watering
    if (species.includes('oak')) return 7; // Oak weekly
    if (species.includes('maple')) return 5; // Maple every 5 days
    if (species.includes('pine')) return 10; // Pine is drought tolerant
    if (species.includes('cherry')) return 6; // Cherry every 6 days
    
    return 7; // Default weekly
  };

  // Get last watering date
  const getLastWatering = () => {
    const wateringActivities = activities.filter(activity => activity.activity_type === 'watering');
    if (wateringActivities.length === 0) return null;
    
    // Sort by date and get the most recent
    return wateringActivities.sort((a, b) => 
      new Date(b.activity_date).getTime() - new Date(a.activity_date).getTime()
    )[0];
  };

  // Check if tree needs watering
  const needsWatering = () => {
    const lastWatering = getLastWatering();
    if (!lastWatering) return true; // If never watered, needs watering
    
    const frequency = getWateringFrequency(tree?.species_name);
    const lastWateringDate = new Date(lastWatering.activity_date);
    const today = new Date();
    const daysSinceWatering = Math.floor((today.getTime() - lastWateringDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysSinceWatering >= frequency;
  };

  // Get days since last watering
  const getDaysSinceWatering = () => {
    const lastWatering = getLastWatering();
    if (!lastWatering) return null;
    
    const lastWateringDate = new Date(lastWatering.activity_date);
    const today = new Date();
    return Math.floor((today.getTime() - lastWateringDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Handlers for modals
  const openMeasurementModal = () => { setShowMeasurementModal(true); setActionError(''); };
  const closeMeasurementModal = () => { setShowMeasurementModal(false); setMeasurementValue(''); setMeasurementNotes(''); };
  const openPhotoModal = () => { setShowPhotoModal(true); setActionError(''); };
  const closePhotoModal = () => { setShowPhotoModal(false); setPhotoFile(null); setPhotoCaption(''); };
  const openCareModal = () => { setShowCareModal(true); setActionError(''); };
  const closeCareModal = () => { setShowCareModal(false); setCareType('watering'); setCareDate(''); setCareNotes(''); };

  // Submit handlers
  const handleAddMeasurement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!measurementValue || isNaN(Number(measurementValue))) {
      setActionError('Please enter a valid height.');
      return;
    }
    setActionLoading(true);
    try {
      await growthAPI.addMeasurement(Number(id), {
        height_cm: Number(measurementValue),
        measurement_date: new Date().toISOString().slice(0, 10),
        notes: measurementNotes,
      });
      closeMeasurementModal();
      fetchTreeData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to add measurement');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUploadPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoFile) {
      setActionError('Please select a photo.');
      return;
    }
    setActionLoading(true);
    try {
      await growthAPI.addPhoto(Number(id), photoFile, photoCaption);
      closePhotoModal();
      fetchTreeData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to upload photo');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddCare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!careDate) {
      setActionError('Please select a date.');
      return;
    }
    setActionLoading(true);
    try {
      await careAPI.addActivity(Number(id), {
        activity_type: careType,
        activity_date: careDate,
        notes: careNotes,
      });
      closeCareModal();
      fetchTreeData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to log care activity');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) {
      return;
    }
    
    setDeletingPhoto(photoId);
    try {
      await growthAPI.deletePhoto(Number(id), photoId);
      fetchTreeData(); // Refresh the data
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete photo');
    } finally {
      setDeletingPhoto(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !tree) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error || 'Tree not found'}</p>
        <Link
          to="/trees"
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Back to Trees
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            to="/trees"
            className="text-green-600 hover:text-green-700 flex items-center gap-1"
          >
            ← Back to Trees
          </Link>
        </div>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{tree.species_name}</h1>
            <p className="text-gray-600 mt-2">Planted on {formatDate(tree.planted_date)}</p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthStatusColor(
              tree.health_status
            )}`}
          >
            {tree.health_status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Map showing tree location */}
      {isLoaded && tree && tree.latitude && tree.longitude && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Tree Location</h2>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={{ lat: tree.latitude, lng: tree.longitude }}
            zoom={18}
            options={{
              streetViewControl: false,
              mapTypeControl: false,
            }}
            mapTypeId="satellite"
          >
            <Marker position={{ lat: tree.latitude, lng: tree.longitude }} />
          </GoogleMap>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Tree Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Tree Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Current Height</p>
                <p className="text-lg font-medium">{tree.current_height_cm} cm</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="text-lg font-medium">
                  {tree.latitude.toFixed(6)}, {tree.longitude.toFixed(6)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Age</p>
                <p className="text-lg font-medium">
                  {Math.floor((new Date().getTime() - new Date(tree.planted_date).getTime()) / (1000 * 60 * 60 * 24))} days
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="text-lg font-medium">{formatDate(tree.updated_at || tree.created_at!)}</p>
              </div>
            </div>
            {tree.notes && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">Notes</p>
                <p className="text-gray-900 italic">"{tree.notes}"</p>
              </div>
            )}
          </div>

          {/* Growth Measurements */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Growth Measurements</h2>
            {measurements.length === 0 ? (
              <p className="text-gray-500">No measurements recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {measurements.map((measurement) => (
                  <div key={measurement.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{measurement.height_cm} cm</p>
                      <p className="text-sm text-gray-600">{formatDate(measurement.measurement_date)}</p>
                    </div>
                    {measurement.notes && (
                      <p className="text-sm text-gray-500 italic">{measurement.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Photos */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Photos</h2>
            {photos.length === 0 ? (
              <p className="text-gray-500">No photos uploaded yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="bg-gray-100 rounded-lg p-4 relative">
                    <button
                      onClick={() => handleDeletePhoto(photo.id!)}
                      disabled={deletingPhoto === photo.id}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 disabled:opacity-50 z-10"
                      title="Delete photo"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                    <div className="aspect-w-16 aspect-h-9 mb-2">
                      <img
                        src={`http://localhost:4000${photo.photo_url}`}
                        alt={photo.caption || 'Tree photo'}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                    <p className="text-sm text-gray-600">{formatDate(photo.taken_at!)}</p>
                    {photo.caption && (
                      <p className="text-sm text-gray-900 mt-1">{photo.caption}</p>
                    )}
                    {deletingPhoto === photo.id && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                        <div className="text-white">Deleting...</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {actionError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{actionError}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Watering Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Watering Status</h2>
            {needsWatering() ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Please water the tree today!</h3>
                    <p className="text-sm text-red-700 mt-1">
                      {getLastWatering() 
                        ? `It's been ${getDaysSinceWatering()} days since last watering`
                        : 'This tree has never been watered'
                      }
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Tree is well watered!</h3>
                    <p className="text-sm text-green-700 mt-1">
                      Last watered {getDaysSinceWatering()} days ago
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Watering Frequency:</span>
                <span className="text-sm font-medium">
                  Every {getWateringFrequency(tree?.species_name)} days
                </span>
              </div>
              {getLastWatering() && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Last Watered:</span>
                  <span className="text-sm font-medium">
                    {formatDate(getLastWatering()!.activity_date)}
                  </span>
                </div>
              )}
              {tree?.care_instructions && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Care Tip:</strong> {tree.care_instructions}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Care Activities */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Care Activities</h2>
            {activities.length === 0 ? (
              <p className="text-gray-500">No care activities recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium capitalize">{activity.activity_type.replace('_', ' ')}</p>
                        <p className="text-sm text-gray-600">{formatDate(activity.activity_date)}</p>
                      </div>
                    </div>
                    {activity.notes && (
                      <p className="text-sm text-gray-500 mt-2">{activity.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {needsWatering() && (
                <button 
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 font-medium" 
                  onClick={() => {
                    setCareType('watering');
                    setCareDate(new Date().toISOString().slice(0, 10));
                    setCareNotes('Quick watering logged');
                    openCareModal();
                  }}
                >
                  💧 Water Tree Now
                </button>
              )}
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700" onClick={openMeasurementModal}>
                Add Measurement
              </button>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700" onClick={openPhotoModal}>
                Upload Photo
              </button>
              <button className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700" onClick={openCareModal}>
                Log Care Activity
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Modals */}
      <Modal isOpen={showMeasurementModal} onRequestClose={closeMeasurementModal} ariaHideApp={false} className="fixed inset-0 flex items-center justify-center z-50">
        <form onSubmit={handleAddMeasurement} className="bg-white p-6 rounded-lg shadow-lg w-80">
          <h3 className="text-lg font-bold mb-4">Add Measurement</h3>
          <input type="number" className="w-full border p-2 mb-2" placeholder="Height (cm)" value={measurementValue} onChange={e => setMeasurementValue(e.target.value)} required />
          <input type="text" className="w-full border p-2 mb-2" placeholder="Notes (optional)" value={measurementNotes} onChange={e => setMeasurementNotes(e.target.value)} />
          {actionError && <p className="text-red-600 text-sm mb-2">{actionError}</p>}
          <div className="flex gap-2">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded" disabled={actionLoading}>{actionLoading ? 'Adding...' : 'Add'}</button>
            <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={closeMeasurementModal}>Cancel</button>
          </div>
        </form>
      </Modal>
      <Modal isOpen={showPhotoModal} onRequestClose={closePhotoModal} ariaHideApp={false} className="fixed inset-0 flex items-center justify-center z-50">
        <form onSubmit={handleUploadPhoto} className="bg-white p-6 rounded-lg shadow-lg w-80" encType="multipart/form-data">
          <h3 className="text-lg font-bold mb-4">Upload Photo</h3>
          <input type="file" accept="image/*" className="w-full mb-2" onChange={e => setPhotoFile(e.target.files?.[0] || null)} required />
          <input type="text" className="w-full border p-2 mb-2" placeholder="Caption (optional)" value={photoCaption} onChange={e => setPhotoCaption(e.target.value)} />
          {actionError && <p className="text-red-600 text-sm mb-2">{actionError}</p>}
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={actionLoading}>{actionLoading ? 'Uploading...' : 'Upload'}</button>
            <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={closePhotoModal}>Cancel</button>
          </div>
        </form>
      </Modal>
      <Modal isOpen={showCareModal} onRequestClose={closeCareModal} ariaHideApp={false} className="fixed inset-0 flex items-center justify-center z-50">
        <form onSubmit={handleAddCare} className="bg-white p-6 rounded-lg shadow-lg w-80">
          <h3 className="text-lg font-bold mb-4">Log Care Activity</h3>
          <select className="w-full border p-2 mb-2" value={careType} onChange={e => setCareType(e.target.value as CareActivity['activity_type'])}>
            <option value="watering">Watering</option>
            <option value="fertilizing">Fertilizing</option>
            <option value="pruning">Pruning</option>
            <option value="other">Other</option>
          </select>
          <input type="date" className="w-full border p-2 mb-2" value={careDate} onChange={e => setCareDate(e.target.value)} required />
          <input type="text" className="w-full border p-2 mb-2" placeholder="Notes (optional)" value={careNotes} onChange={e => setCareNotes(e.target.value)} />
          {actionError && <p className="text-red-600 text-sm mb-2">{actionError}</p>}
          <div className="flex gap-2">
            <button type="submit" className="bg-yellow-600 text-white px-4 py-2 rounded" disabled={actionLoading}>{actionLoading ? 'Logging...' : 'Log'}</button>
            <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={closeCareModal}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TreeDetail; 