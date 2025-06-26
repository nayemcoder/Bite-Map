// src/pages/ProfilePage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import defaultProfile from "../assets/default-profile.png";

export default function ProfilePage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");
  const role = localStorage.getItem("userRole");
  const endpoint =
    role === "seller" ? "/sellers/profile" : "/customers/profile";

  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Track in-flight cancels & reviews
  const [cancelling, setCancelling] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [reviews, setReviews] = useState({});

  // Load profile
  useEffect(() => {
    if (!token) return navigate("/login");
    axios
      .get(endpoint, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setProfile(role === "seller" ? res.data.user : res.data);
      })
      .catch(() => navigate("/login"))
      .finally(() => setLoading(false));
  }, [token, endpoint, role, navigate]);

  // Load bookings for customers
  useEffect(() => {
    if (!profile || role !== "customer") return;
    axios
      .get("/customers/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => {
        const data = res.data.data || [];
        setBookings(data);
        // init review forms
        const init = {};
        data.forEach(b => {
          init[b.id] = { rating: 5, comment: "" };
        });
        setReviews(init);
      })
      .catch(() => setError("Could not load your bookings."));
  }, [profile, role, token]);

  // Cancel only "pending" bookings
  const cancelBooking = async id => {
    if (!window.confirm("Cancel this booking?")) return;
    setCancelling(c => ({ ...c, [id]: true }));
    try {
      await axios.delete(`/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(bs => bs.filter(b => b.id !== id));
    } catch {
      alert("Unable to cancel booking.");
    } finally {
      setCancelling(c => ({ ...c, [id]: false }));
    }
  };

  const handleReviewChange = (bookingId, field, val) => {
    setReviews(r => ({
      ...r,
      [bookingId]: { ...r[bookingId], [field]: val },
    }));
  };

  // Submit review for "completed" bookings
  const submitReview = async bookingId => {
    const { rating, comment } = reviews[bookingId] || {};
    if (!rating) return alert("Please select a rating.");
    const booking = bookings.find(b => b.id === bookingId);
    const restaurantId = booking?.restaurant_id;
    if (!restaurantId) return alert("Invalid restaurant ID.");

    setSubmitting(s => ({ ...s, [bookingId]: true }));
    try {
      await axios.post(
        `/restaurants/${restaurantId}/reviews`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Review submitted. Thank you!");
      setBookings(bs => bs.filter(b => b.id !== bookingId));
    } catch (err) {
      alert(err.response?.data?.message || "Could not submit review");
    } finally {
      setSubmitting(s => ({ ...s, [bookingId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <svg
          role="status"
          className="animate-spin h-8 w-8 text-indigo-600"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
      </div>
    );
  }

  if (!profile) {
    return (
      <p className="p-6 text-center text-red-500">
        Failed to load profile.
      </p>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      {/* Profile Card */}
      <div className="relative bg-white rounded-lg shadow-lg p-6 flex flex-col items-center">
        <button
          onClick={() =>
            navigate(
              role === "seller" ? "/edit-seller-profile" : "/edit-profile"
            )
          }
          className="absolute top-4 right-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full"
        >
          Edit Profile
        </button>
        <img
          src={profile.profileImage || defaultProfile}
          alt="Profile"
          className="w-32 h-32 rounded-full border-4 border-indigo-100 mb-4 object-cover"
        />
        <h2 className="text-2xl font-semibold">{profile.name}</h2>
        <p className="text-gray-600">{profile.email}</p>
        <p className="text-gray-600">{profile.phone}</p>
        <p className="text-gray-600">{profile.address}</p>
        <span className="mt-3 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
          {role === "seller" ? "Restaurant Owner" : "Customer"}
        </span>
      </div>

      {/* Customer's Bookings */}
      {role === "customer" && (
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          <h3 className="text-xl font-semibold mb-4">Your Bookings</h3>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {!bookings.length ? (
            <p className="text-gray-600">No bookings yet.</p>
          ) : (
            bookings.map(b => (
              <div key={b.id} className="border-b pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{b.restaurant_name}</p>
                    <p className="text-gray-500 text-sm">
                      {b.booking_date} @ {b.booking_time}–{b.booking_end_time}
                    </p>
                    <p className="text-gray-500 text-sm">
                      Table {b.table_number} ({b.capacity} seats)
                    </p>
                    <p
                      className={`capitalize inline-block px-2 py-1 rounded-full text-sm ${
                        b.status === "confirmed"
                          ? "bg-blue-100 text-blue-800"
                          : b.status === "canceled"
                          ? "bg-red-100 text-red-800"
                          : b.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {b.status}
                    </p>
                  </div>

                  {/* Only pending bookings may be canceled */}
                  {b.status === "pending" && !cancelling[b.id] && (
                    <button
                      onClick={() => cancelBooking(b.id)}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs"
                    >
                      Cancel
                    </button>
                  )}
                  {cancelling[b.id] && (
                    <button
                      disabled
                      className="px-3 py-1 bg-red-300 text-white rounded-full text-xs cursor-not-allowed"
                    >
                      Cancelling…
                    </button>
                  )}
                </div>

                {/* Review UI for completed bookings */}
                {b.status === "completed" && (
                  <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium mb-2">Leave a review:</p>
                    <select
                      value={reviews[b.id]?.rating}
                      onChange={e =>
                        handleReviewChange(b.id, "rating", e.target.value)
                      }
                      className="border p-2 rounded mb-2"
                    >
                      {[5, 4, 3, 2, 1].map(n => (
                        <option key={n} value={n}>
                          {n} star{n > 1 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                    <textarea
                      rows="2"
                      placeholder="Your comments..."
                      value={reviews[b.id]?.comment}
                      onChange={e =>
                        handleReviewChange(b.id, "comment", e.target.value)
                      }
                      className="w-full border p-2 rounded mb-2"
                    />
                    <button
                      onClick={() => submitReview(b.id)}
                      disabled={submitting[b.id]}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                    >
                      {submitting[b.id] ? "Submitting…" : "Submit Review"}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}