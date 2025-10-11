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
  const [userId, setUserId] = useState('')
  const [message, setMessage] = useState('')
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

  // Helper function to get user's local date in YYYY-MM-DD format
  const getTodayDate = () => new Date().toLocaleDateString('en-CA')

  const getFoodData = async (e) => {
    if (!foodItem) {
      setMessage('⚠️ Please enter a food item first.')
    }
    e.preventDefault()
    const response = await axios.get('https://api.edamam.com/api/nutrition-data', {
      params: {
        app_id: applicationID,
        app_key: applicationKey,
        ingr: foodItem
      }
    })

    // Extract macros from Edamam response
    const totalNutrients = response.data.totalNutrients || {}

    const newFoodItem = {
      name: foodItem,
      calories: response.data.calories || 0,
      protein: totalNutrients.PROCNT?.quantity || null, // Protein in grams
      carbs: totalNutrients.CHOCDF?.quantity || null, // Carbs in grams
      fat: totalNutrients.FAT?.quantity || null // Fat in grams
    }

    setFoodLog([newFoodItem, ...foodLog])
    setTotalCalories(totalCalories + newFoodItem.calories)
  }

  const getGptEstimate = async (e) => {
    e.preventDefault()

    if (!foodItem) {
      setMessage('⚠️ Please enter a food item first.')
      return
    }

    setMessage('🔄 Getting AI estimate...')

    try {
      // Get current user session token
      const {
        data: { session }
      } = await supabase.auth.getSession()

      if (!session) {
        setMessage('❌ Please log in to use AI estimates.')
        return
      }

      // Call backend with auth token
      const response = await axios.post(
        'http://localhost:5050/api/gpt',
        { foodItem },
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        }
      )

      console.log('OpenAI response:', response.data)

      // Parse the GPT response
      const content = response.data.choices[0].message.content.trim()

      // try to parse clean JSON, else fall back gracefully
      let entries
      try {
        entries = JSON.parse(content)
      } catch {
        console.warn("Model response wasn't pure JSON. Full text:", content)
        // attempt a fallback — extract manually if model adds explanation text
        const start = content.indexOf('[')
        const end = content.lastIndexOf(']')
        if (start !== -1 && end !== -1) {
          const possibleJson = content.slice(start, end + 1)
          try {
            entries = JSON.parse(possibleJson)
          } catch {
            throw new Error('Model output not valid JSON')
          }
        } else {
          throw new Error('Model output not valid JSON')
        }
      }

      // Iterate over the entries array
      for (let entry of entries) {
        const newFoodItem = {
          name: entry.food,
          calories: entry.calories || 0,
          protein: entry.protein || null,
          carbs: entry.carbs || null,
          fat: entry.fat || null
        }

        // Use functional updates to ensure correct state updates
        setFoodLog((prevFoodLog) => [newFoodItem, ...prevFoodLog])
        setTotalCalories((prevTotalCalories) => prevTotalCalories + newFoodItem.calories)
      }

      // Clear the input and show success
      setFoodItem('')
      setMessage('✅ AI estimate added!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error fetching GPT nutrition data:', error)

      // Handle rate limit
      if (error.response?.status === 429) {
        setMessage('⛔ Daily limit reached! (3/day). Try again tomorrow.')
      } else if (error.response?.status === 401) {
        setMessage('❌ Session expired. Please log in again.')
      } else {
        setMessage('❌ Error getting AI estimate. Try again.')
      }
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
  // Persist queued items to Supabase with macros
  const postFoodItems = async () => {
    if (!userId || foodLog.length === 0) return
    const rows = foodLog.map((item) => ({
      user_id: userId,
      name: item.name,
      calories: item.calories,
      protein: item.protein, // Can be null
      carbs: item.carbs, // Can be null
      fat: item.fat, // Can be null
      eaten_at: selectedDate
    }))
    const { error } = await supabase.from('foods').insert(rows)
    if (error) {
      console.error('Error saving foods:', error.message)
      return
    }
    setFoodLog([])
    setTotalCalories(0)
    setFoodItem('')
    props.setFoodLogChanged(true)
    getDates()
  }

  const handleInputChange = (e) => {
    setFoodItem(e.target.value)
  }

  const removeFoodItem = (indexToRemove) => {
    // Filter out the item at the specified index
    const newFoodLog = foodLog.filter((_item, index) => index !== indexToRemove)
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
    setSelectedDate(getTodayDate())
    checkLogin()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (userId) {
      getDates()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  useEffect(() => {
    const testSession = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession()

      if (session) {
        console.log('✅ Session exists!')
        console.log('Token:', session.access_token.substring(0, 30) + '...')

        const res = await fetch('http://localhost:5050/api/gpt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ foodItem: 'apple' })
        })

        const data = await res.json()
        console.log('Backend response:', data)
      } else {
        console.log('❌ No session - need to log in')
      }
    }

    testSession()
  }, [])

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
                        placeholder="Enter food item here"
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
                              {/* Display macros if available */}
                              {(item.protein || item.carbs || item.fat) && (
                                <div className="flex gap-3 mt-2 text-sm text-gray-600">
                                  <span>Protein {item.protein ? `${Math.round(item.protein)}g` : '—'}</span>
                                  <span>Carbs {item.carbs ? `${Math.round(item.carbs)}g` : '—'}</span>
                                  <span>Fat {item.fat ? `${Math.round(item.fat)}g` : '—'}</span>
                                </div>
                              )}
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
                        <option value={getTodayDate()}>Today</option>
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
                  <>
                    <div className="flex flex-col gap-2 items-center w-full">
                      {' '}
                      {message && <p className={`text-sm mt-2 ${message.startsWith('✅') ? 'text-green-600' : 'text-red-500'}`}>{message}</p>}
                      <button type="submit" className="block whitespace-nowrap w-[200px] h-10 rounded-lg bg-blue-500 hover:bg-blue-400 text-sm text-center font-medium text-white">
                        Check Calories w API
                      </button>
                      <button type="button" onClick={getGptEstimate} className="block whitespace-nowrap w-[200px] h-10 rounded-lg bg-purple-600 hover:bg-purple-500 text-sm text-center font-medium text-white">
                        Estimate with AI (3/day)
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
        </>
      )}
    </>
  )
}
