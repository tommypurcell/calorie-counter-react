/* eslint-disable react/prop-types */

import React from 'react'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()
  const [errorMsg, setErrorMsg] = useState('')
  const [profile, setProfile] = useState({})

  const handleGoogleLogin = async () => {
    console.log('[OAuth] Starting Google sign-in...')
    const redirectTo = `${window.location.origin}/auth/callback`
    console.log('[OAuth] Using redirectTo:', redirectTo)
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo
      }
    })

    if (error) {
      console.error('[OAuth] Error initiating Google sign-in:', error)
    } else {
      console.log('[OAuth] Supabase returned, redirecting to Google...', data)
    }
  }

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
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
          if (profile) {
            if (profile.name) localStorage.setItem('name', profile.name)
            if (profile.avatar) localStorage.setItem('avatar', profile.avatar)
            if (profile.calorieGoal !== undefined && profile.calorieGoal !== null) {
              localStorage.setItem('calorieGoal', String(profile.calorieGoal))
            }
          }
          setProfile(profile)

          console.log(profile)

          // 🚀 NEW: check for BMI or BMR
          if (!profile.bmi || !profile.bmr || !profile.gender || !profile.height_cm || !profile.weight_kg || !profile.activity_level) {
            navigate('/on-boarding')
            return
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

  useEffect(() => {
    let renderAPI = process.env.REACT_APP_API_BASE
    // wake up backend
    fetch(`${renderAPI}/health`).catch(() => {})
  }, [])

  return (
    <div className="h-screen overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 h-full">
        {/* 1st column */}
        <div
          style={{
            backgroundColor: `#DAFFFD`,

            // backgroundColor: '#ddffaa',
            // eslint-disable-next-line max-len
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cpolygon fill='%23AE9' points='120 120 60 120 90 90 120 60 120 0 120 0 60 60 0 0 0 60 30 90 60 120 120 120 '/%3E%3C/svg%3E")`
          }}
          className="h-full hidden md:block"
        ></div>
        {/* 2nd column */}
        <div className="flex flex-col gap-4 justify-center items-center h-full">
          <span className="text-black text-2xl sm:text-4xl font-thin">Welcome to Calorie Counter!</span>
          <form onSubmit={(e) => requestLogin(e)} className="bg-white grid grid-cols-1 gap-y-1 justify-items-center w-3/4 p-8 rounded-lg shadow-lg">
            {/* wrapper for all form contents (sets width) */}

            <div className="w-full grid grid-cols-1 gap-y-3 md:w-[250px]">
              {/* Email */}
              <div className="w-full flex flex-col items-start">
                <h4 className="text-danger">{errorMsg}</h4>
                <label>Email</label>
                <input name="email" type="email" className="border rounded-lg form-control" required={true} />
              </div>
              {/* password   */}
              <div className="w-full flex flex-col items-start">
                <label>Password</label>
                <input type="password" className="w-full border rounded-lg form-control" required={true} name="password" />
              </div>
              {/* login button */}{' '}
              <button type="submit" className="btn btn-success w-full">
                Login
              </button>
              {/* google sign in */}
              <div className="w-full">
                {' '}
                {/* Google login button */}
                <button className="gsi-material-button w-full" type="button" onClick={handleGoogleLogin} style={{ width: '100%' }}>
                  <div className="gsi-material-button-state"></div>
                  <div className="gsi-material-button-content-wrapper">
                    <div className="gsi-material-button-icon">
                      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                        <path fill="none" d="M0 0h48v48H0z"></path>
                      </svg>
                    </div>
                    <span className="gsi-material-button-contents">Sign in with Google</span>
                    <span style={{ display: 'none' }}>Sign in with Google</span>
                  </div>
                </button>
              </div>
              {/* sign up */}
              <div className="w-full">
                <span>
                  New to Calorie Counter?{' '}
                  <Link to="/signup" className="text-indigo-600 underline">
                    Sign up
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
