// src/pages/SellerManagementPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import defaultCover from '../assets/default-cover.jpg';
import defaultProfile from '../assets/default-profile.png';

export default function SellerManagementPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');

  const [profile, setProfile] = useState({ user: null, restaurant: null });
  const [bookings, setBookings] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [menuFiles, setMenuFiles] = useState({});
  const [newMenu, setNewMenu] = useState({
    name: '',
    description: '',
    price: '',
    file: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  // Fetch bookings
  const fetchBookings = () => {
    axios
      .get('/bookings', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setBookings(res.data.data || []))
      .catch(() => setError('Failed to load bookings'));
  };

  // Fetch menu items
  const fetchMenu = () => {
    const rid = profile.restaurant.id;
    axios
      .get(`/restaurants/${rid}/menu`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setMenuItems(res.data.data || []))
      .catch(() => setError('Failed to load menu'))
      .finally(() => setLoading(false));
  };

  // Load seller profile
  useEffect(() => {
    if (!token) return navigate('/login');
    axios
      .get('/sellers/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setProfile(res.data))
      .catch(() => navigate('/login'));
  }, [navigate, token]);

  // Once restaurant is known, fetch bookings & menu
  useEffect(() => {
    if (!profile.restaurant) return;
    setLoading(true);
    fetchBookings();
    fetchMenu();
  }, [profile.restaurant]);

  // Change booking status
  const changeStatus = async (id, newStatus) => {
    setActionLoading(a => ({ ...a, [id]: true }));
    try {
      await axios.put(
        `/bookings/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Keep booking visible; update status in place
      setBookings(bs =>
        bs.map(b => (b.id === id ? { ...b, status: newStatus } : b))
      );
    } catch {
      alert('Operation failed');
    } finally {
      setActionLoading(a => ({ ...a, [id]: false }));
    }
  };

  // Booking action handlers
  const handleConfirm = id =>
    window.confirm('Confirm this booking?') && changeStatus(id, 'confirmed');
  const handleCancel = id =>
    window.confirm('Cancel this booking?') && changeStatus(id, 'canceled');
  const handleComplete = id =>
    window.confirm('Mark this booking as completed?') &&
    changeStatus(id, 'completed');
  const handleDeleteBooking = id => {
    if (!window.confirm('Permanently delete this booking?')) return;
    setActionLoading(a => ({ ...a, [id]: true }));
    axios
      .delete(`/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => {
        setBookings(bs => bs.filter(b => b.id !== id));
      })
      .catch(() => alert('Delete failed'))
      .finally(() => setActionLoading(a => ({ ...a, [id]: false })));
  };

  // Menu item handlers
  const handleMenuChange = (id, field, val) =>
    setMenuItems(items =>
      items.map(i => (i.id === id ? { ...i, [field]: val } : i))
    );
  const handleMenuFile = (id, file) =>
    setMenuFiles(f => ({ ...f, [id]: file }));

  const saveMenuItem = async item => {
    const rid = profile.restaurant.id;
    const form = new FormData();
    form.append('name', item.name);
    form.append('description', item.description);
    form.append('price', item.price);
    if (menuFiles[item.id]) form.append('image', menuFiles[item.id]);
    if (!window.confirm('Save changes to this menu item?')) return;
    try {
      await axios.put(`/restaurants/${rid}/menu/${item.id}`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMenu();
    } catch {
      alert('Failed to save menu item');
    }
  };

  const deleteMenuItem = id => {
    if (!window.confirm('Delete this menu item?')) return;
    const rid = profile.restaurant.id;
    axios
      .delete(`/restaurants/${rid}/menu/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => fetchMenu())
      .catch(() => alert('Failed to delete menu item'));
  };

  const addMenuItem = async () => {
    if (!newMenu.name.trim() || !newMenu.price.trim()) {
      return alert('Name and price are required');
    }
    const rid = profile.restaurant.id;
    const form = new FormData();
    form.append('name', newMenu.name.trim());
    form.append('description', newMenu.description.trim());
    form.append('price', parseFloat(newMenu.price));
    if (newMenu.file) form.append('image', newMenu.file);
    if (!window.confirm('Add this new menu item?')) return;
    try {
      await axios.post(`/restaurants/${rid}/menu`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setNewMenu({ name: '', description: '', price: '', file: null });
      fetchMenu();
    } catch {
      alert('Failed to add menu item');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <svg className="animate-spin h-10 w-10 text-blue-600" viewBox="0 0 24 24">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className="opacity-25"
          />
          <path
            fill="currentColor"
            className="opacity-75"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
      </div>
    );
  }

  // Not authorized
  if (!profile.user || !profile.restaurant) {
    return <p className="p-6 text-center text-red-500">Not authorized.</p>;
  }

  const { user, restaurant } = profile;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Profile & Restaurant */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Owner */}
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <img
            src={user.profileImage || defaultProfile}
            alt="Owner"
            className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
          />
          <h2 className="text-xl font-semibold">{user.name}</h2>
          <p className="text-gray-600">{user.email}</p>
          <button
            onClick={() => navigate('/edit-seller-profile')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Edit Profile
          </button>
        </div>
        {/* Restaurant */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <img
            src={restaurant.coverImage || defaultCover}
            alt="Restaurant"
            className="w-full h-40 object-cover"
          />
          <div className="p-6">
            <h2 className="text-xl font-semibold">{restaurant.name}</h2>
            <p className="text-indigo-600 font-medium">
              {restaurant.cuisineType}
            </p>
            <p className="text-gray-600 mt-2">{restaurant.description}</p>
            <button
              onClick={() => navigate(`/edit-restaurant/${restaurant.id}`)}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Edit Restaurant
            </button>
          </div>
        </div>
      </div>

      {/* Bookings Management */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Manage Bookings</h2>
        {bookings.length === 0 ? (
          <p className="text-gray-600">No bookings yet.</p>
        ) : (
          <div className="space-y-4">
            {bookings.map(b => {
              const busy = actionLoading[b.id];
              return (
                <div
                  key={b.id}
                  className="bg-white p-4 rounded-lg shadow flex flex-col md:flex-row justify-between"
                >
                  {/* Booking Info */}
                  <div className="flex-1">
                    <p className="font-medium">{b.customer_name}</p>
                    <p className="text-gray-500 text-sm">{b.customer_email}</p>
                    <p className="text-gray-700">
                      <strong>Date:</strong> {b.booking_date}
                    </p>
                    <p className="text-gray-700">
                      <strong>Time:</strong> {b.booking_time} – {b.booking_end_time}
                    </p>
                  </div>
                  {/* Actions */}
                  <div className="mt-4 md:mt-0 flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        b.status === 'confirmed'
                          ? 'bg-blue-100 text-blue-800'
                          : b.status === 'canceled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                    </span>

                    {b.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleConfirm(b.id)}
                          disabled={busy}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm disabled:opacity-50"
                        >
                          {busy ? '…' : 'Confirm'}
                        </button>
                        <button
                          onClick={() => handleCancel(b.id)}
                          disabled={busy}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-full text-sm disabled:opacity-50"
                        >
                          {busy ? '…' : 'Cancel'}
                        </button>
                      </>
                    )}

                    {b.status === 'confirmed' && (
                      <>
                        <button
                          onClick={() => handleComplete(b.id)}
                          disabled={busy}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-full text-sm disabled:opacity-50"
                        >
                          {busy ? '…' : 'Complete'}
                        </button>
                        <button
                          onClick={() => handleCancel(b.id)}
                          disabled={busy}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-full text-sm disabled:opacity-50"
                        >
                          {busy ? '…' : 'Cancel'}
                        </button>
                      </>
                    )}

                    {(b.status === 'completed' || b.status === 'canceled') && (
                      <button
                        onClick={() => handleDeleteBooking(b.id)}
                        disabled={busy}
                        className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-full text-sm disabled:opacity-50"
                      >
                        {busy ? '…' : 'Delete'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Menu CRUD */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Manage Menu Items</h2>
        <table className="w-full bg-white rounded-lg shadow overflow-hidden table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Description</th>
              <th className="p-2 text-left">Price</th>
              <th className="p-2 text-left">Image</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map(item => (
              <tr key={item.id} className="border-t">
                <td className="p-2">
                  <input
                    className="w-full border p-1 rounded"
                    value={item.name}
                    onChange={e => handleMenuChange(item.id, 'name', e.target.value)}
                  />
                </td>
                <td className="p-2">
                  <input
                    className="w-full border p-1 rounded"
                    value={item.description}
                    onChange={e =>
                      handleMenuChange(item.id, 'description', e.target.value)
                    }
                  />
                </td>
                <td className="p-2 w-24">
                  <input
                    className="w-full border p-1 rounded"
                    value={item.price}
                    onChange={e => handleMenuChange(item.id, 'price', e.target.value)}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleMenuFile(item.id, e.target.files[0])}
                    className="text-sm"
                  />
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="w-12 h-12 mt-1 rounded object-cover"
                    />
                  )}
                </td>
                <td className="p-2 text-center space-x-2">
                  <button
                    onClick={() => saveMenuItem(item)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => deleteMenuItem(item.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {/* Add new menu item */}
            <tr>
              <td className="p-2">
                <input
                  className="w-full border p-1 rounded"
                  placeholder="Name"
                  value={newMenu.name}
                  onChange={e => setNewMenu(m => ({ ...m, name: e.target.value }))}
                />
              </td>
              <td className="p-2">
                <input
                  className="w-full border p-1 rounded"
                  placeholder="Description"
                  value={newMenu.description}
                  onChange={e =>
                    setNewMenu(m => ({ ...m, description: e.target.value }))
                  }
                />
              </td>
              <td className="p-2 w-24">
                <input
                  className="w-full border p-1 rounded"
                  placeholder="Price"
                  value={newMenu.price}
                  onChange={e => setNewMenu(m => ({ ...m, price: e.target.value }))}
                />
              </td>
              <td className="p-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setNewMenu(m => ({ ...m, file: e.target.files[0] }))}
                  className="text-sm"
                />
              </td>
              <td className="p-2 text-center">
                <button
                  onClick={addMenuItem}
                  className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700"
                >
                  Add
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}