// Simple helpers for weight tracking
import { supabase } from './supabase'

// Save a new weight entry
export async function saveWeight(userId, weightKg, date) {
  const dateStr = date || new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('weights')
    .insert({
      user_id: userId,
      weight_kg: weightKg,
      logged_at: dateStr
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Get all weight entries for a user
export async function getWeights(userId, limit = 30) {
  const { data, error } = await supabase.from('weights').select('*').eq('user_id', userId).order('logged_at', { ascending: false }).limit(limit)

  if (error) throw error
  return data || []
}

// Delete a weight entry
export async function deleteWeight(weightId) {
  const { error } = await supabase.from('weights').delete().eq('id', weightId)

  if (error) throw error
}
