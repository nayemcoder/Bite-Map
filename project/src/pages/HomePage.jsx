import { Link } from 'react-router-dom';
import bgImage from "../assets/home.png";

export default function HomePage() {
  return (
    <div className="relative">
      <div className="absolute inset-0">
        <img
          className="w-full h-screen object-cover brightness-50"
          src={bgImage}

          alt="Restaurant interior"
        />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-8">
            Discover Amazing Restaurants
          </h1>
          <p className="text-xl text-gray-200 mb-12">
            Find and book the best restaurants in your area
          </p>
          <Link
            to="/restaurants"
            className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Explore Restaurants
          </Link>
        </div>
      </div>
    </div>
  )
}