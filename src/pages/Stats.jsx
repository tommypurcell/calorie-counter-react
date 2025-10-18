// Stats.jsx
import React, { useEffect, useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts'
import { loadUserData } from '../lib/userUtils'
import Nav from '../components/Nav'
import Greeting from '../components/ui/Greeting'
import DailyCalories from '../components/DailyCalories'
import GoalProgress from '../components/GoalProgress'
import MacrosSummary from '../components/MacrosSummary'
import CaloriesChart from '../components/CaloriesChart'
import ExerciseSummary from '../components/ExerciseSummary'
import { getHistoryTotals } from '../lib/statsUtils'

export default function Stats() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [data, setData] = useState([]) // MUST start as empty array
  const [calorieGoal, setCalorieGoal] = useState(null)

  useEffect(() => {
    const init = async () => {
      const { user, history } = await getHistoryTotals()
      if (!user) return setIsLoggedIn(false)

      setData(history)
      setIsLoggedIn(true)
      console.log('data', data)
      setCalorieGoal(calorieGoal)
      console.log(calorieGoal)
    }
    init()
  }, [])

  if (!isLoggedIn)
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-xl font-bold text-gray-700">Please log in to view stats.</h1>
      </div>
    )

  return (
    <>
      <div className="flex flex-col items-center mt-6">
        <Greeting />
        <DailyCalories />
        <ExerciseSummary />
        <GoalProgress />
        <MacrosSummary />
        <CaloriesChart data={data} />
        {calorieGoal && <p className="text-sm text-gray-500 mb-2">Daily Goal: {calorieGoal} kcal</p>}
      </div>
    </>
  )
}
