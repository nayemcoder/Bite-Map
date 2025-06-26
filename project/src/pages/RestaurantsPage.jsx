// src/pages/RestaurantsPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

// Debounce hook
function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// Memoized star rating
const StarRating = React.memo(({ rating, count }) => (
  <div className="flex items-center" aria-label={`Rating: ${rating.toFixed(1)} out of 5`}>
    {[1, 2, 3, 4, 5].map(i => (
      <svg
        key={i}
        className="w-4 h-4"
        viewBox="0 0 20 20"
        fill={i <= Math.round(rating) ? "#FBBF24" : "#E5E7EB"}
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.947a1 1 0 00.95.69h4.154c.969 0 1.371 1.24.588 1.81l-3.36 2.44a1 1 0 00-.364 1.118l1.286 3.946c.3.922-.755 1.688-1.539 1.118l-3.36-2.44a1 1 0 00-1.175 0l-3.36 2.44c-.784.57-1.838-.196-1.539-1.118l1.286-3.946a1 1 0 00-.364-1.118L2.07 9.374c-.783-.57-.38-1.81.588-1.81h4.154a1 1 0 00.95-.69l1.286-3.947z" />
      </svg>
    ))}
    <span className="ml-2 text-sm text-gray-600">
      {rating.toFixed(1)} ({count})
    </span>
  </div>
));

// Simple skeleton card
function SkeletonCard() {
  return (
    <div className="h-64 bg-gray-200 animate-pulse rounded-lg" />
  );
}

export default function RestaurantsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL‐synced state
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "rating");
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page"), 10) || 1
  );

  const debouncedSearch = useDebounce(searchTerm, 300);
  const perPage = 9;

  // Data state
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch once
  useEffect(() => {
    let canceled = false;
    setLoading(true);
    setError("");

    axios
      .get("/restaurants")
      .then(res => {
        if (canceled) return;
        const data = Array.isArray(res.data) ? res.data : [];
        setList(
          data.map(r => ({
            ...r,
            avgRating: typeof r.avgRating === "number" ? r.avgRating : 0,
            reviewCount: r.reviewCount || 0
          }))
        );
      })
      .catch(() => {
        if (canceled) return;
        setError("Could not load restaurants");
      })
      .finally(() => {
        if (canceled) return;
        setLoading(false);
      });

    return () => {
      canceled = true;
    };
  }, []);

  // Sync URL when inputs change
  useEffect(() => {
    setSearchParams({
      q: debouncedSearch || "",
      sort: sortBy,
      page: currentPage
    });
  }, [debouncedSearch, sortBy, currentPage, setSearchParams]);

  // Combined filter + sort
  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    let base = q
      ? list.filter(r =>
          r.name.toLowerCase().includes(q) ||
          r.cuisineType.toLowerCase().includes(q)
        )
      : [...list];

    if (sortBy === "rating") {
      base.sort((a, b) => b.avgRating - a.avgRating);
    } else if (sortBy === "reviews") {
      base.sort((a, b) => b.reviewCount - a.reviewCount);
    } else {
      base.sort((a, b) => a.name.localeCompare(b.name));
    }

    return base;
  }, [list, debouncedSearch, sortBy]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const currentList = useMemo(
    () => filtered.slice((currentPage - 1) * perPage, currentPage * perPage),
    [filtered, currentPage]
  );

  // Handlers
  const handleRetry = () => {
    setError("");
    setLoading(true);
    setList([]);
    // re‐run fetch effect
    axios.get("/restaurants").finally(() => setLoading(false));
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <h1 className="text-4xl font-bold text-center">Our Restaurants</h1>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <input
          aria-label="Search restaurants"
          type="text"
          placeholder="Search by name or cuisine…"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />

        <div className="relative">
          <label htmlFor="sort" className="sr-only">
            Sort restaurants
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-lg p-3 text-sm text-gray-700"
            aria-live="polite"
          >
            <option value="rating">Sort by Rating</option>
            <option value="reviews">Sort by Review Count</option>
            <option value="name">Sort by Name (A–Z)</option>
          </select>
        </div>

        <button
          onClick={() => setSearchTerm("")}
          disabled={!searchTerm}
          aria-disabled={!searchTerm}
          className="bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-gray-700 px-5 py-3 rounded-lg transition"
        >
          Reset
        </button>
      </div>

      {/* Loading / Error / Empty */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: perPage }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center space-y-4">
          <p className="text-red-500">{error}</p>
          <button
            onClick={handleRetry}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-gray-600 text-center">No restaurants found.</p>
      ) : (
        <>
          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentList.map(r => (
              <div
                key={r.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-1 transition"
              >
                <div className="h-48 overflow-hidden rounded-t-lg">
                  <img
                    src={r.coverImage}
                    alt={r.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5 space-y-2">
                  <h3 className="text-2xl font-semibold">{r.name}</h3>
                  <StarRating rating={r.avgRating} count={r.reviewCount} />
                  <p className="text-indigo-600 font-medium">{r.cuisineType}</p>
                  <p className="text-gray-600 line-clamp-3">
                    {r.description}
                  </p>
                  <button
                    onClick={() => navigate(`/restaurants/${r.id}`)}
                    className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <nav
            className="flex justify-center items-center space-x-2 mt-8"
            aria-label="Pagination"
          >
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              aria-disabled={currentPage === 1}
              className={`px-3 py-1 rounded-lg border transition ${
                currentPage === 1
                  ? "bg-gray-200 cursor-not-allowed"
                  : "hover:bg-gray-100"
              }`}
            >
              Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded-lg border transition ${
                  currentPage === i + 1
                    ? "bg-indigo-600 text-white"
                    : "hover:bg-gray-100"
                }`}
                aria-current={currentPage === i + 1 ? "page" : undefined}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() =>
                setCurrentPage(p => Math.min(p + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              aria-disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-lg border transition ${
                currentPage === totalPages
                  ? "bg-gray-200 cursor-not-allowed"
                  : "hover:bg-gray-100"
              }`}
            >
              Next
            </button>
          </nav>
        </>
      )}
    </div>
  );
}