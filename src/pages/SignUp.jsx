import React from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'
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
          <button type="submit" className="btn btn-success bg-sky-900 hover:bg-sky-800 hover:text-green-300 border-gray-200 ">
            Sign Up
          </button>
          <div className="row">
            <span>
              Already have an account? <Link className="text-sky-900 hover:text-blue-400 hover:underline" to="/login">Login</Link>
            </span>
          </div>
        </form>
        <h4 className="text-danger">{errorMsg}</h4>
      </div>
    </div>
  )
}
