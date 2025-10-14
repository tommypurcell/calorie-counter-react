/* eslint-disable react/prop-types */

import React, { useState, useEffect } from 'react'
import FoodLog from '../components/ui/FoodLog'
import FoodInput from '../components/ui/FoodInput'

export default function Home() {
  const [foodLogChanged, setFoodLogChanged] = useState(false)

  useEffect(() => {
    // wake up backend
    let renderAPI = process.env.REACT_APP_API_BASE

    // wake up backend
    async function wakeUpBackend() {
      const res = await fetch(`${renderAPI}/health`)
      console.log('Status:', res.status)
      const text = await res.text() // or res.json() if you return JSON
      console.log('Response body:', text)
    }

    wakeUpBackend()
  }, [])

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      {/* Food input (left) */}
      <section>
        <FoodInput foodLogChanged={foodLogChanged} setFoodLogChanged={setFoodLogChanged} />
      </section>

      {/* Food log (right) */}
      <section>
        <FoodLog foodLogChanged={foodLogChanged} setFoodLogChanged={setFoodLogChanged} />
      </section>
    </div>
  )
}
