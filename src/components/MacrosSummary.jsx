// src/pages/MacrosSummary.jsx
import React, { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { BaseProgressBar, CarbProgressBar, ProteinProgressBar, FatProgressBar } from '../components/GoalProgress'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// ────────────────────────────────
// Individual Mini Cards
// ────────────────────────────────
function ProteinCard({ value, goal }) {
  return (
    <div className="rounded-xl border bg-white p-3 text-center shadow-sm">
      <div className="text-xs text-gray-500">Protein</div>
      <div className="text-lg font-semibold">{value}</div>
      <ProteinProgressBar total={value} goal={goal} />
    </div>
  )
}
function CarbCard({ value, goal }) {
  return (
    <div className="rounded-xl border bg-white p-3 text-center shadow-sm">
      <div className="text-xs text-gray-500">Carbs</div>
      <div className="text-lg font-semibold">{value}g</div>
      <CarbProgressBar total={value} goal={goal} />
    </div>
  )
}
function FatCard({ value, goal }) {
  return (
    <div className="rounded-xl border bg-white p-3 text-center shadow-sm">
      <div className="text-xs text-gray-500">Fat</div>
      <div className="text-lg font-semibold">{value}g</div>
      <FatProgressBar total={value} goal={goal} />
    </div>
  )
}

// ────────────────────────────────
// Macro Pie Chart (Recharts)
// ────────────────────────────────
function MacroPieChart({ protein, carbs, fat }) {
  const data = [
    { name: 'Protein', value: protein },
    { name: 'Carbs', value: carbs },
    { name: 'Fat', value: fat }
  ]

  const COLORS = ['#0891b2', '#34d399', '#14b8a6']

  return (
    <div className="col-span-3 flex justify-center">
      <div className="w-64 h-64">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="80%" label>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default function MacrosSummary() {
  const [err, setErr] = useState('')
  const [macros, setMacros] = useState({ protein: 0, carbs: 0, fat: 0 })
  const [loading, setLoading] = useState(true)
  const [macroGoals, setMacroGoals] = useState({ proteinGoal: 120, carbGoal: 120, fatGoal: 120 })

  useEffect(() => {
    let mounted = true // helps prevent updating state after component unmounts

    async function loadMacros() {
      setLoading(true)
      setErr('')

      try {
        // STEP 1: Get the current logged-in user
        const { data: auth } = await supabase.auth.getUser()
        const user = auth?.user

        // If no user is logged in, stop here
        if (!user) {
          if (mounted) setLoading(false)
          return
        }

        // STEP 2: Make today’s date (like 2025-10-13)
        const date = new Date()
        const today = `${date.getFullYear()}-${String(date.getMonth() + 1)}-${String(date.getDate())}`

        // STEP 3: Get all food entries for today
        const { data: foods, error: foodsError } = await supabase.from('foods').select('protein, carbs, fat').eq('user_id', user.id).eq('eaten_at', today)

        // STEP 4: Get the user’s goal numbers from the profiles table
        const { data: goals, error: goalsError } = await supabase.from('profiles').select('proteingoal, carbgoal, fatgoal').eq('id', user.id).single()

        // Check if either request failed
        if (foodsError) throw foodsError
        if (goalsError) throw goalsError

        // STEP 5: Save the goal numbers to state
        if (mounted && goals) {
          setMacroGoals({
            proteinGoal: goals.proteingoal,
            carbGoal: goals.carbgoal,
            fatGoal: goals.fatgoal
          })
        }

        // STEP 6: Add up all the protein, carbs, and fat from today's foods
        if (foods && foods.length > 0) {
          let totalProtein = 0
          let totalCarbs = 0
          let totalFat = 0

          foods.forEach((food) => {
            totalProtein += Number(food.protein) || 0
            totalCarbs += Number(food.carbs) || 0
            totalFat += Number(food.fat) || 0
          })

          // STEP 7: Save the totals
          if (mounted) {
            setMacros({
              protein: Math.round(totalProtein),
              carbs: Math.round(totalCarbs),
              fat: Math.round(totalFat)
            })
          }
        } else {
          console.log('No food data found for today.')
        }
      } catch (err) {
        console.error('Error loading data:', err)
        setErr('Something went wrong while loading your data.')
      } finally {
        // STEP 8: Always stop the loading spinner
        if (mounted) setLoading(false)
      }
    }

    // Run the function
    loadMacros()

    // Cleanup when leaving the page
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="mx-auto mb-4 grid w-full max-w-md gap-1 md:gap-3" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
      {err ? (
        <div className="col-span-3 text-center text-sm text-red-600">{err}</div>
      ) : (
        <>
          <ProteinCard value={loading ? 0 : macros.protein} goal={macroGoals.proteinGoal} />
          <CarbCard value={loading ? 0 : macros.carbs} goal={macroGoals.carbGoal} />
          <FatCard value={loading ? 0 : macros.fat} goal={macroGoals.fatGoal} />
          <MacroPieChart protein={loading ? 0 : macros.protein} carbs={loading ? 0 : macros.carbs} fat={loading ? 0 : macros.fat} />
        </>
      )}
    </div>
  )
}
