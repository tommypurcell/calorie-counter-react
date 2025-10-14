// ========================================
//  SERVER: Calorie Counter Backend
// ========================================

import cors from 'cors'
import axios from 'axios'
import dotenv from 'dotenv'
import express from 'express'
import { createClient } from '@supabase/supabase-js'

dotenv.config() // Load .env variables

const PORT = process.env.PORT || 5050
const app = express()

// ========================================
//  SUPABASE INITIALIZATION
// ========================================
// Use the SERVICE ROLE KEY only on the backend (NEVER in frontend)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

// ========================================
//  MIDDLEWARE
// ========================================

// Allow requests from local frontend and vercel deployment
app.use(
  cors({
    origin: ['http://localhost:3000', 'https://calorie-counter-react.vercel.app'],
    credentials: true
  })
)

// Allow JSON request bodies
app.use(express.json())

// Health check (to test if server is running)
app.get('/health', (_req, res) => {
  res.json({ status: 'OK' })
})

// ========================================
//  HELPER: Verify user from Bearer token
// ========================================
async function getUserFromToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Missing authorization header' }
  }

  const token = authHeader.split(' ')[1]
  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) {
    return { error: 'Invalid or expired token' }
  }

  return { user: data.user }
}

// ========================================
//  HELPER: Get or Reset Rate Limit Record
// ========================================
async function getRateLimitRecord(userId) {
  const today = new Date().toLocaleDateString('en-CA')

  // Find existing record
  const { data: usage, error } = await supabase.from('api_usage').select('*').eq('user_id', userId).single()

  // No record found → create one
  if (error || !usage) {
    const { data: newUsage } = await supabase.from('api_usage').insert({ user_id: userId, count: 0, last_reset: today }).select().single()
    return newUsage
  }

  // New day → reset count
  const lastResetDate = usage.last_reset.split('T')[0]
  if (lastResetDate < today) {
    await supabase.from('api_usage').update({ count: 0, last_reset: today }).eq('user_id', userId)
    return { ...usage, count: 0, last_reset: today }
  }

  // Return existing record
  return usage
}

// ========================================
//  ENDPOINT: /api/gpt  (AI Estimate with Rate Limit)
// ========================================
app.post('/api/gpt', async (req, res) => {
  const { foodItem } = req.body

  // 1️⃣ Validate request body
  if (!foodItem) {
    return res.status(400).json({ error: 'foodItem is required' })
  }

  // 2️⃣ Verify user authentication
  const authResult = await getUserFromToken(req.headers.authorization)
  if (authResult.error) {
    return res.status(401).json({ error: authResult.error })
  }

  const userId = authResult.user.id
  console.log(`📥 Request from user: ${userId}`)

  // 3️⃣ Fetch user's rate limit record
  const record = await getRateLimitRecord(userId)
  const limit = 15 // daily limit (set higher for dev if needed)

  if (record.count >= limit) {
    console.log(`🚫 Limit reached: ${record.count}/${limit}`)
    return res.status(429).json({
      error: 'Daily limit reached',
      message: `You've used all ${limit} AI estimates today. Try again tomorrow!`,
      usage: { count: record.count, limit }
    })
  }

  // 4️⃣ Check API key
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key not configured' })
  }

  // 5️⃣ Call OpenAI API
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a nutrition expert. Return ONLY valid JSON: [{"food": "name", "calories": number, "protein": number, "carbs": number, "fat": number}]. All nutrients in grams.'
          },
          {
            role: 'user',
            content: `Estimate calories and macronutrients for: ${foodItem}`
          }
        ],
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )

    console.log('✅ OpenAI response received')

    // 6️⃣ Only increment the rate limit if OpenAI succeeded
    const newCount = record.count + 1
    await supabase.from('api_usage').update({ count: newCount }).eq('user_id', userId)

    console.log(`✅ Rate limit OK (${newCount}/${limit})`)
    res.json(response.data)
  } catch (err) {
    console.error('❌ OpenAI error:', err.response?.data || err.message)

    if (err.response?.status === 429) {
      return res.status(503).json({ error: 'OpenAI service busy. Try again shortly.' })
    }

    res.status(500).json({ error: 'Failed to get calorie estimate' })
  }
})

// ========================================
//  START SERVER
// ========================================
app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ Calorie Counter Backend')
  console.log(`🚀 Running on: http://localhost:${PORT}`)
  console.log(`🔐 Supabase: ${process.env.SUPABASE_URL ? '✓' : '✗'}`)
  console.log(`🤖 OpenAI: ${process.env.OPENAI_API_KEY ? '✓' : '✗'}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
})
