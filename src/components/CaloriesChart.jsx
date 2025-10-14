import React from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, ReferenceLine } from 'recharts'

export default function CaloriesChart({ data, calorieGoal }) {
  if (!data?.length) return <p className="text-gray-500 text-center">No data available.</p>

  // Format short labels like "Oct 13"
  const shortDate = (d) => {
    const [year, month, day] = d.split('-')
    const dateObj = new Date(`${month}/${day}/${year}`)
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const chartData = data.map((d) => ({
    ...d,
    goal: calorieGoal,
    dateFormatted: shortDate(d.date)
  }))

  return (
    <div className="w-full max-w-xl mx-auto bg-white border border-gray-200 rounded-xl shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-600 mb-3 text-center">Calories per Day</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={chartData}
          barCategoryGap="38%" // ⬅ removes space between each bar group
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="dateFormatted" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
            contentStyle={{
              background: 'white',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              fontSize: '12px'
            }}
            formatter={(v) => [`${v} kcal`, 'Calories']}
            labelFormatter={(label) => `Date: ${label}`}
          />

          <Bar dataKey="calories" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell
                key={`cell-${i}`}
                fill={entry.calories > calorieGoal ? '#ef4444' : '#22c55e'} // red-500 / green-500
              />
            ))}
          </Bar>
          {/* Optional dashed goal line */}
          <ReferenceLine
            y={calorieGoal}
            stroke="rgb(156 163 175)"
            strokeDasharray="4 4"
            label={{
              value: 'Goal',
              position: 'insideBottomRight',
              fill: 'rgb(75 85 99)',
              fontSize: 12
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
