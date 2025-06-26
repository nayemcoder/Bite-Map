// src/pages/SellerProfilePage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate }                from 'react-router-dom';
import axios                           from 'axios';
import defaultCover                    from '../assets/default-cover.jpg';
import defaultProfile                  from '../assets/default-profile.png';

export default function SellerProfilePage() {
  const navigate = useNavigate();

  const [profile, setProfile]         = useState({ user: null, restaurant: null });
  const [loading, setLoading]         = useState(true);
  const [menuItems, setMenuItems]     = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);

  // NEW: reviews state
  const [reviews, setReviews]             = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Load seller profile (user + restaurant)
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return navigate('/login');

    axios
      .get('/sellers/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setProfile(res.data))
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false));
  }, [navigate]);

  // Load menu once we have restaurant
  useEffect(() => {
    if (!profile.restaurant) return;

    axios
      .get(`/restaurants/${profile.restaurant.id}/menu`)
      .then(res => setMenuItems(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoadingMenu(false));
  }, [profile.restaurant]);

  // NEW: Load reviews once we have restaurant
  useEffect(() => {
    if (!profile.restaurant) return;

    axios
      .get(`/restaurants/${profile.restaurant.id}/reviews`)
      .then(res => {
        setReviews(res.data.reviews || []);
      })
      .catch(console.error)
      .finally(() => setLoadingReviews(false));
  }, [profile.restaurant]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <svg className="animate-spin h-10 w-10 text-indigo-600" viewBox="0 0 24 24">
          <circle
            cx="12" cy="12" r="10"
            stroke="currentColor" strokeWidth="4"
            fill="none" className="opacity-25"
          />
          <path
            d="M4 12a8 8 0 018-8v8z"
            fill="currentColor" className="opacity-75"
          />
        </svg>
      </div>
    );
  }

  const { user, restaurant } = profile;
  if (!user || !restaurant) {
    return <p className="p-6 text-center text-red-500">No profile found.</p>;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div
        className="relative h-80 bg-cover bg-center"
        style={{ backgroundImage: `url(${restaurant.coverImage || defaultCover})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <h1 className="text-4xl md:text-5xl text-white font-bold">
            {restaurant.name}
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Owner Card */}
        <div className="relative bg-white shadow-lg rounded-lg p-6 flex items-center space-x-6 -mt-16">
          <img
            src={user.profileImage || defaultProfile}
            alt="Owner"
            className="w-28 h-28 rounded-full border-4 border-white object-cover shadow"
          />
          <div>
            <h2 className="text-2xl font-semibold">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
            <button
              onClick={() => navigate('/edit-seller-profile')}
              className="mt-4 inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full shadow"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Go to Dashboard */}
        <div className="text-right">
          <button
            onClick={() => navigate('/seller-dashboard/manage')}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full shadow-lg transform hover:-translate-y-1 transition"
          >
            Go to Dashboard
          </button>
        </div>

        {/* About Section */}
        <section className="bg-white shadow-lg rounded-lg p-6 space-y-2">
          <h3 className="text-2xl font-semibold">About Restaurant</h3>
          <p className="text-gray-700">{restaurant.description}</p>
          <div className="mt-4 space-y-1 text-gray-600">
            <p>📍 {restaurant.address}</p>
            <p>📞 {restaurant.contact_phone}</p>
            <p>🍽 {restaurant.cuisineType}</p>
          </div>
        </section>

        {/* Menu Grid */}
        <section className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-2xl font-semibold mb-4">Menu</h3>
          {loadingMenu ? (
            <div className="flex justify-center">
              <svg className="animate-spin h-8 w-8 text-gray-500" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" />
                <path d="M4 12a8 8 0 018-8v8z" fill="currentColor" className="opacity-75" />
              </svg>
            </div>
          ) : menuItems.length === 0 ? (
            <p className="text-gray-600">No menu items yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {menuItems.map(item => (
                <div
                  key={item.id}
                  className="bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition"
                >
                  <img
                    src={item.imageUrl || defaultCover}
                    alt={item.name}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-4">
                    <h4 className="text-lg font-semibold">{item.name}</h4>
                    <p className="text-gray-500 text-sm mb-2 truncate">
                      {item.description}
                    </p>
                    <span className="text-green-600 font-bold">
                      ৳{item.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Customer Reviews */}
        <section className="bg-white shadow-lg rounded-lg p-6 space-y-4">
          <h3 className="text-2xl font-semibold">Customer Reviews</h3>

          {loadingReviews ? (
            <div className="flex justify-center">
              <svg className="animate-spin h-8 w-8 text-gray-500" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" />
                <path d="M4 12a8 8 0 018-8v8z" fill="currentColor" className="opacity-75" />
              </svg>
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-gray-600">No reviews yet.</p>
          ) : (
            reviews.map(r => (
              <div key={r.id} className="border-b pb-4">
                <p className="font-medium">{r.user_name}</p>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="h-5 w-5"
                      fill={i < r.rating ? "#f59e0b" : "#e5e7eb"}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.947a1 1 0 00.95.69h4.154c.969 0 1.371 1.24.588 1.81l-3.36 2.44a1 1 0 00-.364 1.118l1.286 3.946c.3.922-.755 1.688-1.539 1.118l-3.36-2.44a1 1 0 00-1.175 0l-3.36 2.44c-.784.57-1.838-.196-1.539-1.118l1.286-3.946a1 1 0 00-.364-1.118L2.07 9.374c-.783-.57-.38-1.81.588-1.81h4.154a1 1 0 00.95-.69l1.286-3.947z" />
                    </svg>
                  ))}
                  <span className="text-gray-600 ml-2">{r.rating}/5</span>
                </div>
                <p className="text-gray-700 mt-1">{r.comment}</p>
                <p className="text-gray-500 text-sm">
                  {new Date(r.created_at).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}