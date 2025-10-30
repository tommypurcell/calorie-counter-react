// src/pages/Pricing.jsx
import React from 'react'
import { Link } from 'react-router-dom'

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">Pricing Plans</h1>

      <div className=" mx-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free Plan */}
        <div className="bg-white grid items-center border rounded-lg shadow-sm p-6 text-center">
          <h2 className="text-2xl font-semibold mb-2">FREE</h2>
          <p className="text-5xl font-bold mb-1">$0</p>
          <p className="text-gray-500 mb-6">per user / month</p>

          <h3 className="text-red-600 font-semibold mb-2">Limitations</h3>
          <ul className="text-gray-700 text-sm mb-4 space-y-1">
            <li>Up to 5 AI estimates per day</li>
            <li>No saved meal templates</li>
          </ul>

          <div className="flex flex-col items-center">
            {' '}
            <h3 className="text-gray-800 font-semibold mb-2">All Features</h3>
            <ul className="text-gray-700 text-sm space-y-1 mb-6 flex flex-col items-start">
              <li>✅ Macro Goals</li>
              <li>✅ Daily Food Log</li>
              <li>✅ AI Calorie Estimator</li>
              <li>✅ BMI & BMR Tracking</li>
            </ul>
          </div>

          <Link to="/checkout?plan=free" className="place-self-center bg-gray-200 hover:bg-gray-300 text-black w-60 text-nowrap px-5 py-2 rounded font-semibold inline-block">
            Current Plan
          </Link>
        </div>

        {/* Pro Plan */}
        <div className="bg-white border-2 grid items-center border-green-500 rounded-lg shadow-md p-6 text-center">
          <h2 className="text-2xl font-semibold mb-2 text-green-600">PRO</h2>
          <p className="text-5xl font-bold mb-1">$3</p>
          <p className="text-gray-500 mb-6">per user / month</p>

          <h3 className="text-green-600 font-semibold mb-2">Pro Features</h3>
          <ul className="text-gray-700 text-sm mb-4 space-y-1">
            <li>Unlimited AI estimates</li>
            <li>Custom meal templates</li>
          </ul>

          <div className="flex flex-col items-center">
            {' '}
            <h3 className="text-gray-800 font-semibold mb-2">All Features</h3>
            <ul className="text-gray-700 text-sm space-y-1 mb-6 flex flex-col items-start">
              <li>✅ Macro Goals</li>
              <li>✅ Daily Food Log</li>
              <li>✅ AI Calorie Estimator</li>
              <li>✅ BMI & BMR Tracking</li>
            </ul>
          </div>

          <Link to="/checkout?plan=pro" className="bg-green-600 place-self-center hover:bg-green-700 text-white w-60 text-nowrap px-5 py-2 rounded font-semibold inline-block">
            Upgrade to Pro
          </Link>
        </div>

        {/* Enterprise Plan */}
        <div className="hidden bg-white  items-center border rounded-lg shadow-sm p-6 text-center">
          <h2 className="text-2xl font-semibold mb-2 text-blue-600">ENTERPRISE</h2>
          <p className="text-5xl font-bold mb-1">$15</p>
          <p className="text-gray-500 mb-6">per user / month</p>

          <h3 className="text-blue-600 font-semibold mb-2">Enterprise Features</h3>
          <ul className="text-gray-700 text-sm mb-4 space-y-1">
            <li>Dedicated support</li>
            <li>Custom branding</li>
          </ul>

          <div className="flex flex-col items-center">
            {' '}
            <h3 className="text-gray-800 font-semibold mb-2">All Features</h3>
            <ul className="text-gray-700 text-sm space-y-1 mb-6 flex flex-col items-start">
              <li>✅ Macro Goals</li>
              <li>✅ Daily Food Log</li>
              <li>✅ AI Calorie Estimator</li>
              <li>✅ BMI & BMR Tracking</li>
            </ul>
          </div>

          <Link to="/contact" className="bg-blue-600 place-self-center hover:bg-blue-700 text-white w-60 text-nowrap px-5 py-2 rounded font-semibold inline-block">
            Contact Sales
          </Link>
        </div>
      </div>
    </div>
  )
}
