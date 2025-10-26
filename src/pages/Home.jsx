/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import FoodLog from '../components/ui/FoodLog'
import FoodInput from '../components/ui/FoodInput'
import Footer from '../components/ui/Footer'

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

      if (!profile || !profile.bmi || !profile.bmr || !profile.gender || !profile.height_cm || !profile.weight_kg || !profile.activity_level) {
        navigate('/on-boarding')
      }
    }

    checkProfile()
  }, [navigate])

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
