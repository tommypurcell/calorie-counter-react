// src/pages/MacrosSummary.jsx
import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { BaseProgressBar, CarbProgressBar, ProteinProgressBar, FatProgressBar } from '../components/GoalProgress'

function MiniCard({ label, value, goal }) {
  return (
    <div className="rounded-xl border bg-white p-3 text-center shadow-sm">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-semibold">{value}g</div>
      <CarbProgressBar total={100} goal={150} />
    </div>
  )
}

// ────────────────────────────────
// Individual Mini Cards
// ────────────────────────────────
function ProteinCard({ value, goal }) {
  return (
    <div className="rounded-xl border bg-white p-3 text-center shadow-sm">
      <div className="text-xs text-gray-500">Protein</div>
      <div className="text-lg font-semibold">{value}g</div>
      <ProteinProgressBar total={value} goal={goal} />
    </div>
  )
}

function CarbCard({ value, goal }) {
  return (
    <div className="rounded-xl border bg-white p-3 text-center shadow-sm">
      <div className="text-xs text-gray-500">Carbs</div>
      <div className="text-lg font-semibold">{value}g</div>
      <CarbProgressBar total={value} goal={goal} />
    </div>
  )
}

function FatCard({ value, goal }) {
  return (
    <div className="rounded-xl border bg-white p-3 text-center shadow-sm">
      <div className="text-xs text-gray-500">Fat</div>
      <div className="text-lg font-semibold">{value}g</div>
      <FatProgressBar total={value} goal={goal} />
    </div>
  )
}

// UTC 'YYYY-MM-DD' so we don't get off-by-one issues
const isoUTC = () => {
  const now = new Date()
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  return d.toISOString().slice(0, 10)
}

export default function MacrosSummary() {
  const [macros, setMacros] = useState({ protein: 0, carbs: 0, fat: 0 })
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        setErr('')

        // 1️⃣ Get user
        const { data: auth } = await supabase.auth.getUser()
        const user = auth?.user
        if (!user) {
          if (mounted) setLoading(false)
          return
        }

        // 2️⃣ Get today's date (local)
        const date = new Date()
        const today = `${date.getFullYear()}-${String(date.getMonth() + 1)}-${String(date.getDate())}`

        // 3️⃣ Fetch today's foods
        const { data, error } = await supabase.from('foods').select('protein, carbs, fat').eq('user_id', user.id).eq('eaten_at', today)

        if (error) throw error

        // 4️⃣ Sum up macros
        if (data && data.length > 0) {
          let sumProtein = 0
          let sumCarbs = 0
          let sumFat = 0

          data.forEach((food) => {
            sumProtein += Number(food.protein) || 0
            sumCarbs += Number(food.carbs) || 0
            sumFat += Number(food.fat) || 0
          })

          if (mounted) {
            setMacros({
              protein: Math.round(sumProtein),
              carbs: Math.round(sumCarbs),
              fat: Math.round(sumFat)
            })
          }
        } else {
          console.log('No macro data found for today.')
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

  return (
    <div className="mx-auto mb-4 grid w-full max-w-md gap-1 md:gap-3" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
      {err ? (
        <div className="col-span-3 text-center text-sm text-red-600">{err}</div>
      ) : (
        <>
          <ProteinCard value={loading ? 0 : macros.protein} goal={150} />
          <CarbCard value={loading ? 0 : macros.carbs} goal={150} />
          <FatCard value={loading ? 0 : macros.fat} goal={150} />
        </>
      )}
    </div>
  )
}
