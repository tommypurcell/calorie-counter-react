import { getToday } from '../lib/utils'
import { supabase } from '../lib/supabase'
import { loadUserData } from '../lib/userUtils'
import { getTodayTotals } from '../lib/statsUtils'
import React, { useEffect, useState } from 'react'

export default function ExerciseSummary() {
  const [burned, setBurned] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const today = await getToday()

      setLoading(true)

      // get user info and food data
      const { user } = await loadUserData()

      // get today's exercises
      const { data: ex } = await supabase.from('exercises').select('calories_burned').eq('user_id', user.id).eq('completed_at', today.shortDate)

      const totalBurned = (ex || []).reduce((sum, e) => sum + e.calories_burned, 0)

      setBurned(totalBurned)
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) return <p className="text-sm text-gray-400 mt-3">Loading exercise data...</p>

  return (
    <div className="mx-auto mb-4 w-full rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="text-sm text-gray-500 mb-1">Today</div>
      <p>Burned 🔥 {burned} kcal</p>
    </div>
  )
}
