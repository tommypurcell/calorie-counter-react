/* eslint-disable react/prop-types */

import React from 'react'
import axios from 'axios'
import { Params } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Nav from '../components/Nav'
import { check } from 'prettier'
import { Link } from 'react-router-dom'
axios.defaults.withCredentials = true

let render_url = 'https://calorie-counter-api-singapore.onrender.com'
let local_url = 'http://localhost:4000'

// ***************
// TODO
// create user login and authentication
// ***************

export default function FoodLog(props) {
  const applicationKey = '8803e138817c6dd9b43f6f0dcc52b9f1'
  const applicationID = '7b70e049'
  const [foodLog, setFoodLog] = useState([])
  const [date, setDate] = useState('')

  console.log(props.loggedIn)
  console.log(props.foodLogChanged)

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
    const response = await axios.get(`${render_url}/foods`, {
      withCredentials: true
    })
    setFoodLog(response.data)
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
      {props.loggedIn ? (
        <main className="food-log-container">
          <h1>This is the food log</h1>
          <button onClick={(e) => getFoods(e)}>Get Foods</button>
          <div>
            <div className="day-of-food">
              {typeof foodLog === 'object' && foodLog.length > 0 ? (
                // Render foodLog if it exists and is not empty
                foodLog.map((day, dayIndex) => (
                  <div key={dayIndex}>
                    <h3>Date: {day.date}</h3>
                    <section className="food-log-item">
                      {day.foods.map((food, foodIndex) => (
                        <div key={foodIndex}>
                          <p>Food: {food.name}</p>
                          <p>Calories: {food.calories}</p>
                          <div className="food-log-buttons">
                            <button className="removeFood" onClick={() => deleteFoodItem(dayIndex, foodIndex)}>
                              Remove
                            </button>
                            <button onClick={() => addCalories(dayIndex, foodIndex)}>+10</button>
                            <button onClick={() => subtractCalories(dayIndex, foodIndex)}>-10</button>
                          </div>
                        </div>
                      ))}
                      <h2>Total Calories: {day.totalCalories}</h2>
                    </section>
                  </div>
                ))
              ) : (
                // Render a message if foodLog is empty or not defined
                <div>
                  <p>Your food log is currently empty because you have not logged any food.</p>

                  <Link to="/calorie-counter" className="m-2 w-100 text-center nav-button">
                    Click here to start logging food!
                  </Link>
                </div>
              )}
            </div>
          </div>
        </main>
      ) : (
        <div className="d-flex justify-content-center align-items-center">
          <h1>Please log in to view foodlog.</h1>
        </div>
      )}
    </>
  )
}
