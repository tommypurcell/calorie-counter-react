// lib/utils.js
import { clsx } from 'clsx'
import { Lectern } from 'lucide-react'
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

export function getToday() {
  let myDate = new Date()

  const year = myDate.getFullYear()
  const month = String(myDate.getMonth() + 1).padStart(2, '0')
  const day = String(myDate.getDate()).padStart(2, '0')
  const hours = String(myDate.getHours()).padStart(2, '0')
  const minutes = String(myDate.getMinutes()).padStart(2, '0')
  const seconds = String(myDate.getSeconds()).padStart(2, '0')

  return {
    year,
    month,
    day,
    hours,
    minutes,
    seconds,
    formatted: `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`,
    shortDate: `${year}-${month}-${day}`
  }
}

export function getMonthAndDayOnly(date) {
  if (!date) return ''

  const [_, month, dayRaw] = date.split('-')

  const months = {
    ['01']: 'Jan',
    ['02']: 'Feb',
    ['03']: 'Mar',
    ['04']: 'Apr',
    ['05']: 'May',
    ['06']: 'Jun',
    ['07']: 'Jul',
    ['08']: 'Aug',
    ['09']: 'Sep',
    ['10']: 'Oct',
    ['11']: 'Nov',
    ['12']: 'Dec'
  }

  // Remove leading zero on day (e.g., "05" → "5")
  const day = dayRaw.startsWith('0') ? dayRaw.substring(1) : dayRaw

  return `${months[month]} ${day}`
}
