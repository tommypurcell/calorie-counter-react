// imports
import './App.css'
import React from 'react'
import axios from 'axios'
import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'

// import pages
import Home from './pages/Home'
import Stats from './pages/Stats'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Profile from './pages/Profile'
import FoodLog from './pages/FoodLog'
import LandingPage from './pages/LandingPage'
import CalorieCounter from './pages/CalorieCounter'
import MealPlanGenerator from './pages/MealPlanGenerator'

// import components
import Nav from './components/Nav'

// Set up axios configurations
// axios.defaults.withCredentials = true

const render_url = process.env.REACT_APP_RENDER_USA_URL
const local_url = process.env.REACT_APP_LOCAL_URL

function App() {
  // State for managing logged-in status
  const [loggedIn, setLoggedIn] = useState(false)
  const [profilePic, setProfilePic] = useState('')
  const [calorieGoal, setCalorieGoal] = useState(0)

  // Function to check if user is logged in
  const checkLogin = async () => {
    try {
      let user = await axios.get(`${render_url}/profile`, {
        withCredentials: true
      })
      if (user.data !== 'Not authorized') {
        localStorage.setItem('isLoggedIn', true)
        setProfilePic(user.data.avatar)
        setCalorieGoal(user.data.calorieGoal)
      }
    } catch (err) {
      console.error('Error checking login:', err.message)
    }
  }

  // Set state of logged in to display nav button as loggedin or loggedout

  // Effect hook to check login status on mount
  useEffect(() => {
    checkLogin()
  }, [])

  return (
    // Router
    <BrowserRouter>
      {/* Pass loggedIn state and handleLogout function as props to Nav */}

      {/* Conditionally render Nav if not on login or signup pages */}
      {location.pathname !== '/login' && location.pathname !== '/signup' ? <Nav profilePic={profilePic} /> : null}

      <Routes>
        <Route path="/stats" element={<Stats />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/gpt" element={<CalorieCounter />} />
        <Route path="/landing-page" element={<LandingPage />} />
        <Route path="/" element={<Home calorieGoal={calorieGoal} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
