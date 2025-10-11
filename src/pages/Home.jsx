/* eslint-disable react/prop-types */

import React from 'react'
import axios from 'axios'
import Stats from './Stats'
import FoodLog from '../components/FoodLog'
import Nav from '../components/Nav'
import { useState, useEffect } from 'react'
import CalorieCounter from './CalorieCounter'
import FoodInput from '../components/FoodInput'

import { Link } from 'react-router-dom'

const render_url = process.env.REACT_APP_RENDER_USA_URL
const local_url = process.env.REACT_APP_LOCAL_URL

export default function Home(props) {
  const numberOfCards = 2
  const cards = [...new Array(numberOfCards)]

  const [foods, setFoods] = useState([])
  const [foodLogChanged, setFoodLogChanged] = useState(false)

  console.log('caloriegoal home', props.calorieGoal)

  return (
    <div className="w-full h-screen mt-16 flex flex-col lg:flex-row overflow-hidden">
      {/* FoodInput - scrollable on mobile, fixed height on desktop */}
      <div className="w-full lg:w-1/2 overflow-y-auto flex-shrink-0 lg:h-full">
        <FoodInput setFoodLogChanged={setFoodLogChanged} />
      </div>

      {/* FoodLog - scrollable on mobile and desktop */}
      <div className="w-full lg:w-1/2 overflow-y-auto flex-shrink-0 lg:h-full">
        <FoodLog loggedIn={props.loggedIn} foodLogChanged={foodLogChanged} setFoodLogChanged={setFoodLogChanged} calorieGoal={props.calorieGoal} />
      </div>
    </div>
  )
}
