// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Layout            from './components/Layout';

// Public Pages
import HomePage             from './pages/HomePage';
import RestaurantsPage      from './pages/RestaurantsPage';
import RestaurantDetailPage from './pages/RestaurantDetailPage';
import AboutPage            from './pages/AboutPage';
import ContactPage          from './pages/ContactPage';
import LoginPage            from './pages/LoginPage';
import SignupPage           from './pages/SignupPage';

// Customer Profile Pages
import ProfilePage          from './pages/ProfilePage';
import EditProfile          from './pages/EditProfile';
import CustomerBookingsPage from './pages/CustomerBookingsPage';  // NEW

// Seller Profile & Management
import SellerProfile        from './pages/SellerProfile';
import EditSellerProfile    from './pages/EditSellerProfile';
import SellerManagementPage from './pages/SellerManagementPage';
import SellerBookingsPage   from './pages/SellerBookingsPage';    // NEW

// Edit Restaurant Page
import EditRestaurantPage   from './pages/EditRestaurantPage';

// Notifications
import NotificationsPage    from './pages/NotificationsPage';      // NEW

export default function App() {
  return (
    <Layout>
      <Routes>
        {/* Public */}
        <Route path="/"                element={<HomePage />} />
        <Route path="/home"            element={<HomePage />} />
        <Route path="/restaurants"     element={<RestaurantsPage />} />
        <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
        <Route path="/about"           element={<AboutPage />} />
        <Route path="/contact"         element={<ContactPage />} />
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/signup"          element={<SignupPage />} />

        {/* Customer Profile */}
        <Route path="/profile"         element={<ProfilePage />} />
        <Route path="/edit-profile"    element={<EditProfile />} />
        <Route path="/my-bookings"     element={<CustomerBookingsPage />} />

        {/* Seller Profile & Management */}
        <Route path="/seller-dashboard"        element={<SellerProfile />} />
        <Route path="/edit-seller-profile"     element={<EditSellerProfile />} />
        <Route path="/seller-dashboard/manage" element={<SellerManagementPage />} />
        <Route path="/seller/bookings"         element={<SellerBookingsPage />} />

        {/* Notifications */}
        <Route path="/notifications"           element={<NotificationsPage />} />

        {/* Edit Restaurant (seller only) */}
        <Route path="/edit-restaurant/:id"     element={<EditRestaurantPage />} />

        {/* Optional fallback */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
    </Layout>
  );
}