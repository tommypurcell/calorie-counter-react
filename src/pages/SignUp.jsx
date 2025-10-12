import React from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
// Note: Render API is no longer used; all auth/profile actions go through Supabase

export default function SignUp() {
  const navigate = useNavigate()
  const [errorMsg, setErrorMsg] = useState('')

  // access api

  // Function to handle login after successful signup
  const handleLoginAfterSignup = async (email, password, fullName) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setErrorMsg(error.message)
      return
    }
    // Mark logged-in and hydrate navbar data
    localStorage.setItem('isLoggedIn', 'true')
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser()
      if (user) {
        // Ensure profile row exists then load it. Store full name if provided.
        await supabase.from('profiles').upsert({ id: user.id, email: user.email || '', name: fullName || null }, { onConflict: 'id' })
        const { data: profile } = await supabase.from('profiles').select('name, avatar, calorieGoal').eq('id', user.id).single()
        if (profile) {
          if (profile.name) localStorage.setItem('name', profile.name)
          if (profile.avatar) localStorage.setItem('avatar', profile.avatar)
          if (profile.calorieGoal !== undefined && profile.calorieGoal !== null) {
            localStorage.setItem('calorieGoal', String(profile.calorieGoal))
          }
          // Fallback to the submitted full name if profile lacks one
          if (!profile.name && fullName) {
            localStorage.setItem('name', fullName)
          }
        }
      }
    } catch (_) {
      // Non-fatal; Nav effect will still pick up later
    }
    navigate('/')
  }

  // Function to check if passwords match
  const checkPasswords = (password, confirmPassword) => {
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match')
      return false
    }
    return true
  }

  const makeAccount = async (e) => {
    e.preventDefault()
    try {
      const email = e.target.email.value.trim().toLowerCase()
      const password = e.target.password.value.trim()
      const name = e.target.fullName.value.trim()
      const confirmPassword = e.target.confirmPassword.value.trim()

      if (!checkPasswords(password, confirmPassword)) {
        return
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } }
      })
      if (error) {
        setErrorMsg(error.message)
        return
      }

      await handleLoginAfterSignup(email, password, name)
    } catch (error) {
      null
    }
  }

  const handleGoogleSignup = async () => {
    console.log('[OAuth] Starting Google signup...')
    const redirectTo = `${window.location.origin}/auth/callback`
    console.log('[OAuth] Using redirectTo:', redirectTo)
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo
      }
    })
    if (error) {
      console.error('[OAuth] Error initiating Google signup:', error)
      setErrorMsg(error.message)
    } else {
      console.log('[OAuth] Supabase returned, redirecting to Google...', data)
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
          <div className="row text-start">Confirm Password</div>
          <div className="row">
            <input name="confirmPassword" type="password" className="border rounded" required />
          </div>

          <div className="row">
            <button type="submit" className="btn btn-success bg-sky-900 hover:bg-sky-800 hover:text-green-300 border-gray-200 ">
              Sign Up
            </button>
            <button className="gsi-material-button" type="button" onClick={handleGoogleSignup}>
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
                <span className="gsi-material-button-contents">Sign up with Google</span>
                <span style={{ display: 'none' }}>Sign up with Google</span>
              </div>
            </button>
          </div>
          <div className="row">
            <span>
              Already have an account?{' '}
              <Link className="text-sky-900 hover:text-blue-400 hover:underline" to="/login">
                Login
              </Link>
            </span>
          </div>
        </form>
        <h4 className="text-danger">{errorMsg}</h4>
      </div>
    </div>
  )
}
