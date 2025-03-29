import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function SignupPage() {
  const [role, setRole] = useState('customer');
  const [profilePic, setProfilePic] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleProfilePicChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfilePic(file);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('password', password);
    formData.append('confirmPassword', confirmPassword);
    formData.append('role', role);
    if (profilePic) {
      formData.append('profilePic', profilePic);
    }

    try {
      const response = await axios.post('http://localhost:8080/signup', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        setMessage('Account created successfully!');
        setTimeout(() => {
          window.location.reload();
        }, 2000); // Reload after 2 seconds
      } else {
        setMessage('Error signing up. Please try again.');
      }
    } catch (error) {
      setMessage('Error during signup: ' + error.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 py-12 px-6 sm:px-8 lg:px-10">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>
        {message && <p className="text-center text-green-600 font-semibold">{message}</p>}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm space-y-4">
            <input
              id="name"
              name="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Full name"
            />
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Email address"
            />
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Phone number"
            />
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Password"
            />
            <input
              id="password-confirm"
              name="password-confirm"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Confirm password"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
            <input
              id="profile-pic"
              name="profile-pic"
              type="file"
              accept="image/*"
              onChange={handleProfilePicChange}
              className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            {profilePic && (
              <div className="mt-2">
                <img src={URL.createObjectURL(profilePic)} alt="Profile preview" className="w-32 h-32 object-cover rounded-full mx-auto" />
              </div>
            )}
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Sign up as:</label>
            <div className="flex space-x-4 mt-1">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="customer"
                  checked={role === 'customer'}
                  onChange={() => setRole('customer')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-gray-700">Customer</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="seller"
                  checked={role === 'seller'}
                  onChange={() => setRole('seller')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-gray-700">Seller</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create account
          </button>
        </form>
      </div>
    </div>
  );
}
