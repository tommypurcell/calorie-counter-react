/* eslint-disable react/prop-types */

import { useEffect, useState } from 'react'
import React from 'react'
import axios from 'axios'
import Nav from '../components/Nav'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, ReferenceLine, CartesianGrid } from 'recharts'

const render_url = 'https://calorie-counter-api-portalversion.onrender.com'
const local_url = 'http://localhost:4000'

export default function Stats(props) {
  // state variable
  const [foodData, setFoodData] = useState([])
  const [data, setData] = useState([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // get calorie data
  const getCalories = async () => {
    let calories = await axios.get(`${local_url}/foods`)
    setFoodData(calories.data)

    // create data array
    let dataArr = []
    for (let i = 0; i < calories.data.length; i++) {
      dataArr.push({
        date: calories.data[i].date,
        calories: calories.data[i].totalCalories
      })
    }
    // sort data by date
    // sort data array by date
    dataArr.sort((a, b) => new Date(a.date) - new Date(b.date))

    setData(dataArr)
  }

  useEffect(() => {
    getCalories()
  }, [])

  return (
    <>
      {props.loggedIn ? (
        <>
          <p className="text-center">Stats Page</p>
          <div className="d-flex justify-content-center">
            {data.length > 0 ? (
              <div style={{ width: '100%', maxWidth: '600px', margin: 'auto' }}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="calories" fill="#2c3333" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p>No data available.</p>
            )}
          </div>
        </>
      ) : (
        <div className="d-flex justify-content-center align-items-center">
          <h1>Please log in to view stats.</h1>
        </div>
      )}
    </>
  )
}
