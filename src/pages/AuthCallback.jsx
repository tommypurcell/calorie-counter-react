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
    // Handle the OAuth redirect immediately
    const handleCallback = async () => {
      try {
        // Get the current session (handles hash params from OAuth)
        const {
          data: { session },
          error
        } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth error:', error)
          navigate('/login')
          return
        }

        if (session?.user) {
          const user = session.user
          console.log('User detected:', user.email)

          // Get profile
          let { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

          if (!profile) {
            const insertData = {
              id: user.id, // REQUIRED
              email: user.email || user.user_metadata?.email || '',
              name: user.user_metadata?.full_name || user.user_metadata?.name || '',
              avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
              unit_preference: 'imperial'
            }

            const { data: newProfile, error: insertError } = await supabase.from('profiles').insert(insertData).select().single()

            console.log('Attempted insert:', insertData)
            if (insertError) {
              console.error('❌ Profile insert error:', insertError)
            } else {
              console.log('✅ Profile created:', newProfile)
            }

            profile = newProfile
          }

          // Save to localStorage
          if (profile) {
            if (profile.name) localStorage.setItem('name', profile.name)
            if (profile.avatar) localStorage.setItem('avatar', profile.avatar)
            if (profile.calorieGoal !== undefined && profile.calorieGoal !== null) {
              localStorage.setItem('calorieGoal', String(profile.calorieGoal))
            }
          }

          console.log('Profile:', profile)

          // Check if onboarding is needed
          if (!profile?.bmi || !profile?.bmr || !profile?.gender || !profile?.height_cm || !profile?.weight_kg || !profile?.activity_level) {
            navigate('/on-boarding', { replace: true })
          } else {
            navigate('/home', { replace: true })
          }
        } else {
          // No session, redirect to login
          navigate('/login')
        }
      } catch (err) {
        console.error('Callback error:', err)
        navigate('/login')
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <p className="text-sm text-gray-600">Signing you in…</p>
    </div>
  )
}
