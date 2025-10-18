// src/components/ui/InputBox.jsx
import React, { useState, useEffect } from 'react'

// Controlled input with optional "press Enter to submit"
export default function InputBox({ name, value, onChange, onEnter, placeholder }) {
  const [text, setText] = useState(value || '')
  useEffect(() => {
    setText(value || '')
  }, [value])

  return (
    <input
      name={name}
      className="w-full border rounded px-3 py-2"
      type="text"
      value={text}
      placeholder={placeholder}
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
