// src/pages/SellerManagementPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate }                from 'react-router-dom';
import axios                           from 'axios';
import defaultCover                    from '../assets/default-cover.jpg';
import defaultProfile                  from '../assets/default-profile.png';

export default function SellerManagementPage() {
  const navigate = useNavigate();
  const [profile, setProfile]   = useState({ user: null, restaurant: null });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  // Fetch profile...
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return navigate('/login');
    axios.get('/sellers/profile', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setProfile(res.data))
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false));
  }, [navigate]);

  // Fetch bookings...
  useEffect(() => {
    if (!profile.restaurant) return;
    axios.get('/bookings', { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } })
      .then(res => setBookings(res.data.data || []))
      .catch(() => setError('Failed to load bookings'));
  }, [profile.restaurant]);

  const changeStatus = (id, status) => {
    axios.put(
      `/bookings/${id}/status`,
      { status },
      { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
    )
    .then(() => {
      setBookings(bs => bs.map(b => (b.id === id ? { ...b, status } : b)));
    })
    .catch(() => alert('Cannot update status'));
  };

  if (loading) return <p className="p-6">Loading dashboard…</p>;
  if (!profile.user) return <p className="p-6 text-red-500">Not authorized</p>;

  const { user, restaurant } = profile;

  return (
    <div className="min-h-screen bg-gray-100 space-y-8 p-6">
      <h1 className="text-3xl font-bold">Management Dashboard</h1>

      {/* User & Restaurant */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* User */}
        <div className="bg-white p-6 rounded shadow relative">
          <button
            onClick={() => navigate('/edit-seller-profile')}
            className="absolute top-4 right-4 bg-blue-600 text-white px-2 py-1 rounded"
          >
            Edit Profile
          </button>
          <img
            src={user.profileImage || defaultProfile}
            alt="Owner"
            className="w-24 h-24 rounded-full border-4 border-gray-300 mb-4 object-cover"
          />
          <h2 className="text-xl font-semibold">{user.name}</h2>
          <p className="text-gray-600">{user.email}</p>
          <p className="text-gray-600">{user.phone}</p>
        </div>

        {/* Restaurant */}
        <div className="bg-white rounded shadow overflow-hidden relative">
          <button
            onClick={() => navigate(`/edit-restaurant/${restaurant.id}`)}
            className="absolute top-4 right-4 bg-green-600 text-white px-2 py-1 rounded"
          >
            Edit Restaurant
          </button>
          <div
            className="h-48 bg-cover bg-center"
            style={{ backgroundImage: `url(${restaurant.coverImage || defaultCover})` }}
          />
          <div className="p-6">
            <h2 className="text-2xl font-semibold">{restaurant.name}</h2>
            <p className="text-gray-600">{restaurant.cuisineType}</p>
            <p className="mt-2 text-gray-700">{restaurant.description}</p>
          </div>
        </div>
      </div>

      {/* Bookings */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">Manage Bookings</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {!bookings.length ? (
          <p>No bookings yet.</p>
        ) : (
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-gray-100">
              <tr>
                {['ID','Customer','Email','Date','Time','Party','Requests','Status','Actions'].map(h => (
                  <th key={h} className="p-2 border text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{b.id}</td>
                  <td className="p-2 border">{b.customer_name}</td>
                  <td className="p-2 border">{b.customer_email}</td>
                  <td className="p-2 border">{b.booking_date}</td>
                  <td className="p-2 border">{b.booking_time}</td>
                  <td className="p-2 border">{b.number_of_people}</td>
                  <td className="p-2 border">{b.special_requests || '-'}</td>
                  <td className="p-2 border capitalize">{b.status}</td>
                  <td className="p-2 border space-x-1">
                    {['confirmed','canceled','completed'].map(st => (
                      <button
                        key={st}
                        disabled={b.status === st}
                        onClick={() => changeStatus(b.id, st)}
                        className={`px-2 py-1 rounded text-white ${
                          st === 'confirmed' ? 'bg-blue-500' :
                          st === 'canceled'  ? 'bg-red-500'  :
                          'bg-green-500'
                        } disabled:opacity-50`}
                      >
                        {st.charAt(0).toUpperCase() + st.slice(1)}
                      </button>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}