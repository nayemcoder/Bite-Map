import React, { useEffect, useState } from "react";
import { useNavigate }              from "react-router-dom";
import axios                        from "axios";
import defaultItemImage             from "../assets/default-menu-item.png";

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const navigate = useNavigate();
  const token    = localStorage.getItem("authToken");

  // Convert "HH:MM[:SS]" → "h:MM AM/PM"
  const formatTime = timeStr => {
    if (!timeStr) return "";
    let [h, m] = timeStr.split(":");
    h = parseInt(h, 10);
    const suffix = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${m.slice(0,2)} ${suffix}`;
  };

  useEffect(() => {
    if (!token) return navigate("/login", { replace: true });
    axios
      .get("/customers/bookings", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setBookings(res.data.data || []))
      .catch(() => setError("Failed to load your bookings."))
      .finally(() => setLoading(false));
  }, [token, navigate]);

  if (loading) return <p className="p-4">Loading your bookings…</p>;
  if (error)   return <p className="p-4 text-red-500">{error}</p>;
  if (!bookings.length)
    return <p className="p-4 text-gray-600">You have no bookings yet.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Your Bookings</h1>

      {bookings.map(b => {
        const start      = formatTime(b.booking_time);
        const end        = formatTime(b.booking_end_time);
        const totalPrice = b.menu_items.reduce(
          (sum, mi) => sum + mi.price * mi.quantity, 0
        );

        return (
          <div key={b.id} className="bg-white shadow rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 bg-gray-50">
              <div>
                <h2 className="text-lg font-medium">{b.restaurant_name}</h2>
                <p className="text-sm text-gray-600">
                  {b.booking_date} @ {start}–{end}
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs uppercase font-semibold ${
                  b.status === "confirmed"
                    ? "bg-blue-100 text-blue-800"
                    : b.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : b.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {b.status}
              </span>
            </div>

            {/* Pre-ordered Items */}
            {b.menu_items.length > 0 && (
              <div className="px-6 py-4 bg-gray-100 space-y-3">
                <p className="text-sm font-medium">Pre-ordered Items</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {b.menu_items.map(mi => (
                    <div
                      key={mi.id}
                      className="bg-white rounded-lg shadow p-3 flex flex-col items-center"
                    >
                      <img
                        src={mi.imageUrl || defaultItemImage}
                        alt={mi.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <p className="mt-2 text-sm font-medium truncate">{mi.name}</p>
                      <p className="text-xs text-gray-600">Qty: {mi.quantity}</p>
                      <p className="text-xs text-gray-600">
                        ৳ {(mi.price * mi.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-right text-sm font-semibold">
                  Total: ৳{totalPrice.toFixed(2)}
                </div>
              </div>
            )}

            {/* Details */}
            <div className="px-6 py-4 space-y-2">
              <p className="text-sm">
                <strong>Table:</strong> {b.table_number} ({b.capacity} seats)
              </p>
              {b.special_requests && (
                <p className="text-sm">
                  <strong>Notes:</strong> {b.special_requests}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}