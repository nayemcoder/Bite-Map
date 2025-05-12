// src/pages/ProfilePage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:8080/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Ensure user_type is correctly set from backend
        setUser({
          ...response.data,
          user_type: response.data.user_type || 'customer', // Default to customer if not set
          avatar: response.data.profileImage 
            ? `http://localhost:8080/${response.data.profileImage.replace(/\\/g, '/')}`
            : null
        });
      } catch (err) {
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) {
    return <div className="text-center py-8">Loading profile...</div>;
  }

  if (!user) {
    return <div className="text-center py-8">No profile data available</div>;
  }

  const defaultAvatar = 'http://localhost:8080/uploads/cat.png';

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col items-center">
          <img
            className="w-32 h-32 rounded-full border-4 border-blue-100 mb-4"
            src={user.profileImage || defaultAvatar}
            alt="Profile"
            onError={(e) => {
              e.target.src = defaultAvatar;
            }}
          />
          <h2 className="text-xl font-semibold">{user.name}</h2>
          <p className="text-gray-600">{user.email}</p>
          <p className="text-gray-600">{user.phone}</p>
          
          {/* Correct user type display */}
          <div className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            {user.user_type === 'seller' ? 'Restaurant Owner' : 'Food Explorer'}
          </div>

          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => navigate('/edit-profile')}
          >
            Edit Profile
          </button>

          {/* Only show orders/favorites for customers */}
          {user.user_type === 'customer' && (
            <div className="mt-4 flex gap-2">
              <button 
                className="px-3 py-1 bg-gray-100 rounded"
                onClick={() => navigate('/orders')}
              >
                My Orders
              </button>
              <button 
                className="px-3 py-1 bg-gray-100 rounded"
                onClick={() => navigate('/favorites')}
              >
                Favorites
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}