// src/lib/foodUtils.js
// Tiny pure helpers. Return NEW arrays.
export function addCalories(list, id, amt = 10) {
  return list.map((it) => (it.id === id ? { ...it, calories: (Number(it.calories) || 0) + amt } : it))
}
export function subtractCalories(list, id, amt = 10) {
  return list.map((it) => (it.id === id ? { ...it, calories: Math.max(0, (Number(it.calories) || 0) - amt) } : it))
}
export function removeFood(list, id) {
  return list.filter((it) => it.id !== id)
}
