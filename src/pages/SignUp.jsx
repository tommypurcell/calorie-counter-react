import React from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
axios.defaults.withCredentials = true

let render_url = 'https://calorie-counter-api-singapore.onrender.com'
let local_url = 'http://localhost:4000'

export default function SignUp() {
  const navigate = useNavigate()
  const [errorMsg, setErrorMsg] = useState('')

  // access api

  // Function to handle login after successful signup
  const handleLoginAfterSignup = async (email, password) => {
    try {
      let loginAccount = await axios.post(
        `${render_url}/login`,
        {
          email: email,
          password: password
        },
        { withCredentials: true }
      )

      console.log('login data', loginAccount.data)
      navigate('/') // Redirect to the home page after successful login
    } catch (error) {
      setErrorMsg('Cannot login: User does not exist. Please sign up instead.')
    }
  }

  const makeAccount = async (e) => {
    e.preventDefault()
    try {
      let newAccount = await axios.post(`${render_url}/signup`, {
        name: e.target.fullName.value,
        email: e.target.email.value,
        password: e.target.password.value
      })

      if (newAccount.data === 'User with this email already exists') {
        console.log(newAccount.data)
        setErrorMsg(newAccount.data)
      } else {
        // If the signup is successful, log in the user
        await handleLoginAfterSignup(newAccount.data.email, newAccount.data.password)
      }
    } catch (error) {
      null
    }
  }

  return (
    <div className="signup-card card align-items-center position-absolute top-50 start-50 translate-middle w-50 h-auto p-5">
      <div className="card-body container">
        <form onSubmit={(e) => makeAccount(e)}>
          <div className="row text-start">Your Full Name</div>
          <div className="row">
            <input name="fullName" type="text" className="border rounded" required />
          </div>

          <div className="row text-start">Email</div>
          <div className="row">
            <input name="email" type="email" className="border rounded" required />
          </div>
          <div className="row text-start">Password</div>
          <div className="row">
            <input name="password" type="password" className="border rounded" required />
          </div>
          <button type="submit" className="btn btn-success row mt-3">
            Sign Up
          </button>
          <div className="row">
            <span>
              Already have an account? <Link to="/login">Login</Link>
            </span>
          </div>
        </form>
        <h4 className="text-danger">{errorMsg}</h4>
      </div>
    </div>
  )
}
