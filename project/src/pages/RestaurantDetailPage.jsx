// src/pages/RestaurantDetailPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate }     from "react-router-dom";
import axios                           from "axios";
import defaultCover                    from "../assets/default-cover.jpg";

export default function RestaurantDetailPage() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const token        = localStorage.getItem("authToken");
  const userRole     = localStorage.getItem("userRole");

  const [rest, setRest]               = useState(null);
  const [loadingRest, setLoadingRest] = useState(true);

  const [menu, setMenu]               = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);

  const [availableTables, setAvailableTables] = useState([]);
  const [loadingTables, setLoadingTables]     = useState(false);

  const [form, setForm] = useState({
    booking_date: "",
    booking_start_time: "",
    booking_end_time: "",
    table_ids: [],
    number_of_people: 1,
    special_requests: ""
  });
  const [error, setError] = useState("");

  // Load restaurant (including mapEmbedHtml)
  useEffect(() => {
    axios.get(`/restaurants/${id}`)
      .then(res => setRest(res.data))
      .catch(() => navigate("/restaurants"))
      .finally(() => setLoadingRest(false));
  }, [id, navigate]);

  // Load menu
  useEffect(() => {
    if (!rest) return;
    setLoadingMenu(true);
    axios.get(`/restaurants/${id}/menu`)
      .then(res => setMenu(res.data.data || []))
      .catch(() => setMenu([]))
      .finally(() => setLoadingMenu(false));
  }, [rest, id]);

  // Load available tables
  useEffect(() => {
    const { booking_date, booking_start_time, booking_end_time } = form;
    if (booking_date && booking_start_time && booking_end_time &&
        booking_end_time > booking_start_time) {
      setLoadingTables(true);
      axios.get(`/restaurants/${id}/available-tables`, {
        params: { booking_date, booking_start_time, booking_end_time }
      })
      .then(res => setAvailableTables(res.data.data || []))
      .catch(() => setAvailableTables([]))
      .finally(() => setLoadingTables(false));
    } else {
      setAvailableTables([]);
    }
  }, [
    form.booking_date,
    form.booking_start_time,
    form.booking_end_time,
    id
  ]);

  // Handle form changes
  const handleChange = e => {
    const { name, value, type, selectedOptions } = e.target;
    if (name === "table_ids") {
      const ids = Array.from(selectedOptions).map(o => o.value);
      setForm(f => ({ ...f, table_ids: ids }));
    } else if (type === "number") {
      setForm(f => ({ ...f, [name]: parseInt(value, 10) }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  // Submit booking(s)
  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    const {
      booking_date,
      booking_start_time,
      booking_end_time,
      table_ids,
      number_of_people,
      special_requests
    } = form;

    if (!table_ids.length) {
      setError("Please select at least one table");
      return;
    }
    if (booking_end_time <= booking_start_time) {
      setError("End time must be after start time");
      return;
    }

    try {
      await Promise.all(
        table_ids.map(table_id =>
          axios.post(
            "/bookings",
            {
              restaurant_id:    rest.id,
              table_id,
              booking_date,
              booking_time:     booking_start_time,
              booking_end_time,
              number_of_people,
              special_requests
            },
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      );
      navigate("/profile");
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed");
    }
  };

  if (loadingRest) {
    return (
      <div className="flex justify-center items-center h-screen">
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
  if (!rest) return null;

  // Fallback map iframe if seller didn't supply one
  const fallbackMap = `
    <iframe
      src="https://maps.google.com/maps?q=${encodeURIComponent(rest.address)}&t=&z=15&output=embed"
      width="100%" height="100%" frameborder="0" style="border:0;"
      allowfullscreen="" loading="lazy"
    ></iframe>`;

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <div
        className="relative h-[60vh] bg-cover bg-center"
        style={{ backgroundImage: `url(${rest.coverImage||defaultCover})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-5xl font-bold">{rest.name}</h1>
            <p className="mt-2 text-xl">{rest.cuisineType}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: About & Menu */}
        <div className="lg:col-span-2 space-y-8">
          {/* About */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">About</h2>
            <p className="text-gray-700 mb-4">{rest.description}</p>
            <div className="flex flex-col sm:flex-row gap-4 text-gray-600">
              <div className="flex items-center">
                <span className="mr-2">📞</span>{rest.contactPhone}
              </div>
              <div className="flex items-center">
                <span className="mr-2">📍</span>{rest.address}
              </div>
            </div>
          </div>

          {/* Menu */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Menu</h2>
            {loadingMenu ? (
              <p>Loading menu…</p>
            ) : menu.length === 0 ? (
              <p className="text-gray-600">No items available.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {menu.map(item => {
                  const priceNum = parseFloat(item.price) || 0;
                  return (
                    <div
                      key={item.id}
                      className="bg-gray-50 rounded-lg overflow-hidden shadow hover:shadow-lg transition"
                    >
                      <img
                        src={item.imageUrl||defaultCover}
                        alt={item.name}
                        className="w-full h-32 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="text-lg font-semibold truncate">{item.name}</h3>
                        <p className="text-gray-500 text-sm mb-2 truncate">
                          {item.description}
                        </p>
                        <span className="text-green-600 font-bold">
                          ৳{priceNum.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Map & Booking */}
        <div className="space-y-8">
          {/* Map */}
          <section className="bg-white rounded-lg overflow-hidden shadow h-64">
            <div
              className="w-full h-full"
              dangerouslySetInnerHTML={{
                __html: rest.mapEmbedHtml?.trim() || fallbackMap
              }}
            />
          </section>

          {/* Booking Form */}
          {userRole === "customer" && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-semibold mb-4">Reserve a Table</h2>
              {error && <p className="text-red-500 mb-4">{error}</p>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="date"
                    name="booking_date"
                    value={form.booking_date}
                    onChange={handleChange}
                    required
                    className="border p-2 rounded w-full"
                  />
                  <input
                    type="time"
                    name="booking_start_time"
                    value={form.booking_start_time}
                    onChange={handleChange}
                    required
                    className="border p-2 rounded w-full"
                  />
                  <input
                    type="time"
                    name="booking_end_time"
                    value={form.booking_end_time}
                    onChange={handleChange}
                    required
                    className="border p-2 rounded w-full"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Party Size</label>
                  <input
                    type="number"
                    min="1"
                    name="number_of_people"
                    value={form.number_of_people}
                    onChange={handleChange}
                    className="border p-2 rounded w-full"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">
                    Select Table{form.table_ids.length>1?'s':''}
                  </label>
                  <select
                    name="table_ids"
                    multiple
                    value={form.table_ids}
                    onChange={handleChange}
                    required
                    className="border p-2 rounded w-full h-32"
                  >
                    {loadingTables ? (
                      <option>Loading…</option>
                    ) : availableTables.length ? (
                      availableTables.map(t => (
                        <option key={t.id} value={t.id}>
                          Table {t.table_number} (seats {t.capacity})
                        </option>
                      ))
                    ) : (
                      <option disabled>No free tables</option>
                    )}
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    Hold Ctrl (Windows) or ⌘ (Mac) to select multiple.
                  </p>
                </div>

                <textarea
                  name="special_requests"
                  rows="3"
                  placeholder="Special requests…"
                  value={form.special_requests}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                />

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded font-semibold"
                >
                  Book Now
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}