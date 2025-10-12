import React from 'react'

export default function FoodItemCard({ item, onBump, onRemove }) {
  const bump = (delta) => onBump(delta)

  return (
    <article className="bg-gray-50 py-3 border-b">
      <div className="flex flex-col items-start">
        <p className="text-3xl">{item.calories} Calories</p>
        <p className="text-gray-600">{item.name}</p>
        {(item.protein || item.carbs || item.fat) && (
          <div className="flex gap-3 mt-2 text-sm text-gray-600">
            {item.protein && <span>Protein {Math.round(item.protein)}g</span>}
            {item.carbs && <span>Carbs {Math.round(item.carbs)}g</span>}
            {item.fat && <span>Fat {Math.round(item.fat)}g</span>}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4">
        {[-10, +10, -100, +100].map((val) => (
          <button key={val} type="button" onClick={() => bump(val)} className="rounded-lg text-sm border-2 border-blue-700 text-gray-900 p-2 font-semibold hover:border-blue-200 hover:bg-blue-100 transition">
            {val > 0 ? `+${val}` : val}
          </button>
        ))}
      </div>

      <button onClick={onRemove} className="bg-red-500 hover:bg-red-600 text-white rounded py-2 w-full mt-4">
        Remove
      </button>
    </article>
  )
}
