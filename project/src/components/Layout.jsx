import { Link, useLocation } from 'react-router-dom'
import { ShoppingBagIcon, HeartIcon } from '@heroicons/react/24/outline'
import images from "../components/image.png"

export default function Layout({ children }) {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link to="/" className="text-blue-600 text-2xl font-bold">bite map</Link>
              </div>
              <div className="image">
      <img src={images} alt="Logo" className="w-16 h-16" />
    </div>
              <div className="hidden md:block ml-10">
                <div className="flex space-x-4">
                  <Link 
                    to="/" 
                    className={`px-3 py-2 text-sm font-medium ${
                      location.pathname === '/' 
                        ? 'text-gray-900 border-b-2 border-blue-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Home
                  </Link>
                  <Link 
                    to="/restaurants" 
                    className={`px-3 py-2 text-sm font-medium ${
                      location.pathname === '/restaurants' 
                        ? 'text-gray-900 border-b-2 border-blue-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Restaurants
                  </Link>
                  <Link 
                    to="/about" 
                    className={`px-3 py-2 text-sm font-medium ${
                      location.pathname === '/about' 
                        ? 'text-gray-900 border-b-2 border-blue-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    About
                  </Link>
                  <Link 
                    to="/contact" 
                    className={`px-3 py-2 text-sm font-medium ${
                      location.pathname === '/contact' 
                        ? 'text-gray-900 border-b-2 border-blue-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Contact
                  </Link>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/orders" className="text-gray-500 hover:text-gray-700 flex items-center space-x-1">
                <ShoppingBagIcon className="h-6 w-6" />
                <span className="text-sm">Orders</span>
              </Link>
              <Link to="/favorites" className="text-gray-500 hover:text-gray-700 flex items-center space-x-1">
                <HeartIcon className="h-6 w-6" />
                <span className="text-sm">Favorites</span>
              </Link>
              <Link to="/login" className="text-gray-700 hover:text-gray-900 text-sm">Login</Link>
              <Link to="/signup" className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {children}

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Copyright 2022 - 2023
            </div>
            <div className="flex space-x-4">
              <Link to="/privacy" className="text-sm text-gray-500 hover:text-gray-700">Privacy Policy</Link>
              <Link to="/terms" className="text-sm text-gray-500 hover:text-gray-700">Website Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}