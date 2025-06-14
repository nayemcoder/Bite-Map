// src/components/Layout.jsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import defaultProfile from '../assets/default-profile.png';

export default function Layout({ children }) {
  const location = useLocation();
  const navigate  = useNavigate();
  const [user, setUser]    = useState(null);

  // read token + role from localStorage
  const token    = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole'); // 'customer' or 'seller'
  const isCustomer = userRole === 'customer';

  useEffect(() => {
    // if not logged in, no need to load user
    if (!token) return;

    // try to parse stored user object
    const raw = localStorage.getItem('user');
    if (!raw) {
      localStorage.clear();
      navigate('/login');
      return;
    }
    try {
      setUser(JSON.parse(raw));
    } catch {
      localStorage.clear();
      navigate('/login');
    }
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // helper to highlight active link
  const linkClass = (path) =>
    `px-3 py-2 text-sm font-medium ${
      location.pathname === path ||
      (path === '/restaurants' && location.pathname.startsWith('/restaurants'))
        ? 'text-gray-900 border-b-2 border-blue-600'
        : 'text-gray-500 hover:text-gray-700'
    }`;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 flex justify-between h-16 items-center">
          {/* Branding */}
          <div className="flex items-center space-x-6">
            <Link to="/home" className="text-blue-600 text-2xl font-bold">
              bite map
            </Link>

            {/* Only show on medium+ */}
            <div className="hidden md:flex space-x-4">
              <Link to="/home" className={linkClass('/home')}>
                Home
              </Link>

              {isCustomer && (
                <Link to="/restaurants" className={linkClass('/restaurants')}>
                  Restaurants
                </Link>
              )}
            </div>
          </div>

          {/* Right side: login/profile */}
          <div className="flex items-center space-x-4">
            {token ? (
              <>
                <Link
                  to={userRole === 'seller' ? '/seller-dashboard' : '/profile'}
                  className="flex items-center space-x-2"
                >
                  <img
                    src={user?.profileImage || defaultProfile}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-sm text-gray-700">
                    {user?.name || 'My Profile'}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-700 hover:text-gray-900"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-gray-900 text-sm"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-grow">{children}</main>

      <footer className="border-t py-4">
        <div className="max-w-7xl mx-auto px-4 text-sm text-gray-500">
          © 2022 - 2025 Bite Map
        </div>
      </footer>
    </div>
  );
}