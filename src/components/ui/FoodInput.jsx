// src/components/ui/FoodInput.jsx
import React, { useState, useEffect } from 'react'

import SaveBar from './SaveBar'
import InputBox from './InputBox'
import DateSelector from './DateSelector'

import { Info } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { saveFoods } from '../../lib/services/foodService'
import { formatDate } from '../../lib/utils'
import { getGptEstimate } from '../../lib/services/gptService'
import { getCaloriesFromEdamam } from '../../lib/services/edamamService'
import { addCalories, subtractCalories, removeFood } from '../../lib/foodUtils'

// Simple, local-only state. No context, no reducers.
export default function FoodInput({ foodLogChanged, setFoodLogChanged }) {
  const [msg, setMsg] = useState('')
  const [foods, setFoods] = useState([]) // [{id,name,calories}]
  const [saving, setSaving] = useState(false)
  const [msgType, setMsgType] = useState('') // success | error
  const [dateStr, setDateStr] = useState(todayLocal())
  const [loading, setLoading] = useState(false)
  const [requests, setRequests] = useState(0)
  const [foodText, setFoodText] = useState('')
  const [messageIndex, setMessageIndex] = useState(0)

  const loadingMessages = ['Hold on…', 'Estimating your calories…', 'Almost there…', 'Thinking hard 🧠', 'Final touches…']

  useEffect(() => {
    if (!loading) return
    const timer = setInterval(() => {
      setMessageIndex((i) => (i + 1) % loadingMessages.length)
    }, 1800)
    return () => clearInterval(timer)
  }, [loading])

  async function handleAI() {
    setLoading(true)
    await addViaAI()
    setLoading(false)
  }

  function uid() {
    return Math.random().toString(36).slice(2, 9)
  }

  // add this tiny helper near the top of the file
  function todayLocal() {
    const d = new Date()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  async function checkRequests() {
    const {
      data: { user }
    } = await supabase.auth.getUser()
    if (!user) return
    const { data, error } = await supabase.from('api_usage').select('count').eq('user_id', user.id).single()
    if (!error && data) setRequests(data.count)
  }

  checkRequests()

  async function addViaAPI() {
    if (!foodText.trim()) {
      setMsg('Type a food first')
      setMsgType('error')
      return
    }
    setMsg('')
    setMsgType('')
    setLoading(true)
    try {
      const nutritionInfo = await getCaloriesFromEdamam(foodText.trim())
      if (!nutritionInfo) {
        setMsg('No calories found. Try AI.')
        setMsgType('error')
      } else {
        setFoods((list) => [...list, { id: uid(), name: foodText.trim(), calories: Math.round(nutritionInfo.calories), protein: Math.round(nutritionInfo.protein), carbs: Math.round(nutritionInfo.carbs), fat: Math.round(nutritionInfo.fat) }])
        setFoodText('')
        setMsg('Added from API')
        setMsgType('success')
      }
    } catch {
      setMsg('API error. Try again?')
      setMsgType('error')
    } finally {
      setLoading(false)
    }
  }

  async function addViaAI() {
    console.log('add via ai called')
    console.log(foodText)
    if (!foodText.trim()) {
      setMsg('Type a food first')
      setMsgType('error')
      return
    }

    setMsg('')
    setMsgType('')
    setLoading(true)

    try {
      // GPT returns an ARRAY: [{ name, calories, protein, carbs, fat }]
      const items = await getGptEstimate(foodText.trim())

      if (!Array.isArray(items) || items.length === 0) {
        setMsg('AI returned no items')
        setMsgType('error')
        return
      }

      // Normalize + add ids; keep macros if present
      const normalized = items.map((e) => ({
        id: uid(),
        name: e.name || foodText.trim(),
        calories: Math.max(0, Math.round(Number(e.calories) || 0)),
        protein: e.protein ?? null,
        carbs: e.carbs ?? null,
        fat: e.fat ?? null
      }))

      setFoods((list) => [...list, ...normalized])
      setFoodText('')
      setMsg(`AI added ${normalized.length} item(s)`)
      setMsgType('success')
    } catch (err) {
      setMsg('AI error. Use API instead?')
      setMsgType('error')
    } finally {
      setLoading(false)
    }
  }

  function inc(id) {
    setFoods((list) => addCalories(list, id, 10))
  }
  function dec(id) {
    setFoods((list) => subtractCalories(list, id, 10))
  }
  function remove(id) {
    setFoods((list) => removeFood(list, id))
  }

  const total = foods.reduce((s, f) => s + (Number(f.calories) || 0), 0)

  async function handleSave() {
    if (!foods.length) {
      setMsg('Add some foods first')
      setMsgType('error')
      return
    }
    setMsg('')
    setMsgType('')
    setSaving(true)
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser()
      if (!user) {
        setMsg('Please log in')
        setMsgType('error')
        setSaving(false)
        return
      }
      const err = await saveFoods(dateStr, foods, user.id)
      if (err) throw new Error(err)
      setFoods([])
      setFoodText('')
      setMsg(`Saved ${total} cal to ${formatDate(dateStr)}`)
      setMsgType('success')
      setFoodLogChanged(!foodLogChanged) // flip the flag
    } catch (e) {
      setMsg('Could not save. Try again.')
      setMsgType('error')
    } finally {
      setSaving(false)
    }
  }

  // ✅ Auto-dismiss success messages after 3s (keep errors visible)
  useEffect(() => {
    if (msgType !== 'success' || !msg) return
    const t = setTimeout(() => {
      setMsg('')
      setMsgType('')
    }, 3000) // 3 seconds feels right for “Added from API”
    return () => clearTimeout(t) // avoid overlapping timers
  }, [msg, msgType])

  return (
    <div className="max-w-xl mx-auto p-4 border rounded space-y-4">
      <h1 className="text-2xl font-bold">Add Food</h1>

      <InputBox value={foodText} onChange={setFoodText} onEnter={addViaAI} placeholder="Enter food item here" disabled={requests >= 5} />

      <div className="flex gap-2">
        {/* <button className="bg-black text-sm text-white px-4 rounded disabled:opacity-50 h-10" onClick={addViaAPI} disabled={loading}>
          {loading ? 'Loading…' : 'Check Calories (API)'}
        </button> */}
        <button className="border bg-gray-700 text-sm text-white px-4 rounded disabled:opacity-50 h-10" onClick={handleAI} disabled={loading}>
          {loading ? loadingMessages[messageIndex] : 'Estimate Calories'}
        </button>

        <div className="flex items-center gap-2">
          <div className="relative group">
            <Info className="h-6 w-6 text-gray-400 hover:text-gray-600 cursor-pointer" />
            <div className="absolute left-6 top-0 z-10 hidden group-hover:block w-64 rounded-md bg-white p-3 text-xs text-gray-700 shadow-lg border border-gray-200">
              <p className="font-semibold mb-1">Estimates are AI generated.</p>
              <p className="font-semibold mb-1">Tips for better accuracy:</p>
              <ul className="list-disc ml-4 space-y-1">
                <ul className="list-disc ml-4 space-y-1 text-sm">
                  <li>Be specific — include quantity (e.g. 1 plate, 5 oz, 200 g).</li>
                  <li>Include brand or restaurant (e.g. McDonald’s, KFC).</li>
                  <li>Add nutrition info if you know it (e.g. 150 kcal, 15g protein).</li>
                  <li>Example input: 4 oz cooked salmon fillet</li>
                </ul>
              </ul>
            </div>
          </div>
          <div className="text-sm text-gray-600 mt-2">
            {!requests ? null : 5 - requests > 0 ? (
              <p>{5 - requests} / 5 food estimates remaining today</p>
            ) : (
              <>
                <p className="text-red-500">You are out of requests today.</p>
                <a href="/pricing" className="text-blue-500 font-semibold underline underline-offset-2">
                  Get more!
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      {msg && <div className={`p-2 rounded ${msgType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{msg}</div>}

      {foods.length > 0 && (
        <>
          <ul className="space-y-2">
            {foods.map((item) => (
              <li key={item.id} className="flex items-center justify-between border rounded px-3 py-2">
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-600">{item.calories} kcal</div>
                </div>
                <div className="flex gap-2">
                  <button className="border px-2 py-1 rounded" onClick={() => dec(item.id)}>
                    -10
                  </button>
                  <button className="border px-2 py-1 rounded" onClick={() => inc(item.id)}>
                    +10
                  </button>
                  <button className="text-red-600 border px-2 py-1 rounded" onClick={() => remove(item.id)}>
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* Show date picker only after items exist */}
          <DateSelector value={dateStr} onChange={setDateStr} />

          {/* Simple next-steps reminder */}
          <div className="mt-2 text-sm bg-blue-50 text-blue-800 border border-blue-200 rounded px-3 py-2">
            Next step: pick a date above, then press <span className="font-semibold">Save to Log</span> below to add these items.
          </div>
        </>
      )}

      <SaveBar total={total} onSave={handleSave} saving={saving} />
    </div>
  )
}
