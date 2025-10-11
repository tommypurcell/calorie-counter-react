import cors from 'cors'
import axios from 'axios'
import dotenv from 'dotenv'
import express from 'express'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const PORT = 5050
const app = express()

// Initialize Supabase with SERVICE ROLE KEY (only for backend!)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

// CORS: Allow frontend
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
  })
)

app.use(express.json())

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'OK' })
})

// ========================================
// HELPER: Verify user from token
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
// HELPER: Check rate limit (3 per day)
// ========================================
async function checkRateLimit(userId) {
  const today = new Date().toLocaleDateString('en-CA')
  console.log(`🧠 Checking rate limit for ${userId} on ${today}`)

  const { data: usage, error } = await supabase.from('api_usage').select('*').eq('user_id', userId).single()

  if (error) console.log('⚠️ Fetch error:', error)
  else console.log('📄 Current usage:', usage)

  // No record — insert
  if (error || !usage) {
    console.log('🆕 Creating first usage record...')
    const { data: inserted, error: insertError } = await supabase.from('api_usage').insert({ user_id: userId, count: 1, last_reset: today }).select()
    if (insertError) console.log('❌ Insert error:', insertError)
    else console.log('✅ Inserted usage:', inserted)
    return { allowed: true, count: 1, limit: 3 }
  }

  const lastResetDate = usage.last_reset.split('T')[0]
  const isNewDay = lastResetDate < today
  if (isNewDay) {
    console.log('🔁 Resetting count for new day')
    await supabase.from('api_usage').update({ count: 1, last_reset: today }).eq('user_id', userId)
    return { allowed: true, count: 1, limit: 3 }
  }

  if (usage.count >= 3) {
    console.log('🚫 Limit reached:', usage.count)
    return { allowed: false, count: usage.count, limit: 3 }
  }

  const newCount = usage.count + 1
  console.log('🔢 Incrementing count to:', newCount)
  await supabase.from('api_usage').update({ count: newCount }).eq('user_id', userId)

  return { allowed: true, count: newCount, limit: 3 }
}

// ========================================
// ENDPOINT: OpenAI with Auth + Rate Limit
// ========================================
app.post('/api/gpt', async (req, res) => {
  const { foodItem } = req.body

  // 1. Validate input
  if (!foodItem) {
    return res.status(400).json({ error: 'foodItem is required' })
  }

  // 2. Verify user authentication
  const authResult = await getUserFromToken(req.headers.authorization)
  if (authResult.error) {
    return res.status(401).json({ error: authResult.error })
  }

  const userId = authResult.user.id
  console.log(`📥 Request from user: ${userId}`)

  // 3. Check rate limit
  const rateLimit = await checkRateLimit(userId)

  if (!rateLimit.allowed) {
    console.log(`⛔ User ${userId} hit limit (${rateLimit.count}/${rateLimit.limit})`)
    return res.status(429).json({
      error: 'Daily limit reached',
      message: `You've used all ${rateLimit.limit} AI estimates today. Try again tomorrow!`,
      usage: {
        count: rateLimit.count,
        limit: rateLimit.limit
      }
    })
  }

  console.log(`✅ Rate limit OK (${rateLimit.count}/${rateLimit.limit})`)

  // 4. Call OpenAI
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key not configured' })
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a nutrition expert. Return ONLY valid JSON array with macronutrients. Format: [{"food": "item name", "calories": number, "protein": number, "carbs": number, "fat": number}]. All nutrients in grams. Be realistic with estimates.'
          },
          {
            role: 'user',
            content: `Estimate calories and macronutrients (protein, carbs, fat in grams) for: ${foodItem}`
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
    res.json(response.data)
  } catch (err) {
    console.error('❌ OpenAI error:', err.response?.data || err.message)

    if (err.response?.status === 429) {
      return res.status(503).json({ error: 'OpenAI service busy. Try again shortly.' })
    }

    res.status(500).json({ error: 'Failed to get calorie estimate' })
  }
})

// Start server
app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ Calorie Counter Backend')
  console.log(`🚀 http://localhost:${PORT}`)
  console.log(`🔐 Supabase: ${process.env.SUPABASE_URL ? '✓' : '✗'}`)
  console.log(`🤖 OpenAI: ${process.env.OPENAI_API_KEY ? '✓' : '✗'}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
})
