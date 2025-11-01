// Stats.jsx
import React, { useEffect, useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts'
import { loadUserData } from '../lib/userUtils'
import Nav from '../components/Nav'
import Footer from '../components/ui/Footer'
import Greeting from '../components/ui/Greeting'
import WeightLog from '../components/WeightLog'
import GoalProgress from '../components/GoalProgress'
import MacrosSummary from '../components/MacrosSummary'
import DailyCalories from '../components/DailyCalories'
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
      setCalorieGoal(calorieGoal)
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
    <div className="min-h-screen flex flex-col">
      <div className="mt-12">
        <Greeting />
      </div>

      {/* main content should flex-grow */}
      <div className="flex-grow items-center grid lg:grid-cols-4 gap-4 max-w-full lg:items-start mt-6 mx-20">
        <div className="lg:col-span-2 grid gap-3">
          <div className="flex flex-col lg:flex-row gap-1">
            <DailyCalories />
            <ExerciseSummary />
          </div>
          <div className="flex flex-col lg:flex-row gap-1">
            <MacrosSummary />
            <GoalProgress />
          </div>
        </div>

        <div className="lg:col-span-2 grid gap-3">
          <CaloriesChart data={data} />
          <WeightLog />
        </div>

        {calorieGoal && <p className="text-sm text-gray-500 mb-2">Daily Goal: {calorieGoal} kcal</p>}
      </div>

      <Footer className="mt-12" />
    </div>
  )
}
