// Sky gradient colors by weather condition
// Color values are defined inline in each platform's main file
// to work around Perry's cross-module export const limitation.

// Returns true if the weather condition needs light text (dark background)
export function needsLightText(category: string): boolean {
  if (category === "clear") return true
  if (category === "rain") return true
  return false
}
