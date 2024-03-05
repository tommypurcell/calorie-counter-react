import React from 'react'
import axios from 'axios'
import { useState, useEffect } from 'react'
import MealList from '../components/MealList'
import Nav from '../components/Nav'

export default function MealPlanGenerator() {
  const apiKey = 'b89406da93bd4b51a53e382ff1ab97c3'
  const [mealData, setMealData] = useState(null)
  const [calories, setCalories] = useState(2000)

  async function getMealData() {
    const response = await fetch(`https://api.spoonacular.com/mealplanner/generate?apiKey=${apiKey}&timeFrame=day&targetCalories=${calories}`)

    const data = await response.json()
    setMealData(data)
    console.log(data)
  }

  function handleChange(e) {
    setCalories(e.target.value)
  }

  return (
    <>
      <div className="App">
        <section className="controls">
          <input type="number" placeholder="Calories (e.g. 2000)" onChange={handleChange} />
          <button onClick={getMealData}>Get Daily Meal Plan</button>
        </section>
        {mealData && <MealList mealData={mealData} />}
      </div>
    </>
  )
}
