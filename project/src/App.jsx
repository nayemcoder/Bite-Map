// src/App.jsx
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import RestaurantsPage from './pages/RestaurantsPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import ConnectPage from './pages/ConnectPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ProfilePage from './pages/ProfilePage' 
import EditProfile from "./pages/EditProfile";
import axios from 'axios'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/restaurants" element={<RestaurantsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/connect" element={<ConnectPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/edit-profile" element={<EditProfile />} />
      </Routes>
    </Layout>
  )
}

export default App
