// imports
import './App.css'
import React from 'react'
import axios from 'axios'
import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// import pages
import Stats from './pages/Stats'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Profile from './pages/Profile'
import Home from './pages/Home'
import FoodLog from './pages/FoodLog'
import LandingPage from './pages/LandingPage'
import CalorieCounter from './pages/CalorieCounter'
import MealPlanGenerator from './pages/MealPlanGenerator'

// import components
import Nav from './components/Nav'

// Set up axios configurations
axios.defaults.withCredentials = true
const local_url = 'http://localhost:4000'

function App() {
  // State for managing logged-in status
  const [loggedIn, setLoggedIn] = useState(false)

  // Function to check if user is logged in
  const checkLogin = async () => {
    try {
      let user = await axios.get(`${local_url}/profile`)
      if (user.data !== 'Not authorized') {
        setLoggedIn(true)
      } else {
        setLoggedIn(false)
      }
    } catch (err) {
      console.error('Error checking login:', err.message)
    }
  }

  // Set state of logged in to display nav button as loggedin or loggedout
  const handleLogin = () => {
    setLoggedIn(true)
  }
  const handleLogout = () => {
    setLoggedIn(false)
  }

  // Effect hook to check login status on mount
  useEffect(() => {
    checkLogin()
  }, [])

  return (
    // Router
    <BrowserRouter>
      {/* Pass loggedIn state and handleLogout function as props to Nav */}
      <Nav loggedIn={loggedIn} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home loggedIn={loggedIn} />} />
        <Route path="/stats" element={<Stats loggedIn={loggedIn} />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/foodlog" element={<FoodLog loggedIn={loggedIn} />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/calorie-counter" element={<CalorieCounter />} />
        <Route path="/meal-plan-generator" element={<MealPlanGenerator />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
