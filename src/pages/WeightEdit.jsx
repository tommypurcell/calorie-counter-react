// Edit all weight entries
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getWeights, deleteWeight } from '../lib/weightUtils'
import { kgToLb, lbToKg } from '../lib/unitUtils'

export default function WeightEdit() {
  const navigate = useNavigate()
  const [weights, setWeights] = useState([])
  const [loading, setLoading] = useState(true)
  const [unitPreference, setUnitPreference] = useState('imperial')
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')

  // Load all weights
  useEffect(() => {
    loadWeights()
  }, [])

  async function loadWeights() {
    try {
      setLoading(true)
      const { data } = await supabase.auth.getUser()
      if (!data.user) return

      // Get unit preference
      const { data: profile } = await supabase.from('profiles').select('unit_preference').eq('id', data.user.id).single()
      if (profile?.unit_preference) {
        setUnitPreference(profile.unit_preference)
      }

      // Get all weights
      const allWeights = await getWeights(data.user.id)
      setWeights(allWeights)
    } catch (err) {
      console.error('Error loading weights:', err)
    } finally {
      setLoading(false)
    }
  }

  // Delete weight
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

  // Start editing
  function startEdit(weight) {
    setEditingId(weight.id)
    const weightKg = parseFloat(weight.weight_kg)
    const displayWeight = unitPreference === 'imperial' ? kgToLb(weightKg) : weightKg
    setEditValue(displayWeight.toFixed(1))
  }

  // Save edit
  async function saveEdit(weightId) {
    try {
      // Convert to kg if needed
      let weightKg = parseFloat(editValue)
      if (unitPreference === 'imperial') {
        weightKg = lbToKg(weightKg)
      }

      // Update in database
      const { error } = await supabase.from('weights').update({ weight_kg: weightKg }).eq('id', weightId)

      if (error) {
        alert('Failed to save')
        console.error(error)
      } else {
        setEditingId(null)
        setEditValue('')
        await loadWeights()
      }
    } catch (err) {
      console.error('Error saving weight:', err)
      alert('Failed to save weight')
    }
  }

  // Cancel edit
  function cancelEdit() {
    setEditingId(null)
    setEditValue('')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    )
  }

  const unit = unitPreference === 'imperial' ? 'lb' : 'kg'

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Edit Weight Entries</h1>
          <button onClick={() => navigate(-1)} className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100">
            Back
          </button>
        </div>

        {weights.length === 0 ? (
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-8 text-center">
            <p className="text-sm text-gray-500">No weight entries yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {weights.map((weight) => {
              const weightKg = parseFloat(weight.weight_kg)
              const displayWeight = unitPreference === 'imperial' ? kgToLb(weightKg).toFixed(1) : weightKg
              const isEditing = editingId === weight.id

              return (
                <div key={weight.id} className="rounded-xl border border-gray-100 bg-white p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">{new Date(weight.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.1"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-32 rounded-lg border border-gray-200 px-3 py-1 text-sm"
                          />
                          <span className="text-sm text-gray-500">{unit}</span>
                        </div>
                      ) : (
                        <p className="text-sm font-semibold text-gray-900">
                          {displayWeight} {unit}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <button onClick={() => saveEdit(weight.id)} className="rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white transition hover:bg-gray-800">
                            Save
                          </button>
                          <button onClick={cancelEdit} className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 transition hover:bg-gray-100">
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(weight)} className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 transition hover:bg-gray-100">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(weight.id)} className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-100">
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
