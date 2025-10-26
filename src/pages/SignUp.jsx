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
    <div className="flex flex-col gap-8 items-center justify-center min-h-screen bg-gray-50">
      <span className="text-black text-2xl sm:text-4xl font-thin">Welcome to Calorie Counter!</span>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <h2 className="text-2xl font-semibold text-center text-gray-800">Create an Account</h2>

        <form onSubmit={makeAccount} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
            <input name="fullName" type="text" required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none" />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
            <input name="email" type="email" required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none" />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
            <input name="password" type="password" required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none" />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Confirm Password</label>
            <input name="confirmPassword" type="password" required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none" />
          </div>

          {/* Sign Up Button */}
          <button type="submit" className="w-full bg-sky-900 text-white py-2 rounded-lg font-semibold hover:bg-sky-800 transition">
            Sign Up
          </button>

          {/* Google Signup */}
          <button type="button" onClick={handleGoogleSignup} className="flex items-center justify-center gap-3 w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-100 transition">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
            </svg>
            <span className="text-gray-700 font-medium">Sign up with Google</span>
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-sky-700 hover:underline">
            Log in
          </Link>
        </div>

        {/* Error message */}
        {errorMsg && <p className="text-red-600 text-sm text-center">{errorMsg}</p>}
      </div>
    </div>
  )
}
