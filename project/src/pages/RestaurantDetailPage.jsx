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
    special_requests: "",
    menu_items: []       // {id, quantity}
  });
  const [error, setError]               = useState("");
  const [seatingMessage, setSeatingMessage] = useState("");

  // Fetch restaurant
  useEffect(() => {
    axios.get(`/restaurants/${id}`)
      .then(res => setRest(res.data))
      .catch(() => navigate("/restaurants"))
      .finally(() => setLoadingRest(false));
  }, [id, navigate]);

  // Fetch menu
  useEffect(() => {
    if (!rest) return;
    setLoadingMenu(true);
    axios.get(`/restaurants/${id}/menu`)
      .then(res => setMenu(res.data.data || []))
      .catch(() => setMenu([]))
      .finally(() => setLoadingMenu(false));
  }, [rest, id]);

  // Fetch available tables
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

  // Live seating check
  useEffect(() => {
    if (!availableTables.length || !form.table_ids.length) {
      setSeatingMessage("");
      return;
    }
    const total = availableTables
      .filter(t => form.table_ids.includes(t.id.toString()))
      .reduce((sum, t) => sum + t.capacity, 0);

    setSeatingMessage(
      form.number_of_people > total
        ? `⚠️ Only ${total} seats—add more tables.`
        : `✅ ${total} seats available.`
    );
  }, [form.table_ids, form.number_of_people, availableTables]);

  // Generic input change
  const handleChange = e => {
    const { name, value, type } = e.target;
    if (type === "number") {
      setForm(f => ({ ...f, [name]: parseInt(value, 10) || "" }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  // Toggle table checkbox
  const toggleTable = id => {
    setForm(f => {
      const ids = f.table_ids.includes(id)
        ? f.table_ids.filter(x => x !== id)
        : [...f.table_ids, id];
      return { ...f, table_ids: ids };
    });
  };

  // Toggle menu item
  const toggleMenuItem = item => {
    setForm(f => {
      const exists = f.menu_items.find(mi => mi.id === item.id);
      if (exists) {
        return {
          ...f,
          menu_items: f.menu_items.filter(mi => mi.id !== item.id)
        };
      } else {
        return {
          ...f,
          menu_items: [...f.menu_items, { id: item.id, quantity: 1 }]
        };
      }
    });
  };

  // Change menu qty
  const changeMenuQty = (id, qty) => {
    setForm(f => ({
      ...f,
      menu_items: f.menu_items.map(mi =>
        mi.id === id ? { ...mi, quantity: Math.max(1, qty) } : mi
      )
    }));
  };

  // Remove menu item
  const removeMenuItem = id => {
    setForm(f => ({
      ...f,
      menu_items: f.menu_items.filter(mi => mi.id !== id)
    }));
  };

  // Submit booking
  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    const {
      booking_date, booking_start_time, booking_end_time,
      table_ids, number_of_people, special_requests, menu_items
    } = form;

    if (!table_ids.length) {
      setError("Select at least one table.");
      return;
    }
    if (booking_end_time <= booking_start_time) {
      setError("End time must be after start time.");
      return;
    }

    try {
      await axios.post(
        "/bookings",
        {
          restaurant_id: rest.id,
          table_ids,
          booking_date,
          booking_time: booking_start_time,
          booking_end_time,
          number_of_people,
          special_requests,
          menu_items
        },
        { headers: { Authorization: `Bearer ${token}` } }
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
          <circle cx="12" cy="12" r="10"
            stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25"/>
          <path d="M4 12a8 8 0 018-8v8z"
            fill="currentColor" className="opacity-75"/>
        </svg>
      </div>
    );
  }
  if (!rest) return null;

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
        {/* About & Menu */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">About</h2>
            <p className="text-gray-700 mb-4">{rest.description}</p>
            <div className="flex flex-wrap gap-4 text-gray-600">
              <div className="flex items-center"><span className="mr-2">📞</span>{rest.contactPhone}</div>
              <div className="flex items-center"><span className="mr-2">📍</span>{rest.address}</div>
            </div>
          </div>

          {/* Menu Grid */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Menu</h2>
            {loadingMenu ? (
              <p>Loading menu…</p>
            ) : !menu.length ? (
              <p className="text-gray-600">No items available.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {menu.map(item => {
                  const selected = form.menu_items.some(mi => mi.id === item.id);
                  const qty = form.menu_items.find(mi => mi.id === item.id)?.quantity;
                  const price = parseFloat(item.price) || 0;
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleMenuItem(item)}
                      className={`relative p-2 rounded-lg border cursor-pointer hover:shadow-lg transition ${
                        selected ? "border-indigo-500 bg-indigo-50" : "border-gray-200"
                      }`}
                    >
                      {selected && (
                        <div className="absolute top-2 right-2 bg-indigo-500 text-white rounded-full p-1">
                          ✓
                        </div>
                      )}
                      <img
                        src={item.imageUrl||defaultCover}
                        alt={item.name}
                        className="w-full h-32 object-cover rounded"
                      />
                      <h3 className="mt-2 font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-600 truncate">{item.description}</p>
                      <div className="mt-1 flex justify-between items-center">
                        <span className="font-bold text-green-600">৳{price.toFixed(2)}</span>
                        {selected && (
                          <div className="flex items-center space-x-1">
                            <button
                              type="button"
                              onClick={e => { e.stopPropagation(); changeMenuQty(item.id, qty - 1); }}
                              className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center"
                            >–</button>
                            <span>{qty}</span>
                            <button
                              type="button"
                              onClick={e => { e.stopPropagation(); changeMenuQty(item.id, qty + 1); }}
                              className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center"
                            >+</button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Map & Booking */}
        <div className="space-y-8">
          <section className="bg-white rounded-lg overflow-hidden shadow h-64">
            <div
              className="w-full h-full"
              dangerouslySetInnerHTML={{ __html: rest.mapEmbedHtml?.trim() || fallbackMap }}
            />
          </section>

          {userRole === "customer" && (
            <div className="bg-white p-6 rounded-lg shadow space-y-4">
              <h2 className="text-2xl font-semibold">Reserve a Table</h2>
              {error && <p className="text-red-500">{error}</p>}

              {/* Selected Menu Cards */}
              {form.menu_items.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-4">
                  {form.menu_items.map(mi => {
                    const item = menu.find(m => m.id === mi.id);
                    const price = parseFloat(item?.price) || 0;
                    return (
                      <div key={mi.id} className="flex border rounded-lg overflow-hidden shadow-sm">
                        <img src={item?.imageUrl||defaultCover} className="w-16 h-16 object-cover" alt="" />
                        <div className="p-2 flex flex-col justify-between">
                          <h4 className="text-sm font-semibold">{item?.name}</h4>
                          <p className="text-xs text-gray-600">Qty: {mi.quantity}</p>
                          <p className="text-xs text-green-600">৳{(price * mi.quantity).toFixed(2)}</p>
                        </div>
                        <button
                          onClick={() => removeMenuItem(mi.id)}
                          className="text-red-500 px-2 self-start"
                        >×</button>
                      </div>
                    );
                  })}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="block font-medium">Select Tables</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {loadingTables
                      ? <p>Loading tables…</p>
                      : availableTables.map(t => {
                        const sel = form.table_ids.includes(t.id.toString());
                        return (
                          <label key={t.id} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={sel}
                              onChange={() => toggleTable(t.id.toString())}
                              className="h-4 w-4 text-indigo-600"
                            />
                            <span>Table {t.table_number} (seats {t.capacity})</span>
                          </label>
                        );
                      })
                    }
                  </div>
                  {seatingMessage && <p className="text-sm text-gray-700 mt-1">{seatingMessage}</p>}
                </div>

                <div>
                  <label className="block mb-1 font-medium">Party Size</label>
                  <input
                    type="number"
                    min="1"
                    name="number_of_people"
                    value={form.number_of_people}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Date & Time</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                </div>

                <div>
                  <label className="block mb-1 font-medium">Special Requests</label>
                  <textarea
                    name="special_requests"
                    rows="3"
                    placeholder="Any special requests…"
                    value={form.special_requests}
                    onChange={handleChange}
                    className="border p-2 rounded w-full"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded font-semibold transition"
                >
                  Confirm Booking
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}