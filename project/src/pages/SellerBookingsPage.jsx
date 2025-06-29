// src/pages/SellerBookingsPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate }                from "react-router-dom";
import axios                          from "axios";
import defaultAvatar                  from "../assets/default-profile.png";
import defaultItemImage               from "../assets/default-menu-item.png";

export default function SellerBookingsPage() {
  const navigate         = useNavigate();
  const token            = localStorage.getItem("authToken");
  const [bookings, setBookings]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  // date/time formatters
  const fmtDate = d =>
    new Date(d).toLocaleDateString(undefined, {
      year: "numeric", month: "long", day: "numeric"
    });
  const fmtTime = t => {
    if (!t) return "";
    let [h, m] = t.split(":");
    h = parseInt(h, 10);
    const suf = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${m.slice(0,2)} ${suf}`;
  };

  const setBusy = (id, busy) =>
    setActionLoading(a => ({ ...a, [id]: busy }));

  // change single booking status
  const handleStatus = (id, newStatus) => {
    setBusy(id, true);
    axios.put(
      `/bookings/${id}/status`,
      { status: newStatus },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then(() =>
      setBookings(bs =>
        bs.map(b => b.id === id ? { ...b, status: newStatus } : b)
      )
    )
    .catch(console.error)
    .finally(() => setBusy(id, false));
  };

  // delete single booking
  const handleDelete = id => {
    if (!window.confirm("Delete this booking?")) return;
    setBusy(id, true);
    axios.delete(`/bookings/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() =>
      setBookings(bs => bs.filter(b => b.id !== id))
    )
    .catch(console.error)
    .finally(() => setBusy(id, false));
  };

  // load seller bookings
  useEffect(() => {
    if (!token) return navigate("/login", { replace: true });
    axios.get("/seller/bookings", {
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

  // ── GROUP BY customer + date + slot ───────────────────────────────
  const groups = Object.values(
    bookings.reduce((acc, b) => {
      const key = [
        b.customer_id,
        b.booking_date,
        b.booking_time,
        b.booking_end_time
      ].join("|");
      if (!acc[key]) {
        acc[key] = {
          key,
          customer_id:       b.customer_id,
          customer_name:     b.customer_name,
          customer_email:    b.customer_email,
          customer_phone:    b.customer_phone,
          customer_imageUrl: b.customer_imageUrl,
          booking_date:      b.booking_date,
          booking_time:      b.booking_time,
          booking_end_time:  b.booking_end_time,
          bookings:          []
        };
      }
      acc[key].bookings.push(b);
      return acc;
    }, {})
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Incoming Bookings</h1>

      {groups.map(g => {
        // totals
        const totalTables = g.bookings.length;
        const totalSeats  = g.bookings.reduce((sum, b) => sum + b.capacity, 0);

        // merge all menu items in this group
        const menuMap = {};
        g.bookings.forEach(b =>
          b.menu_items.forEach(mi => {
            if (!menuMap[mi.id]) {
              menuMap[mi.id] = { ...mi };
            } else {
              menuMap[mi.id].quantity += mi.quantity;
            }
          })
        );
        const aggregatedItems = Object.values(menuMap);

        // check if any action is in progress
        const busyAny = g.bookings.some(b => actionLoading[b.id]);

        return (
          <div
            key={g.key}
            className="bg-white shadow-md rounded-lg overflow-hidden"
          >
            {/* Header: customer + slot + totals */}
            <div className="flex items-center justify-between bg-gray-50 px-6 py-4">
              <div className="flex items-center space-x-4">
                <img
                  src={g.customer_imageUrl || defaultAvatar}
                  alt={g.customer_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-800">
                    {g.customer_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {g.customer_email}
                  </p>
                  <p className="text-sm text-gray-600">
                    {g.customer_phone}
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-700 text-right">
                <p>
                  📅 {fmtDate(g.booking_date)} @{" "}
                  {fmtTime(g.booking_time)}–{fmtTime(g.booking_end_time)}
                </p>
                <p>Total tables: <strong>{totalTables}</strong></p>
                <p>Total seats: <strong>{totalSeats}</strong></p>
              </div>
            </div>

            {/* Aggregated menu items */}
            {aggregatedItems.length > 0 && (
              <div className="px-6 py-4 border-b space-y-2">
                <p className="font-medium text-gray-800">
                  Pre-ordered Items:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {aggregatedItems.map(mi => (
                    <div
                      key={mi.id}
                      className="border rounded-lg p-3 flex flex-col items-center"
                    >
                      <img
                        src={mi.imageUrl || defaultItemImage}
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
              </div>
            )}

            {/* Batch Actions */}
            <div className="px-6 py-4 bg-gray-50 flex flex-wrap justify-end gap-2">
              {/* Confirm All */}
              {g.bookings.every(b => b.status === "pending") && (
                <button
                  onClick={() =>
                    g.bookings.forEach(b =>
                      handleStatus(b.id, "confirmed")
                    )
                  }
                  disabled={busyAny}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {busyAny ? "…" : "Confirm All"}
                </button>
              )}
              {/* Complete All */}
              {g.bookings.every(b => b.status === "confirmed") && (
                <button
                  onClick={() =>
                    g.bookings.forEach(b =>
                      handleStatus(b.id, "completed")
                    )
                  }
                  disabled={busyAny}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {busyAny ? "…" : "Complete All"}
                </button>
              )}
              {/* Cancel All */}
              {["pending", "confirmed"].some(st =>
                g.bookings.some(b => b.status === st)
              ) && (
                <button
                  onClick={() =>
                    g.bookings.forEach(b =>
                      handleStatus(b.id, "canceled")
                    )
                  }
                  disabled={busyAny}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {busyAny ? "…" : "Cancel All"}
                </button>
              )}
              {/* Delete All */}
              {g.bookings.every(b =>
                ["completed", "canceled"].includes(b.status)
              ) && (
                <button
                  onClick={() =>
                    g.bookings.forEach(b => handleDelete(b.id))
                  }
                  disabled={busyAny}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
                >
                  {busyAny ? "…" : "Delete All"}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}