/* eslint-disable react/prop-types */

import React from 'react'
import axios from 'axios'
import { useState, useEffect } from 'react'
import Nav from '../components/Nav'

axios.defaults.withCredentials = true
// Docs for edamam api
// https://developer.edamam.com/edamam-docs-nutrition-api

const render_url = process.env.REACT_APP_RENDER_USA_URL
const local_url = process.env.REACT_APP_LOCAL_URL

export default function FoodInput(props) {
  const applicationKey = '21bface20dc29be8fe5d8bcd08d14d33'
  const applicationID = '2dafcce0'
  const [foodItem, setFoodItem] = useState('')
  const [foodLog, setFoodLog] = useState([])
  const [totalCalories, setTotalCalories] = useState(0)
  const [selectedDate, setSelectedDate] = useState(``)
  const [dates, setDates] = useState([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userId, setUserId] = useState('')

  // check if user is logged in
  const checkLogin = async () => {
    console.log('checking login...')
    try {
      let login = await axios.get(`${render_url}/profile`, {
        withCredentials: true,
        validateStatus: function (status) {
          return status >= 200 && status < 500 // default is to resolve only on 2xx, this allows 401
        }
      })
      if (login.data == 'User not logged in') {
        console.log('user not logged in')
        setIsLoggedIn(false)
      } else {
        setIsLoggedIn(true)
        setUserId(login._id)
      }
    } catch (err) {
      console.error('Error fetching profile:', err.message)
    }
  }

  // set up date object
  const date = new Date()
  let day = date.getDate()
  let month = date.getMonth() + 1
  let year = date.getFullYear()

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
      const response = await axios.post(
        `${render_url}/gpt-nutrition`,
        {
          foodItem: foodItem // Submitting the food item to the GPT route
        },
        { withCredentials: true }
      )

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

  // format selected date
  const formatDate = (date) => {
    if (date) {
      let newDate = date.split('-')
      let year = newDate[0]
      let month = newDate[1]
      let day = newDate[2]
      return `${month}/${day}/${year}`
    } else {
      return null
    }
  }

  // get dates from database and set state
  const getDates = async () => {
    let datesArr = []
    const response = await axios.get(`${render_url}/foods`)
    for (let item of response.data) {
      datesArr.push(item.date)
    }
    setDates(datesArr)
  }

  // post food item to database
  const postFoodItems = async () => {
    for (let item of foodLog) {
      const response = await axios.post(`${render_url}/foods`, {
        userId: userId,
        name: item.name,
        calories: item.calories,
        date: selectedDate,
        timestamp: Date.now()
      })
    }
    setFoodLog([])
    setTotalCalories(0)
    props.setFoodLogChanged(true)
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
    getDates()
    checkLogin()
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
                        <option value={today}>{formatDate(today)}</option>
                        {dates.map((item, index) => (
                          <option key={index} value={item}>
                            {formatDate(item)}
                          </option>
                        ))}
                      </select>
                    </h2>
                    {/* type button so it doesnt submit the form again */}
                    <button onClick={postFoodItems} type="button" className="block w-full rounded-lg bg-blue-500 hover:bg-blue-400 text-white px-5 py-3 text-sm font-medium  select-none">
                      Submit to food log
                    </button>
                  </>
                ) : (
                  <div className="flex flex-row gap-2">
                    {' '}
                    <button type="submit" className="block whitespace-nowrap w-full rounded-lg bg-blue-500 hover:bg-blue-400 px-5 py-3 text-sm font-medium text-white">
                      Check Calories w API
                    </button>
                    <button onClick={getGptEstimate} type="button" className="block w-full rounded-lg bg-blue-500 hover:bg-blue-400 px-5 py-3 text-sm font-medium text-white">
                      Check Cal w AI
                    </button>
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
