// src/pages/SellerManagementPage.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate }           from "react-router-dom";
import axios                           from "axios";
import defaultCover                    from "../assets/default-cover.jpg";
import defaultProfile                  from "../assets/default-profile.png";

export default function SellerManagementPage() {
  const navigate = useNavigate();
  const token    = localStorage.getItem("authToken");

  const [profile,   setProfile]    = useState({ user: null, restaurant: null });
  const [menuItems, setMenuItems]  = useState([]);
  const [menuFiles, setMenuFiles]  = useState({});
  const [newMenu,   setNewMenu]    = useState({ name: "", description: "", price: "", file: null });
  const [loading,   setLoading]    = useState(true);

  // Load seller & restaurant
  useEffect(() => {
    if (!token) return navigate("/login");
    axios
      .get("/sellers/profile", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setProfile(res.data))
      .catch(() => navigate("/login"));
  }, [navigate, token]);

  // Load menu when restaurant is available
  useEffect(() => {
    const rid = profile.restaurant?.id;
    if (!rid) return;
    setLoading(true);

    axios
      .get(`/restaurants/${rid}/menu`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setMenuItems(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [profile.restaurant, token]);

  // Menu CRUD helpers…
  const handleMenuChange = (id, field, val) =>
    setMenuItems(mi => mi.map(x => (x.id === id ? { ...x, [field]: val } : x)));

  const handleMenuFile = (id, file) =>
    setMenuFiles(f => ({ ...f, [id]: file }));

  const saveMenuItem = async item => {
    const rid = profile.restaurant.id;
    const form = new FormData();
    form.append("name", item.name);
    form.append("description", item.description);
    form.append("price", item.price);
    if (menuFiles[item.id]) form.append("image", menuFiles[item.id]);
    if (!window.confirm("Save changes?")) return;
    try {
      await axios.put(`/restaurants/${rid}/menu/${item.id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const res = await axios.get(`/restaurants/${rid}/menu`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMenuItems(res.data.data || []);
    } catch {}
  };

  const deleteMenuItem = async id => {
    if (!window.confirm("Delete this item?")) return;
    const rid = profile.restaurant.id;
    try {
      await axios.delete(`/restaurants/${rid}/menu/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMenuItems(mi => mi.filter(x => x.id !== id));
    } catch {}
  };

  const addMenuItem = async () => {
    const rid = profile.restaurant.id;
    if (!newMenu.name || !newMenu.price) return;
    const form = new FormData();
    form.append("name", newMenu.name);
    form.append("description", newMenu.description);
    form.append("price", newMenu.price);
    if (newMenu.file) form.append("image", newMenu.file);
    if (!window.confirm("Add menu item?")) return;
    try {
      await axios.post(`/restaurants/${rid}/menu`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewMenu({ name: "", description: "", price: "", file: null });
      const res = await axios.get(`/restaurants/${rid}/menu`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMenuItems(res.data.data || []);
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-indigo-600" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25"/>
          <path d="M4 12a8 8 0 018-8v8z" fill="currentColor" className="opacity-75"/>
        </svg>
      </div>
    );
  }

  if (!profile.user) {
    return <p className="text-center text-red-500 p-6">Not authorized</p>;
  }

  const { user, restaurant } = profile;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-12">
      {/* Link to full bookings dashboard */}
      <div className="flex justify-end">
        <Link
          to="/seller/bookings"
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
        >
          View Bookings
        </Link>
      </div>

      {/* Profile & Restaurant cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="flex items-center space-x-4 p-6 bg-white rounded-lg shadow">
          <img
            src={user.profileImage || defaultProfile}
            alt="Owner"
            className="w-20 h-20 rounded-full object-cover"
          />
          <div>
            <h3 className="text-xl font-semibold">{user.name}</h3>
            <p className="text-gray-600">{user.email}</p>
            <button
              onClick={() => navigate("/edit-seller-profile")}
              className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Edit Profile
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <img
            src={restaurant.coverImage || defaultCover}
            alt="Restaurant"
            className="h-44 w-full object-cover"
          />
          <div className="p-6">
            <h3 className="text-xl font-semibold">{restaurant.name}</h3>
            <p className="text-indigo-600">{restaurant.cuisineType}</p>
            <p className="mt-2 text-gray-700">{restaurant.description}</p>
            <button
              onClick={() => navigate(`/edit-restaurant/${restaurant.id}`)}
              className="mt-4 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Edit Restaurant
            </button>
          </div>
        </div>
      </div>

      {/* Menu CRUD */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Manage Menu Items</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {menuItems.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-lg shadow flex flex-col">
              <img
                src={item.imageUrl || defaultCover}
                alt={item.name}
                className="h-36 w-full object-cover rounded"
              />
              <input
                className="mt-2 p-1 border rounded"
                value={item.name}
                onChange={e => handleMenuChange(item.id, "name", e.target.value)}
              />
              <textarea
                rows="2"
                className="mt-1 p-1 border rounded"
                value={item.description}
                onChange={e => handleMenuChange(item.id, "description", e.target.value)}
              />
              <input
                className="mt-1 p-1 border rounded"
                value={item.price}
                onChange={e => handleMenuChange(item.id, "price", e.target.value)}
              />
              <input
                type="file"
                className="mt-1"
                onChange={e => handleMenuFile(item.id, e.target.files[0])}
              />
              <div className="mt-2 flex space-x-2">
                <button
                  onClick={() => saveMenuItem(item)}
                  className="flex-1 bg-blue-600 text-white py-1 rounded hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={() => deleteMenuItem(item.id)}
                  className="flex-1 bg-red-600 text-white py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {/* New item card */}
          <div className="bg-white p-4 rounded-lg shadow flex flex-col">
            <div className="h-36 w-full bg-gray-100 rounded mb-2 flex items-center justify-center">
              <span className="text-gray-500">No image</span>
            </div>
            <input
              className="p-1 border rounded"
              placeholder="Name"
              value={newMenu.name}
              onChange={e => setNewMenu(n => ({ ...n, name: e.target.value }))}
            />
            <textarea
              rows="2"
              className="mt-1 p-1 border rounded"
              placeholder="Description"
              value={newMenu.description}
              onChange={e => setNewMenu(n => ({ ...n, description: e.target.value }))}
            />
            <input
              className="mt-1 p-1 border rounded"
              placeholder="Price"
              value={newMenu.price}
              onChange={e => setNewMenu(n => ({ ...n, price: e.target.value }))}
            />
            <input
              type="file"
              className="mt-1"
              onChange={e => setNewMenu(n => ({ ...n, file: e.target.files[0] }))}
            />
            <button
              onClick={addMenuItem}
              className="mt-auto bg-green-600 text-white py-1 rounded hover:bg-green-700"
            >
              + Add Item
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}