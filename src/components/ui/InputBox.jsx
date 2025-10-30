// src/components/ui/InputBox.jsx
import React, { useState, useEffect } from 'react'

// Controlled input with optional "press Enter to submit"
export default function InputBox({ name, value, onChange, onEnter, placeholder, disabled }) {
  const [text, setText] = useState(value || '')

  useEffect(() => {
    setText(value || '')
  }, [value])

  return (
    <input
      name={name}
      className="w-full border rounded px-3 py-2 disabled:bg-red-700 disabled:text-white disabled:hover:cursor-not-allowed"
      type="text"
      value={text}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(e) => {
        setText(e.target.value)
        onChange?.(e.target.value)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onEnter?.()
      }}
    />
  )
}
