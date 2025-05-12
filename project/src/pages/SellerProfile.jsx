import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SellerProfilePage() {
  const navigate = useNavigate();
  const [seller, setSeller] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    // Fetch seller profile
    fetch('http://localhost:8080/seller/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setSeller(data))
      .catch(err => console.error('Failed to fetch seller profile:', err));

    // Fetch orders
    fetch('http://localhost:8080/seller/orders', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(err => console.error('Failed to fetch orders:', err));
  }, []);

  if (!seller) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500">Loading seller profile...</p>
      </div>
    );
  }

  // Order stats
  const totalOrders = orders.length;
  const acceptedOrders = orders.filter(order => order.status === 'accepted').length;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const completedOrders = orders.filter(order => order.status === 'completed').length;
  const canceledOrders = orders.filter(order => order.status === 'canceled').length;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-md rounded-2xl p-8 w-full max-w-2xl">
        <div className="flex flex-col items-center">
          <img
            className="w-32 h-32 rounded-full object-cover border-4 border-green-500 mb-4"
            src={seller.avatar}
            alt="Seller Avatar"
          />
          <h2 className="text-2xl font-bold text-gray-800">{seller.name}</h2>
          <p className="text-sm text-gray-500">Restaurant Owner</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 w-full text-center">
            <div className="bg-blue-100 p-4 rounded-lg">
              <h3 className="text-xl font-bold">{totalOrders}</h3>
              <p className="text-sm text-gray-600">Total Orders</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg">
              <h3 className="text-xl font-bold">{acceptedOrders}</h3>
              <p className="text-sm text-gray-600">Accepted</p>
            </div>
            <div className="bg-yellow-100 p-4 rounded-lg">
              <h3 className="text-xl font-bold">{pendingOrders}</h3>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
            <div className="bg-purple-100 p-4 rounded-lg">
              <h3 className="text-xl font-bold">{completedOrders}</h3>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
            <div className="bg-red-100 p-4 rounded-lg">
              <h3 className="text-xl font-bold">{canceledOrders}</h3>
              <p className="text-sm text-gray-600">Canceled</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/edit-seller-profile')}
            className="mt-6 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Edit Restaurant Profile
          </button>
        </div>
      </div>
    </div>
  );
}
