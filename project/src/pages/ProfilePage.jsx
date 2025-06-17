// src/pages/ProfilePage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate }                from "react-router-dom";
import axios                           from "axios";
import defaultProfile                  from "../assets/default-profile.png";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  // 1) Load user role & token
  const token    = localStorage.getItem("authToken");
  const role     = localStorage.getItem("userRole"); // 'customer' or 'seller'
  const endpoint = role === "seller"
    ? "/sellers/profile"
    : "/customers/profile";

  // 2) Fetch profile from API
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .get(endpoint, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        // customers endpoint returns flat user object; sellers returns { user, restaurant }
        if (role === "seller") {
          setProfile(res.data.user);
        } else {
          setProfile(res.data);
        }
      })
      .catch(err => {
        console.error("Profile fetch error:", err);
        navigate("/login");
      })
      .finally(() => setLoading(false));
  }, [token, endpoint, role, navigate]);

  // 3) If customer, fetch bookings
  useEffect(() => {
    if (!profile || role !== "customer") return;
    axios
      .get("/customers/bookings", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setBookings(res.data.data || []))
      .catch(() => setError("Could not load your bookings."));
  }, [profile, role, token]);

  if (loading) return <p className="p-6">Loading profile…</p>;
  if (!profile) return <p className="p-6 text-red-500">Failed to load profile.</p>;

  // after update, profile has name, email, phone, address, profileImage, role
  return (
    <div className="max-w-3xl mx-auto p-4 space-y-8">
      <div className="relative bg-white rounded-lg shadow p-6 flex flex-col items-center">
        <button
          onClick={() =>
            navigate(role === "seller" ? "/edit-seller-profile" : "/edit-profile")
          }
          className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          Edit Profile
        </button>
        <img
          src={profile.profileImage || defaultProfile}
          alt="Profile"
          className="w-32 h-32 rounded-full border-4 border-blue-100 mb-4 object-cover"
        />
        <h2 className="text-2xl font-semibold">{profile.name}</h2>
        <p className="text-gray-600">{profile.email}</p>
        <p className="text-gray-600">{profile.phone}</p>
        <p className="text-gray-600">{profile.address}</p>
        <span className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
          {role === "seller" ? "Restaurant Owner" : "Customer"}
        </span>
      </div>

      {role === "customer" && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Your Bookings</h3>
          {error ? (
            <p className="text-red-500">{error}</p>
          ) : !bookings.length ? (
            <p className="text-gray-500">You have no bookings yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    {["ID","Restaurant","Date","Time","Party Size","Status"].map(col => (
                      <th key={col} className="p-2 border text-left">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="p-2 border">{b.id}</td>
                      <td className="p-2 border">{b.restaurant_name}</td>
                      <td className="p-2 border">{b.booking_date}</td>
                      <td className="p-2 border">{b.booking_time}</td>
                      <td className="p-2 border">{b.number_of_people}</td>
                      <td className="p-2 border capitalize">{b.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}