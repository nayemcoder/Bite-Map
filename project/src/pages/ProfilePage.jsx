import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import defaultProfile from "../assets/default-profile.png";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser]                     = useState(null);
  const [bookings, setBookings]             = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [errorBookings, setErrorBookings]     = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) return navigate("/login");
    try { setUser(JSON.parse(raw)); }
    catch { localStorage.clear(); navigate("/login"); }
  }, [navigate]);

  useEffect(() => {
    if (!user || user.role !== "customer") return;

    setLoadingBookings(true);
    axios.get("/customers/bookings", {
      headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
    })
      .then(res => setBookings(res.data.data || []))
      .catch(() => setErrorBookings("Could not load your bookings."))
      .finally(() => setLoadingBookings(false));
  }, [user]);

  if (!user) return <p>Loading profile…</p>;

  const editPath = user.role === "seller"
    ? "/edit-seller-profile"
    : "/edit-profile";

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-8">
      <div className="relative bg-white rounded-lg shadow p-6 flex flex-col items-center">
        <button
          onClick={() => navigate(editPath)}
          className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          Edit Profile
        </button>
        <img
          src={user.profileImage || defaultProfile}
          alt="Profile"
          className="w-32 h-32 rounded-full border-4 border-blue-100 mb-4 object-cover"
        />
        <h2 className="text-2xl font-semibold">{user.name}</h2>
        <p className="text-gray-600">{user.email}</p>
        <p className="text-gray-600">{user.phone}</p>
        <span className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
          {user.role === "seller" ? "Restaurant Owner" : "Customer"}
        </span>
      </div>

      {user.role === "customer" && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Your Bookings</h3>
          {loadingBookings
            ? <p>Loading your bookings…</p>
            : errorBookings
              ? <p className="text-red-500">{errorBookings}</p>
              : bookings.length === 0
                ? <p className="text-gray-500">You have no bookings yet.</p>
                : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full table-auto border-collapse">
                      <thead className="bg-gray-100">
                        <tr>
                          {["ID","Restaurant","Date","Time","Party Size","Status"]
                            .map(col => <th key={col} className="p-2 border text-left">{col}</th>)}
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
                )
          }
        </div>
      )}
    </div>
  );
}