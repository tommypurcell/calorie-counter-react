// Simple helpers for unit conversion

// Convert kg to lb
export function kgToLb(kg) {
  return kg * 2.20462
}

// Convert lb to kg
export function lbToKg(lb) {
  return lb * 0.453592
}

// Convert cm to feet and inches
export function cmToFeetInches(cm) {
  const totalInches = cm / 2.54
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches % 12)
  return { feet, inches }
}

// Convert feet and inches to cm
export function feetInchesToCm(feet, inches) {
  const totalInches = feet * 12 + inches
  return totalInches * 2.54
}

// Format weight based on user preference
export function formatWeight(weightKg, unitPreference) {
  if (unitPreference === 'imperial') {
    return `${kgToLb(weightKg).toFixed(1)} lb`
  }
  return `${weightKg} kg`
}

// Format height based on user preference
export function formatHeight(heightCm, unitPreference) {
  if (unitPreference === 'imperial') {
    const { feet, inches } = cmToFeetInches(heightCm)
    return `${feet}' ${inches}"`
  }
  return `${heightCm} cm`
}
