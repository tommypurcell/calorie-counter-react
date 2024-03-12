/* eslint-disable react/prop-types */
import { Link, NavLink } from 'react-router-dom'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import React, { Component } from 'react'
axios.defaults.withCredentials = true

let render_url = 'https://calorie-counter-api-singapore.onrender.com'
let local_url = 'http://localhost:4000'

export default function Nav(props) {
  const isLoggedIn = localStorage.getItem('isLoggedIn')
  console.log(props)
  const navigate = useNavigate()

  const requestLogout = async (e) => {
    e.preventDefault()

    let userToLogout = await axios.get(`${render_url}/logout`)

    localStorage.removeItem('isLoggedIn')
    navigate('/login')
  }

  // Inside your Nav component
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    console.log('Login status changed:', isLoggedIn)
  }, [props.loggedIn])

  return (
    <>
      {/* nav bar */}
      <nav className="logo-bar container">
        <div className="d-flex flex-column flex-md-row g-4 nav-div">
          <NavLink
            to="/"
            style={({ isActive }) => ({
              color: isActive ? '#fff' : '',
              background: isActive ? '#7600dc' : ''
            })}
            className="m-2 w-100 text-center nav-button"
          >
            Home
          </NavLink>
          {/* <NavLink
            to="/meal-plan-generator"
            style={({ isActive }) => ({
              color: isActive ? '#fff' : '',
              background: isActive ? '#7600dc' : ''
            })}
            className="m-2 w-100 text-center nav-button"
          >
            Meal Plan Generator
          </NavLink> */}
          <NavLink
            to="/stats"
            style={({ isActive }) => ({
              color: isActive ? '#fff' : '',
              background: isActive ? '#7600dc' : ''
            })}
            className="m-2 w-100 text-center nav-button position-relative"
          >
            Stats
          </NavLink>

          {isLoggedIn ? (
            <NavLink
              to="/profile"
              style={({ isActive }) => ({
                color: isActive ? '#fff' : '',
                background: isActive ? '#7600dc' : ''
              })}
              className="m-2 w-100 text-center nav-button d-flex flex-row gap-2 position-relative align-items-center"
            >
              <img src={props.profilePic} alt="profile headshot for nav menu" className="rounded-circle h-100 m-0 w-auto" />
              <span>Profile</span>
              <span className="position-absolute top-0 start-100 translate-middle badge rounded bg-danger">
                <span>1</span>
              </span>
            </NavLink>
          ) : null}
          {isLoggedIn ? (
            <a onClick={(e) => requestLogout(e)} type="submit" className="btn btn-outline-secondary m-2 w-100 text-center nav-button" style={{ height: 44, marginLeft: 5 }}>
              Logout
            </a>
          ) : (
            <NavLink to="/login" className="btn btn-outline-secondary m-2 w-100 text-center nav-button" style={{ height: 44, marginLeft: 5 }}>
              Login
            </NavLink>
          )}
        </div>
      </nav>
    </>
  )
}
