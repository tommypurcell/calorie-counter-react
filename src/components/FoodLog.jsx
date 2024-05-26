/* eslint-disable react/prop-types */

import React from 'react'
import axios from 'axios'
import { Params } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Nav from './Nav'
import { check } from 'prettier'
import { Link } from 'react-router-dom'
axios.defaults.withCredentials = true

const render_url = process.env.REACT_APP_RENDER_USA_URL
const local_url = process.env.REACT_APP_LOCAL_URL

// ***************
// TODO
// create user login and authentication
// ***************

export default function FoodLog(props) {
  const isLoggedIn = localStorage.getItem('isLoggedIn')
  const applicationKey = '8803e138817c6dd9b43f6f0dcc52b9f1'
  const applicationID = '7b70e049'
  const [foodLog, setFoodLog] = useState([])
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [editButtons, setEditButtons] = useState(false)

  console.log(props.foodLogChanged)
  console.log(props.cal)

  // format date
  const formatDate = (date) => {
    let newDate = date.split('T')[0].split('-')
    let year = newDate[0]
    let month = newDate[1]
    let day = newDate[2]
    setDate(`${month}/${day}/${year}`)
  }

  // get all foods for current logged in user
  const getFoods = async () => {
    setLoading(true)
    const response = await axios.get(`${render_url}/foods`, {
      withCredentials: true
    })
    setFoodLog(response.data)
    setLoading(false)
  }

  // delete food item from database
  const deleteFoodItem = async (dayIndex, foodIndex) => {
    const idToDelete = foodLog[dayIndex].foods[foodIndex]._id
    await axios.delete(`${render_url}/foods/${idToDelete}`)
    getFoods()
  }

  // add ten calories to food item when button is clicked
  const addCalories = async (dayIndex, foodIndex) => {
    const idToUpdate = foodLog[dayIndex].foods[foodIndex]._id
    const caloriesToAdd = foodLog[dayIndex].foods[foodIndex].calories + 10
    console.log(`axios patch request sent to ${render_url}/foods`)
    await axios.patch(`${render_url}/foods`, {
      id: idToUpdate,
      calories: caloriesToAdd
    })
    getFoods()
  }

  // subtract ten calories from food item when button is clicked
  const subtractCalories = async (dayIndex, foodIndex) => {
    const idToUpdate = foodLog[dayIndex].foods[foodIndex]._id
    const caloriesToSubtract = foodLog[dayIndex].foods[foodIndex].calories - 10
    await axios.patch(`${render_url}/foods`, {
      id: idToUpdate,
      calories: caloriesToSubtract
    })
    getFoods()
  }

  const showObject = () => {
    let display = ''
    for (let key in foodLog) {
      display += `${key}: ${foodLog[key]}`
    }
    return display
  }

  useEffect(() => {
    getFoods()
  }, [])

  useEffect(() => {
    if (props.foodLogChanged) {
      getFoods()
      props.setFoodLogChanged(false)
    }
  }, [props.foodLogChanged])

  return (
    <>
      {loading ? (
        <div role="status">
          <div
            role="status"
            className="max-w-md p-4 space-y-4 border border-gray-200 divide-y divide-gray-200 rounded shadow animate-pulse dark:divide-gray-700 md:p-6 dark:border-gray-700"
          >
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
        <main className="food-log-container">
          <h1 className="text-center text-xl font-bold text-gray-700 sm:text-lg">
            Food Log
          </h1>

          <div>
            <div className="shadow-sm">
              {foodLog.length > 0 ? (
                foodLog.map((day, dayIndex) => (
                  <div key={dayIndex}>
                    <h3 className="text-gray-700 font-bold text-lg bg-gray-200 px-2 pt-2">
                      {day.date}
                    </h3>
                    <section className="food-log-item mt-0 mb-5">
                      {day.foods.map((food, foodIndex) => (
                        <div
                          key={foodIndex}
                          className={`flex flex-row justify-between p-4 ${foodIndex % 2 == 0 ? 'bg-white' : 'bg-gray-100'}`}
                        >
                          <p className="text-2xl text-gray-700 font-bold">
                            {food.name}
                          </p>
                          <p className="text-lg text-gray-500 font-semibold">
                            {food.calories} cal
                          </p>
                          <div className="food-log-buttons">
                            {!editButtons ? (
                              <button
                                className="bg-blue-500 hover:bg-blue-400 w-16 h-8 flex items-center"
                                onClick={() => setEditButtons(true)}
                              >
                                Edit
                              </button>
                            ) : (
                              <>
                                <button
                                  className="bg-blue-500 hover:bg-blue-400"
                                  onClick={() =>
                                    addCalories(dayIndex, foodIndex)
                                  }
                                >
                                  +10
                                </button>
                                <button
                                  className="bg-blue-500 hover:bg-blue-400"
                                  onClick={() =>
                                    subtractCalories(dayIndex, foodIndex)
                                  }
                                >
                                  -10
                                </button>
                                <button
                                  className="removeFood bg-red-500 hover:bg-red-400"
                                  onClick={() =>
                                    deleteFoodItem(dayIndex, foodIndex)
                                  }
                                >
                                  Remove
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                      <h2
                        className={`font-semibold text-xl text-white ${day.totalCalories > props.calorieGoal ? 'bg-red-700' : 'bg-green-700'} p-1 rounded-b-xl `}
                      >
                        Total {day.totalCalories} cal for the day
                      </h2>
                    </section>
                  </div>
                ))
              ) : (
                <div>
                  <p>Your food log is currently empty.</p>
                  <Link
                    to="/calorie-counter"
                    className="m-2 w-100 text-center nav-button"
                  >
                    Login to start logging food
                  </Link>
                </div>
              )}
            </div>
          </div>
        </main>
      ) : (
        <div className="d-flex justify-content-center align-items-center">
          <h1>Please log in to view the food log.</h1>
        </div>
      )}
    </>
  )
}
