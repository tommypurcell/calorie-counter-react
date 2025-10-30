// src/components/Goals.jsx
import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { ProteinProgressBar, CarbProgressBar, FatProgressBar } from './GoalProgress'

export default function Goals() {
  const [userData, setUserData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadUserData() {
    setError('')
    setLoading(true)

    const { data: auth } = await supabase.auth.getUser()
    const user = auth?.user
    if (!user) {
      setError('No user found.')
      setLoading(false)
      return
    }

    const { data, error } = await supabase.from('profiles').select('name, avatar, calorieGoal, proteingoal, carbgoal, fatgoal, age, gender, height_cm, weight_kg, activity_level, goal, bmi, bmr').eq('id', user.id).single()

    if (error) {
      setError('Could not load your plan.')
    } else {
      setUserData(data)
    }

    setLoading(false)
  }

  useEffect(() => {
    loadUserData()
  }, [])

  if (loading) return <p className="text-center text-gray-500">Loading your plan...</p>
  if (error) return <p className="text-center text-red-500">{error}</p>
  if (!userData) return null

  return (
    <div className="w-full mx-auto p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <img src={userData.avatar} alt="Avatar" className="h-16 w-16 rounded-full border border-gray-300" />
        <div>
          <h2 className="text-xl font-semibold text-gray-800">{userData.name}</h2>
          <p className="text-sm text-gray-500 capitalize">
            {userData.goal} weight • {userData.activity_level} activity
          </p>
          {/* Body info */}
          <div className="flex justify-start gap-2 text-sm text-gray-500">
            <p>{Math.round(userData.height_cm)} cm</p>
            <p>{Math.round(userData.weight_kg)} kg</p>
            <p>{userData.age} years old</p>
          </div>
        </div>
      </div>
      <h1 className="text-xl font-semibold">Your Custom Plan</h1>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 text-center mb-4">
        <Stat label="BMI" value={userData.bmi} />
        <Stat label="BMR" value={`${userData.bmr} kcal`} />
        <Stat label="Calories" value={`${userData.calorieGoal} kcal`} />
      </div>

      {/* Macros */}
      <h3 className="text-gray-700 text-sm font-semibold mb-2">Daily Macro Goals</h3>
      <div className="grid grid-cols-3 gap-3">
        <GoalCard label="Protein" value={userData.proteingoal} unit="g" Bar={ProteinProgressBar} />
        <GoalCard label="Carbs" value={userData.carbgoal} unit="g" Bar={CarbProgressBar} />
        <GoalCard label="Fat" value={userData.fatgoal} unit="g" Bar={FatProgressBar} />
      </div>
    </div>
  )
}

function GoalCard({ label, value, unit }) {
  return (
    <div className="rounded-xl border bg-gray-50 p-3 text-center shadow-sm">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-semibold text-gray-800">
        {value}
        {unit}
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg p-2 shadow-sm">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium text-gray-800">{value}</p>
    </div>
  )
}
