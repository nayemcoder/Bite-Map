import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import defaultCover   from "../assets/default-cover.jpg";

export default function RestaurantDetailPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();

  const [rest, setRest]       = useState(null);
  const [user, setUser]       = useState(null);
  const [form, setForm]       = useState({
    booking_date:      "",
    booking_time:      "",
    number_of_people:  1,
    special_requests:  ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  // 1) load restaurant data
  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`/restaurants/${id}`);
        // your controller returns a flat object
        setRest(res.data);
      } catch {
        navigate("/restaurants");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  // 2) load current user
  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) setUser(JSON.parse(raw));
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    try {
      await axios.post(
        "/bookings",
        { restaurant_id: rest.id, ...form },
        { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } }
      );
      navigate("/profile");
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed");
    }
  };

  if (loading) return <p className="p-6">Loading…</p>;
  if (!rest)   return null;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Link to="/restaurants" className="text-blue-600 hover:underline">
        ← Back to all restaurants
      </Link>

      {/* Cover */}
      <div
        className="h-64 bg-cover bg-center rounded"
        style={{
          backgroundImage: `url(${rest.coverImage || defaultCover})`
        }}
      />

      {/* Info */}
      <h2 className="text-3xl font-bold">{rest.name}</h2>
      <p className="text-gray-600">{rest.cuisineType}</p>
      <p className="text-gray-700">{rest.description}</p>

      {/* (Optional) Gallery */}
      {/* If you need images, update your backend to return rest.gallery as an array of URLs */}
      {/* {rest.gallery?.length > 0 && ( ... )} */}

      {/* Booking form only for customers */}
      {user?.role === "customer" && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
          <h3 className="text-xl font-semibold">Make a Booking</h3>
          {error && <p className="text-red-500">{error}</p>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm">Date</label>
              <input
                name="booking_date"
                type="date"
                value={form.booking_date}
                onChange={handleChange}
                required
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm">Time</label>
              <input
                name="booking_time"
                type="time"
                value={form.booking_time}
                onChange={handleChange}
                required
                className="w-full border p-2 rounded"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm">Party Size</label>
            <input
              name="number_of_people"
              type="number"
              min="1"
              value={form.number_of_people}
              onChange={handleChange}
              required
              className="w-24 border p-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm">Special Requests</label>
            <textarea
              name="special_requests"
              rows="2"
              value={form.special_requests}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Book Now
          </button>
        </form>
      )}
    </div>
  );
}