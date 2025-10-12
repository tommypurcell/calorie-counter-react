// src/lib/services/edamamService.js
// Fetch calories + macros from Edamam, beginner-simple.

import axios from 'axios'

// Works for Vite (VITE_*) and CRA (REACT_APP_*)
const APP_ID = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_EDAMAM_APP_ID) || process.env.REACT_APP_EDAMAM_APPLICATION_ID

const APP_KEY = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_EDAMAM_APP_KEY) || process.env.REACT_APP_EDAMAM_APPLICATION_KEY

export async function getCaloriesFromEdamam(foodText) {
  // Always return the same shape
  const empty = { calories: 0, protein: null, carbs: null, fat: null }
  if (!foodText || !foodText.trim()) return empty

  // Quick sanity check so we fail loudly in dev
  if (!APP_ID || !APP_KEY) {
    console.warn('[Edamam] Missing APP_ID/APP_KEY. Check your .env variable names.')
    return empty
  }

  try {
    const { data } = await axios.get('https://api.edamam.com/api/nutrition-data', {
      params: {
        app_id: APP_ID,
        app_key: APP_KEY,
        ingr: foodText.trim() // e.g., "1 large apple" (quantity helps!)
      }
    })

    const tn = data?.totalNutrients || {}
    const out = {
      calories: Number(data?.calories || 0),
      protein: tn.PROCNT?.quantity ?? null, // g
      carbs: tn.CHOCDF?.quantity ?? null, // g
      fat: tn.FAT?.quantity ?? null // g
    }

    console.log(out)

    // Sanitize any weird numbers
    out.calories = Number.isFinite(out.calories) ? out.calories : 0
    if (typeof out.protein === 'number' && !Number.isFinite(out.protein)) out.protein = null
    if (typeof out.carbs === 'number' && !Number.isFinite(out.carbs)) out.carbs = null
    if (typeof out.fat === 'number' && !Number.isFinite(out.fat)) out.fat = null

    return out
  } catch (err) {
    console.warn('[Edamam] Request failed:', err?.message || err)
    return empty
  }
}

/** QUICK DEBUG (optional):
 * Paste in DevTools console after the app loads:
 *   import { getCaloriesFromEdamam } from '/src/lib/services/edamamService.js'
 *   getCaloriesFromEdamam('1 large apple').then(console.log)
 */
