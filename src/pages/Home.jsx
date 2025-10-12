/* eslint-disable react/prop-types */

import React, { useState, useEffect } from 'react'
import FoodLog from '../components/ui/FoodLog'
import FoodInput from '../components/ui/FoodInput'

export default function Home() {
  const [foodLogChanged, setFoodLogChanged] = useState(false)

  useEffect(() => {}, [])

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
