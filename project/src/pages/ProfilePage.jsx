// src/pages/ProfilePage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ Import useNavigate

export default function ProfilePage() {
  const navigate = useNavigate(); // ✅ Initialize navigate
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    fetch('http://localhost:8080/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        localStorage.setItem('profilePic', data.avatar); // Optional: For navbar use
      })
      .catch((err) => console.error('Failed to fetch profile:', err));
  }, []);

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  const defaultAvatar = 'http://localhost:8080/uploads/default-avatar.jpg';

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-md">
        <div className="flex flex-col items-center">
          <img
            className="w-32 h-32 rounded-full shadow-lg mb-4 object-cover border-4 border-blue-500"
            src={user.avatar || defaultAvatar}
            alt="User Avatar"
          />
          <h2 className="text-2xl font-semibold text-gray-800">{user.name}</h2>
          <p className="text-gray-500">{user.email}</p>
          <p className="mt-4 text-center text-gray-600">
            {user.bio || 'Food lover. Hungry for more! 🍽️'}
          </p>
          <button
            className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            onClick={() => navigate('/edit-profile')} // ✅ Redirect on click
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
