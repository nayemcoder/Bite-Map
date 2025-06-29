// src/pages/EditProfile.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate }                 from 'react-router-dom';
import axios                           from 'axios';

export default function EditProfile() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    name:         '',
    email:        '',
    phone:        '',
    address:      '',
    password:     '',
    profileImage: null
  });
  const [loading, setLoading] = useState(true);

  // 1) Fetch existing profile
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    axios
      .get('/customers/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        const { name, email, phone, address } = res.data;
        setData(d => ({ ...d, name, email, phone, address }));
      })
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false));
  }, [navigate]);

  // 2) Handle form changes
  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === 'profileImage') {
      setData(d => ({ ...d, profileImage: files[0] }));
    } else {
      setData(d => ({ ...d, [name]: value }));
    }
  };

  // 3) Submit updates
  const handleSubmit = async e => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    const form = new FormData();

    form.append('name', data.name);
    form.append('email', data.email);
    form.append('phone', data.phone);
    form.append('address', data.address);
    if (data.password) form.append('password', data.password);
    if (data.profileImage) form.append('profileImage', data.profileImage);

    try {
      await axios.put('/customers/profile', form, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Profile updated!');
      navigate('/profile');
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  if (loading) return <p className="p-6">Loading…</p>;

  return (
    <form
      onSubmit={handleSubmit}
      encType="multipart/form-data"
      className="p-8 bg-white rounded-lg shadow max-w-lg mx-auto mt-10"
    >
      <h2 className="text-xl font-semibold mb-4">Edit Your Profile</h2>

      {['name','email','phone','address','password'].map(field => (
        <div key={field} className="mb-4">
          <label className="block mb-1 capitalize">
            {field === 'password'
              ? 'New Password'
              : field.charAt(0).toUpperCase() + field.slice(1)}
          </label>
          <input
            type={
              field === 'email'
                ? 'email'
                : field === 'password'
                ? 'password'
                : 'text'
            }
            name={field}
            value={data[field]}
            onChange={handleChange}
            placeholder={field === 'password' ? 'Leave blank' : ''}
            className="w-full p-2 border rounded"
          />
        </div>
      ))}

      <div className="mb-4">
        <label className="block mb-1">Profile Picture</label>
        <input
          type="file"
          name="profileImage"
          accept="image/*"
          onChange={handleChange}
        />
      </div>

      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Update Profile
      </button>
    </form>
  );
}