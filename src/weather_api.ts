// Open-Meteo Weather API client
// Free API, no key required
import { fetchText } from "node-fetch"

// State — populated by fetchWeather, read by UI modules via getter functions
// (Perry limitation: export let/const don't generate cross-module symbols)
let currentTemp = 0
let currentHumidity = 0
let currentWindSpeed = 0
let currentWeatherCode = 0
let feelsLike = 0

// Hourly data (parallel arrays, up to 24 entries)
let hourlyTemps: number[] = JSON.parse('[]')
let hourlyTimes: string[] = JSON.parse('[]')

// Daily forecast (parallel arrays, 5 entries)
let forecastMaxTemps: number[] = JSON.parse('[]')
let forecastMinTemps: number[] = JSON.parse('[]')
let forecastCodes: number[] = JSON.parse('[]')
let forecastDays: string[] = JSON.parse('[]')

// Loading/error state
let isLoading = false
let hasData = false
let errorMessage = ""

// --- Getter functions for cross-module access ---
// WORKAROUND: Perry codegen bug — functions returning `number` crash (SIGILL)
// because the generated _i64 variant loads all module variables and traps on
// NaN-boxed pointers. Return strings instead and parseFloat() in the callers.
export function getCurrentTempStr(): string { return "" + currentTemp }
export function getCurrentHumidityStr(): string { return "" + currentHumidity }
export function getCurrentWindSpeedStr(): string { return "" + currentWindSpeed }
export function getCurrentWeatherCodeStr(): string { return "" + currentWeatherCode }
export function getFeelsLikeStr(): string { return "" + feelsLike }
export function getHourlyTemps(): number[] { return hourlyTemps }
export function getHourlyTimes(): string[] { return hourlyTimes }
export function getForecastMaxTemps(): number[] { return forecastMaxTemps }
export function getForecastMinTemps(): number[] { return forecastMinTemps }
export function getForecastCodes(): number[] { return forecastCodes }
export function getForecastDays(): string[] { return forecastDays }
export function getIsLoading(): boolean { return isLoading }
export function getHasData(): boolean { return hasData }
export function getErrorMessage(): string { return errorMessage }


// Callback for when data is ready
let onDataReady: (() => void) | null = null

export function setOnDataReady(callback: () => void): void {
  onDataReady = callback
}

function parseWeatherResponse(data: any): void {
  // Current weather
  const current = data.current
  currentTemp = current.temperature_2m
  currentHumidity = current.relative_humidity_2m
  currentWindSpeed = current.wind_speed_10m
  currentWeatherCode = current.weather_code
  feelsLike = current.apparent_temperature

  // Hourly temperatures (next 24 hours)
  const hourly = data.hourly
  const allTemps = hourly.temperature_2m
  const allTimes = hourly.time

  // Build arrays for next 24 hours using JSON serialization (Perry workaround)
  let tempsJson = "["
  let timesJson = "["
  let first = true
  const count = 24
  for (let i = 0; i < count; i++) {
    if (i < allTemps.length) {
      if (!first) {
        tempsJson = tempsJson + ","
        timesJson = timesJson + ","
      }
      tempsJson = tempsJson + JSON.stringify(allTemps[i])
      timesJson = timesJson + JSON.stringify(allTimes[i])
      first = false
    }
  }
  tempsJson = tempsJson + "]"
  timesJson = timesJson + "]"
  hourlyTemps = JSON.parse(tempsJson)
  hourlyTimes = JSON.parse(timesJson)

  // Daily forecast (5 days)
  const daily = data.daily
  const maxTemps = daily.temperature_2m_max
  const minTemps = daily.temperature_2m_min
  const codes = daily.weather_code
  const days = daily.time

  let maxJson = "["
  let minJson = "["
  let codesJson = "["
  let daysJson = "["
  let firstDay = true
  for (let i = 0; i < 5; i++) {
    if (i < maxTemps.length) {
      if (!firstDay) {
        maxJson = maxJson + ","
        minJson = minJson + ","
        codesJson = codesJson + ","
        daysJson = daysJson + ","
      }
      maxJson = maxJson + JSON.stringify(maxTemps[i])
      minJson = minJson + JSON.stringify(minTemps[i])
      codesJson = codesJson + JSON.stringify(codes[i])
      daysJson = daysJson + JSON.stringify(days[i])
      firstDay = false
    }
  }
  maxJson = maxJson + "]"
  minJson = minJson + "]"
  codesJson = codesJson + "]"
  daysJson = daysJson + "]"
  forecastMaxTemps = JSON.parse(maxJson)
  forecastMinTemps = JSON.parse(minJson)
  forecastCodes = JSON.parse(codesJson)
  forecastDays = JSON.parse(daysJson)

  hasData = true
  errorMessage = ""
}

export function fetchWeather(latitude: number, longitude: number): void {
  isLoading = true
  errorMessage = ""

  const url = "https://api.open-meteo.com/v1/forecast"
    + "?latitude=" + latitude
    + "&longitude=" + longitude
    + "&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,apparent_temperature"
    + "&daily=temperature_2m_max,temperature_2m_min,weather_code"
    + "&hourly=temperature_2m"
    + "&timezone=auto"
    + "&forecast_days=5"

  fetchText(url).then(function (text: string) {
    isLoading = false
    const data = JSON.parse(text)
    parseWeatherResponse(data)
    if (onDataReady !== null) {
      onDataReady()
    }
  })
}

