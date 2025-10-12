// src/lib/gptService.js
import axios from 'axios'
import { supabase } from '../supabase'

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5050'

export async function getGptEstimate(foodItem) {
  if (!foodItem) throw new Error('Missing food item')

  // Get current session token for the Authorization header
  const {
    data: { session }
  } = await supabase.auth.getSession()
  if (!session) throw new Error('Not logged in')

  const { data } = await axios.post(`${API_BASE}/api/gpt`, { foodItem }, { headers: { Authorization: `Bearer ${session.access_token}` } })

  // GPT returns an array; normalize it into a plain array of foods
  // Expect: [{"food":"...", "calories":123, "protein":10, "carbs":12, "fat":5}]
  const content = data?.choices?.[0]?.message?.content?.trim() || '[]'

  let entries
  try {
    entries = JSON.parse(content)
  } catch {
    const start = content.indexOf('[')
    const end = content.lastIndexOf(']')
    entries = JSON.parse(content.slice(start, end + 1))
  }

  // Return an array of normalized items
  return entries.map((e) => ({
    name: e.food,
    calories: e.calories || 0,
    protein: e.protein ?? null,
    carbs: e.carbs ?? null,
    fat: e.fat ?? null
  }))
}
