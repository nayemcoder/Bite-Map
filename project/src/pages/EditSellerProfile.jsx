import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function EditSellerProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', profileImage: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return navigate('/login');

    axios.get('/sellers/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        const u = res.data.user;
        setFormData(fd => ({ ...fd, name: u.name, email: u.email }));
      })
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === 'profileImage') {
      setFormData(fd => ({ ...fd, profileImage: files[0] }));
    } else {
      setFormData(fd => ({ ...fd, [name]: value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('email', formData.email);
    if (formData.password) payload.append('password', formData.password);
    if (formData.profileImage) payload.append('profileImage', formData.profileImage);

    try {
      await axios.put('/sellers/profile', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Profile updated!');
      navigate('/seller-dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  if (loading) return <p>Loading…</p>;

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data"
      className="p-8 bg-white rounded-lg shadow max-w-lg mx-auto mt-10">
      <h2 className="text-xl font-semibold mb-4">Edit Seller Profile</h2>
      {['name','email','password'].map(f => (
        <div key={f} className="mb-4">
          <label className="block mb-1 capitalize">
            {f === 'password' ? 'New Password' : f.charAt(0).toUpperCase()+f.slice(1)}
          </label>
          <input
            type={f==='password'?'password':'text'} 
            name={f}
            value={formData[f]}
            onChange={handleChange}
            placeholder={f==='password'?'Leave blank':''}
            className="w-full p-2 border rounded"
          />
        </div>
      ))}
      <div className="mb-4">
        <label className="block mb-1">Profile Picture</label>
        <input type="file" name="profileImage" accept="image/*"
          onChange={handleChange}/>
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Save Changes
      </button>
    </form>
  );
}