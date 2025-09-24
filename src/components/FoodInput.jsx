/* eslint-disable react/prop-types */

import React from 'react'
import axios from 'axios'
// import Nav from '../components/Nav'

import { supabase } from '../supabase'
import { useState, useEffect } from 'react'

axios.defaults.withCredentials = true
// Docs for edamam api
// https://developer.edamam.com/edamam-docs-nutrition-api

// NOTE: We now log foods directly to Supabase (no Render API)

export default function FoodInput(props) {
  const applicationID = process.env.REACT_APP_EDAMAM_APPLICATION_ID
  const applicationKey = process.env.REACT_APP_EDAMAM_APPLICATION_KEY

  const [dates, setDates] = useState([])
  const [apiKey, setApiKey] = useState('')
  const [userId, setUserId] = useState('')
  const [foodLog, setFoodLog] = useState([])
  const [foodItem, setFoodItem] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [selectedDate, setSelectedDate] = useState(``)
  const [totalCalories, setTotalCalories] = useState(0)

  // check if user is logged in
  const checkLogin = async () => {
    const { data } = await supabase.auth.getUser()
    const user = data?.user
    setIsLoggedIn(!!user)
    setUserId(user ? user.id : '')
  }

  // set up date object
  const date = new Date()
  let day = date.getDate()
  let year = date.getFullYear()
  let month = date.getMonth() + 1

  // set date format
  if (day < 10) {
    day = `0${day}`
  }
  if (month < 10) {
    month = `0${month}`
  }
  const today = `${year}-${month}-${day}`

  const getFoodData = async (e) => {
    e.preventDefault()
    const response = await axios.get('https://api.edamam.com/api/nutrition-data', {
      params: {
        app_id: applicationID,
        app_key: applicationKey,
        ingr: foodItem
      }
    })

    const newFoodItem = {
      name: foodItem,
      calories: response.data.calories
    }
    setFoodLog([newFoodItem, ...foodLog])
    setTotalCalories(totalCalories + response.data.calories)
    // getGptEstimate()
  }

  const getGptEstimate = async (e) => {
    e.preventDefault()

    try {
      // Placeholder: AI estimation endpoint removed. Keep structure for future.
      const response = { data: { entries: [] } }

      console.log('Nutrition data:', response.data)

      // Iterate over the entries array
      for (let entry of response.data.entries) {
        // Creating a new food item from the GPT response
        const newFoodItem = {
          name: entry.food, // Food name from GPT response
          calories: entry.calories // Calories from GPT response
        }

        // Use functional updates to ensure correct state updates
        setFoodLog((prevFoodLog) => [newFoodItem, ...prevFoodLog])
        setTotalCalories((prevTotalCalories) => prevTotalCalories + entry.calories)
      }
    } catch (error) {
      console.error('Error fetching GPT nutrition data:', error.message)
      // Optionally handle the error state
    }
  }

  // format selected date (reserved for future UI uses)
  // const formatDate = (date) => {
  //   if (!date) return null
  //   const [y, m, d] = date.split('-')
  //   return `${m}/${d}/${y}`
  // }

  // get dates from database and set state
  // Load available dates from Supabase for the current user
  const getDates = async () => {
    if (!userId) return
    const { data, error } = await supabase.from('foods').select('eaten_at').eq('user_id', userId)
    if (error) {
      console.error('Error fetching dates:', error.message)
      return
    }
    const uniqueDates = Array.from(new Set((data || []).map((row) => row.eaten_at)))
      .sort()
      .reverse()
    setDates(uniqueDates)
  }

  // post food item to database
  // Persist queued items to Supabase
  const postFoodItems = async () => {
    if (!userId || foodLog.length === 0) return
    const rows = foodLog.map((item) => ({
      user_id: userId,
      name: item.name,
      calories: item.calories,
      eaten_at: selectedDate
    }))
    const { error } = await supabase.from('foods').insert(rows)
    if (error) {
      console.error('Error saving foods:', error.message)
      return
    }
    setFoodLog([])
    setTotalCalories(0)
    props.setFoodLogChanged(true)
    getDates()
  }

  const handleInputChange = (e) => {
    setFoodItem(e.target.value)
  }

  const removeFoodItem = (indexToRemove) => {
    // Filter out the item at the specified index
    const newFoodLog = foodLog.filter((item, index) => index !== indexToRemove)
    console.log('new Food log', newFoodLog)
    setFoodLog(newFoodLog)

    // Subtract the calories of the removed item from the total
    setTotalCalories(totalCalories - foodLog[indexToRemove].calories)
  }

  const addCalories = (indexToAdd, amount) => {
    // add calories to total
    setTotalCalories(totalCalories + amount)
    foodLog[indexToAdd].calories = foodLog[indexToAdd].calories + amount
  }

  const subtractCalories = (indexToSubtract, amount) => {
    // subtract calories from total
    setTotalCalories(totalCalories - amount)
    foodLog[indexToSubtract].calories = foodLog[indexToSubtract].calories - amount
  }

  useEffect(() => {
    setSelectedDate(today)
    checkLogin()
  }, [today])

  useEffect(() => {
    if (userId) {
      getDates()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  return (
    <>
      {!isLoggedIn ? (
        <>
          <h1 className="text-center text-2xl font-bold text-gray-500 sm:text-3xl">Please login to add foods</h1>
        </>
      ) : (
        <>
          <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-lg">
              <h1 className="text-center text-2xl font-bold text-gray-700 sm:text-3xl">Log New Food Item</h1>

              <form
                onSubmit={
                  getFoodData // Call the getFoodData function
                }
                className="mb-0 mt-6 space-y-4 rounded-lg p-4 shadow-lg bg-gray-50 sm:p-6 lg:p-8"
              >
                <p className="text-start text-lg font-medium text-gray-500">Just simply write what you ate here.</p>

                <div>
                  <div className="relative">
                    <div className="relative flex flex-row items-center mb-8">
                      <input
                        name="foodItem" // Ensure name is present for proper form handling
                        type="text"
                        className="w-full rounded-lg p-0 m-0 h-12 text-start px-3 border-gray-200 text-sm shadow-sm"
                        placeholder="1 plate of fried rice"
                        value={foodItem}
                        onChange={handleInputChange}
                      />

                      <span className="absolute inset-y-0 end-0 grid place-content-center px-4">
                        <i className="fa-solid fa-bowl-food"></i>
                      </span>
                    </div>

                    <div className="foods-container bg-gray-50">
                      {foodLog.map((item, index) => (
                        <div key={index}>
                          <article className="bg-gray-50">
                            <div className="flex flex-col items-start">
                              <p className="text-4xl">{item.calories} Calories</p>
                              <p className="text-gray-500">{item.name}</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6 align-start justify-start w-full">
                              <a className="bg-blue-500 hover:bg-blue-400 rounded text-white hover:cursor-pointer w-full text-center select-none" onClick={() => subtractCalories(index, 10)}>
                                - 10
                              </a>
                              <a className="bg-blue-500 hover:bg-blue-400 rounded text-white hover:cursor-pointer w-full text-center select-none" onClick={() => addCalories(index, 10)}>
                                + 10
                              </a>

                              <a className="bg-blue-500 hover:bg-blue-400 rounded text-white hover:cursor-pointer w-full text-center select-none" onClick={() => subtractCalories(index, 100)}>
                                - 100
                              </a>
                              <a className="bg-blue-500 hover:bg-blue-400 rounded text-white hover:cursor-pointer w-full text-center select-none" onClick={() => addCalories(index, 100)}>
                                + 100
                              </a>
                            </div>
                            <button className="bg-red-500 hover:bg-red-600 text-white rounded py-2 w-full mt-8 select-none" onClick={() => removeFoodItem(index)}>
                              Remove
                            </button>
                          </article>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {foodLog.length > 0 ? (
                  <>
                    <h2 className="text-gray-500">
                      Log foods for{' '}
                      <select className="form-select form-select-lg mb-3" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}>
                        <option value={today}>Today</option>
                        {dates.map((item, index) => (
                          <option key={index} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </h2>
                    <button type="button" onClick={postFoodItems} className="block w-full rounded-lg bg-green-600 hover:bg-green-500 px-5 py-3 text-sm font-medium text-white">
                      Save to Log
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 items-center w-full">
                    {' '}
                    <button type="submit" className="block whitespace-nowrap w-[200px] h-10 rounded-lg bg-blue-500 hover:bg-blue-400 text-sm text-center font-medium text-white">
                      Check Calories w API
                    </button>
                    {/* dropdown hyper ui */}
                    <details className="group [&_summary::-webkit-details-marker]:hidden">
                      <summary className="flex cursor-pointer items-center justify-between rounded-lg px-4 py-2 w-[200px] text-white h-10 bg-slate-500 hover:bg-gray-700">
                        <span className="text-sm font-medium text-nowrap">Count Calories with AI </span>

                        <span className="shrink-0 transition duration-300 group-open:-rotate-180">
                          <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </span>
                      </summary>

                      <ul className="mt-2">
                        <li>
                          <input
                            name="apiKey"
                            type="text"
                            className="w-full bg-gray-100 border-1 rounded-lg p-0 m-0 h-8 text-start px-3 border-gray-800 text-sm shadow-sm"
                            placeholder="Enter OpenAI API Key"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)} // add this
                          />
                        </li>
                        <li className="w-full">
                          <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="block px-3 py-2 text-sm text-sky-900 hover:underline text-right">
                            Get API Key
                          </a>
                        </li>
                      </ul>
                    </details>
                  </div>
                )}
              </form>
            </div>
          </div>
        </>
      )}
    </>
  )
}
