// src/pages/EditProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function EditProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePic, setProfilePic] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    fetch('http://localhost:8080/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        setName(data.name);
        setEmail(data.email);
      })
      .catch((err) => console.error('Failed to fetch profile:', err));
  }, [navigate]);

  const handleProfileUpdate = (e) => {
    e.preventDefault();

    const token = localStorage.getItem('authToken');
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    if (password) formData.append('password', password);
    if (profilePic) formData.append('profilePic', profilePic);

    fetch('http://localhost:8080/update-profile', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        alert('Profile updated successfully!');
        navigate('/profile');
      })
      .catch((err) => {
        console.error('Error updating profile:', err);
        alert('Error updating profile. Please try again.');
      });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-800">Edit Profile</h2>
        <form onSubmit={handleProfileUpdate} className="space-y-4 mt-6">
          <div>
            <label htmlFor="name" className="block text-gray-700">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-700">New Password (Optional)</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label htmlFor="profilePic" className="block text-gray-700">Profile Picture</label>
            <input
              type="file"
              id="profilePic"
              accept="image/*"
              onChange={(e) => setProfilePic(e.target.files[0])}
              className="mt-1 w-full"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
}
