// lib/userUtils.js
import { supabase } from './supabase'

/**
 * Verify user, fetch foods + calorieGoal.
 * Returns:
 * {
 *   user,                                  // Supabase user or null
 *   foodsDaily: [{date:'YYYY-MM-DD', calories:Number}], // summed per day, sorted ASC
 *   calorieGoal: Number|null
 * }
 */
export async function loadUserData() {
  const { data: auth, error: authErr } = await supabase.auth.getUser()
  const user = auth?.user
  if (!user || authErr) {
    console.log('❌ Not logged in or auth error:', authErr)
    localStorage.removeItem('isLoggedIn')
    return { user: null, foodsDaily: [], calorieGoal: null }
  }

  localStorage.setItem('isLoggedIn', 'true')

  // Log the user ID to confirm it’s real
  console.log('✅ Logged in user:', user.id)

  // 1️⃣ Fetch foods using correct columns
  const { data: foods, error: foodsErr } = await supabase.from('foods').select('eaten_at, calories, user_id').eq('user_id', user.id)

  console.log('🍱 foods data:', foods)
  console.log('🍱 foods error:', foodsErr)

  if (foodsErr) {
    console.error('Supabase foods error:', foodsErr.message)
  }

  const safeFoods = Array.isArray(foods) ? foods : []

  // 2️⃣ Group by date and sum calories
  const byDate = new Map()
  for (const f of safeFoods) {
    const date = f.eaten_at ? f.eaten_at.slice(0, 10) : 'unknown'
    const cals = Number(f.calories) || 0
    byDate.set(date, (byDate.get(date) || 0) + cals)
  }

  const foodsDaily = Array.from(byDate.entries())
    .map(([date, calories]) => ({ date, calories }))
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  // 3️⃣ Get calorie goal
  const { data: profile, error: profileErr } = await supabase.from('profiles').select('calorieGoal').eq('id', user.id).single()

  console.log('🎯 profile:', profile)
  if (profileErr) console.log('profile error:', profileErr.message)

  return {
    user,
    foodsDaily,
    calorieGoal: profile?.calorieGoal ?? null
  }
}
