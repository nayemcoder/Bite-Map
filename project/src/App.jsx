// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Layout            from './components/Layout';

// Pages
import HomePage             from './pages/HomePage';
import RestaurantsPage      from './pages/RestaurantsPage';
import RestaurantDetailPage from './pages/RestaurantDetailPage';
import AboutPage            from './pages/AboutPage';
import ContactPage          from './pages/ContactPage';
import ConnectPage          from './pages/ConnectPage';
import LoginPage            from './pages/LoginPage';
import SignupPage           from './pages/SignupPage';

import ProfilePage          from './pages/ProfilePage';
import EditProfile          from './pages/EditProfile';

import SellerProfile        from './pages/SellerProfile';
import EditSellerProfile    from './pages/EditSellerProfile';
import SellerManagementPage from './pages/SellerManagementPage';

export default function App() {
  return (
    <Layout>
      <Routes>
        {/* Public */}
        <Route path="/"                   element={<HomePage />} />
        <Route path="/home"               element={<HomePage />} />
        <Route path="/restaurants"        element={<RestaurantsPage />} />
        <Route path="/restaurants/:id"    element={<RestaurantDetailPage />} />
        <Route path="/about"              element={<AboutPage />} />
        <Route path="/contact"            element={<ContactPage />} />
        <Route path="/connect"            element={<ConnectPage />} />
        <Route path="/login"              element={<LoginPage />} />
        <Route path="/signup"             element={<SignupPage />} />

        {/* Customer Profile */}
        <Route path="/profile"            element={<ProfilePage />} />
        <Route path="/edit-profile"       element={<EditProfile />} />

        {/* Seller Profile & Management */}
        <Route path="/seller-dashboard"           element={<SellerProfile />} />
        <Route path="/edit-seller-profile"        element={<EditSellerProfile />} />
        <Route path="/seller-dashboard/manage"    element={<SellerManagementPage />} />

        {/* Fallback (optional) */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
    </Layout>
  );
}