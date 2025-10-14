// src/App.jsx
import './App.css'
import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'

// pages
import Home from './pages/Home'
import Stats from './pages/Stats'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Profile from './pages/Profile'
import LandingPage from './pages/LandingPage'
import AuthCallback from './pages/AuthCallback'
import CalorieCounter from './pages/CalorieCounter'

// components
import Nav from './components/Nav'
import { supabase } from './lib/supabase'
import { render } from '@testing-library/react'

function AppContent() {
  const location = useLocation()
  const [loggedIn, setLoggedIn] = useState(false)
  const [profilePic, setProfilePic] = useState('')
  const [calorieGoal, setCalorieGoal] = useState(0)

  useEffect(() => {
    const checkLogin = async () => {
      const { data } = await supabase.auth.getUser()
      const user = data?.user
      if (user) localStorage.setItem('isLoggedIn', 'true')
      else localStorage.removeItem('isLoggedIn')
    }
    checkLogin()

    let renderAPI = process.env.REACT_APP_API_BASE

    // wake up backend
    fetch(`${renderAPI}/health`).catch(() => {})
  }, [])

  // condition updates automatically on route change
  const hideNav = location.pathname === '/login' || location.pathname === '/signup'

  return (
    <>
      {!hideNav && <Nav profilePic={profilePic} />}

      <Routes>
        <Route path="/stats" element={<Stats />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/gpt" element={<CalorieCounter />} />
        <Route path="/landing-page" element={<LandingPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/" element={<Home calorieGoal={calorieGoal} />} />
      </Routes>
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
