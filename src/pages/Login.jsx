/* eslint-disable react/prop-types */

import React from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

axios.defaults.withCredentials = true

const render_url = process.env.REACT_APP_RENDER_USA_URL
const local_url = process.env.REACT_APP_LOCAL_URL
console.log(render_url)

export default function Login(props) {
  const navigate = useNavigate()
  const [errorMsg, setErrorMsg] = useState('')

  const requestLogin = async (e) => {
    e.preventDefault()

    try {
      let loginAccount = await axios.post(
        `${render_url}/login`,

        {
          email: e.target.email.value,
          password: e.target.password.value
        },
        { withCredentials: true }
      )
      if (loginAccount) {
        console.log('loginAccount', loginAccount)
      }
      navigate('/')
    } catch (error) {
      console.error('Network or server error:', error)
      setErrorMsg('An error occurred. Please try again later.')
    }
  }

  return (
    <div className="h-screen overflow-hidden">
      <div className="grid grid-cols-2 h-full">
        <div
          style={{
            backgroundColor: `#DAFFFD`,

            // backgroundColor: '#ddffaa',
            // eslint-disable-next-line max-len
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cpolygon fill='%23AE9' points='120 120 60 120 90 90 120 60 120 0 120 0 60 60 0 0 0 60 30 90 60 120 120 120 '/%3E%3C/svg%3E")`
          }}
          className="h-full"
        ></div>
        <div className="flex justify-center items-center h-full">
          <form onSubmit={(e) => requestLogin(e)} className="bg-white p-8 rounded-lg shadow-lg">
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
          </form>
        </div>
      </div>
    </div>
  )
}
