/* eslint-disable react/prop-types */

import React from 'react'
import axios from 'axios'
import { useState, useEffect } from 'react'
import Nav from '../components/Nav'

axios.defaults.withCredentials = true
// trying this one using edamam instead of spoonacular
// https://developer.edamam.com/edamam-docs-nutrition-api

let render_url = 'https://calorie-counter-api-singapore.onrender.com'
let local_url = 'http://localhost:4000'

export default function CalorieCounter(props) {
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
          <main className="calorie-counter-container">
            <form onSubmit={getFoodData}>
              <span>Enter Food item</span>
              <div>
                <input type="text" value={foodItem} onChange={handleInputChange} />
                <button type="submit" className="submit-food">
                  Submit
                </button>
              </div>
            </form>
            <div className="foods-container">
              {foodLog.map((item, index) => (
                <div key={index}>
                  <article>
                    <p>Name: {item.name}</p>
                    <p>Calories: {item.calories} </p>
                    <div className="plus-minus">
                      <a className="action-button" onClick={() => subtractCalories(index, 10)}>
                        - 10
                      </a>
                      <a className="action-button shadow animate red" onClick={() => addCalories(index, 10)}>
                        + 10
                      </a>
                    </div>
                    <div className="plus-minus">
                      <a className="action-button" onClick={() => subtractCalories(index, 100)}>
                        - 100
                      </a>
                      <a className="action-button shadow animate red" onClick={() => addCalories(index, 100)}>
                        + 100
                      </a>
                    </div>
                    <button className="removeFood" onClick={() => removeFoodItem(index)}>
                      Remove
                    </button>
                  </article>
                </div>
              ))}
              <h2>Total Calories: {totalCalories}</h2>
            </div>
          </main>
        </>
      ) : (
        <>
          <main className="calorie-counter-container">
            <form onSubmit={getFoodData}>
              <span>Enter Food item</span>
              <div>
                <input type="text" value={foodItem} onChange={handleInputChange} />
                <button type="submit" className="submit-food">
                  Submit
                </button>
              </div>
            </form>
            <h2>
              Log foods eaten on{' '}
              <select className='"form-select form-select-lg mb-3"' value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}>
                <option value={today}>{formatDate(today)}</option>
                {dates.map((item, index) => (
                  <option key={index} value={item}>
                    {formatDate(item)}
                  </option>
                ))}
              </select>
            </h2>
            <div className="foods-container">
              {foodLog.map((item, index) => (
                <div key={index}>
                  <article>
                    <p>Name: {item.name}</p>
                    <p>Calories: {item.calories} </p>
                    <div className="plus-minus">
                      <a className="action-button" onClick={() => subtractCalories(index, 10)}>
                        - 10
                      </a>
                      <a className="action-button shadow animate red" onClick={() => addCalories(index, 10)}>
                        + 10
                      </a>
                    </div>
                    <div className="plus-minus">
                      <a className="action-button" onClick={() => subtractCalories(index, 100)}>
                        - 100
                      </a>
                      <a className="action-button shadow animate red" onClick={() => addCalories(index, 100)}>
                        + 100
                      </a>
                    </div>
                    <button className="removeFood" onClick={() => removeFoodItem(index)}>
                      Remove
                    </button>
                  </article>
                </div>
              ))}
            </div>
            <h2>Total Calories: {totalCalories}</h2>
            <button onClick={postFoodItems}>add to foodlog</button>
          </main>
        </>
      )}
    </>
  )
}
