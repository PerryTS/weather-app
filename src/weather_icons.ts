// WMO Weather interpretation codes (WW)
// Maps weather code to emoji icon and description
// Using emoji for Phase 1 (replaced with proper icons in Phase 4)

export function weatherIcon(code: number): string {
  // Clear sky
  if (code === 0) return "☀️"
  // Mainly clear
  if (code === 1) return "🌤"
  // Partly cloudy
  if (code === 2) return "⛅"
  // Overcast
  if (code === 3) return "☁️"
  // Fog
  if (code === 45) return "🌫"
  if (code === 48) return "🌫"
  // Drizzle
  if (code === 51) return "🌦"
  if (code === 53) return "🌦"
  if (code === 55) return "🌦"
  // Freezing drizzle
  if (code === 56) return "🌧"
  if (code === 57) return "🌧"
  // Rain
  if (code === 61) return "🌧"
  if (code === 63) return "🌧"
  if (code === 65) return "🌧"
  // Freezing rain
  if (code === 66) return "🌧"
  if (code === 67) return "🌧"
  // Snow
  if (code === 71) return "❄️"
  if (code === 73) return "❄️"
  if (code === 75) return "❄️"
  // Snow grains
  if (code === 77) return "❄️"
  // Rain showers
  if (code === 80) return "🌦"
  if (code === 81) return "🌧"
  if (code === 82) return "🌧"
  // Snow showers
  if (code === 85) return "🌨"
  if (code === 86) return "🌨"
  // Thunderstorm
  if (code === 95) return "⛈"
  if (code === 96) return "⛈"
  if (code === 99) return "⛈"
  return "🌡"
}

export function weatherDescription(code: number): string {
  if (code === 0) return "Clear sky"
  if (code === 1) return "Mainly clear"
  if (code === 2) return "Partly cloudy"
  if (code === 3) return "Overcast"
  if (code === 45) return "Fog"
  if (code === 48) return "Depositing rime fog"
  if (code === 51) return "Light drizzle"
  if (code === 53) return "Moderate drizzle"
  if (code === 55) return "Dense drizzle"
  if (code === 56) return "Light freezing drizzle"
  if (code === 57) return "Dense freezing drizzle"
  if (code === 61) return "Slight rain"
  if (code === 63) return "Moderate rain"
  if (code === 65) return "Heavy rain"
  if (code === 66) return "Light freezing rain"
  if (code === 67) return "Heavy freezing rain"
  if (code === 71) return "Slight snow"
  if (code === 73) return "Moderate snow"
  if (code === 75) return "Heavy snow"
  if (code === 77) return "Snow grains"
  if (code === 80) return "Slight rain showers"
  if (code === 81) return "Moderate rain showers"
  if (code === 82) return "Violent rain showers"
  if (code === 85) return "Slight snow showers"
  if (code === 86) return "Heavy snow showers"
  if (code === 95) return "Thunderstorm"
  if (code === 96) return "Thunderstorm with slight hail"
  if (code === 99) return "Thunderstorm with heavy hail"
  return "Unknown"
}

// Weather category for background gradient selection
export function weatherCategory(code: number): string {
  if (code === 0) return "clear"
  if (code === 1) return "clear"
  if (code === 2) return "cloudy"
  if (code === 3) return "cloudy"
  if (code === 45) return "cloudy"
  if (code === 48) return "cloudy"
  if (code >= 51 && code <= 67) return "rain"
  if (code >= 71 && code <= 77) return "snow"
  if (code >= 80 && code <= 82) return "rain"
  if (code >= 85 && code <= 86) return "snow"
  if (code >= 95) return "rain"
  return "clear"
}
