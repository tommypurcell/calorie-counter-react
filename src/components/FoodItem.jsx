/* eslint-disable react/prop-types */

// ========================================
// Food Item Component
// ========================================
// Purpose:
// Displays a single food entry inside a day’s log (used in FoodDay.jsx).
// Each FoodItem shows the food name, calories, and macros (protein, carbs, fat).
//
// Styling:
// Alternates background color (white / gray) to visually separate rows.
//
//  Behavior:
// • Clicking “Edit” toggles editing mode for that food.
// • “+10” / “–10” buttons adjust calories immediately (optimistic update).
// • “Remove” deletes the food locally and in Supabase.
// • Calorie and deletion changes sync with the database via foodService.js.

import React from 'react'
import { updateCaloriesBy, deleteFood, updateFood } from '../lib/services/foodService'

export default function FoodItem({ food, day, dayIndex, foodIndex, editingId, setEditingId, foodLog, setFoodLog, getFoods }) {
  const isEditing = editingId === food.id

  // -----------------------------------------------
  // Handle +10 / -10 buttons (optimistic update)
  // -----------------------------------------------

  const addCalories = (delta) => {
    // 1. Copy the whole food log (so React sees a new version)
    let newLog = [...foodLog]

    // 2. Find the correct day
    let day = { ...newLog[dayIndex] }

    // 3. Get that day’s list of foods
    let foods = [...day.foods]

    // 4. Find the specific food we want to change
    let food = { ...foods[foodIndex] }

    // 5. Change the calories
    food.calories += delta

    // 6. Put the updated food back into the foods list
    foods[foodIndex] = food

    // 7. Put the updated foods back into the day
    day.foods = foods

    // 8. Put the updated day back into the food log
    newLog[dayIndex] = day

    // 9. Tell React we have a new version to show
    setFoodLog(newLog)
  }

  const subtractCalories = (delta) => {
    // 1. Copy the whole food log (so React sees a new version)
    let newLog = [...foodLog]

    // 2. Find the correct day
    let day = { ...newLog[dayIndex] }

    // 3. Get that day’s list of foods
    let foods = [...day.foods]

    // 4. Find the specific food we want to change
    let food = { ...foods[foodIndex] }

    // 5. Change the calories
    food.calories -= delta

    // 6. Put the updated food back into the foods list
    foods[foodIndex] = food

    // 7. Put the updated foods back into the day
    day.foods = foods

    // 8. Put the updated day back into the food log
    newLog[dayIndex] = day

    // 9. Tell React we have a new version to show
    setFoodLog(newLog)
  }

  const saveCalories = async () => {
    // 1. Make a copy of the full food log
    let newLog = [...foodLog]

    // 2. Find the correct day
    let day = { ...newLog[dayIndex] }

    // 3. Copy that day's foods
    let foods = [...day.foods]

    // 4. Find the food we just edited
    let updatedFood = { ...foods[foodIndex] }

    // 5. Replace it in the foods list
    foods[foodIndex] = updatedFood

    // 6. Put foods back into the day
    day.foods = foods

    // 7. Put day back into the food log
    newLog[dayIndex] = day

    // 9. Save to the database
    try {
      await updateFood(updatedFood.id, updatedFood)
      setEditingId(false) // exit edit mode
    } catch (err) {
      console.error('⚠️ Failed to save:', err.message)
    }
  }

  // ----------------------------------------
  // Handle delete button
  // ----------------------------------------
  const handleDelete = async () => {
    const id = food.id
    if (!id) return

    if (window.confirm(`Remove ${food.name}?`)) {
      try {
        await deleteFood(id)

        setFoodLog((prev) => {
          if (!Array.isArray(prev)) return prev
          const updated = prev.map((day, i) => (i === dayIndex ? { ...day, foods: day.foods.filter((f) => f.id !== id) } : day))
          return updated.filter((d) => d.foods.length > 0)
        })

        getFoods?.()
        if (editingId === id) setEditingId(null)
      } catch (err) {
        console.error('⚠️ Delete failed:', err.message)
      }
    }
  }

  // ----------------------------------------
  // UI
  // ----------------------------------------
  return (
    <div className={`flex flex-row gap-x-4 p-2 ${foodIndex % 2 === 0 ? 'bg-white' : 'bg-gray-100'}`}>
      <div className="flex flex-row justify-between w-full items-center">
        <p className="text-sm text-gray-800 font-normal w-64">{food.name}</p>

        <div className="flex flex-row gap-x-2 items-center">
          {!isEditing && (food.protein || food.carbs || food.fat) ? (
            <>
              <p className="hidden sm:block text-sm text-gray-500 font-semibold">Protein {Math.round(food.protein)}g</p>
              <p className="hidden sm:block text-sm text-gray-500 font-semibold">Carbs {Math.round(food.carbs)}g</p>
              <p className="hidden sm:block text-sm text-gray-500 font-semibold">Fat {Math.round(food.fat)}g</p>
            </>
          ) : null}

          <p className="text-xs sm:text-sm text-nowrap text-gray-700 font-semibold">{Math.round(food.calories)} cal</p>
        </div>
      </div>

      <div className="hidden sm:flex flex-row gap-2">
        {isEditing ? (
          <>
            <button className="border-1 border-blue-500 text-sm bg-blue-100 text-blue-500 hover:underline rounded w-10 h-8" onClick={() => addCalories(10)}>
              +10
            </button>
            <button className="border-1 border-blue-500 text-sm bg-blue-100 text-blue-500 hover:underline rounded w-10 h-8" onClick={() => subtractCalories(10)}>
              -10
            </button>
            <button className="text-red-500 text-sm hover:underline w-16 h-8" onClick={handleDelete}>
              Remove
            </button>
            <button className="text-blue-500 text-sm hover:underline w-16 h-8" onClick={saveCalories}>
              Save
            </button>
          </>
        ) : (
          <button className="text-blue-500 text-sm hover:underline w-16 h-8" onClick={() => setEditingId(food.id)}>
            Edit
          </button>
        )}
      </div>
    </div>
  )
}
