import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function EditSellerProfile() {
  const navigate = useNavigate();
  const [seller, setSeller] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    profilePic: null,
  });

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    fetch('http://localhost:8080/seller/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setSeller(data);
        setFormData((prev) => ({
          ...prev,
          name: data.name || '',
          email: data.email || '',
        }));
      })
      .catch((err) => console.error('Failed to fetch seller profile:', err));
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profilePic') {
      setFormData((prev) => ({ ...prev, profilePic: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('email', formData.email);
    if (formData.password) payload.append('password', formData.password);
    if (formData.profilePic) payload.append('profilePic', formData.profilePic);

    try {
      const res = await fetch('http://localhost:8080/update-profile', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      });

      const result = await res.json();
      if (res.ok) {
        alert('Profile updated successfully!');
        navigate('/seller-profile');
      } else {
        alert(result.message || 'Update failed.');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  if (!seller) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-xl p-8 w-full max-w-xl"
        encType="multipart/form-data"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">Edit Restaurant Profile</h2>

        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-1">New Password (optional)</label>
          <input
            type="password"
            name="password"
            placeholder="Leave blank to keep current password"
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-1">Profile Picture</label>
          <input
            type="file"
            name="profilePic"
            accept="image/*"
            onChange={handleChange}
            className="w-full"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
