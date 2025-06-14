import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import bcrypt from 'bcryptjs';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    user_type: 'customer'
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const navigate              = useNavigate();

  const handleChange = e => {
    const { name, value } = e.target;
    console.log('🔹 field change:', name, value);
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    console.log('🔹 signup submit:', formData);
    setError('');

    const { name, email, phone, password, user_type } = formData;
    if (!name || !email || !phone || !password) {
      setError('All fields are required.');
      return;
    }

    setLoading(true);
    try {
      // 1. Generate a salt + hash the password
      const saltRounds = 10;
      console.log('🔹 hashing password...');
      const hash = await bcrypt.hash(password, saltRounds);
      console.log('🔹 hash generated:', hash);

      // 2. Store the “registeredUser” object with hash, no plaintext
      const registeredUser = { name, email, phone, role: user_type, passwordHash: hash };
      console.log('🔹 storing registeredUser:', registeredUser);
      localStorage.setItem('registeredUser', JSON.stringify(registeredUser));

      // 3. Clear any prior session
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');

      // 4. Navigate to login
      navigate('/login');
    } catch (err) {
      console.error('🔹 signup error:', err);
      setError('Failed to sign up.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold text-center mb-6">
          Create your account
        </h2>
        {error && (
          <div className="mb-4 text-red-500 text-center">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Full name"
            className="w-full p-2 border rounded"
            required
          />
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full p-2 border rounded"
            required
          />
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone"
            className="w-full p-2 border rounded"
            required
          />
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full p-2 border rounded"
            required
          />

          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="user_type"
                value="customer"
                checked={formData.user_type === 'customer'}
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
                checked={formData.user_type === 'seller'}
                onChange={handleChange}
                className="mr-2"
              />
              Restaurant Owner
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-70"
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <p className="mt-4 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}