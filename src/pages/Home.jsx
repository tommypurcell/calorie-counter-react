/* eslint-disable react/prop-types */

import React from 'react'
import axios from 'axios'
import Stats from './Stats'
import FoodLog from './FoodLog'
import Nav from '../components/Nav'
import { useState, useEffect } from 'react'
import CalorieCounter from './CalorieCounter'

import { Link } from 'react-router-dom'
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faCoffee, faPen } from '@fortawesome/free-solid-svg-icons'
let render_url = 'https://calorie-counter-api-portalversion.onrender.com'
let local_url = 'http://localhost:4000'
function Home(props) {
  const numberOfCards = 2
  const cards = [...new Array(numberOfCards)]

  const [foods, setFoods] = useState([])
  const [foodLogChanged, setFoodLogChanged] = useState(false)

  return (
    <div className="container mx-auto p-4">
      <div className="grid">
        <div className="row row-cols-1 row-cols-md-2 g-4">
          <div className="col">
            <Card setFoodLogChanged={setFoodLogChanged} />
          </div>
          <div className="col">
            <FoodLog loggedIn={props.loggedIn} foodLogChanged={foodLogChanged} setFoodLogChanged={setFoodLogChanged} />
          </div>
        </div>
      </div>
      <div className="flex justify-center h-20 mt-10 pt-10 border-t border-gray-100"></div>
    </div>
  )
}

export default Home

function Card({ setFoodLogChanged }) {
  return (
    <>
      <div className="card d-flex align-items-center">
        <div className="card-body text-center">
          <CalorieCounter setFoodLogChanged={setFoodLogChanged} />
        </div>
      </div>
    </>
  )
}
