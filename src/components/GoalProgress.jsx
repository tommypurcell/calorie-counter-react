import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { TestTubeDiagonalIcon } from 'lucide-react'

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
export const CalorieProgressBar = ({ total, goal }) => <BaseProgressBar label="Calories" total={total} goal={goal} height="h-3" />

export const ProteinProgressBar = ({ total, goal }) => <BaseProgressBar label="Protein (g)" total={total} goal={goal} />

export const CarbProgressBar = ({ total, goal }) => <BaseProgressBar label="Carbs (g)" total={total} goal={goal} />

export const FatProgressBar = ({ total, goal }) => <BaseProgressBar label="Fat (g)" total={total} goal={goal} />

// ────────────────────────────────
// Main GoalProgress component (default export)
// ────────────────────────────────
export default function GoalProgress() {
  const [goal, setGoal] = useState(null)
  const [todayFat, setTodayFat] = useState(0)
  const [todayCals, setTodayCals] = useState(0)
  const [todayCarbs, setTodayCarbs] = useState(0)
  const [todayProtein, setTodayProtein] = useState(0)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  const macroGoals = { protein: 150, carbs: 200, fat: 60 }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        setErr('')

        const { data: auth } = await supabase.auth.getUser()
        const user = auth?.user
        if (!user) {
          if (mounted) setLoading(false)
          return
        }

        // 1️⃣ Fetch goal from profiles
        const { data: profile } = await supabase.from('profiles').select('calorieGoal').eq('id', user.id).single()
        const g = profile?.calorieGoal ?? null
        if (mounted) setGoal(g)

        // 2️⃣ Get today's date (local)
        const date = new Date()
        const today = `${date.getFullYear()}-${String(date.getMonth() + 1)}-${String(date.getDate())}`

        // 3️⃣ Fetch foods for today
        const { data, error } = await supabase.from('foods').select('calories, protein, carbs, fat').eq('user_id', user.id).eq('eaten_at', today)

        if (error) throw error

        // 4️⃣ Aggregate totals
        if (data && data.length > 0) {
          let sumCal = 0
          let sumProtein = 0
          let sumCarbs = 0
          let sumFat = 0

          data.forEach((food) => {
            sumCal += Number(food.calories) || 0
            sumProtein += Number(food.protein) || 0
            sumCarbs += Number(food.carbs) || 0
            sumFat += Number(food.fat) || 0
          })

          console.log('Total calories today:', sumCal)
          setTodayCals(sumCal)
          setTodayProtein(sumProtein)
          setTodayCarbs(sumCarbs)
          setTodayFat(sumFat)
        } else {
          console.log('No food entries found for today.')
        }
      } catch (e) {
        console.error(e)
        setErr('Failed to load data.')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
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
    <div className="mx-auto mb-4 w-full max-w-md rounded-xl border border-gray-200 bg-white p-4 shadow">
      <div className="mb-1 flex items-end justify-between">
        <div className="text-sm text-gray-500 font-semibold">Goal Progress</div>
      </div>

      {/* Progress bars */}
      <div className="mt-3 grid grid-cols-1 gap-3">
        <BaseProgressBar label="Calories" total={todayCals} goal={goal || 2000} height="h-2" color={todayCals < goal ? 'bg-green-500' : 'bg-red-500'} />
      </div>

      {/* Helper text */}
      {!loading && goal && <div className="mt-3 text-xs text-gray-500">{todayCals <= goal ? 'Nice! Under goal today.' : `Over goal today by ${todayCals - goal} calories`}</div>}
      {err && <div className="mt-2 text-xs text-red-600">{err}</div>}
    </div>
  )
}
