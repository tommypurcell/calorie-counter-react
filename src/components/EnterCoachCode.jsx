// src/components/EnterCoachCode.jsx
import React, { useState } from 'react'
import { linkToCoach } from '../lib/coachUtils'
import { supabase } from '../lib/supabase'

export default function EnterCoachCode({ userId, onSuccess }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!code.trim()) {
      setError('Please enter a coach code')
      return
    }

    try {
      setLoading(true)
      setError('')
      const coach = await linkToCoach(userId, code)
      alert(`Success! You are now linked to coach: ${coach.name}`)
      if (onSuccess) onSuccess(coach)
    } catch (err) {
      console.error('Link to coach error:', err)
      setError(err.message || 'Invalid coach code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Have a Coach?</h3>
      <p className="text-sm text-gray-600 mb-4">Enter your coach&apos;s invite code to connect with them.</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="COACH-ABC123"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={loading}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded px-3 py-2">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button type="submit" disabled={loading || !code.trim()} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold disabled:opacity-50">
          {loading ? 'Connecting...' : 'Connect to Coach'}
        </button>
      </form>
    </div>
  )
}
