/* eslint-disable react/prop-types */

import React from 'react'
import axios from 'axios'
import Stats from './Stats'
import FoodLog from '../components/FoodLog'
import Nav from '../components/Nav'
import { useState, useEffect } from 'react'
import CalorieCounter from './CalorieCounter'
import FoodInput from '../components/FoodInput'
import { useNavigate } from 'react-router-dom'

import { Link } from 'react-router-dom'

const render_url = process.env.REACT_APP_RENDER_USA_URL
const local_url = process.env.REACT_APP_LOCAL_URL

export default function Home(props) {
  const numberOfCards = 2
  const cards = [...new Array(numberOfCards)]
  const navigate = useNavigate()

  const [foods, setFoods] = useState([])
  const [foodLogChanged, setFoodLogChanged] = useState(false)

  console.log('caloriegoal home', props.calorieGoal)
  const checkCalGoal = (calorieGoal) => {
    if (!calorieGoal) {
      navigate('/login')
    }
  }

  useEffect(() => {
    checkCalGoal(props.calorieGoal)
  }),
    []
  return (
    <div className="p-4 w-full h-screen">
      <div className="grid">
        <div className="pt-10 row row-cols-1 row-cols-md-2 g-2">
          <div className="col">
            <FoodInput setFoodLogChanged={setFoodLogChanged} />
          </div>
          <div className="col h-screen">
            <FoodLog loggedIn={props.loggedIn} foodLogChanged={foodLogChanged} setFoodLogChanged={setFoodLogChanged} calorieGoal={props.calorieGoal} />
          </div>
        </div>
      </div>
    </div>
  )
}
