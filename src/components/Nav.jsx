/* eslint-disable react/prop-types */
import axios from 'axios'
import React from 'react'

import { supabase } from '../lib/supabase'
import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

axios.defaults.withCredentials = true

export default function Nav() {
  // Track login state so Nav re-renders immediately on auth changes
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('isLoggedIn'))
  const navigate = useNavigate()

  const [profilePic, setProfilePic] = useState(localStorage.getItem('avatar'))
  const [displayName, setDisplayName] = useState(localStorage.getItem('name') || '')

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileNav, setMobileNav] = useState(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen)
  }

  // Compute an initial to show when the user has no avatar image set
  const initial = displayName && displayName.length > 0 ? displayName.charAt(0).toUpperCase() : 'U'

  const requestLogout = async (e) => {
    e.preventDefault()
    try {
      // Close the dropdown immediately on click
      setDropdownOpen(false)
      await supabase.auth.signOut()
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('avatar')
      localStorage.removeItem('name')
      localStorage.removeItem('calorieGoal')
      setProfilePic(null)
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Inside your Nav component
  useEffect(() => {
    // Listen for Supabase auth changes to update Nav instantly
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsLoggedIn(true)
        localStorage.setItem('isLoggedIn', 'true')
      } else {
        setIsLoggedIn(false)
        localStorage.removeItem('isLoggedIn')
        setDisplayName('')
        setProfilePic(null)
      }
    })

    // Also respond to localStorage updates (e.g., after profile save)
    const handleStorage = (e) => {
      if (e.key === 'name') setDisplayName(e.newValue || '')
      if (e.key === 'avatar') setProfilePic(e.newValue || null)
      if (e.key === 'isLoggedIn') setIsLoggedIn(!!e.newValue)
    }
    window.addEventListener('storage', handleStorage)

    return () => {
      data.subscription.unsubscribe()
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  useEffect(() => {
    const syncSession = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data?.user) {
        setProfilePic(null)
        localStorage.removeItem('isLoggedIn')
        setDisplayName('')
        return
      }
      localStorage.setItem('isLoggedIn', 'true')
      setProfilePic(localStorage.getItem('avatar'))

      // Prefer name from localStorage if present
      const cachedName = localStorage.getItem('name')
      if (cachedName && cachedName.length > 0) {
        setDisplayName(cachedName)
        return
      }

      // Otherwise fetch from Supabase profiles; fallback to email username
      try {
        const userId = data.user.id
        const { data: profile } = await supabase.from('profiles').select('name, avatar').eq('id', userId).single()

        const fallback = data.user?.user_metadata?.full_name || data.user?.email?.split('@')[0] || 'User'
        const nameToUse = profile?.name || fallback
        setDisplayName(nameToUse)
        localStorage.setItem('name', nameToUse)

        if (profile?.avatar) {
          setProfilePic(profile.avatar)
          localStorage.setItem('avatar', profile.avatar)
        }
      } catch (err) {
        const fallback = data.user?.user_metadata?.full_name || data.user?.email?.split('@')[0] || 'User'
        setDisplayName(fallback)
      }
    }
    syncSession()
  }, [isLoggedIn])

  return (
    <>
      {/* nav bar */}
      <nav className="bg-gray-900 p-4 flex justify-between items-center select-none">
        <div className="flex items-center gap-x-6">
          <span className="text-white text-2xl font-thin text-nowrap">Calorie Counter</span>
          <NavLink to="/" className={({ isActive }) => `hidden sm:block font-bold text-lg text-nowrap ${isActive ? 'text-white font-bold' : 'text-gray-400 hover:text-white'}`} draggable="false">
            Home
          </NavLink>
          <NavLink to="/stats" className={({ isActive }) => `hidden sm:block font-bold text-lg text-nowrap ${isActive ? 'text-white font-bold' : 'text-gray-400 hover:text-white'}`} draggable="false">
            Stats
          </NavLink>
          <NavLink to="/exercise-log" className={({ isActive }) => `hidden sm:block font-bold text-lg text-nowrap ${isActive ? 'text-white font-bold' : 'text-gray-400 hover:text-white'}`} draggable="false">
            Exercise Log
          </NavLink>
        </div>

        {isLoggedIn ? (
          <div className="relative">
            <div onClick={toggleDropdown} className="hidden sm:flex hover:cursor-pointer items-center space-x-2 focus:outline-none">
              <div className="relative">
                {profilePic ? (
                  <div className="h-10 w-10 rounded-full bg-cover bg-center" style={{ backgroundImage: `url(${profilePic})` }}></div>
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gray-600 text-white flex items-center justify-center">
                    <span className="font-semibold">{initial}</span>
                  </div>
                )}
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-600 text-white text-xs flex items-center justify-center rounded-full">1</span>
              </div>
              <span className="text-white">{displayName || 'User'}</span>
              <i className="fa-solid fa-caret-down fa-sm text-yellow-500"></i>
            </div>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-md shadow-lg py-2 z-20">
                <NavLink to="/profile" onClick={() => setDropdownOpen(false)} className="flex flex-row justify gap-x-6 items-center px-4 py-2 text-gray-800 hover:bg-gray-100 hover:text-gray-800">
                  <i className="fa-solid fa-user text-gray-500"></i>
                  <span className="text-gray-700">Profile</span>
                </NavLink>
                <button onClick={requestLogout} className="flex flex-row w-full justify gap-x-6 items-center px-4 py-2 text-gray-800 hover:bg-gray-100 hover:text-gray-800">
                  <i className="fa-solid fa-right-from-bracket text-gray-500"></i>
                  <span className="text-gray-700">Logout</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <NavLink to="/login" draggable="false" className="text-gray-400 hover:text-white px-3 py-2 rounded-md">
            <span className="user-select-none">Login</span>
          </NavLink>
        )}

        {/* Mobile hamburger (sm:hidden) */}
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="sm:hidden text-white ml-auto focus:outline-none z-40">
          {isMobileMenuOpen ? <i className="fa-solid fa-x fa-lg"></i> : <i className="fa-solid fa-bars fa-lg"></i>}
        </button>

        {/* Mobile dropdown full width */}
        {isMobileMenuOpen && (
          <div className="absolute top-16 left-0 w-full bg-gray-900 border-t border-gray-700 flex flex-col items-center sm:hidden shadow-lg z-30">
            <NavLink
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => `block w-full text-center py-3 text-lg font-semibold transition ${isActive ? 'bg-gray-800 border-2 border-gray-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
            >
              Home
            </NavLink>
            <NavLink
              to="/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => `block w-full text-center py-3 text-lg font-semibold transition ${isActive ? 'bg-gray-800 border-2 border-gray-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
            >
              Profile
            </NavLink>
            <NavLink
              to="/stats"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => `block w-full text-center py-3 text-lg font-semibold transition ${isActive ? 'bg-gray-800 border-2 border-gray-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
            >
              Stats
            </NavLink>
            <NavLink
              to="/exercise-log"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => `block w-full text-center py-3 text-lg font-semibold transition ${isActive ? 'bg-gray-800 border-2 border-gray-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
            >
              Exercise Log
            </NavLink>
          </div>
        )}
      </nav>
    </>
  )
}
