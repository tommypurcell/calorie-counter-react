/* eslint-disable react/prop-types */

import React from 'react'
import axios from 'axios'
import { supabase } from '../supabase'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

axios.defaults.withCredentials = true

// ***************
// TODO
// create user login and authentication
// ***************

export default function FoodLog(props) {
  const { foodLogChanged, setFoodLogChanged, calorieGoal } = props
  const isLoggedIn = !!localStorage.getItem('isLoggedIn')
  const [foodLog, setFoodLog] = useState([])
  const [loading, setLoading] = useState(false)

  const [editField, setEditField] = useState(null) // Track the specific field being edited

  // format date (if needed in future)

  // Group flat rows into day buckets with totals
  const groupFoodsByDate = (rows) => {
    const grouped = rows.reduce((acc, row) => {
      const dateKey = row.eaten_at
      if (!acc[dateKey]) {
        acc[dateKey] = { date: dateKey, foods: [], totalCalories: 0 }
      }
      acc[dateKey].foods.push(row)
      acc[dateKey].totalCalories += row.calories || 0
      return acc
    }, {})
    return Object.values(grouped).sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  // get all foods for current logged in user from Supabase
  const getFoods = async () => {
    setLoading(true)
    const {
      data: { user }
    } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }
    const { data, error } = await supabase
      .from('foods')
      .select('id, name, calories, eaten_at')
      .eq('user_id', user.id)
      .order('eaten_at', { ascending: false })

    if (error) {
      console.error('Error fetching foods:', error.message)
      setLoading(false)
      return
    }
    setFoodLog(groupFoodsByDate(data || []))
    setLoading(false)
  }

  // delete food item from database
  const deleteFoodItem = async (dayIndex, foodIndex) => {
    const idToDelete = foodLog[dayIndex].foods[foodIndex].id
    const { error } = await supabase.from('foods').delete().eq('id', idToDelete)
    if (error) {
      console.error('Error deleting food:', error.message)
    }
    getFoods()
  }

  // add ten calories to food item when button is clicked
  const addCalories = async (dayIndex, foodIndex) => {
    const idToUpdate = foodLog[dayIndex].foods[foodIndex].id
    const caloriesToAdd = foodLog[dayIndex].foods[foodIndex].calories + 10
    const { error } = await supabase.from('foods').update({ calories: caloriesToAdd }).eq('id', idToUpdate)
    if (error) {
      console.error('Error updating calories:', error.message)
    }
    getFoods()
  }

  // subtract ten calories from food item when button is clicked
  const subtractCalories = async (dayIndex, foodIndex) => {
    const idToUpdate = foodLog[dayIndex].foods[foodIndex].id
    const caloriesToSubtract = foodLog[dayIndex].foods[foodIndex].calories - 10
    const { error } = await supabase.from('foods').update({ calories: caloriesToSubtract }).eq('id', idToUpdate)
    if (error) {
      console.error('Error updating calories:', error.message)
    }
    getFoods()
  }

  // removed unused helper

  useEffect(() => {
    const ensureAuth = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        localStorage.setItem('isLoggedIn', 'true')
        getFoods()
      } else {
        localStorage.removeItem('isLoggedIn')
      }
    }
    ensureAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (foodLogChanged) {
      getFoods()
      setFoodLogChanged(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foodLogChanged, setFoodLogChanged])

  return (
    <>
      {loading ? (
        <div role="status">
          <div role="status" className="max-w-md p-4 space-y-4 border border-gray-200 divide-y divide-gray-200 rounded shadow animate-pulse dark:divide-gray-700 md:p-6 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-24 mb-2.5" />
                <div className="w-32 h-2 bg-gray-200 rounded-full dark:bg-gray-700" />
              </div>
              <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 w-12" />
            </div>
            <div className="flex items-center justify-between pt-4">
              <div>
                <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-24 mb-2.5" />
                <div className="w-32 h-2 bg-gray-200 rounded-full dark:bg-gray-700" />
              </div>
              <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 w-12" />
            </div>
            <div className="flex items-center justify-between pt-4">
              <div>
                <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-24 mb-2.5" />
                <div className="w-32 h-2 bg-gray-200 rounded-full dark:bg-gray-700" />
              </div>
              <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 w-12" />
            </div>
            <div className="flex items-center justify-between pt-4">
              <div>
                <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-24 mb-2.5" />
                <div className="w-32 h-2 bg-gray-200 rounded-full dark:bg-gray-700" />
              </div>
              <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 w-12" />
            </div>
            <div className="flex items-center justify-between pt-4">
              <div>
                <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-24 mb-2.5" />
                <div className="w-32 h-2 bg-gray-200 rounded-full dark:bg-gray-700" />
              </div>
              <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 w-12" />
            </div>
            <span className="sr-only">Loading...</span>
          </div>

          <span className="sr-only">Loading...</span>
        </div>
      ) : isLoggedIn ? (
        <>
          {' '}
          <h1 className="text-center text-2xl font-bold text-gray-700 sm:text-3xl">Food Log</h1>
          <main className="food-log-container min-h-screen pb-48 pt-10">
            <div>
              <div className="">
                {foodLog.length > 0 ? (
                  foodLog.map((day, dayIndex) => (
                    <div key={dayIndex}>
                      <h3 className="text-gray-700 font-bold text-lg rounded-t-md bg-gray-200 px-2 pt-2">{day.date}</h3>
                      <section className="food-log-item mt-0 mb-5 xl:w-[700px]">
                        {day.foods.map((food, foodIndex) => (
                          <div key={foodIndex} className={`flex flex-row gap-x-4 p-2 ${foodIndex % 2 === 0 ? 'bg-white' : 'bg-gray-100'}`}>
                            <div className="flex flex-row justify-between w-full">
                              <p className="text-xl text-gray-800 font-normal w-64">{food.name}</p>
                              <p className="text-lg text-gray-500 font-semibold">{food.calories} cal</p>
                            </div>
                            <div className="food-log-buttons flex flex-row gap-2">
                              {/* Conditionally render edit buttons for the current food item */}
                              {editField === `${dayIndex}-${foodIndex}` ? (
                                <>
                                  <button className="border-1 border-blue-500 bg-blue-100 text-blue-500 hover:underline rounded w-10 h-8" onClick={() => addCalories(dayIndex, foodIndex)}>
                                    +10
                                  </button>
                                  <button className="border-1 border-blue-500 bg-blue-100 text-blue-500 hover:underline rounded w-10 h-8" onClick={() => subtractCalories(dayIndex, foodIndex)}>
                                    -10
                                  </button>
                                  <button
                                    className="text-red-500 hover:underline w-16 h-8"
                                    onClick={() => {
                                      if (window.confirm(`Are you sure you want to remove ${food.name}?`)) {
                                        deleteFoodItem(dayIndex, foodIndex)
                                      }
                                    }}
                                  >
                                    Remove
                                  </button>

                                  <button className="text-blue-500 hover:underline w-16 h-8" onClick={() => setEditField(null)}>
                                    Save
                                  </button>
                                </>
                              ) : (
                                <button className="text-blue-500 hover:underline w-16 h-8" onClick={() => setEditField(`${dayIndex}-${foodIndex}`)}>
                                  Edit
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        <h2 className={`font-thin text-xl text-white ${day.totalCalories > calorieGoal ? 'bg-red-700' : 'bg-green-700'} p-1 rounded-b-xl`}>{day.totalCalories} total calories for the day</h2>
                      </section>
                    </div>
                  ))
                ) : (
                  <div>
                    <p>Your food log is currently empty.</p>
                    <Link to="/calorie-counter" className="m-2 w-100 text-center nav-button">
                      Login to start logging food
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </main>
        </>
      ) : (
        <div className="d-flex justify-content-center align-items-center">
          <h1>Please log in to view the food log.</h1>
        </div>
      )}
    </>
  )
}
