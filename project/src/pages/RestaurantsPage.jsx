// src/pages/RestaurantsPage.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function RestaurantsPage() {
  const [list,    setList]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      setError("");
      try {
        // ← call the root-mounted route, not /api/restaurants
        const res = await axios.get("/restaurants");
        console.log("🍽 Response:", res.data);

        // expecting an array of restaurants
        if (Array.isArray(res.data)) {
          setList(res.data);
        } else {
          setError("Unexpected response format");
        }
      } catch (err) {
        console.error("❌ Request failed:", err);
        setError(err.response?.data?.message || "Could not load restaurants");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [navigate]);

  if (loading) return <p className="p-6">Loading restaurants…</p>;
  if (error)   return <p className="p-6 text-red-500">{error}</p>;
  if (!list.length) return <p className="p-6">No restaurants found.</p>;

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {list.map(r => (
        <div key={r.id} className="bg-white rounded shadow overflow-hidden">
          <div
            className="h-48 bg-cover bg-center"
            style={{ backgroundImage: `url(${r.coverImage})` }}
          />
          <div className="p-4 space-y-2">
            <h3 className="text-xl font-semibold">{r.name}</h3>
            <p className="text-sm text-gray-600">{r.cuisineType}</p>
            <p className="line-clamp-3 text-gray-700">{r.description}</p>
            <Link
              to={`/restaurants/${r.id}`}
              className="inline-block mt-2 text-blue-600 hover:underline"
            >
              View Details →
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}