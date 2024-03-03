/* eslint-disable react/prop-types */
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import React, { Component } from 'react'
axios.defaults.withCredentials = true

let render_url = 'https://calorie-counter-api-portalversion.onrender.com'
let local_url = 'http://localhost:4000'

export default function Nav(props) {
  console.log(props.loggedIn)
  const navigate = useNavigate()

  const requestLogout = async (e) => {
    e.preventDefault()
    let userToLogout = await axios.get(`${local_url}/logout`)
    console.log(userToLogout.data)
    props.onLogout()
    navigate('/login')
  }

  return (
    <>
      {/* nav bar */}
      <nav className="logo-bar container">
        <div className="d-flex flex-column flex-md-row g-4 nav-div">
          <Link to="/calorie-counter" className="m-2 w-100 text-center nav-button">
            Calorie Counter
          </Link>
          <Link to="/foodlog" className="m-2 w-100 text-center nav-button">
            Food Log
          </Link>
          <Link to="/meal-plan-generator" className="m-2 w-100 text-center nav-button">
            Meal Plan Generator
          </Link>
          <Link to="/stats" className="m-2 w-100 text-center nav-button position-relative">
            Stats
          </Link>
          <Link to="/profile" className="m-2 w-100 text-center nav-button d-flex flex-row gap-2 position-relative align-items-center">
            <img src="https://randomuser.me/api/portraits/men/33.jpg" alt="" className="rounded-circle h-100 m-0 w-auto" />
            <span>Profile</span>
            <span className="position-absolute top-0 start-100 translate-middle badge rounded bg-danger">
              <span>1</span>
            </span>
          </Link>
          {props.loggedIn ? (
            <a onClick={(e) => requestLogout(e)} type="submit" className="btn btn-outline-secondary m-2 w-100 text-center nav-button" style={{ height: 44, marginLeft: 5 }}>
              Logout
            </a>
          ) : (
            <a href="/login" className="btn btn-outline-secondary m-2 w-100 text-center nav-button" style={{ height: 44, marginLeft: 5 }}>
              Login
            </a>
          )}
        </div>
      </nav>
    </>
  )
}
