import './App.css'
import React from 'react'
import logo from './logo.svg'
import Stats from './pages/Stats'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Profile from './pages/Profile'
import FoodLog from './pages/FoodLog'
import LandingPage from './pages/LandingPage'
import CalorieCounter from './pages/CalorieCounter'
import MealPlanGenerator from './pages/MealPlanGenerator'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    // Router
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/foodlog" element={<FoodLog />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/calorie-counter" element={<CalorieCounter />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/meal-plan-generator" element={<MealPlanGenerator />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
