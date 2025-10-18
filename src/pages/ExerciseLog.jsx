/* eslint-disable react/prop-types */
import InputBox from '../components/ui/InputBox'
import { supabase } from '../lib/supabase'
import { loadUserData } from '../lib/userUtils'
import React, { useState, useEffect } from 'react'
import DateSelector from '../components/ui/DateSelector'
import { formatDate } from '../lib/utils'

export default function ExerciseLog() {
  const [expandedDay, setExpandedDay] = useState(null)
  const [userId, setUserId] = useState('user123') // Add this line
  const [workouts, setWorkouts] = useState([])
  const [dateStr, setDateStr] = useState(todayLocal())
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState('') // "success" or "error"
  const [editingId, setEditingId] = useState(null)
  const [editValues, setEditValues] = useState({ exercise: '', calories: 0 })

  // mock Supabase "exercises" table

  // This function runs when the form is submitted
  const handleSubmit = async (e) => {
    e.preventDefault() // stop the page from refreshing

    // Get what the user typed
    const exercise = e.target.exercise.value.trim()
    const calories = Number(e.target.calories.value)

    // Make sure we have a real user logged in
    if (!userId) {
      console.error('No user found. Please log in first.')
      return
    }

    // Add the new exercise to the Supabase "exercises" table
    const { data, error } = await supabase
      .from('exercises')
      .insert([
        {
          user_id: userId, // who added it
          exercise: exercise, // what they did
          calories_burned: calories, // how many calories
          category: null, // just a default for now
          completed_at: dateStr // Save it in the database exactly as "YYYY-MM-DD"
        }
      ])
      .select() // tells Supabase to give us the new data back

    // Check for errors
    if (error) {
      console.error('❌ Could not save exercise:', error)
      setMsg('Could not save. Try again.')
      setMsgType('error')
    } else {
      console.log('✅ Exercise saved!', data)
      setMsg(`Saved ${exercise} (${calories} kcal) to ${formatDate(dateStr)}.`)
      setMsgType('success')

      // Now get all exercises again so the page updates
      const { data: newData, error: fetchError } = await supabase.from('exercises').select('*').eq('user_id', userId).order('completed_at', { ascending: false })

      if (fetchError) {
        console.error('❌ Could not load exercises:', fetchError)
      } else {
        setWorkouts(newData || [])
      }
    }

    // Clear the form boxes after submitting
    e.target.reset()
  }

  const handleEdit = async (id, newExercise, newCalories) => {
    console.log('Saving edit for id', id, newExercise, newCalories)

    const { data, error } = await supabase
      .from('exercises')
      .update({
        exercise: newExercise,
        calories_burned: Number(newCalories)
      })
      .eq('id', id)
      .eq('user_id', userId) // safety for row-level security
      .select()

    if (error) {
      console.error('Error updating:', error)
      setMsg('Could not update.')
      setMsgType('error')
    } else {
      console.log('✅ Updated in Supabase:', data)
      setWorkouts((prev) => prev.map((w) => (w.id === id ? { ...w, exercise: newExercise.trim(), calories_burned: Number(newCalories) } : w)))
      setEditingId(null)
      setMsg('Updated successfully.')
      setMsgType('success')
    }
  }

  // Delete one exercise
  const handleDelete = async (id) => {
    const { error } = await supabase.from('exercises').delete().eq('id', id)
    if (error) {
      console.error('Error deleting exercise:', error)
      setMsg('Could not delete.')
      setMsgType('error')
    } else {
      setWorkouts((prev) => prev.filter((w) => w.id !== id))
      setMsg('Exercise deleted.')
      setMsgType('success')
    }
  }

  console.log('workouts:', workouts)
  const grouped = workouts.reduce((acc, w) => {
    // Handle both "YYYY-MM-DD" and "YYYY-MM-DDTHH:MM:SS"
    let dateKey = w.completed_at

    // if it has a 'T', split there; otherwise split at space
    if (dateKey.includes('T')) {
      dateKey = dateKey.split('T')[0]
    } else if (dateKey.includes(' ')) {
      dateKey = dateKey.split(' ')[0]
    }

    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(w)

    return acc
  }, {})

  const toggleDay = (day) => {
    setExpandedDay(expandedDay === day ? null : day)
  }
  function todayLocal() {
    const d = new Date()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  useEffect(() => {
    if (msgType !== 'success' || !msg) return
    const timer = setTimeout(() => setMsg(''), 3000)
    return () => clearTimeout(timer)
  }, [msg, msgType])

  useEffect(() => {
    const fetchData = async () => {
      const userData = await loadUserData()
      console.log('userdata', userData)
      if (!userData.user.id) {
        console.error('No user_id found')
        return
      }

      setUserId(userData.user.id)

      const { data, error } = await supabase.from('exercises').select('*').eq('user_id', userData.user.id).order('completed_at', { ascending: false })

      if (error) console.error('Error fetching data:', error)
      else setWorkouts(data || [])
    }

    fetchData()
  }, [])

  return (
    <div className="grid grid-cols-1 h-screen w-screen gap-8 place-items-center place-content-center justify-center items-center">
      <form onSubmit={handleSubmit} className="flex flex-col justify-center items-center border border-gray-300 rounded-md h-full w-full sm:w-3/4 xl:w-1/4">
        <div className="flex flex-col items-center m-4 gap-4">
          <div className="flex flex-row gap-2 items-center justify-center">
            <span>🏃</span>
            <InputBox name="exercise" placeholder="Enter exercise here" />
          </div>
          <div className="flex flex-row gap-2 items-center justify-center">
            <span>🔥</span>
            <InputBox name="calories" placeholder="Enter calories burned" />
          </div>
          {/* Show date picker only after items exist */}
          <DateSelector value={dateStr} onChange={setDateStr} />

          <button type="submit" className="p-2 bg-orange-400 rounded-md w-full">
            Submit
          </button>
          {msg && <div className={`text-sm p-2 rounded w-full text-center ${msgType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{msg}</div>}
        </div>
      </form>

      {/* Workout Log */}
      <div className="h-full p-4 w-full sm:w-3/4 xl:w-1/4 overflow-y-auto">
        <h2 className="font-bold text-lg mb-2">Workout Log</h2>

        {Object.keys(grouped).map((date) => {
          const exercises = grouped[date] // only this day's workouts
          let total = 0

          // add up calories for that day
          for (let i = 0; i < exercises.length; i++) {
            total += Number(exercises[i].calories_burned) || 0
          }

          return (
            <div key={date} className="bg-gray-100 rounded-lg mb-2">
              <button onClick={() => toggleDay(date)} className="w-full flex justify-between items-center p-3 font-semibold text-left">
                {formatDate(date)}
                <span>{expandedDay === date ? '▲' : '▼'}</span>
              </button>

              {expandedDay === date && (
                <ul className="bg-white p-3 list-disc border rounded-b-lg">
                  {exercises.map((w) => (
                    <li className="mx-20" key={w.id}>
                      <div className="flex flex-row justify-between items-center">
                        {editingId === w.id ? (
                          <>
                            <input className="border rounded px-1 w-24" value={editValues.exercise} onChange={(e) => setEditValues({ ...editValues, exercise: e.target.value })} />
                            <input type="number" className="border rounded px-1 w-16 text-right" value={editValues.calories} onChange={(e) => setEditValues({ ...editValues, calories: Number(e.target.value) })} />
                            <div className="flex flex-row gap-2">
                              <button onClick={() => handleEdit(w.id, editValues.exercise, editValues.calories)} className="text-green-600 text-xs border border-green-400 rounded px-2 py-0.5 hover:bg-green-100">
                                Save
                              </button>
                              <button onClick={() => setEditingId(null)} className="text-gray-500 text-xs border border-gray-300 rounded px-2 py-0.5 hover:bg-gray-100">
                                Cancel
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* View mode */}
                            <div>
                              <p>{w.exercise}</p>
                              <p className="text-sm text-gray-500">{w.calories_burned} kcal</p>
                            </div>
                            <div className="flex flex-row gap-2">
                              <button
                                onClick={() => {
                                  setEditingId(w.id)
                                  setEditValues({ exercise: w.exercise, calories: w.calories_burned })
                                }}
                                className="text-blue-500 text-xs border border-blue-400 rounded px-2 py-0.5 hover:bg-blue-100"
                              >
                                Edit
                              </button>

                              <button onClick={() => handleDelete(w.id)} className="text-red-500 text-xs border border-red-400 rounded px-2 py-0.5 hover:bg-red-100">
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </li>
                  ))}

                  {/* show total */}
                  <div className="flex flex-row justify-end mt-2 font-semibold">
                    <p>Total: {total} kcal</p>
                  </div>
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
