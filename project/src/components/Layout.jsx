// src/components/Layout.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import defaultProfile from "../assets/default-profile.png";
import logo from "../assets/image.png";

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const token = localStorage.getItem("authToken");
  const role = localStorage.getItem("userRole"); // 'customer'|'seller'
  const isSeller = role === "seller";

  useEffect(() => {
    if (!token) return;
    const raw = localStorage.getItem("user");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setUser(parsed);

        const restrictedPaths = ["/home", "/restaurants"];
        if (isSeller && restrictedPaths.includes(location.pathname)) {
          navigate("/seller-dashboard/manage", { replace: true });
        }
      } catch {
        localStorage.clear();
        navigate("/login");
      }
    }
  }, [token, navigate, location.pathname, isSeller]);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const customerNav = !isSeller && (
    <>
      <Link to="/home" className={linkClass("/home")}>Home</Link>
      <Link to="/restaurants" className={linkClass("/restaurants")}>Restaurants</Link>
    </>
  );

  function linkClass(path) {
    const active = location.pathname === path;
    return `px-4 py-2 rounded-lg text-sm font-medium transition ${
      active ? "bg-blue-800 text-white shadow-lg" : "text-white hover:bg-blue-700"
    }`;
  }

  const pillStyle =
    "flex items-center space-x-2 bg-white text-blue-900 px-3 py-1 rounded-lg hover:shadow transition";

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-blue-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link
              to={isSeller ? "/seller-dashboard/manage" : "/home"}
              className="flex items-center space-x-2"
            >
              <img src={logo} alt="BiteMap" className="w-8 h-8" />
              <span className="text-xl font-bold">BiteMap</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-2">
              {customerNav}
              <Link to="/about" className={linkClass("/about")}>About</Link>
              <Link to="/contact" className={linkClass("/contact")}>Contact</Link>

              {isSeller && (
                <button
                  onClick={() => navigate("/seller-dashboard/manage")}
                  className={pillStyle}
                >
                  Manage Dashboard
                </button>
              )}
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              {token ? (
                <>
                  <Link
                    to={isSeller ? "/seller-dashboard" : "/profile"}
                    className={pillStyle}
                  >
                    <img
                      src={user?.profileImage || defaultProfile}
                      alt="Profile"
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-sm">{user?.name || "Profile"}</span>
                  </Link>
                  <button onClick={logout} className="text-sm hover:underline">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-3 py-1 hover:underline">Login</Link>
                  <Link
                    to="/signup"
                    className="bg-white text-blue-900 px-4 py-1 rounded-lg shadow hover:shadow-md transition"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            <button
              onClick={() => setMobileOpen(o => !o)}
              className="md:hidden p-2 rounded-lg hover:bg-blue-800 transition"
            >
              <span className="material-icons">{mobileOpen ? "close" : "menu"}</span>
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-blue-800 text-white">
            <div className="flex flex-col px-4 py-6 space-y-3">
              {customerNav}
              <Link to="/about" className={linkClass("/about") + " block"} onClick={() => setMobileOpen(false)}>About</Link>
              <Link to="/contact" className={linkClass("/contact") + " block"} onClick={() => setMobileOpen(false)}>Contact</Link>

              {isSeller && (
                <button
                  onClick={() => { navigate("/seller-dashboard/manage"); setMobileOpen(false); }}
                  className={`${pillStyle} w-full justify-center`}
                >
                  Manage Dashboard
                </button>
              )}

              <div className="border-t border-blue-700/50 pt-4">
                {token ? (
                  <>
                    <Link
                      to={isSeller ? "/seller-dashboard" : "/profile"}
                      className="flex items-center space-x-2 mb-3"
                      onClick={() => setMobileOpen(false)}
                    >
                      <img
                        src={user?.profileImage || defaultProfile}
                        alt="Profile"
                        className="w-8 h-8 rounded-full"
                      />
                      <span>{user?.name || "Profile"}</span>
                    </Link>
                    <button
                      onClick={() => { logout(); setMobileOpen(false); }}
                      className="text-sm hover:underline"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2 hover:underline"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMobileOpen(false)}
                      className="bg-white text-blue-900 block px-4 py-2 rounded-lg shadow transition text-center"
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

      <main className="flex-grow bg-gray-50">{children}</main>

      <footer className="bg-blue-900 border-t border-blue-800 text-gray-400 text-center py-4">
        © 2022–2025 BiteMap
      </footer>
    </div>
  );
}