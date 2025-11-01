// src/lib/coachUtils.js
// Simple helpers for coach features
import { supabase } from './supabase'

// Generate a random coach code like "COACH-A1B2C3"
function generateCoachCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // No confusing letters
  let code = 'COACH-'
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

// Make a user into a coach
export async function becomeCoach(userId) {
  // Generate a unique code
  let code = generateCoachCode()
  let attempts = 0

  // Try up to 5 times to find a unique code
  while (attempts < 5) {
    const { data: existing } = await supabase.from('profiles').select('id').eq('coach_code', code).single()

    if (!existing) break // Code is unique!
    code = generateCoachCode() // Try again
    attempts++
  }

  // Update user to be a coach
  const { data, error } = await supabase.from('profiles').update({ is_coach: true, coach_code: code }).eq('id', userId).select().single()

  if (error) throw error
  return data
}

// Link a client to their coach using coach code
export async function linkToCoach(clientId, coachCode) {
  // Find the coach
  const { data: coaches } = await supabase.from('profiles').select('*').eq('coach_code', coachCode)

  if (!coaches || coaches.length === 0) {
    throw new Error('Coach code not found')
  }

  const coach = coaches[0]
  console.log('coach', coach)
  // Link the client to the coach
  await supabase.from('profiles').update({ coach_id: coach.id }).eq('id', clientId)

  return coach
}

// Get all clients for a coach
export async function getMyClients(coachId) {
  const { data, error } = await supabase.from('profiles').select('id, name, email, avatar, calorieGoal, proteingoal').eq('coach_id', coachId).order('name')

  if (error) throw error
  return data || []
}

// Get client activity stats (last logged, streak, etc)
export async function getClientActivity(clientId) {
  const today = new Date().toISOString().split('T')[0]
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // Get food logs from last 30 days
  const { data: foods } = await supabase
    .from('foods')
    .select('eaten_at')
    .eq('user_id', clientId)
    .gte('eaten_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .order('eaten_at', { ascending: false })

  if (!foods || foods.length === 0) {
    return {
      lastLogged: null,
      loggedToday: false,
      loggedThisWeek: false,
      streak: 0,
      totalLogs: 0
    }
  }

  // Calculate stats
  const uniqueDays = [...new Set(foods.map((f) => f.eaten_at.split('T')[0]))]
  const lastLogged = uniqueDays[0]
  const loggedToday = uniqueDays.includes(today)
  const loggedThisWeek = uniqueDays.some((day) => day >= sevenDaysAgo)

  // Calculate streak (consecutive days)
  let streak = 0
  const sortedDays = uniqueDays.sort((a, b) => new Date(b) - new Date(a))

  for (let i = 0; i < sortedDays.length; i++) {
    const expectedDate = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    if (sortedDays[i] === expectedDate) {
      streak++
    } else {
      break
    }
  }

  return {
    lastLogged,
    loggedToday,
    loggedThisWeek,
    streak,
    totalLogs: foods.length
  }
}

// Get activity for all clients at once
export async function getClientsWithActivity(coachId) {
  const clients = await getMyClients(coachId)

  // Fetch activity for all clients
  const clientsWithActivity = await Promise.all(
    clients.map(async (client) => {
      const activity = await getClientActivity(client.id)
      return { ...client, activity }
    })
  )

  return clientsWithActivity
}

// Get client's food logs
export async function getClientFoodLogs(clientId, limit = 100) {
  const { data, error } = await supabase.from('foods').select('id, name, calories, protein, carbs, fat, eaten_at').eq('user_id', clientId).order('eaten_at', { ascending: false }).limit(limit)

  if (error) throw error
  return data || []
}

// Get client's exercise logs
export async function getClientExerciseLogs(clientId, limit = 100) {
  const { data, error } = await supabase.from('exercises').select('id, exercise, calories_burned, category, completed_at').eq('user_id', clientId).order('completed_at', { ascending: false }).limit(limit)

  if (error) throw error
  return data || []
}
