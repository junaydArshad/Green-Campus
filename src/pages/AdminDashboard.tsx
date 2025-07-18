import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import Modal from 'react-modal';

const mapContainerStyle = {
  width: '200px',
  height: '150px',
};

const AdminDashboard: React.FC = () => {
  const [trees, setTrees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ email: string, name: string } | null>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
  });

  useEffect(() => {
    const fetchTrees = async () => {
      setLoading(true);
      setError('');
      try {
        const adminToken = localStorage.getItem('adminToken');
        const res = await fetch('/api/trees/all', {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
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

  const openContactModal = (user: { email: string, name: string }) => {
    setSelectedUser(user);
    setMessage('');
    setSendResult(null);
    setModalOpen(true);
  };

  const closeContactModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
    setMessage('');
    setSendResult(null);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSending(true);
    setSendResult(null);
    try {
      const adminToken = localStorage.getItem('adminToken');
      const res = await fetch('/api/care/send-admin-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          to: selectedUser.email,
          subject: 'Message from Green Campus Admin',
          text: message
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSendResult('Message sent successfully!');
      } else {
        setSendResult(data.error || 'Failed to send message');
      }
    } catch (err) {
      setSendResult('Failed to send message');
    } finally {
      setSending(false);
    }
  };

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
                <th className="px-4 py-2">Map</th>
                <th className="px-4 py-2">Notes</th>
                <th className="px-4 py-2">Contact</th>
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
                  <td className="px-4 py-2 text-center">
                    <button
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                      onClick={() => openContactModal({ email: tree.user_email, name: tree.user_full_name })}
                    >
                      Contact
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Contact Modal */}
          <Modal
            isOpen={modalOpen}
            onRequestClose={closeContactModal}
            contentLabel="Send Message"
            ariaHideApp={false}
            className="fixed inset-0 flex items-center justify-center z-50"
            overlayClassName="fixed inset-0 bg-black bg-opacity-40 z-40"
          >
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Send Message to {selectedUser?.name}</h2>
              <form onSubmit={handleSendMessage}>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-2 mb-4"
                  rows={5}
                  placeholder="Type your message here..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  required
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                    onClick={closeContactModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                    disabled={sending}
                  >
                    {sending ? 'Sending...' : 'Send'}
                  </button>
                </div>
                {sendResult && (
                  <div className={`mt-4 text-center ${sendResult.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{sendResult}</div>
                )}
              </form>
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 