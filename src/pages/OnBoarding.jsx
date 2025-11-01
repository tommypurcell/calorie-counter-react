import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Onboarding() {
  const [age, setAge] = useState('')
  const [goal, setGoal] = useState('')
  const [gender, setGender] = useState('')
  const [inches, setInches] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [activity, setActivity] = useState('')
  const [results, setResults] = useState(null)
  const [heightUnit, setHeightUnit] = useState('ft') // cm or ft
  const [weightUnit, setWeightUnit] = useState('lb') // kg or lb

  // Convert height/weight to metric for calculations
  const toMetric = () => {
    let height_cm = Number(height)
    let weight_kg = Number(weight)
    let heightNum = Number(height)
    let inchesNum = Number(inches)

    let height_in = heightNum * 12 + inchesNum
    let height_ft = height_in / 12

    if (heightUnit === 'ft') height_cm = height_ft * 30.48
    if (weightUnit === 'lb') weight_kg = weight * 0.453592

    return { height_cm, weight_kg }
  }

  // Simple formulas
  const calcBMI = (w, h) => +(w / (h / 100) ** 2).toFixed(1)
  const calcBMR = (w, h, a, g) => {
    if (g === 'male') return +(10 * w + 6.25 * h - 5 * a + 5).toFixed(0)
    if (g === 'female') return +(10 * w + 6.25 * h - 5 * a - 161).toFixed(0)
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const { height_cm, weight_kg } = toMetric()
    const bmi = calcBMI(weight_kg, height_cm)
    const bmr = calcBMR(weight_kg, height_cm, Number(age), gender)

    // activity multipliers
    const activityMap = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    }
    const maintenance = bmr * (activityMap[activity] || 1.2)

    // goal adjustment
    let calorieGoal = maintenance
    if (goal === 'lose') calorieGoal *= 0.8
    if (goal === 'gain') calorieGoal *= 1.15
    calorieGoal = Math.round(calorieGoal)

    // macros (g)
    const protein = Math.round(weight_kg * 1.8)
    const fat = Math.round(weight_kg * 0.9)
    const carbCalories = calorieGoal - (protein * 4 + fat * 9)
    const carbs = Math.round(carbCalories / 4)

    const { data: auth } = await supabase.auth.getUser()
    const user = auth?.user
    if (!user) return alert('Please log in first')

    // Determine unit preference
    const unitPreference = weightUnit === 'kg' ? 'metric' : 'imperial'

    const { error } = await supabase
      .from('profiles')
      .update({
        age: Number(age),
        gender,
        height_cm,
        weight_kg,
        activity_level: activity,
        goal,
        bmi,
        bmr,
        calorieGoal,
        proteingoal: protein,
        carbgoal: carbs,
        fatgoal: fat,
        unit_preference: unitPreference
      })
      .eq('id', user.id)

    if (error) {
      console.error(error)
      alert('Error saving info')
    } else {
      setResults({
        bmi: bmi.toFixed(1),
        bmr: bmr.toFixed(0),
        calorieGoal,
        protein,
        carbs,
        fat
      })
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 text-center text-gray-700">Let’s personalize your plan</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="number" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} className="border p-2 rounded" />

        <select value={gender} onChange={(e) => setGender(e.target.value)} className="border p-2 rounded">
          <option value="">Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        <div className="flex gap-2">
          <input type="number" placeholder={heightUnit === 'ft' ? 'Feet' : 'Height'} value={height} onChange={(e) => setHeight(e.target.value)} className="border p-2 rounded w-full" />

          {heightUnit === 'ft' && <input type="number" placeholder="in" value={inches} onChange={(e) => setInches(e.target.value)} className="border p-2 rounded w-20" />}
          <select value={heightUnit} onChange={(e) => setHeightUnit(e.target.value)} className="border p-2 rounded">
            <option value="ft">ft</option>
            <option value="cm">cm</option>
          </select>
        </div>

        <div className="flex gap-2">
          <input type="number" placeholder="Weight" value={weight} onChange={(e) => setWeight(e.target.value)} className="border p-2 rounded w-full" />
          <select value={weightUnit} onChange={(e) => setWeightUnit(e.target.value)} className="border p-2 rounded">
            <option value="lb">lb</option>
            <option value="kg">kg</option>
          </select>
        </div>

        <select value={activity} onChange={(e) => setActivity(e.target.value)} className="border p-2 rounded">
          <option value="">Activity Level</option>
          <option value="sedentary">Sedentary (little or no exercise)</option>
          <option value="light">Light (1–3 days/week)</option>
          <option value="moderate">Moderate (3–5 days/week)</option>
          <option value="active">Active (6–7 days/week)</option>
          <option value="very_active">Very Active (twice/day or physical job)</option>
        </select>

        <select value={goal} onChange={(e) => setGoal(e.target.value)} className="border p-2 rounded">
          <option value="">Goal</option>
          <option value="lose">Lose Weight</option>
          <option value="maintain">Maintain</option>
          <option value="gain">Gain Weight</option>
        </select>

        <button type="submit" className="bg-green-500 hover:bg-green-600 text-white py-2 rounded">
          Save & Continue
        </button>
      </form>
      {results && (
        <div className="mt-6 text-center space-y-2">
          <h3 className="font-semibold text-lg text-gray-800">Your Personalized Plan</h3>
          <p className="text-gray-600">BMI: {results.bmi}</p>
          <p className="text-gray-600">BMR: {results.bmr} kcal/day</p>
          <p className="text-gray-700 font-medium mt-2">
            🎯 Daily Calorie Target: <span className="font-semibold">{results.calorieGoal}</span> kcal/day
          </p>
          <p className="text-sm text-gray-500 mt-1 italic">These are your daily macro goals:</p>

          <div className="grid grid-cols-3 mt-3 px-5">
            <div className="border-4 border-emerald-200 bg-emerald-50 rounded-full h-20 w-20 text-center flex-col place-self-center place-content-center">
              <div>Protein</div>
              <div className="font-semibold">{results.protein} g</div>
            </div>
            <div className="border-4 border-blue-200 bg-blue-50 rounded-full h-20 w-20 text-center flex-col place-self-center place-content-center">
              <div>Carbs</div>
              <div className="font-semibold">{results.carbs} g</div>
            </div>
            <div className="border-4 border-cyan-200 bg-cyan-50 rounded-full h-20 w-20 text-center flex-col place-self-center place-content-center">
              <div>Fat</div>
              <div className="font-semibold">{results.fat} g</div>
            </div>
          </div>

          <a href="/home" className="block mt-4 bg-sky-600 hover:bg-sky-700 text-white py-2 rounded-lg">
            Start Tracking
          </a>
        </div>
      )}
    </div>
  )
}
