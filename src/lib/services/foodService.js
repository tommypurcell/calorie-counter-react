// src/lib/services/foodService.js
// Simple Supabase CRUD for the "foods" table
import { supabase } from '../supabase'

// Get latest foods for a user
export async function fetchFoods(userId) {
  const { data, error } = await supabase.from('foods').select('id, name, calories, protein, carbs, fat, eaten_at').eq('user_id', userId).order('eaten_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Increment/decrement calories by delta (keeps >= 0)
export async function updateCaloriesBy(foodId, delta) {
  const { data, error } = await supabase.from('foods').select('calories').eq('id', foodId).single()
  if (error) throw error

  const next = Math.max(0, (Number(data?.calories) || 0) + Number(delta || 0))
  const { error: updateError } = await supabase.from('foods').update({ calories: next }).eq('id', foodId)

  if (updateError) throw updateError
}

// update full food object (any fields passed)
export async function updateFood(foodId, newFood) {
  const { error } = await supabase.from('foods').update(newFood).eq('id', foodId)

  if (error) throw error
}

// Delete one food row
export async function deleteFood(foodId) {
  const { error } = await supabase.from('foods').delete().eq('id', foodId)
  if (error) throw error
}

// Save foods; supports BOTH signatures for simplicity:
// a) saveFoods(dateStr, foods, userId)
// b) saveFoods(foodLog, userId, date)
export async function saveFoods(a, b, c) {
  let dateStr, foods, userId

  // New style: (dateStr, foods[], userId)
  if (typeof a === 'string' && Array.isArray(b) && typeof c === 'string') {
    dateStr = a
    foods = b
    userId = c
  } else {
    // Old style: (foodLog[], userId, date)
    foods = Array.isArray(a) ? a : []
    userId = typeof b === 'string' ? b : ''
    dateStr = typeof c === 'string' ? c : ''
  }

  if (!userId || !dateStr || !foods?.length) return

  const rows = foods.map((f) => ({
    user_id: userId,
    name: f.name,
    calories: Math.max(0, Math.round(Number(f.calories) || 0)),
    protein: f.protein ?? null,
    carbs: f.carbs ?? null,
    fat: f.fat ?? null,
    eaten_at: dateStr
  }))

  const { error } = await supabase.from('foods').insert(rows)
  if (error) throw error
}
