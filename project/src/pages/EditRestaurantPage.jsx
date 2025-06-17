import React, { useEffect, useState } from 'react';
import { useNavigate, useParams }        from 'react-router-dom';
import axios                              from 'axios';

export default function EditRestaurantPage() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const [data, setData]       = useState({
    name:          '',
    description:   '',
    address:       '',
    contact_phone: '',
    email:         '',
    cuisine_type:  '',
    cover_image:   null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  // Fetch current restaurant details
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    axios.get(`/restaurants/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      const r = res.data;
      setData({
        name:          r.name || '',
        description:   r.description || '',
        address:       r.address || '',
        contact_phone: r.contactPhone || '',
        email:         r.email || '',
        cuisine_type:  r.cuisineType || '',
        cover_image:   null
      });
    })
    .catch(() => {
      alert("Not authorized or restaurant not found");
      navigate('/seller-dashboard');
    })
    .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === 'cover_image') {
      setData(d => ({ ...d, cover_image: files[0] }));
    } else {
      setData(d => ({ ...d, [name]: value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    const token = localStorage.getItem('authToken');
    const form  = new FormData();
    ['name','description','address','contact_phone','email','cuisine_type']
      .forEach(key => form.append(key, data[key]));
    if (data.cover_image) {
      form.append('cover_image', data.cover_image);
    }

    try {
      const res = await axios.put(
        `/sellers/restaurants/${id}`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      alert(res.data.message);
      navigate('/seller-dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  if (loading) return <p className="p-6">Loading…</p>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow space-y-4">
      <h2 className="text-2xl font-semibold">Edit Restaurant</h2>
      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <label className="block mb-1">Name</label>
        <input
          name="name"
          value={data.name}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-4"
          required
        />

        <label className="block mb-1">Description</label>
        <textarea
          name="description"
          value={data.description}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-4"
          rows={4}
        />

        <label className="block mb-1">Address</label>
        <input
          name="address"
          value={data.address}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-4"
        />

        <label className="block mb-1">Contact Phone</label>
        <input
          name="contact_phone"
          value={data.contact_phone}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-4"
        />

        <label className="block mb-1">Email</label>
        <input
          name="email"
          type="email"
          value={data.email}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-4"
        />

        <label className="block mb-1">Cuisine Type</label>
        <input
          name="cuisine_type"
          value={data.cuisine_type}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-4"
        />

        <label className="block mb-1">Cover Image</label>
        <input
          type="file"
          name="cover_image"
          accept="image/*"
          onChange={handleChange}
          className="mb-4"
        />

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}