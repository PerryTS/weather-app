// Temperature formatting
export function formatTemp(temp: number): string {
  const rounded = Math.round(temp)
  return rounded + "°"
}

export function formatTempFull(temp: number): string {
  const rounded = Math.round(temp)
  return rounded + "°C"
}

// Wind speed formatting
export function formatWind(speed: number): string {
  const rounded = Math.round(speed)
  return rounded + " km/h"
}

// Humidity formatting
export function formatHumidity(humidity: number): string {
  const rounded = Math.round(humidity)
  return rounded + "%"
}

// Extract hour from ISO time string like "2024-01-15T14:00"
export function formatHour(isoTime: string): string {
  if (isoTime.length < 16) return ""
  const hour = isoTime.substring(11, 13)
  const h = parseInt(hour)
  if (h === 0) return "12am"
  if (h < 12) return h + "am"
  if (h === 12) return "12pm"
  return (h - 12) + "pm"
}

// Extract day name from ISO date string like "2024-01-15"
export function formatDayName(isoDate: string): string {
  // Simple day-of-week calculation using Zeller-like formula
  if (isoDate.length < 10) return ""
  const year = parseInt(isoDate.substring(0, 4))
  const month = parseInt(isoDate.substring(5, 7))
  const day = parseInt(isoDate.substring(8, 10))
  const dow = dayOfWeek(year, month, day)
  if (dow === 0) return "Sun"
  if (dow === 1) return "Mon"
  if (dow === 2) return "Tue"
  if (dow === 3) return "Wed"
  if (dow === 4) return "Thu"
  if (dow === 5) return "Fri"
  return "Sat"
}

// Tomohiko Sakamoto's algorithm for day of week (0=Sunday)
function dayOfWeek(y: number, m: number, d: number): number {
  // Month offset table
  const t0 = 0
  const t1 = 3
  const t2 = 2
  const t3 = 5
  const t4 = 0
  const t5 = 3
  const t6 = 5
  const t7 = 1
  const t8 = 4
  const t9 = 6
  const t10 = 2
  const t11 = 4
  let yy = y
  if (m < 3) yy = yy - 1
  let t = 0
  if (m === 1) t = t0
  else if (m === 2) t = t1
  else if (m === 3) t = t2
  else if (m === 4) t = t3
  else if (m === 5) t = t4
  else if (m === 6) t = t5
  else if (m === 7) t = t6
  else if (m === 8) t = t7
  else if (m === 9) t = t8
  else if (m === 10) t = t9
  else if (m === 11) t = t10
  else t = t11
  const result = (yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) + t + d) % 7
  return result
}

// Format date as "Mon, Jan 15"
export function formatDateFull(isoDate: string): string {
  if (isoDate.length < 10) return ""
  const dayName = formatDayName(isoDate)
  const month = parseInt(isoDate.substring(5, 7))
  const day = parseInt(isoDate.substring(8, 10))
  let monthName = ""
  if (month === 1) monthName = "Jan"
  else if (month === 2) monthName = "Feb"
  else if (month === 3) monthName = "Mar"
  else if (month === 4) monthName = "Apr"
  else if (month === 5) monthName = "May"
  else if (month === 6) monthName = "Jun"
  else if (month === 7) monthName = "Jul"
  else if (month === 8) monthName = "Aug"
  else if (month === 9) monthName = "Sep"
  else if (month === 10) monthName = "Oct"
  else if (month === 11) monthName = "Nov"
  else monthName = "Dec"
  return dayName + ", " + monthName + " " + day
}

// Integer to string with sign
export function formatTempSigned(temp: number): string {
  const rounded = Math.round(temp)
  if (rounded > 0) return "+" + rounded + "°"
  return rounded + "°"
}
