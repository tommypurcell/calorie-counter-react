/* eslint-disable react/prop-types */
import { Link, NavLink, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useEffect, useState } from 'react'
import React, { Component } from 'react'
axios.defaults.withCredentials = true

let render_url = 'https://calorie-counter-api-singapore.onrender.com'
let local_url = 'http://localhost:4000'

export default function Nav(props) {
  const isLoggedIn = localStorage.getItem('isLoggedIn')
  console.log(props)

  const [profilePic, setProfilePic] = useState(localStorage.getItem('avatar'))

  const navigate = useNavigate()

  const requestLogout = async (e) => {
    e.preventDefault()

    let userToLogout = await axios.get(`${render_url}/logout`)

    localStorage.removeItem('isLoggedIn')
    navigate('/login')
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
      <nav className="bg-gray-900 p-4 flex justify-between items-center">
        <div className="flex items-center gap-x-6">
          <span className="text-white text-2xl font-thin text-nowrap">Calorie Counter</span>
          <NavLink to="/" className={({ isActive }) => `font-bold text-lg text-nowrap ${isActive ? 'text-white font-bold' : 'text-gray-400 hover:text-white'}`}>
            Home
          </NavLink>
          <NavLink to="/stats" className={({ isActive }) => `font-bold text-lg text-nowrap ${isActive ? 'text-white font-bold' : 'text-gray-400 hover:text-white'}`}>
            Stats
          </NavLink>
        </div>
        <div className="flex items-center mr-6">
          {isLoggedIn ? (
            <NavLink to="/profile" className={({ isActive }) => `flex items-center space-x-2 ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-cover bg-center" style={{ backgroundImage: `url(${profilePic})` }}></div>
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-600 text-white text-xs flex items-center justify-center rounded-full">1</span>
              </div>
              <span className="text-white">{localStorage.getItem('name')}</span>
            </NavLink>
          ) : (
            <NavLink to="/login" className={({ isActive }) => `font-bold text-lg text-nowrap ${isActive ? 'text-white font-bold' : 'text-gray-400 hover:text-white'}`}>
              Login
            </NavLink>
          )}
        </div>
      </nav>
    </>
  )
}
