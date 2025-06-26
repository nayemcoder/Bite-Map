import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    // user fields
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    user_type: 'customer',
    profileImage: null,

    // seller-only restaurant fields
    restaurantName: '',
    restaurantDescription: '',
    restaurantAddress: '',
    restaurantContact: '',
    restaurantCuisine: '',
    restaurantCover: null
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (files) {
      setForm(f => ({ ...f, [name]: files[0] }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    // Basic validation
    const required = ['name', 'email', 'phone', 'address', 'password'];
    for (let key of required) {
      if (!form[key]) {
        setError('All fields are required.');
        return;
      }
    }

    if (form.user_type === 'seller') {
      const rs = ['restaurantName', 'restaurantDescription', 'restaurantAddress', 'restaurantContact', 'restaurantCuisine'];
      for (let key of rs) {
        if (!form[key]) {
          setError('Please fill in all restaurant details.');
          return;
        }
      }
    }

    setLoading(true);
    try {
      // 1) Sign up user (with restaurant fields if seller)
      const res = await axios.post(
        '/auth/signup',
        {
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          password: form.password,
          user_type: form.user_type,
          ...(form.user_type === 'seller' && {
            restaurantName: form.restaurantName,
            restaurantDescription: form.restaurantDescription,
            restaurantAddress: form.restaurantAddress,
            restaurantContact: form.restaurantContact,
            restaurantCuisine: form.restaurantCuisine,
            restaurantCoverFile: form.restaurantCover?.name || null
          })
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const { token, user } = res.data;
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));

      // 2) Upload profile image
      if (form.profileImage) {
        const pf = new FormData();
        pf.append('profileImage', form.profileImage);
        await axios.put(
          form.user_type === 'seller' ? '/sellers/profile' : '/customers/profile',
          pf,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }

      // 3) Upload restaurant cover image (optional)
      if (form.user_type === 'seller' && form.restaurantCover) {
        const rf = new FormData();
        rf.append('cover_image', form.restaurantCover);
        await axios.put(
          `/sellers/restaurants/${user.id}`, // Adjust if needed
          rf,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }

      // 4) Redirect based on role
      const dest = form.user_type === 'seller' ? '/seller-dashboard/manage' : '/home';
      navigate(dest);
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.response?.data?.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow space-y-6">
        <h2 className="text-2xl font-bold text-center">Create your account</h2>
        {error && <div className="text-red-500 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User fields */}
          {['name', 'email', 'phone', 'address', 'password'].map(field => (
            <input
              key={field}
              name={field}
              type={field === 'email' ? 'email' : field === 'password' ? 'password' : 'text'}
              placeholder={field[0].toUpperCase() + field.slice(1)}
              value={form[field]}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          ))}

          {/* Profile picture */}
          <div>
            <label className="block mb-1">Profile Picture</label>
            <input
              type="file"
              name="profileImage"
              accept="image/*"
              onChange={handleChange}
              className="w-full"
            />
          </div>

          {/* Role toggle */}
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="user_type"
                value="customer"
                checked={form.user_type === 'customer'}
                onChange={handleChange}
                className="mr-2"
              />
              Customer
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="user_type"
                value="seller"
                checked={form.user_type === 'seller'}
                onChange={handleChange}
                className="mr-2"
              />
              Restaurant Owner
            </label>
          </div>

          {/* Seller fields */}
          {form.user_type === 'seller' && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-medium">Restaurant Details</h3>

              <input
                name="restaurantName"
                value={form.restaurantName}
                onChange={handleChange}
                placeholder="Restaurant Name"
                className="w-full p-2 border rounded"
                required
              />

              <textarea
                name="restaurantDescription"
                value={form.restaurantDescription}
                onChange={handleChange}
                placeholder="Description"
                rows={3}
                className="w-full p-2 border rounded"
                required
              />

              <input
                name="restaurantAddress"
                value={form.restaurantAddress}
                onChange={handleChange}
                placeholder="Restaurant Address"
                className="w-full p-2 border rounded"
                required
              />

              <input
                name="restaurantContact"
                value={form.restaurantContact}
                onChange={handleChange}
                placeholder="Contact Phone"
                className="w-full p-2 border rounded"
                required
              />

              <input
                name="restaurantCuisine"
                value={form.restaurantCuisine}
                onChange={handleChange}
                placeholder="Cuisine Type"
                className="w-full p-2 border rounded"
                required
              />

              <div>
                <label className="block mb-1">Cover Image</label>
                <input
                  type="file"
                  name="restaurantCover"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-70"
          >
            {loading ? 'Creating account…' : 'Sign up'}
          </button>
        </form>

        <p className="text-center text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
