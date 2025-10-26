/* eslint-disable react/prop-types */
import React, { useState } from 'react'
import { formatDate } from '../lib/utils'
import FoodItem from './FoodItem'

export default function FoodDay({ day, dayIndex, calorieGoal, foodLog, setFoodLog, updateCaloriesBy, deleteFood, getFoods }) {
  const [editingId, setEditingId] = useState(null)

  return (
    <details className="group mb-2">
      <summary className="flex cursor-pointer items-center justify-between bg-gray-200 px-2 py-2 rounded-xl group-open:rounded-b-none w-full min-w-[350px] lg:min-w-[620px]">
        <h3 className="text-gray-700 font-bold text-sm">{formatDate(day.date)}</h3>
        <span className="shrink-0 transition duration-300 group-open:-rotate-180">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </span>
      </summary>

      <section className="bg-white my-0 rounded-b-xl">
        {day.foods.map((food, foodIndex) => (
          <FoodItem
            key={food.id}
            food={food}
            day={day}
            dayIndex={dayIndex}
            foodIndex={foodIndex}
            editingId={editingId}
            setEditingId={setEditingId}
            foodLog={foodLog}
            setFoodLog={setFoodLog}
            updateCaloriesBy={updateCaloriesBy}
            deleteFood={deleteFood}
            getFoods={getFoods}
          />
        ))}

        <h2 className={`font-thin text-sm text-white ${day.totalCalories > calorieGoal ? 'bg-red-700' : 'bg-green-700'} px-2 rounded-b-xl`}>{day.totalCalories} total calories for the day</h2>
      </section>
    </details>
  )
}
