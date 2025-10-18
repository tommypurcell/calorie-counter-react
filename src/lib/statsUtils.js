// statsUtils.js
import { supabase } from './supabase'
import { getToday } from './utils'

export async function getTodayTotals() {
  const { data: auth } = await supabase.auth.getUser()
  const user = auth?.user
  if (!user) return { user: null, totals: null }

  const today = getToday()

  // get foods
  const { data: foods } = await supabase.from('foods').select('calories, protein, carbs, fat').eq('user_id', user.id).eq('eaten_at', today.shortDate)

  // get exercises
  const { data: exercises } = await supabase.from('exercises').select('calories_burned').eq('user_id', user.id).eq('completed_at', today.shortDate)

  // totals
  const totalFat = (foods || []).reduce((sum, f) => sum + (Number(f.fat) || 0), 0)
  const totalCarbs = (foods || []).reduce((sum, f) => sum + (Number(f.carbs) || 0), 0)
  const totalEaten = (foods || []).reduce((sum, f) => sum + (Number(f.calories) || 0), 0)
  const totalProtein = (foods || []).reduce((sum, f) => sum + (Number(f.protein) || 0), 0)
  const totalBurned = (exercises || []).reduce((sum, e) => sum + (Number(e.calories_burned) || 0), 0)
  const netCalories = totalEaten - totalBurned

  return {
    user,
    totals: {
      fat: totalFat,
      net: netCalories,
      carbs: totalCarbs,
      eaten: totalEaten,
      burned: totalBurned,
      protein: totalProtein
    }
  }
}

export async function getHistoryTotals() {
  const { data: auth } = await supabase.auth.getUser()
  const user = auth?.user
  if (!user) return { user: null, history: [], calorieGoal: null }

  // 1. Fetch foods and exercises
  const { data: foods } = await supabase.from('foods').select('eaten_at, calories').eq('user_id', user.id)

  const { data: exercises } = await supabase.from('exercises').select('completed_at, calories_burned').eq('user_id', user.id)

  // 2. Group by date
  const map = new Map()

  ;(foods || []).forEach((f) => {
    const date = f.eaten_at?.slice(0, 10)
    if (!map.has(date)) map.set(date, { eaten: 0, burned: 0 })
    map.get(date).eaten += Number(f.calories) || 0
  })
  ;(exercises || []).forEach((e) => {
    const date = e.completed_at?.slice(0, 10)
    if (!map.has(date)) map.set(date, { eaten: 0, burned: 0 })
    map.get(date).burned += Number(e.calories_burned) || 0
  })

  // 3. Convert to array
  const history = Array.from(map.entries()).map(([date, vals]) => ({
    date,
    eaten: vals.eaten,
    burned: vals.burned,
    net: vals.eaten - vals.burned
  }))

  // 4. Sort ascending
  history.sort((a, b) => new Date(a.date) - new Date(b.date))

  // 5. Fetch calorie goal
  const { data: profile } = await supabase.from('profiles').select('calorieGoal').eq('id', user.id).single()

  const calorieGoal = profile?.calorieGoal || 2000

  return { user, history, calorieGoal }
}
