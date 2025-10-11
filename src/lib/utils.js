// lib/utils.js
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString) {
  if (!dateString) return ''

  // Split the plain date (YYYY-MM-DD) into parts
  const [year, month, day] = dateString.split('-')

  // Create a local date (no UTC conversion)
  const d = new Date(`${month}/${day}/${year}`)

  // Format it in a human-readable way
  const weekday = d.toLocaleDateString('en-US', { weekday: 'short' })
  const monthName = d.toLocaleDateString('en-US', { month: 'short' })
  const dayNum = d.getDate()
  const yearNum = d.getFullYear()

  return `${weekday} ${monthName} ${dayNum}, ${yearNum}`
}

export function groupFoodsByDate(rows) {
  const grouped = {}
  rows.forEach((row) => {
    const dateKey = row.eaten_at.split('T')[0]
    if (!grouped[dateKey]) {
      grouped[dateKey] = { date: dateKey, foods: [], totalCalories: 0 }
    }
    grouped[dateKey].foods.push(row)
    grouped[dateKey].totalCalories += row.calories || 0
  })
  return Object.values(grouped).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
