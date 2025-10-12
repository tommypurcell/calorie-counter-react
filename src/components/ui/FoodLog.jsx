/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Link } from 'react-router-dom'
import { groupFoodsByDate } from '../../lib/utils'
import { fetchFoods, updateCaloriesBy, deleteFood } from '../../lib/services/foodService'
import FoodDay from '../FoodDay'

/**
 * FoodLog Component
 * ------------------
 * Fetches, organizes, and displays the user’s daily food logs.
 * Each day’s log is shown using the <FoodDay /> component.
 */
export default function FoodLog({ foodLogChanged, setFoodLogChanged }) {
  // --- State ---
  const [foodLog, setFoodLog] = useState([]) // grouped food data by date
  const [loading, setLoading] = useState(false) // shows loading spinner/text
  const [editingId, setEditingId] = useState(null)
  const [calorieGoal, setCalorieGoal] = useState(null) // user’s daily calorie goal

  const isLoggedIn = !!localStorage.getItem('isLoggedIn')

  /**
   * Fetch all foods for the logged-in user.
   * Groups entries by date for display.
   */
  const getFoods = async () => {
    setLoading(true)

    // get current user from Supabase
    const { data } = await supabase.auth.getUser()
    const user = data?.user
    if (!user) {
      console.warn('⚠️ No user found, skipping fetch')
      setLoading(false)
      return
    }

    try {
      // fetch all foods, then group them by date
      const rows = await fetchFoods(user.id)
      setFoodLog(groupFoodsByDate(rows))
    } catch (err) {
      console.error('❌ Error fetching foods:', err.message)
    } finally {
      setLoading(false)
    }
  }

  /**
   * On component mount:
   * - verify user is logged in
   * - load foods + profile data (calorieGoal)
   */
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser()
      const user = data?.user

      if (user) {
        localStorage.setItem('isLoggedIn', 'true')
        getFoods()

        // get calorie goal from user profile
        const { data: profile } = await supabase.from('profiles').select('calorieGoal').eq('id', user.id).single()
        if (profile) setCalorieGoal(profile.calorieGoal)
      } else {
        localStorage.removeItem('isLoggedIn')
      }
    }

    init()
  }, [])

  /**
   * Re-fetch foods when parent component signals that
   * the log has changed (e.g., after adding a new food).
   */
  useEffect(() => {
    if (foodLogChanged) {
      getFoods()
      setFoodLogChanged(false)
    }
  }, [foodLogChanged])

  // --- Conditional Renders ---
  if (loading) return <div className="flex justify-center p-8 text-gray-500">Loading...</div>

  if (!isLoggedIn)
    return (
      <div className="flex justify-center items-center h-full">
        <h1>Please log in to view the food log.</h1>
      </div>
    )

  // --- Main Render ---
  return (
    <div>
      {/* Food List */}
      <main className="min-h-screen pb-48 pt-10">
        {foodLog.length > 0 ? (
          foodLog.map((day, i) => <FoodDay key={day.date} day={day} dayIndex={i} calorieGoal={calorieGoal} foodLog={foodLog} setFoodLog={setFoodLog} updateCaloriesBy={updateCaloriesBy} deleteFood={deleteFood} getFoods={getFoods} />)
        ) : (
          <div className="text-center mt-4">
            <p>Your food log is empty.</p>
            <Link to="/calorie-counter" className="m-2 nav-button">
              Login to start logging food
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
