import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import defaultItemImage from "../assets/default-menu-item.png";
import defaultRestaurantImage from "../assets/default-restaurant.jpg";

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  // time formatter
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
      .then(res => {
        const raw = res.data.data || [];

        // 1️⃣ Group bookings by restaurant + date/time
        const map = {};
        raw.forEach(b => {
          const key = [
            b.restaurant_id,
            b.booking_date,
            b.booking_time,
            b.booking_end_time,
            b.number_of_people,
            b.special_requests || ""
          ].join("|");

          if (!map[key]) {
            map[key] = {
              ...b,
              table_numbers: [b.table_number],
              table_count: 1
            };
          } else {
            map[key].table_numbers.push(b.table_number);
            map[key].table_count++;
          }
        });

        // 2️⃣ Convert to array
        setBookings(Object.values(map));
      })
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
        const start = formatTime(b.booking_time);
        const end   = formatTime(b.booking_end_time);

        const totalPrice = b.menu_items.reduce(
          (sum, mi) => sum + mi.price * mi.quantity,
          0
        );

        return (
          <div
            key={`${b.restaurant_id}-${b.booking_date}-${b.booking_time}`}
            className="bg-white shadow rounded-lg overflow-hidden border border-gray-200"
          >
            {/* ───── Restaurant Banner ───── */}
            <div className="flex items-center gap-4 px-6 py-4 bg-gray-50 border-b">
              <img
                src={b.restaurant_image || defaultRestaurantImage}
                alt={b.restaurant_name}
                className="w-14 h-14 object-cover rounded-full border"
              />
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{b.restaurant_name}</h2>
                <p className="text-sm text-gray-500">{b.restaurant_address}</p>
                <p className="text-xs text-gray-400">{b.cuisineType}</p>
              </div>
              <span
                className={`px-2 py-1 text-xs rounded-full font-semibold uppercase ${
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

            {/* ───── Booking & Table Info ───── */}
            <div className="px-6 py-3 text-sm text-gray-600 flex flex-col sm:flex-row sm:justify-between gap-2">
              <div>
                📅 {b.booking_date} @ {start}–{end}
              </div>
              <div>
                🪑 Party size: {b.number_of_people} &nbsp;|&nbsp;
                Tables ({b.table_count}): {b.table_numbers.join(", ")}
              </div>
            </div>

            {/* ───── Pre-ordered Items ───── */}
            {b.menu_items.length > 0 && (
              <div className="px-6 pt-2 pb-4 bg-gray-50 space-y-2">
                <p className="text-sm font-medium">Pre-ordered Items</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {b.menu_items.map(mi => (
                    <div
                      key={mi.id}
                      className="bg-white p-3 rounded shadow-sm text-center"
                    >
                      <img
                        src={mi.imageUrl || defaultItemImage}
                        alt={mi.name}
                        className="w-16 h-16 object-cover rounded mx-auto"
                      />
                      <p className="mt-1 text-sm font-medium truncate">
                        {mi.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Qty: {mi.quantity}
                      </p>
                      <p className="text-xs text-gray-500">
                        ৳ {(mi.price * mi.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ───── Total Cost & Notes ───── */}
            <div className="px-6 py-3 text-right font-semibold text-sm text-gray-700 border-t">
              Total: ৳{totalPrice.toFixed(2)}
            </div>
            {b.special_requests && (
              <div className="px-6 pb-4 pt-2 text-sm text-gray-600 italic">
                “{b.special_requests}”
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}