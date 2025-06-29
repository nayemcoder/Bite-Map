// src/pages/NotificationsPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate }                 from "react-router-dom";
import axios                           from "axios";

export default function NotificationsPage() {
  const [notes, setNotes] = useState([]);
  const navigate          = useNavigate();
  const token             = localStorage.getItem("authToken");
  const role              = localStorage.getItem("userRole"); // 'seller' or 'customer'

  useEffect(() => {
    if (!token) return navigate("/login");
    axios
      .get("/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(r => setNotes(r.data.data || []))
      .catch(() => setNotes([]));
  }, [navigate, token]);

  const markRead = async id => {
    try {
      await axios.put(
        `/notifications/${id}/read`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes(ns =>
        ns.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch {
      /* ignore */
    }
  };

  const handleClick = async note => {
    if (!note.is_read) {
      await markRead(note.id);
    }
    // redirect based on user role
    if (role === "seller") {
      navigate("/seller/bookings");
    } else {
      navigate("/profile");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Notifications</h1>
      {notes.length === 0 && (
        <p className="text-gray-600">No notifications</p>
      )}
      {notes.map(n => (
        <div
          key={n.id}
          onClick={() => handleClick(n)}
          className={`p-4 rounded-lg shadow flex justify-between items-center cursor-pointer transition ${
            n.is_read ? "bg-gray-50 hover:bg-gray-100" : "bg-indigo-50 hover:bg-indigo-100"
          }`}
        >
          <div>
            <p className="text-sm">{n.message}</p>
            <p className="text-xs text-gray-500">
              {new Date(n.created_at).toLocaleString()}
            </p>
          </div>
          {!n.is_read && (
            <button
              onClick={e => {
                e.stopPropagation();
                markRead(n.id);
              }}
              className="px-2 py-1 bg-indigo-600 text-white rounded text-xs"
            >
              Mark read
            </button>
          )}
        </div>
      ))}
    </div>
  );
}