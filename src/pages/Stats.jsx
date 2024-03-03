import { useEffect, useState } from 'react'
import React from 'react'
import axios from 'axios'
import Nav from '../components/Nav'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const render_url = 'https://calorie-counter-api-portalversion.onrender.com'
const local_url = 'http://localhost:4000'

export default function Stats() {
  // state variable
  const [foodData, setFoodData] = useState([])
  const [data, setData] = useState([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)

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
      }
    } catch (err) {
      console.error('Error fetching profile:', err.message)
    }
  }

  // get calorie data
  const getCalories = async () => {
    let calories = await axios.get(`${render_url}/foods`)
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
    checkLogin()
    getCalories()
  }, [])

  return (
    <>
      {isLoggedIn ? (
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
