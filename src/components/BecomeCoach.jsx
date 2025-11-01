// src/components/BecomeCoach.jsx
import React, { useState } from 'react'
import { becomeCoach } from '../lib/coachUtils'

export default function BecomeCoach({ userId, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleBecomeCoach = async () => {
    if (!confirm('Are you sure you want to become a coach? You will get a special code to share with clients.')) {
      return
    }

    try {
      setLoading(true)
      setError('')
      const updatedProfile = await becomeCoach(userId)
      alert(`Success! Your coach code is: ${updatedProfile.coach_code}`)
      if (onSuccess) onSuccess(updatedProfile)
    } catch (err) {
      console.error('Become coach error:', err)
      setError(err.message || 'Failed to become coach')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Become a Coach</h3>
      <p className="text-sm text-gray-600 mb-4">Help others reach their fitness goals! As a coach, you can view your clients&apos; food and exercise logs.</p>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded px-3 py-2">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button onClick={handleBecomeCoach} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold disabled:opacity-50">
        {loading ? 'Setting up...' : 'Become a Coach'}
      </button>
    </div>
  )
}
