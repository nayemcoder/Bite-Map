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
  const [cancelling, setCancelling] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [reviews, setReviews] = useState({});

  // Load profile
  useEffect(() => {
    if (!token) return navigate("/login");
    axios
      .get(endpoint, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setProfile(role === "seller" ? res.data.user : res.data))
      .catch(() => navigate("/login"))
      .finally(() => setLoading(false));
  }, [token, endpoint, role, navigate]);

  // Load bookings for customer
  useEffect(() => {
    if (!profile || role !== "customer") return;
    axios
      .get("/customers/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => {
        const data = res.data.data || [];
        setBookings(data);
        const init = {};
        data.forEach(b => {
          init[b.id] = { rating: 5, comment: "" };
        });
        setReviews(init);
      })
      .catch(() => setError("Failed to load your bookings."));
  }, [profile, role, token]);

  // Cancel booking
  const cancelBooking = async id => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    setCancelling(c => ({ ...c, [id]: true }));
    try {
      await axios.delete(`/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(bs => bs.filter(b => b.id !== id));
    } catch {
      alert("Could not cancel booking.");
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

  // Submit review
  const submitReview = async bookingId => {
    const { rating, comment } = reviews[bookingId] || {};
    if (!rating) return alert("Please select a rating.");
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    setSubmitting(s => ({ ...s, [bookingId]: true }));
    try {
      await axios.post(
        `/restaurants/${booking.restaurant_id}/reviews`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Thank you for your review!");
      setBookings(bs => bs.filter(b => b.id !== bookingId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmitting(s => ({ ...s, [bookingId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <svg
          className="animate-spin h-10 w-10 text-indigo-600"
          viewBox="0 0 24 24"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className="opacity-25"
          />
          <path
            d="M4 12a8 8 0 018-8v8z"
            fill="currentColor"
            className="opacity-75"
          />
        </svg>
      </div>
    );
  }

  if (!profile) {
    return <p className="text-center text-red-500 mt-10">Failed to load profile.</p>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      {/* Profile Card */}
      <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-xl p-6 flex flex-col items-center">
        <button
          onClick={() =>
            navigate(role === "seller" ? "/edit-seller-profile" : "/edit-profile")
          }
          className="absolute top-4 right-4 bg-white text-indigo-600 hover:bg-gray-100 px-3 py-1 rounded-full text-sm font-medium transition"
        >
          Edit
        </button>
        <img
          src={profile.profileImage || defaultProfile}
          alt="Profile"
          className="w-32 h-32 rounded-full border-4 border-white mb-4 object-cover"
        />
        <h2 className="text-2xl font-bold">{profile.name}</h2>
        <p className="mt-1">{profile.email}</p>
        <p>{profile.phone}</p>
        <p className="text-center">{profile.address}</p>
        <span className="mt-3 px-3 py-1 bg-white text-indigo-600 rounded-full text-sm uppercase">
          {role === "seller" ? "Seller" : "Customer"}
        </span>
      </div>

      {/* Customer Bookings */}
      {role === "customer" && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Your Bookings</h3>
          {error && <p className="text-red-500">{error}</p>}
          {!bookings.length && <p className="text-gray-600">No bookings yet.</p>}

          <div className="space-y-4">
            {bookings.map(b => (
              <div
                key={b.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 bg-gray-50">
                  <div>
                    <h4 className="text-lg font-medium">{b.restaurant_name}</h4>
                    <p className="text-sm text-gray-600">
                      {b.booking_date} @ {b.booking_time}–{b.booking_end_time}
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

                {/* Body */}
                <div className="px-6 py-4 space-y-2">
                  <p className="text-sm">
                    <strong>Table:</strong> {b.table_number} ({b.capacity} seats)
                  </p>
                  {b.menu_items?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-1">Pre-ordered Items:</p>
                      <div className="flex flex-wrap gap-2">
                        {b.menu_items.map(mi => (
                          <span
                            key={mi.id}
                            className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs"
                          >
                            ID {mi.id} ×{mi.quantity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {b.special_requests && (
                    <p className="text-sm">
                      <strong>Notes:</strong> {b.special_requests}
                    </p>
                  )}
                </div>

                {/* Actions & Review */}
                <div className="px-6 py-4 bg-gray-50 flex flex-col gap-3">
                  {/* Cancel */}
                  {b.status === "pending" && (
                    <button
                      onClick={() => cancelBooking(b.id)}
                      disabled={cancelling[b.id]}
                      className="self-start bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium transition disabled:opacity-50"
                    >
                      {cancelling[b.id] ? "Cancelling…" : "Cancel Booking"}
                    </button>
                  )}

                  {/* Review for completed */}
                  {b.status === "completed" && (
                    <div className="space-y-2">
                      <p className="font-medium">Leave a review:</p>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() =>
                              handleReviewChange(b.id, "rating", star)
                            }
                            className={`text-2xl ${
                              reviews[b.id]?.rating >= star
                                ? "text-yellow-400"
                                : "text-gray-300"
                            } transition`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                      <textarea
                        rows="2"
                        placeholder="Write your comments..."
                        value={reviews[b.id]?.comment}
                        onChange={e =>
                          handleReviewChange(b.id, "comment", e.target.value)
                        }
                        className="w-full border p-2 rounded"
                      />
                      <button
                        onClick={() => submitReview(b.id)}
                        disabled={submitting[b.id]}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition disabled:opacity-50"
                      >
                        {submitting[b.id] ? "Submitting…" : "Submit Review"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}