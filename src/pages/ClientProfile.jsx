// src/pages/ClientProfile.jsx
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getClientFoodLogs, getClientExerciseLogs } from '../lib/coachUtils'

export default function ClientProfile() {
  const { clientId } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [client, setClient] = useState(null)
  const [foodLogs, setFoodLogs] = useState([])
  const [exerciseLogs, setExerciseLogs] = useState([])
  const [activeTab, setActiveTab] = useState('food') // 'food' or 'exercise'

  useEffect(() => {
    loadClientProfile()
  }, [clientId])

  const loadClientProfile = async () => {
    try {
      setLoading(true)

      // Get current user (the coach)
      const {
        data: { user: currentUser }
      } = await supabase.auth.getUser()
      if (!currentUser) {
        navigate('/login')
        return
      }

      // Verify coach status
      const { data: coachProfile } = await supabase.from('profiles').select('is_coach').eq('id', currentUser.id).single()
      if (!coachProfile?.is_coach) {
        alert('You must be a coach to view client profiles')
        navigate('/profile')
        return
      }

      // Get client profile
      const { data: clientProfile, error: clientError } = await supabase.from('profiles').select('*').eq('id', clientId).single()

      if (clientError) throw clientError

      // Verify this client belongs to this coach
      if (clientProfile.coach_id !== currentUser.id) {
        alert('This client is not linked to you')
        navigate('/coach-dashboard')
        return
      }

      setClient(clientProfile)

      // Load food and exercise logs
      const [foods, exercises] = await Promise.all([getClientFoodLogs(clientId), getClientExerciseLogs(clientId)])

      setFoodLogs(foods)
      setExerciseLogs(exercises)
    } catch (err) {
      console.error('Load client error:', err)
      setError(err.message || 'Failed to load client profile')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading client profile...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-600">{error}</p>
          <Link to="/coach-dashboard" className="text-blue-600 underline mt-3 inline-block">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // Calculate totals for today
  const today = new Date().toISOString().split('T')[0]
  const todayFoods = foodLogs.filter((f) => f.eaten_at?.startsWith(today))
  const todayCalories = todayFoods.reduce((sum, f) => sum + (f.calories || 0), 0)
  const todayProtein = todayFoods.reduce((sum, f) => sum + (f.protein || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link to="/coach-dashboard" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to Dashboard
        </Link>

        {/* Client Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            {/* Avatar */}
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              {client?.avatar ? (
                <img src={client.avatar} alt={client.name} className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <span className="text-green-600 font-semibold text-2xl">{client?.name?.[0]?.toUpperCase() || '?'}</span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{client?.name || 'Unnamed Client'}</h1>
              <p className="text-gray-600">{client?.email}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-500">Calorie Goal</p>
              <p className="text-lg font-semibold text-gray-900">{client?.calorieGoal || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Protein Goal</p>
              <p className="text-lg font-semibold text-gray-900">{client?.proteingoal || 'Not set'} g</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Today&apos;s Calories</p>
              <p className="text-lg font-semibold text-green-600">{todayCalories}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Today&apos;s Protein</p>
              <p className="text-lg font-semibold text-green-600">{Math.round(todayProtein)} g</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200 flex">
            <button
              onClick={() => setActiveTab('food')}
              className={`flex-1 px-6 py-3 font-semibold transition ${activeTab === 'food' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Food Log ({foodLogs.length})
            </button>
            <button
              onClick={() => setActiveTab('exercise')}
              className={`flex-1 px-6 py-3 font-semibold transition ${activeTab === 'exercise' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Exercise Log ({exerciseLogs.length})
            </button>
          </div>

          <div className="p-6">
            {/* Food Tab */}
            {activeTab === 'food' && (
              <div>
                {foodLogs.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No food logs yet</p>
                ) : (
                  <div className="space-y-3">
                    {foodLogs.map((food) => (
                      <div key={food.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{food.name}</h3>
                            <p className="text-sm text-gray-500">{new Date(food.eaten_at).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900">{food.calories} cal</p>
                            {food.protein !== null && <p className="text-sm text-gray-500">P: {food.protein}g</p>}
                            {food.carbs !== null && <p className="text-sm text-gray-500">C: {food.carbs}g</p>}
                            {food.fat !== null && <p className="text-sm text-gray-500">F: {food.fat}g</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Exercise Tab */}
            {activeTab === 'exercise' && (
              <div>
                {exerciseLogs.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No exercise logs yet</p>
                ) : (
                  <div className="space-y-3">
                    {exerciseLogs.map((exercise) => (
                      <div key={exercise.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{exercise.exercise}</h3>
                            <p className="text-sm text-gray-500">
                              {exercise.completed_at ? new Date(exercise.completed_at).toLocaleDateString() : 'No date'}
                              {exercise.category && ` • ${exercise.category}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-orange-600">{exercise.calories_burned} cal</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
