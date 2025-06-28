// src/pages/NotificationsPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function NotificationsPage() {
  const [notes, setNotes] = useState([]);
  const navigate = useNavigate();
  const token    = localStorage.getItem("authToken");

  useEffect(() => {
    if (!token) {
      console.warn("No token—redirecting to login");
      navigate("/login");
      return;
    }

    console.log("NotificationsPage: fetching /notifications");
    axios
      .get("/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(r => {
        console.log("Notifications response:", r.data.data);
        setNotes(r.data.data || []);
      })
      .catch(err => {
        console.error("Failed to load notifications:", err);
        setNotes([]);
      });
  }, [navigate, token]);

  const markRead = id => {
    if (!token) return;
    console.log("Marking read:", id);
    axios
      .put(`/notifications/${id}/read`, null, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => {
        setNotes(ns =>
          ns.map(n => (n.id === id ? { ...n, is_read: true } : n))
        );
      })
      .catch(err => {
        console.error("Failed to mark read:", err);
      });
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
          className={`p-4 rounded-lg shadow flex justify-between items-center ${
            n.is_read ? "bg-gray-50" : "bg-indigo-50"
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
              onClick={() => markRead(n.id)}
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