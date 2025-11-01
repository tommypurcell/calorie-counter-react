// Coach Dashboard - where coaches see their clients
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getClientsWithActivity } from '../lib/coachUtils'

export default function CoachDashboard() {
  const navigate = useNavigate()

  // Basic data
  const [profile, setProfile] = useState(null)
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [coachBio, setCoachBio] = useState('')
  const [editingBio, setEditingBio] = useState(false)

  // Filters
  const [searchText, setSearchText] = useState('')
  const [showOnly, setShowOnly] = useState('all') // all, today, week
  const [sortBy, setSortBy] = useState('name') // name, active, streak

  // Load everything when page opens
  useEffect(() => {
    loadData()
  }, [])

  // Save coach bio
  async function saveBio() {
    try {
      const { error } = await supabase.from('profiles').update({ coach_bio: coachBio }).eq('id', profile.id)

      if (error) {
        alert('Error saving bio')
        console.error(error)
      } else {
        setEditingBio(false)
      }
    } catch (err) {
      alert('Error saving bio')
      console.error(err)
    }
  }

  async function loadData() {
    try {
      setLoading(true)

      // Check if user is logged in
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        navigate('/login')
        return
      }

      // Get their profile
      const { data: userProfile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
      setProfile(userProfile)
      setCoachBio(userProfile?.coach_bio || '')

      // Make sure they are a coach
      if (!userProfile.is_coach) {
        alert('You need to become a coach first!')
        navigate('/profile')
        return
      }

      // Load all clients with their activity stats
      const allClients = await getClientsWithActivity(data.user.id)
      setClients(allClients)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Filter clients by search text
  function filterBySearch(list) {
    const q = searchText.trim().toLowerCase()
    if (!q) return list

    const terms = q.split(/\s+/) // split by spaces into tokens

    return list.filter((client) => {
      const name = (client.name || '').toLowerCase()
      const email = (client.email || '').toLowerCase()

      // every search token must match something
      return terms.every((t) => name.includes(t) || email.includes(t))
    })
  }

  // Filter clients by activity
  function filterByActivity(clientList) {
    if (showOnly === 'today') {
      return clientList.filter((c) => c.activity?.loggedToday)
    }
    if (showOnly === 'week') {
      return clientList.filter((c) => c.activity?.loggedThisWeek)
    }
    return clientList
  }

  // Sort clients
  function sortClients(clientList) {
    const sorted = [...clientList]

    if (sortBy === 'name') {
      sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    } else if (sortBy === 'active') {
      sorted.sort((a, b) => {
        if (a.activity?.loggedToday && !b.activity?.loggedToday) return -1
        if (!a.activity?.loggedToday && b.activity?.loggedToday) return 1
        return 0
      })
    } else if (sortBy === 'streak') {
      sorted.sort((a, b) => (b.activity?.streak || 0) - (a.activity?.streak || 0))
    }

    return sorted
  }

  // Apply all filters and sorting
  const displayedClients = sortClients(filterByActivity(filterBySearch(clients)))

  // Show loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    )
  }

  // Show error screen
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  // Main page
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          {/* Title */}
          <div className="border-b border-gray-100 px-6 py-6">
            <h1 className="text-2xl font-semibold text-gray-900">Coach Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500 w-full text-center">Welcome back, Coach {profile?.name.split(' ')[0]}</p>
          </div>

          <div className="w-full border-b border-gray-100 flex flex-row items-start gap-8 px-6 py-4">
            {/* Coach Bio Section */}
            <div className="flex-1">
              <flex className="flex flex-row items-center gap-4">
                {' '}
                <img src={profile.avatar} alt="Profile avatar" className="h-16 w-16 border-2 border-gray-400 rounded-full object-cover transition duration-300" />
                <h3 className="text-2xl font-extrabold">Coach {profile.name.split(' ')[0]}</h3>
              </flex>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">Coach Bio</h3>
                {!editingBio ? (
                  <button onClick={() => setEditingBio(true)} className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 transition hover:bg-gray-100">
                    Edit Bio
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setEditingBio(false)} className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 transition hover:bg-gray-100">
                      Cancel
                    </button>
                    <button onClick={saveBio} className="rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white transition hover:bg-gray-800">
                      Save
                    </button>
                  </div>
                )}
              </div>
              {editingBio ? (
                <textarea
                  value={coachBio}
                  onChange={(e) => setCoachBio(e.target.value)}
                  placeholder="Tell clients about yourself..."
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none"
                  rows="3"
                />
              ) : (
                <p className="text-sm text-gray-600 rounded-lg border border-gray-100 bg-gray-50 p-3">{coachBio || 'No bio yet'}</p>
              )}
            </div>

            {/* Coach Code Section */}
            <div className="w-1/3 max-w-xs">
              <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500 mb-1">Your Coach Code</h3>
              <p className="text-xs text-gray-600 mb-1">Share this code with clients:</p>
              <div className="flex items-center gap-3">
                <code className="text-lg font-mono font-bold text-gray-600">{profile?.coach_code}</code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(profile?.coach_code)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  }}
                  className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-gray-600 border border-gray-600 transition hover:bg-gray-100"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          {/* Client List */}
          <div className="px-6 py-6">
            <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500 mb-4">My Clients ({clients.length})</h3>

            {clients.length === 0 ? (
              <div className="rounded-2xl border border-gray-100 bg-gray-50 py-12 text-center">
                <p className="text-sm text-gray-500 mb-1">No clients yet</p>
                <p className="text-xs text-gray-400">Share your coach code to get started</p>
              </div>
            ) : (
              <>
                {/* Search Box */}
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm mb-3 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none"
                />

                {/* Filter Buttons */}
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  {/* Activity buttons */}
                  <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-1">
                    <button onClick={() => setShowOnly('all')} className={`rounded px-2 py-1 text-xs font-semibold ${showOnly === 'all' ? 'bg-gray-900 text-white' : 'text-gray-600'}`}>
                      All
                    </button>
                    <button onClick={() => setShowOnly('today')} className={`rounded px-2 py-1 text-xs font-semibold ${showOnly === 'today' ? 'bg-gray-900 text-white' : 'text-gray-600'}`}>
                      Today
                    </button>
                    <button onClick={() => setShowOnly('week')} className={`rounded px-2 py-1 text-xs font-semibold ${showOnly === 'week' ? 'bg-gray-900 text-white' : 'text-gray-600'}`}>
                      This Week
                    </button>
                  </div>

                  {/* Sort buttons */}
                  <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-1">
                    <button onClick={() => setSortBy('name')} className={`rounded px-2 py-1 text-xs font-semibold ${sortBy === 'name' ? 'bg-gray-900 text-white' : 'text-gray-600'}`}>
                      Name
                    </button>
                    <button onClick={() => setSortBy('active')} className={`rounded px-2 py-1 text-xs font-semibold ${sortBy === 'active' ? 'bg-gray-900 text-white' : 'text-gray-600'}`}>
                      Active
                    </button>
                    <button onClick={() => setSortBy('streak')} className={`rounded px-2 py-1 text-xs font-semibold ${sortBy === 'streak' ? 'bg-gray-900 text-white' : 'text-gray-600'}`}>
                      Streak
                    </button>
                  </div>

                  {/* Result count */}
                  {searchText && <p className="text-xs text-gray-500 ml-auto">{displayedClients.length} results</p>}
                </div>

                {/* Client cards */}
                {displayedClients.length === 0 ? (
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 py-8 text-center">
                    <p className="text-sm text-gray-500">No clients match your filters</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {displayedClients.map((client) => (
                      <div key={client.id} className="rounded-2xl border border-gray-100 p-4 hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/coach/client/${client.id}`)}>
                        <div className="flex items-center justify-between gap-4">
                          {/* Left side - avatar and info */}
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full border border-gray-200 bg-gray-50 relative overflow-hidden">
                              {client.avatar ? (
                                <img src={client.avatar} alt={client.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-gray-400">{client.name?.[0]?.toUpperCase() || '?'}</div>
                              )}
                              {/* Green dot if logged today */}
                              {client.activity?.loggedToday && <div className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500" />}
                            </div>

                            <div>
                              <h3 className="text-sm font-semibold text-gray-900">{client.name || 'Unnamed Client'}</h3>
                              <p className="text-xs text-gray-500">{client.email}</p>
                              {client.activity?.streak > 0 && <p className="text-xs text-orange-600">🔥 {client.activity.streak} day streak</p>}
                            </div>
                          </div>

                          {/* Right side - stats */}
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Goal: {client.calorieGoal || '—'}</p>
                            {client.activity?.lastLogged && <p className="text-xs text-gray-400">Last: {new Date(client.activity.lastLogged).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
