import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import defaultCover from '../assets/default-cover.jpg';
import defaultProfile from '../assets/default-profile.png';

export default function SellerProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ user: null, restaurant: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return navigate('/login');

    axios
      .get('/sellers/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setProfile(res.data))
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) {
    return <p>Loading dashboard…</p>;
  }
  if (!profile.user || !profile.restaurant) {
    return <p>No profile found.</p>;
  }

  const { user, restaurant } = profile;

  return (
    <div className="min-h-screen bg-gray-100">
      <div
        className="h-64 bg-cover bg-center"
        style={{ backgroundImage: `url(${restaurant.coverImage || defaultCover})` }}
      />

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Manage Dashboard Button */}
        <button
          onClick={() => navigate('/seller-dashboard/manage')}
          className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Manage Dashboard
        </button>

        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-2">About</h2>
          <p className="text-gray-700">{restaurant.description}</p>
        </section>

        <section className="bg-white rounded-lg shadow p-6 flex items-center space-x-4">
          <img
            src={user.profileImage || defaultProfile}
            alt="Owner"
            className="w-20 h-20 rounded-full object-cover border-4 border-gray-300"
          />
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
        </section>
      </div>
    </div>
  );
}