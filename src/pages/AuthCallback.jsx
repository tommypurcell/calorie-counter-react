// AuthCallback.jsx
// ----------
// Helps google login route back to where we want to send user after login.
// ----------

import React from 'react'

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event)

      if (session?.user) {
        const user = session.user
        console.log('User detected:', user.email)

        const { data: profile } = await supabase.from('profiles').select('name, avatar, calorieGoal, bmi, bmr, gender, height_cm, weight_kg, activity_level').eq('id', user.id).single()

        if (profile) {
          if (profile.name) localStorage.setItem('name', profile.name)
          if (profile.avatar) localStorage.setItem('avatar', profile.avatar)
          if (profile.calorieGoal !== undefined && profile.calorieGoal !== null) localStorage.setItem('calorieGoal', String(profile.calorieGoal))
        }

        console.log('Profile:', profile)

        if (!profile || !profile.bmi || !profile.bmr || !profile.gender || !profile.height_cm || !profile.weight_kg || !profile.activity_level) {
          navigate('/on-boarding')
        } else {
          navigate('/', { replace: true })
        }
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [navigate])

  return <p className="p-4 text-sm text-gray-600">Signing you in…</p>
}
