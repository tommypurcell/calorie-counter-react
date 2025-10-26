import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { TestTubeDiagonalIcon } from 'lucide-react'
import { getTodayTotals } from '../lib/statsUtils'

// ────────────────────────────────
// Base component for any macro (exported)
// ────────────────────────────────
export function BaseProgressBar({ label, total, goal, color = 'bg-green-500', height = 'h-[3px]' }) {
  if (!goal || goal <= 0) return null
  const pct = Math.min(200, Math.round((total / goal) * 100))
  const pctDisplay = Math.min(100, pct)
  const barColor = pct < 90 ? 'bg-green-500' : pct <= 110 ? 'bg-yellow-400' : 'bg-red-500'

  return (
    <div>
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>{label}</span>
        <span>
          {Math.round(total)} / {goal}
        </span>
      </div>
      <div className={`${height} w-full bg-gray-200 rounded-full overflow-hidden`}>
        <div className={`${height} ${color || barColor} transition-all`} style={{ width: `${pctDisplay}%` }} />
      </div>
      <div className="text-[10px] text-gray-400 mt-1">{pct < 90 ? 'Under goal' : pct <= 110 ? 'On target' : 'Over goal'}</div>
    </div>
  )
}

// ────────────────────────────────
// Individual exported macros
// ────────────────────────────────
export const FatProgressBar = ({ total, goal }) => <BaseProgressBar label="Fat (g)" total={total} goal={goal} />
export const CarbProgressBar = ({ total, goal }) => <BaseProgressBar label="Carbs (g)" total={total} goal={goal} />
export const ProteinProgressBar = ({ total, goal }) => <BaseProgressBar label="Protein (g)" total={total} goal={goal} />
export const CalorieProgressBar = ({ total, goal }) => <BaseProgressBar label="Calories" total={total} goal={goal} height="h-3" />

// ────────────────────────────────
// Main GoalProgress component (default export)
// ────────────────────────────────
export default function GoalProgress() {
  const [err, setErr] = useState('')
  const [goal, setGoal] = useState(null)
  const [todayFat, setTodayFat] = useState(0)
  const [loading, setLoading] = useState(true)
  const [todayCals, setTodayCals] = useState(0)
  const [todayCarbs, setTodayCarbs] = useState(0)
  const [todayEaten, setTodayEaten] = useState(0)
  const [todayBurned, setTodayBurned] = useState(0)

  const [todayProtein, setTodayProtein] = useState(0)

  const macroGoals = { protein: 150, carbs: 200, fat: 60 }

  useEffect(() => {
    let mounted = true

    async function loadData() {
      try {
        setLoading(true)
        setErr('')

        // Step 1: Get today's totals (foods + exercises)
        const { user, totals } = await getTodayTotals()

        // Stop if user is not logged in
        if (!user) {
          if (mounted) setLoading(false)
          return
        }

        // Step 2: Get the user's calorie goal
        const { data: profile } = await supabase.from('profiles').select('calorieGoal').eq('id', user.id).single()

        // Step 3: Update all numbers on screen
        if (mounted) {
          setGoal(profile?.calorieGoal ?? 2000) // default to 2000 if not set
          setTodayCals(totals.net) // eaten minus burned

          setTodayEaten(totals.eaten)
          setTodayBurned(totals.burned)

          setTodayProtein(totals.protein)
          setTodayCarbs(totals.carbs)
          setTodayFat(totals.fat)
        }
      } catch (error) {
        console.error('Error loading data:', error)
        setErr('Failed to load data.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    // Run the function
    loadData()

    // Cleanup if the component unmounts
    return () => {
      mounted = false
    }
  }, [])

  // percentage for calories
  const pct = useMemo(() => {
    if (!goal || goal <= 0) return 0
    return Math.min(200, Math.round((todayCals / goal) * 100))
  }, [todayCals, goal])

  return (
    <div className="mx-auto mb-4 w-full rounded-xl border border-gray-200 bg-white p-4 shadow">
      <div className="mb-1 flex items-end justify-between">
        <div className="text-sm text-gray-500 font-semibold">Goal Progress</div>
      </div>

      {/* Progress bars */}
      <div className="mt-3 grid grid-cols-1 gap-1">
        <BaseProgressBar label="Eaten 🍱" total={todayEaten} goal={goal || 2000} height="h-2" color="bg-blue-500" />
        <BaseProgressBar label="Burned 🔥" total={todayBurned} goal={goal || 2000} height="h-2" color="bg-orange-500" />
        <BaseProgressBar label="Net ⚖️" total={todayCals} goal={goal || 2000} height="h-2" color={todayCals < goal ? 'bg-green-500' : 'bg-red-500'} />
      </div>

      {goal && <div className="mt-2 text-xs text-gray-600">Remaining: {Math.max(goal - todayCals, 0)} kcal</div>}

      {/* Helper text */}
      {!loading && goal && <div className="mt-3 text-xs text-gray-500">{todayCals <= goal ? 'Nice! Under goal today.' : `Over goal today by ${todayCals - goal} calories`}</div>}
      {err && <div className="mt-2 text-xs text-red-600">{err}</div>}
    </div>
  )
}
