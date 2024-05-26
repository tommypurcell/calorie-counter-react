/* eslint-disable react/prop-types */
import { Link, NavLink, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useEffect, useState } from 'react'
import React, { Component } from 'react'
axios.defaults.withCredentials = true

const render_url = process.env.REACT_APP_RENDER_USA_URL
const local_url = process.env.REACT_APP_LOCAL_URL

console.log('Render URL:', render_url) // This should print the URL
console.log('Local URL:', local_url)

export default function Nav(props) {
  const isLoggedIn = localStorage.getItem('isLoggedIn')

  const [profilePic, setProfilePic] = useState(localStorage.getItem('avatar'))

  const navigate = useNavigate()

  const [dropdownOpen, setDropdownOpen] = useState(false)

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen)
  }

  const requestLogout = async (e) => {
    e.preventDefault()
    try {
      // Clear local storage and update state first
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('avatar')
      localStorage.removeItem('name')
      localStorage.removeItem('calorieGoal')
      setProfilePic(null) // Reset profile picture state

      // Then make the API call
      await axios.get(`${render_url}/logout`)

      // Finally, navigate to the login page
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Inside your Nav component
  useEffect(() => {
    const getProfile = async () => {
      if (!isLoggedIn) {
        setProfilePic(null)
      }
      try {
        const response = await axios.get(`${render_url}/profile`, {
          withCredentials: true // Include credentials in the request
        })
        console.log('Response:', response)
        console.log(response.data.avatar)
        setProfilePic(response.data.avatar)
      } catch (error) {
        alert(error.message)
      }
    }
    getProfile()
  }, [isLoggedIn])

  return (
    <>
      {/* nav bar */}
      <nav className="bg-gray-900 p-4 flex justify-between items-center select-none">
        <div className="flex items-center gap-x-6">
          <span className="text-white text-2xl font-thin text-nowrap">Calorie Counter</span>
          <NavLink to="/" className={({ isActive }) => `font-bold text-lg text-nowrap ${isActive ? 'text-white font-bold' : 'text-gray-400 hover:text-white'}`} draggable="false">
            Home
          </NavLink>
          <NavLink to="/stats" className={({ isActive }) => `font-bold text-lg text-nowrap ${isActive ? 'text-white font-bold' : 'text-gray-400 hover:text-white'}`} draggable="false">
            Stats
          </NavLink>
        </div>

        {isLoggedIn ? (
          <div className="relative">
            <div onClick={toggleDropdown} className="flex hover:cursor-pointer items-center space-x-2 focus:outline-none">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-cover bg-center" style={{ backgroundImage: `url(${profilePic})` }}></div>
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-600 text-white text-xs flex items-center justify-center rounded-full">1</span>
              </div>
              <span className="text-white">Demo</span>
              <i className="fa-solid fa-caret-down fa-sm text-yellow-500"></i>
            </div>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-md shadow-lg py-2 z-20">
                <NavLink to="/profile" className="flex flex-row justify gap-x-6 items-center px-4 py-2 text-gray-800 hover:bg-gray-100 hover:text-gray-800">
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
      </nav>
    </>
  )
}
