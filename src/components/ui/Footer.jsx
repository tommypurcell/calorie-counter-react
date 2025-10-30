import React from 'react'
import { NavLink } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 text-sm py-6 px-4 mt-24 h-36">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
        <p className="text-center sm:text-left">© {new Date().getFullYear()} Calorie Counter</p>
        <div className="flex flex-col mt-10">
          <a href="/privacy" className="hover:text-white">
            Privacy
          </a>
          <a href="/terms" className="hover:text-white">
            Terms
          </a>
          <a href="/contact" className="hover:text-white">
            Contact
          </a>
        </div>
      </div>
    </footer>
  )
}
