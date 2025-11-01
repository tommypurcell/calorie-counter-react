import React from 'react'
import { NavLink } from 'react-router-dom'

export default function LandingPage() {
  // rest of component...

  return (
    <>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 via-slate-900 to-black text-white">
        {/* Navbar */}
        <nav className="flex justify-between items-center px-8 py-4 md:border-b md:mb-10 border-gray-700">
          <h1 className="text-2xl font-light tracking-wide">Calorie Counter</h1>
          <div className="hidden md:flex flex-col md:flex-row items-center gap-y-2 gap-x-4">
            <NavLink to="/signup" className="bg-green-500 hover:bg-green-600 border-1 border-green-600 md:text-white p-2 md:px-4 md:py-2 rounded-md md:font-semibold">
              Sign Up
            </NavLink>
            <NavLink to="/login" className="text-gray-300 hover:text-white">
              Login
            </NavLink>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="flex-grow flex flex-col items-center justify-center text-center px-6">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">Track Your Nutrition. Easier.</h2>
          <div className="flex flex-row">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">With AI.</h2>
            <img src="https://cdn-icons-png.flaticon.com/128/16921/16921802.png" alt="" className="ml-4 h-10 w-10" />
          </div>
          <p className="max-w-2xl text-gray-300 mb-8 text-sm sm:text-lg">AI-powered calorie tracking that estimates macros, suggests goals, and makes tracking easy.</p>
          <div className="flex gap-4">
            <NavLink to="/signup" className="bg-green-500 hover:bg-green-600 hover:text-white px-6 py-3 rounded-lg text-lg font-medium">
              Get Started
            </NavLink>
            <NavLink to="/login" className="border border-gray-400 hover:border-white hover:bg-gray-600 hover:text-white px-6 py-3 rounded-lg text-lg font-medium">
              Log In
            </NavLink>
          </div>

          <div className="mt-16 max-w-3xl w-full bg-gray-800/50 rounded-xl p-6 shadow-lg border border-gray-700">
            <h3 className="text-xl font-semibold mb-3">Why Calorie Counter?</h3>
            <ul className="text-gray-300 space-y-2 text-left list-disc list-inside text-sm sm:text-lg">
              <li>🔍 Get instant calorie & macro estimates for any meal</li>
              <li>🎯 Personalized targets based on your goals</li>
              <li>📊 Visualize progress with daily and weekly analytics</li>
            </ul>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t mt-20 border-gray-700 py-4 text-center text-gray-400 text-sm">© {new Date().getFullYear()} Calorie Counter. All rights reserved.</footer>
      </div>
    </>
  )
}
