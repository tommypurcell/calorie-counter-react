/* eslint-disable react/prop-types */

import React from 'react'
import { supabase } from '../supabase'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function Login() {
  const navigate = useNavigate()
  const [errorMsg, setErrorMsg] = useState('')

  const requestLogin = async (e) => {
    e.preventDefault()

    try {
      const email = e.target.email.value
      const password = e.target.password.value

      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setErrorMsg(error.message)
        return
      }
      // Mark the user as logged in so Nav shows the correct UI immediately
      localStorage.setItem('isLoggedIn', 'true')

      // Prefill navbar data from profiles if available
      try {
        const {
          data: { user }
        } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, avatar, calorieGoal')
            .eq('id', user.id)
            .single()
          if (profile) {
            if (profile.name) localStorage.setItem('name', profile.name)
            if (profile.avatar) localStorage.setItem('avatar', profile.avatar)
            if (profile.calorieGoal !== undefined && profile.calorieGoal !== null) {
              localStorage.setItem('calorieGoal', String(profile.calorieGoal))
            }
          }
        }
      } catch (_) {
        // Non-fatal: navbar will still update from Nav effect
      }

      navigate('/')
    } catch (error) {
      console.error('Supabase login error:', error)
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
          <form
            onSubmit={(e) => requestLogin(e)}
            className="bg-white p-8 rounded-lg shadow-lg"
          >
            <div className="card-body container">
              <h4 className="text-danger">{errorMsg}</h4>
              <label>Email</label>
              <input
                name="email"
                type="email"
                className="border rounded form-control"
                required={true}
              />
              <label>Password</label>
              <input
                type="password"
                className="border rounded form-control"
                required={true}
                name="password"
              />
              <button
                type="submit"
                className="login-button btn btn-success mt-3"
              >
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
