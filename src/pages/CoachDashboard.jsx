// src/pages/CoachDashboard.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getMyClients } from '../lib/coachUtils'

export default function CoachDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')
  const [profile, setProfile] = useState(null)
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      setLoading(true)

      // Get current user
      const {
        data: { user: currentUser }
      } = await supabase.auth.getUser()
      if (!currentUser) {
        navigate('/login')
        return
      }
      setUser(currentUser)

      // Get profile to check if they're a coach
      const { data: userProfile, error: profileError } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single()

      if (profileError) throw profileError

      setProfile(userProfile)

      // If not a coach, redirect to profile
      if (!userProfile.is_coach) {
        alert('You need to become a coach first!')
        navigate('/profile')
        return
      }

      // Load clients
      const clientList = await getMyClients(currentUser.id)
      setClients(clientList)
    } catch (err) {
      console.error('Dashboard error:', err)
      setError(err.message || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Main Container */}
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          {/* Header */}
          <div className="border-b border-gray-100 px-6 py-6">
            <h1 className="text-2xl font-semibold text-gray-900">Coach Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">Welcome back, Coach {profile?.name}</p>
          </div>

          {/* Coach Code Section */}
          <div className="border-b border-gray-100 px-6 py-5">
            <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500 mb-3">Your Coach Code</h3>
            <div className="rounded-2xl border border-gray-100 p-4">
              <p className="text-xs text-gray-600 mb-2">Share this code with clients:</p>
              <div className="flex items-center gap-3">
                <code className="text-lg font-mono font-bold text-gray-600">{profile?.coach_code}</code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(profile?.coach_code)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  }}
                  className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-gray-600 border border-gray-600 transition hover:bg-blue-700"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          {/* Client List Section */}
          <div className="px-6 py-6">
            <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500 mb-4">My Clients ({clients.length})</h3>

            {clients.length === 0 ? (
              <div className="rounded-2xl border border-gray-100 bg-gray-50 py-12 text-center">
                <p className="text-sm text-gray-500 mb-1">No clients yet</p>
                <p className="text-xs text-gray-400">Share your coach code to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {clients.map((client) => (
                  <div key={client.id} className="rounded-2xl border border-gray-100 p-4 transition hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/coach/client/${client.id}`)}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="h-10 w-10 overflow-hidden rounded-full border border-gray-200 bg-gray-50">
                          {client.avatar ? (
                            <img src={client.avatar} alt={client.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-gray-400">{client.name?.[0]?.toUpperCase() || '?'}</div>
                          )}
                        </div>

                        {/* Info */}
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">{client.name || 'Unnamed Client'}</h3>
                          <p className="text-xs text-gray-500">{client.email}</p>
                        </div>
                      </div>

                      {/* Goals */}
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Calorie Goal</p>
                        <p className="text-sm font-medium text-gray-900">{client.calorieGoal || '—'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
