import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState }            from "react";
import defaultProfile                     from "../assets/default-profile.png";
import logo                               from "../assets/image.png";
import axios                              from "axios";
import { BellIcon }                       from "@heroicons/react/24/outline";

export default function Layout({ children }) {
  const location   = useLocation();
  const navigate   = useNavigate();
  const [user, setUser]             = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  const token    = localStorage.getItem("authToken");
  const role     = localStorage.getItem("userRole");
  const isSeller = role === "seller";

  // Load user & notifications
  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        localStorage.clear();
        navigate("/login");
        return;
      }
    }
    if (token) {
      axios
        .get("/notifications", { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          const list = res.data.data || [];
          setNotifCount(list.filter(n => !n.is_read).length);
        })
        .catch(() => setNotifCount(0));
    }
  }, [token, navigate]);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const linkClass = path => {
    const active = location.pathname.startsWith(path);
    return `px-4 py-2 rounded-lg text-sm font-medium transition ${
      active ? "bg-indigo-800 text-white" : "text-white hover:bg-indigo-700"
    }`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-indigo-900 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 flex justify-between h-16 items-center">

          {/* Logo */}
          <Link
            to={isSeller ? "/seller-dashboard/manage" : "/home"}
            className="flex items-center space-x-2"
          >
            <img src={logo} alt="BiteMap" className="w-8 h-8" />
            <span className="text-2xl font-bold">BiteMap</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-2">
            {isSeller ? (
              <>
                <Link
                  to="/seller-dashboard/manage"
                  className={linkClass("/seller-dashboard/manage")}
                >
                  Dashboard
                </Link>
                <Link
                  to="/seller/bookings"
                  className={linkClass("/seller/bookings")}
                >
                  Bookings
                </Link>
              </>
            ) : (
              <>
                <Link to="/home" className={linkClass("/home")}>
                  Home
                </Link>
                <Link to="/restaurants" className={linkClass("/restaurants")}>
                  Restaurants
                </Link>
                <Link to="/my-bookings" className={linkClass("/my-bookings")}>
                  My Bookings
                </Link>
              </>
            )}
            <Link to="/about" className={linkClass("/about")}>
              About
            </Link>
            <Link to="/contact" className={linkClass("/contact")}>
              Contact
            </Link>
          </nav>

          {/* Desktop Profile + Bell */}
          <div className="hidden md:flex items-center space-x-4">
            {token ? (
              <>
                <Link to="/notifications" className="relative">
                  <BellIcon className="w-6 h-6 text-white hover:text-gray-200" />
                  {notifCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-xs text-white rounded-full px-1">
                      {notifCount}
                    </span>
                  )}
                </Link>
                <Link
                  to={isSeller ? "/seller-dashboard" : "/profile"}
                  className="flex items-center space-x-1 px-3 py-1 bg-white text-indigo-900 rounded-lg"
                >
                  <img
                    src={user?.profileImage || defaultProfile}
                    alt="Profile"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-sm">{user?.name || "Profile"}</span>
                </Link>
                <button onClick={logout} className="text-sm hover:underline">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-1 hover:underline">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-1 bg-white text-indigo-900 rounded-lg"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="md:hidden p-2 hover:bg-indigo-800 rounded"
          >
            <span className="material-icons text-2xl">
              {mobileOpen ? "close" : "menu"}
            </span>
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden bg-indigo-800 text-white">
            <div className="p-4 space-y-3">
              {isSeller ? (
                <>
                  <Link
                    to="/seller-dashboard/manage"
                    className={linkClass("/seller-dashboard/manage") + " block"}
                    onClick={() => setMobileOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/seller/bookings"
                    className={linkClass("/seller/bookings") + " block"}
                    onClick={() => setMobileOpen(false)}
                  >
                    Bookings
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/home"
                    className={linkClass("/home") + " block"}
                    onClick={() => setMobileOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    to="/restaurants"
                    className={linkClass("/restaurants") + " block"}
                    onClick={() => setMobileOpen(false)}
                  >
                    Restaurants
                  </Link>
                  <Link
                    to="/my-bookings"
                    className={linkClass("/my-bookings") + " block"}
                    onClick={() => setMobileOpen(false)}
                  >
                    My Bookings
                  </Link>
                </>
              )}
              <Link
                to="/about"
                className={linkClass("/about") + " block"}
                onClick={() => setMobileOpen(false)}
              >
                About
              </Link>
              <Link
                to="/contact"
                className={linkClass("/contact") + " block"}
                onClick={() => setMobileOpen(false)}
              >
                Contact
              </Link>

              <div className="border-t border-indigo-700 pt-4">
                {token ? (
                  <>
                    <Link
                      to={isSeller ? "/seller-dashboard" : "/profile"}
                      className="flex items-center space-x-2 mb-2"
                      onClick={() => setMobileOpen(false)}
                    >
                      <img
                        src={user?.profileImage || defaultProfile}
                        alt="Profile"
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <span>{user?.name || "Profile"}</span>
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setMobileOpen(false);
                      }}
                      className="text-sm hover:underline"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block"
                      onClick={() => setMobileOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="block mt-2 bg-white text-indigo-900 px-4 py-2 rounded-lg text-center"
                      onClick={() => setMobileOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow bg-gray-100">{children}</main>
      <footer className="bg-indigo-900 text-gray-200 text-center py-4">
        © 2022–2025 BiteMap
      </footer>
    </div>
  );
}