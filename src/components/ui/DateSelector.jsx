import React from 'react'

export default function DateSelector({ value, onChange }) {
  function todayLocal() {
    const d = new Date()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  const today = todayLocal()
  const selected = value || today

  return (
    <div className="flex flex-row items-center justify-start gap-2 h-10">
      <div className="h-full">
        <select
          className="border text-sm text-center rounded h-8"
          value={selected === today ? 'today' : 'custom'}
          onChange={(e) => {
            if (e.target.value === 'today') onChange?.(today)
          }}
        >
          <option value="today">Today</option>
          <option value="custom">Pick date…</option>
        </select>
      </div>
      <div className="h-full">
        <input className="border text-sm rounded h-8" type="date" value={selected} max={today} onChange={(e) => onChange?.(e.target.value)} />
      </div>
    </div>
  )
}
