// src/pages/SellerBookingsPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios           from "axios";
import defaultAvatar   from "../assets/default-profile.png";

export default function SellerBookingsPage() {
  const navigate         = useNavigate();
  const token            = localStorage.getItem("authToken");
  const [bookings, setBookings]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  // Format date & time
  const formatDate = d => new Date(d).toLocaleDateString(undefined, {
    year: "numeric", month: "long", day: "numeric"
  });
  const formatTime = t => {
    if (!t) return "";
    let [h, m] = t.split(":");
    h = parseInt(h, 10);
    const suffix = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${m.slice(0,2)} ${suffix}`;
  };

  // Lock/unlock a booking’s buttons
  const setBusy = (id, busy) =>
    setActionLoading(a => ({ ...a, [id]: busy }));

  // Change status
  const handleStatus = (id, newStatus) => {
    setBusy(id, true);
    axios
      .put(
        `/bookings/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() =>
        setBookings(bs =>
          bs.map(b => (b.id === id ? { ...b, status: newStatus } : b))
        )
      )
      .catch(console.error)
      .finally(() => setBusy(id, false));
  };

  // Delete booking
  const handleDelete = id => {
    if (!window.confirm("Delete this booking permanently?")) return;
    setBusy(id, true);
    axios
      .delete(`/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => setBookings(bs => bs.filter(b => b.id !== id)))
      .catch(console.error)
      .finally(() => setBusy(id, false));
  };

  // Fetch seller’s bookings on mount
  useEffect(() => {
    if (!token) return navigate("/login", { replace: true });
    axios
      .get("/seller/bookings", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setBookings(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-gray-500">Loading bookings…</p>
      </div>
    );
  }
  if (!bookings.length) {
    return (
      <div className="py-16 text-center">
        <p className="text-gray-600">No incoming bookings yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Incoming Bookings</h1>

      {bookings.map(b => {
        const busy      = actionLoading[b.id];
        const dateLabel = formatDate(b.booking_date);
        const timeLabel = `${formatTime(b.booking_time)} – ${formatTime(b.booking_end_time)}`;
        const totalPrice = b.menu_items.reduce(
          (sum, mi) => sum + mi.price * mi.quantity,
          0
        );

        return (
          <div
            key={b.id}
            className="bg-white shadow-md rounded-lg overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-gray-50 px-6 py-4">
              {/* Customer Info */}
              <div className="flex items-center space-x-4">
                <img
                  src={b.customer_profile || defaultAvatar}
                  alt={b.customer_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-800">
                    {b.customer_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {b.customer_email}
                  </p>
                  <p className="text-sm text-gray-600">
                    {b.customer_phone}
                  </p>
                </div>
              </div>
              {/* Status Badge */}
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full uppercase ${
                  b.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : b.status === "confirmed"
                    ? "bg-blue-100 text-blue-800"
                    : b.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {b.status}
              </span>
            </div>

            {/* Body */}
            <div className="px-6 py-4 space-y-4">
              {/* When and Where */}
              <div className="flex flex-wrap items-center justify-between">
                <div>
                  <p className="text-gray-700">
                    <strong>Date:</strong> {dateLabel}
                  </p>
                  <p className="text-gray-700">
                    <strong>Time:</strong> {timeLabel}
                  </p>
                </div>
                <div>
                  <p className="text-gray-700">
                    <strong>Table:</strong> {b.table_number} ({b.capacity} seats)
                  </p>
                  <p className="text-gray-700">
                    <strong>Party:</strong> {b.number_of_people} people
                  </p>
                </div>
              </div>

              {/* Special Requests */}
              {b.special_requests && (
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-gray-700">
                    <strong>Special Requests:</strong> {b.special_requests}
                  </p>
                </div>
              )}

              {/* Pre-ordered Items */}
              {b.menu_items.length > 0 && (
                <div className="space-y-2">
                  <p className="text-gray-800 font-medium">
                    Pre-ordered Items
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {b.menu_items.map(mi => (
                      <div
                        key={mi.id}
                        className="border rounded-lg p-3 flex flex-col items-center"
                      >
                        <img
                          src={mi.imageUrl}
                          alt={mi.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <p className="mt-2 text-sm font-medium text-center truncate">
                          {mi.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          Qty: {mi.quantity}
                        </p>
                        <p className="text-xs text-gray-600">
                          ৳{(mi.price * mi.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="text-right font-semibold text-gray-800">
                    Total: ৳{totalPrice.toFixed(2)}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-gray-50 flex flex-wrap gap-2 justify-end">
              {b.status === "pending" && (
                <>
                  <button
                    onClick={() => handleStatus(b.id, "confirmed")}
                    disabled={busy}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {busy ? "…" : "Confirm"}
                  </button>
                  <button
                    onClick={() => handleStatus(b.id, "canceled")}
                    disabled={busy}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    {busy ? "…" : "Cancel"}
                  </button>
                </>
              )}
              {b.status === "confirmed" && (
                <>
                  <button
                    onClick={() => handleStatus(b.id, "completed")}
                    disabled={busy}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {busy ? "…" : "Complete"}
                  </button>
                  <button
                    onClick={() => handleStatus(b.id, "canceled")}
                    disabled={busy}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    {busy ? "…" : "Cancel"}
                  </button>
                </>
              )}
              {(b.status === "completed" || b.status === "canceled") && (
                <button
                  onClick={() => handleDelete(b.id)}
                  disabled={busy}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
                >
                  {busy ? "…" : "Delete"}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}