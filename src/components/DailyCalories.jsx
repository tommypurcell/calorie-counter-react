// src/components/DailyCalories.jsx
import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// tiny helper: today in UTC as 'YYYY-MM-DD'
const isoUTC = () => {
  const now = new Date()
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  return d.toISOString().slice(0, 10)
}

export default function DailyCalories() {
  const [todayCals, setTodayCals] = useState(0)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        setErr('')
        // 1) who’s logged in?
        const { data: auth, error: authErr } = await supabase.auth.getUser()
        const user = auth?.user
        if (authErr || !user) {
          if (mounted) {
            setTodayCals(0)
            setLoading(false)
          }
          return
        }

        // 2)  Get today's date in YYYY-MM-DD format
        const date = new Date()
        const today = date.getFullYear() + '-' + String(date.getMonth() + 1) + '-' + String(date.getDate())
        const { data: rows, error } = await supabase.from('foods').select('calories, eaten_at').eq('user_id', user.id).eq('eaten_at', today)

        if (error) throw error

        // 3) sum safely (treat nulls as 0)
        const total = (rows || []).reduce((sum, r) => sum + (Number(r.calories) || 0), 0)

        if (mounted) setTodayCals(total)
      } catch (e) {
        if (mounted) setErr('Failed to load')
        console.warn('DailyCalories:', e?.message || e)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="w-full rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="text-sm text-gray-500 mb-1">Today</div>
      {err ? <div className="text-sm text-red-600">{err}</div> : <div className="text-2xl font-bold">{loading ? '…' : `${todayCals.toLocaleString()} kcal`}</div>}
    </div>
  )
}
