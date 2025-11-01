/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react'

import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

import Footer from '../components/ui/Footer'
import FoodLog from '../components/ui/FoodLog'
import FoodInput from '../components/ui/FoodInput'

export default function Home() {
  const [foodLogChanged, setFoodLogChanged] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Wake up backend (optional)
    const renderAPI = process.env.REACT_APP_API_BASE
    async function wakeUpBackend() {
      try {
        const res = await fetch(`${renderAPI}/health`)
        console.log('Backend awake, status:', res.status)
      } catch (e) {
        console.warn('Backend wake-up failed:', e.message)
      }
    }
    wakeUpBackend()

    // Check if profile is incomplete → reroute to onboarding
    const checkProfile = async () => {
      const { data: auth } = await supabase.auth.getUser()
      const user = auth?.user
      if (!user) return

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

      if (!profile.bmi || !profile.bmr || !profile.gender || !profile.height_cm || !profile.weight_kg || !profile.activity_level) {
        navigate('/on-boarding')
      }
    }

    checkProfile()
  }, [])

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser()
      console.log('🔥 FULL USER OBJECT:', data?.user)
      window.__user = data?.user // so you can inspect in console manually
    }
    loadUser()

    const ensureProfile = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser()
      if (!user) return

      // Try to fetch profile
      let { data: profile, error: fetchErr } = await supabase.from('profiles').select('*').eq('id', user.id).single()

      console.log('Fetched profile:', profile, 'Error:', fetchErr)

      // If missing, create it
      if (!profile) {
        console.log('⚠️ No profile found — creating...')

        const insertData = {
          id: user.id,
          email: user.email || user.user_metadata?.email || '',
          name: user.user_metadata?.full_name || user.user_metadata?.name || '',
          avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
          unit_preference: 'imperial'
        }

        const { data: newProfile, error: insertErr } = await supabase.from('profiles').insert(insertData).select().single()

        console.log('Insert data:', insertData)
        console.log('✅ newProfile:', newProfile)
        console.log('❌ insertErr:', insertErr)

        if (insertErr) {
          console.error('❌ Profile insert failed:', insertErr)
        }
      }
    }

    ensureProfile()
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow grid grid-cols-1 xl:grid-cols-2 gap-8 mt-10">
        <section>
          <FoodInput foodLogChanged={foodLogChanged} setFoodLogChanged={setFoodLogChanged} />
        </section>

        <section>
          <FoodLog foodLogChanged={foodLogChanged} setFoodLogChanged={setFoodLogChanged} />
        </section>
      </div>

      <Footer className="mt-10" />
    </div>
  )
}
