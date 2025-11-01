// Weight Log - track your weight over time
import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, Cell, ReferenceLine } from 'recharts'
import { supabase } from '../lib/supabase'
import { saveWeight, getWeights, deleteWeight } from '../lib/weightUtils'
import { kgToLb, lbToKg } from '../lib/unitUtils'
import { getToday, getMonthAndDayOnly } from '../lib/utils'
import { useNavigate } from 'react-router-dom'

export default function WeightLog() {
  const navigate = useNavigate()
  const [weights, setWeights] = useState([])
  const [newWeight, setNewWeight] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState(null)
  const [unitPreference, setUnitPreference] = useState('imperial') // imperial or metric

  // Load weights when component opens
  useEffect(() => {
    loadWeights()
    console.log(weights)
  }, [])

  async function loadWeights() {
    try {
      setLoading(true)

      // Get current user
      const { data } = await supabase.auth.getUser()
      if (!data.user) return

      setUserId(data.user.id)

      // Get user's unit preference
      const { data: profile } = await supabase.from('profiles').select('unit_preference').eq('id', data.user.id).single()
      if (profile?.unit_preference) {
        setUnitPreference(profile.unit_preference)
      }

      // Get all weight entries
      const allWeights = await getWeights(data.user.id)
      setWeights(allWeights)
      console.log(allWeights)
    } catch (err) {
      console.error('Error loading weights:', err)
    } finally {
      setLoading(false)
    }
  }

  // Add new weight
  async function handleAddWeight(e) {
    e.preventDefault()

    if (!newWeight || !userId) return

    try {
      setSaving(true)

      // Convert to kg if user entered in lb
      let weightKg = parseFloat(newWeight)
      if (unitPreference === 'imperial') {
        weightKg = lbToKg(weightKg)
      }

      // Save to database (always stored in kg)
      await saveWeight(userId, weightKg, getToday().shortDate)
      console.log(getToday)
      // Reload the list
      await loadWeights()

      // Clear input
      setNewWeight('')
    } catch (err) {
      console.error('Error saving weight:', err)
      alert('Failed to save weight')
    } finally {
      setSaving(false)
    }
  }

  // Delete a weight entry
  async function handleDelete(weightId) {
    if (!confirm('Delete this weight entry?')) return

    try {
      await deleteWeight(weightId)
      await loadWeights()
    } catch (err) {
      console.error('Error deleting weight:', err)
      alert('Failed to delete weight')
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    )
  }

  // Prepare chart data (oldest to newest for chart)
  console.log('weights', weights)
  const chartData = [...weights].reverse().map((w) => {
    const weightKg = parseFloat(w.weight_kg)
    const displayWeight = unitPreference === 'imperial' ? kgToLb(weightKg) : weightKg
    return {
      date: getMonthAndDayOnly(w.logged_at),
      weight: parseFloat(displayWeight.toFixed(1))
    }
  })

  return (
    <>
      <div className="w-full max-w-xl mx-auto bg-white border border-gray-200 rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-600">Weight Log</h3>
        </div>
        {/* Add Weight Form */}
        <form onSubmit={handleAddWeight} className="mb-4">
          <div className="flex gap-2">
            <input
              type="number"
              step="0.1"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              placeholder={unitPreference === 'imperial' ? 'Weight (lb)' : 'Weight (kg)'}
              className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-gray-300 focus:outline-none"
              disabled={saving}
            />
            <button type="submit" disabled={saving || !newWeight} className="rounded-full bg-gray-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50">
              {saving ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>

        {weights.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-2">No weight entries yet</p>
        ) : (
          <>
            {/* Weight Chart */}
            <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#334155" interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#334155" domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #60a5fa',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Line type="monotone" dataKey="weight" stroke="#60a5fa" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Weight List */}
            {/* <div className="mt-4 space-y-2">
              {weights.slice(0, 5).map((weight) => {
                const weightKg = parseFloat(weight.weight_kg)
                const displayWeight = unitPreference === 'imperial' ? kgToLb(weightKg).toFixed(1) : weightKg
                const unit = unitPreference === 'imperial' ? 'lb' : 'kg'

                return (
                  <div key={weight.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {displayWeight} {unit}
                      </p>
                      <p className="text-xs text-gray-500">{new Date(weight.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <button onClick={() => handleDelete(weight.id)} className="text-xs text-red-600 hover:text-red-800">
                      Delete
                    </button>
                  </div>
                )
              })}
            </div> */}
          </>
        )}
        <button onClick={() => navigate('/weight-edit')} className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 transition hover:bg-gray-100">
          Edit Weights
        </button>
      </div>
    </>
  )
}
