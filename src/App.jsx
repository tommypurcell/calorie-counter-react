// src/App.jsx
import './App.css'
import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'

// pages
import Home from './pages/Home'
import Stats from './pages/Stats'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Profile from './pages/Profile'
import Checkout from './pages/Checkout'
import ContactForm from './pages/Contact'
import Onboarding from './pages/OnBoarding'
import LandingPage from './pages/LandingPage'
import AuthCallback from './pages/AuthCallback'
import CalorieCounter from './pages/CalorieCounter'
import Pricing from './pages/Pricing'

import CoachDashboard from './pages/CoachDashboard'
import ClientProfile from './pages/ClientProfile'
import WeightEdit from './pages/WeightEdit'

// components
import { supabase } from './lib/supabase'
import { render } from '@testing-library/react'

import { Analytics } from '@vercel/analytics/react'

import Nav from './components/Nav'
import Footer from './components/ui/Footer'
import ExerciseLog from './pages/ExerciseLog'
import { PrivacyPolicy, TermsOfService } from './pages/Privacy'

function AppContent() {
  const location = useLocation()
  const [loggedIn, setLoggedIn] = useState(null)
  const [profilePic, setProfilePic] = useState('')
  const [calorieGoal, setCalorieGoal] = useState(0)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    const checkLogin = async () => {
      const { data } = await supabase.auth.getUser()
      const user = data?.user
      setLoggedIn(!!user)
      setCheckingAuth(false)

      if (user) localStorage.setItem('isLoggedIn', 'true')
      else localStorage.removeItem('isLoggedIn')
    }
    checkLogin()

    // Wake backend
    const renderAPI = process.env.REACT_APP_API_BASE
    fetch(`${renderAPI}/health`).catch(() => {})
  }, [])

  // condition updates automatically on route change
  // pages where we *always* hide the Nav
  const noNavRoutes = ['/', '/login', '/signup', '/auth/callback']

  // hide nav if it's a no-nav route, or if it's the landing page shown at "/"
  const hideNav = (!loggedIn && location.pathname === '/') || noNavRoutes.includes(location.pathname)

  // ⛔️ STOP — don't render anything until we know auth state
  // Only block while checking auth if user might be trying to access a protected route
  const publicRoutes = ['/', '/login', '/signup', '/auth/callback']

  if (loggedIn === null && !publicRoutes.includes(location.pathname)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p className="text-sm text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <>
      {!hideNav && <Nav profilePic={profilePic} />}

      <Routes>
        <Route path="/auth/v1/callback" element={<AuthCallback />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route
          path="/"
          element={
            loggedIn === null ? (
              <div /> // hold — don't flash LandingPage or /home yet
            ) : loggedIn ? (
              <Navigate to="/home" replace />
            ) : (
              <LandingPage />
            )
          }
        />

        <Route path="/gpt" element={<CalorieCounter />} />
        <Route path="/home" element={<Home />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/login" element={<Login />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/contact" element={<ContactForm />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/on-boarding" element={<Onboarding />} />
        <Route path="/exercise-log" element={<ExerciseLog />} />

        {/* Coach Routes */}
        <Route path="/coach-dashboard" element={<CoachDashboard />} />
        <Route path="/coach/client/:clientId" element={<ClientProfile />} />

        <Route path="/weight-edit" element={<WeightEdit />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/checkout" element={<Checkout />} />
      </Routes>
      <Analytics />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
