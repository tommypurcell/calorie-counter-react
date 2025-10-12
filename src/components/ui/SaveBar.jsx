// src/components/ui/SaveBar.jsx
import React from 'react'

// Shows total + Save button
export default function SaveBar({ total, onSave, saving }) {
  return (
    <div className="flex gap-4 items-center justify-end border-t mt-4 pt-3">
      {total ? <div className="text-lg font-semibold">Total: {Math.round(total)} kcal</div> : null}

      <button className="bg-green-600 text-white text-sm px-4 py-2 rounded disabled:opacity-50" onClick={onSave} disabled={saving}>
        {saving ? 'Saving…' : 'Save to Log'}
      </button>
    </div>
  )
}
