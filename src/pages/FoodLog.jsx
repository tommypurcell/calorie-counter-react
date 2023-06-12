import React from 'react'
import axios from 'axios'
import { Params } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Nav from '../components/Nav'

export default function CalorieCounter() {
  const applicationKey = '8803e138817c6dd9b43f6f0dcc52b9f1'
  const applicationID = '7b70e049'
  const [foodItem, setFoodItem] = useState('')
  const [foodLog, setFoodLog] = useState([])
  const [totalCalories, setTotalCalories] = useState(0)
  const [date, setDate] = useState('')

  // format date
  const formatDate = (date) => {
    let newDate = date.split('T')[0].split('-')
    let year = newDate[0]
    let month = newDate[1]
    let day = newDate[2]
    setDate(`${month}/${day}/${year}`)
  }

  // get food data from database and set state
  const getFoods = async () => {
    const response = await axios.get('http://localhost:4000/foods')
    setFoodLog(response.data)
    console.log(response.data)
  }

  // delete food item from database
  const deleteFoodItem = async (dayIndex, foodIndex) => {
    const idToDelete = foodLog[dayIndex].foods[foodIndex]._id
    await axios.delete(`http://localhost:4000/foods/${idToDelete}`)
    getFoods()
  }

  const calculateCalories = () => {
    let total = 0
    setTotalCalories(total)
  }

  const showObject = () => {
    let display = ''
    for (let key in foodLog) {
      display += `${key}: ${foodLog[key]}`
    }
    return display
  }

  useEffect(() => {
    calculateCalories()
  }, [foodLog])

  useEffect(() => {
    getFoods()
  }, [])

  return (
    <>
      <Nav />
      <main className="food-log-container">
        <h1>This is the food log</h1>
        <button onClick={(e) => getFoods(e)}>Get Foods</button>
        <div>
          <div className="day-of-food">
            {foodLog.map((day, dayIndex) => (
              <div key={dayIndex}>
                <h3>Date: {day.date}</h3>
                <section className="food-log-item">
                  {day.foods.map((food, foodIndex) => (
                    <div key={foodIndex}>
                      <p>Food: {food.name}</p>
                      <p>Calories: {food.calories}</p>
                      <div className="food-log-buttons">
                        <button
                          className="removeFood"
                          onClick={() => deleteFoodItem(dayIndex, foodIndex)}
                        >
                          Remove
                        </button>
                        <button>+10</button>
                        <button>-10</button>
                      </div>
                    </div>
                  ))}
                </section>
              </div>
            ))}
            <h2>Total Calories: {totalCalories}</h2>
          </div>
        </div>
      </main>
    </>
  )
}