/* eslint-disable react/prop-types */

import React from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
axios.defaults.withCredentials = true

const render_url = process.env.REACT_APP_RENDER_USA_URL
const local_url = process.env.REACT_APP_LOCAL_URL

export default function Login(props) {
  const navigate = useNavigate()
  const [errorMsg, setErrorMsg] = useState('')

  const requestLogin = async (e) => {
    e.preventDefault()

    let loginAccount = await axios.post(
      `${render_url}/login`,
      {
        email: e.target.email.value,
        password: e.target.password.value
      },
      { withCredentials: true } // This is necessary to receive and send cookies
    )

    console.log('loginAcccount', JSON.stringify(loginAccount)) // Convert object to JSON string
    if (loginAccount.data !== 'Cannot login: User does not exist. Please sign up instead.') {
      // Store token and user info in localStorage
      localStorage.setItem('token', loginAccount.data.token)
      localStorage.setItem('avatar', loginAccount.data.user.avatar)
      localStorage.setItem('name', loginAccount.data.user.name)
      localStorage.setItem('isLoggedIn', true)

      navigate('/')
      console.log('Login successful:', loginAccount)
    } else {
      setErrorMsg(loginAccount.data)
    }
  }

  return (
    <>
      <div className="login-card card align-items-center position-absolute top-50 start-50 translate-middle w-50 h-auto p-5">
        <form onSubmit={(e) => requestLogin(e)}>
          {props.loginAttempt && !errorMsg ? (
            <h1>Logging in. Please Wait...</h1>
          ) : (
            <div className="card-body container">
              <h4 className="text-danger">{errorMsg}</h4>
              <label>Email</label>
              <input name="email" type="email" className="border rounded form-control" required={true} />
              <label>Password</label>
              <input type="password" className="border rounded form-control" required={true} name="password" />
              <button type="submit" className="login-button btn btn-success mt-3">
                Login
              </button>
              <div>
                <span>
                  New to Calorie Counter?{' '}
                  <Link to="/signup" className="signup-link">
                    Signup
                  </Link>
                </span>
              </div>
            </div>
          )}
        </form>
      </div>
    </>
  )
}
