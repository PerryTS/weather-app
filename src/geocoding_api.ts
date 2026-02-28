// Open-Meteo Geocoding API client
// City search — free, no key required
import { fetchText } from "node-fetch"

// Search results (parallel arrays)
// (Perry limitation: export let/const don't generate cross-module symbols)
let searchNames: string[] = JSON.parse('[]')
let searchLats: number[] = JSON.parse('[]')
let searchLons: number[] = JSON.parse('[]')
let searchCountries: string[] = JSON.parse('[]')
let searchCount = 0
let isSearching = false

// --- Getter functions for cross-module access ---
export function getSearchNames(): string[] { return searchNames }
export function getSearchLats(): number[] { return searchLats }
export function getSearchLons(): number[] { return searchLons }
export function getSearchCountries(): string[] { return searchCountries }
export function getSearchCountStr(): string { return "" + searchCount }
export function getIsSearching(): boolean { return isSearching }

// Callback for when results are ready
let onResultsReady: (() => void) | null = null

export function setOnResultsReady(callback: () => void): void {
  onResultsReady = callback
}

function parseGeocodingResponse(data: any): void {
  const results = data.results
  if (results === undefined || results === null) {
    searchCount = 0
    searchNames = JSON.parse('[]')
    searchLats = JSON.parse('[]')
    searchLons = JSON.parse('[]')
    searchCountries = JSON.parse('[]')
    return
  }

  let namesJson = "["
  let latsJson = "["
  let lonsJson = "["
  let countriesJson = "["
  let first = true

  const max = 5
  for (let i = 0; i < max; i++) {
    if (i < results.length) {
      if (!first) {
        namesJson = namesJson + ","
        latsJson = latsJson + ","
        lonsJson = lonsJson + ","
        countriesJson = countriesJson + ","
      }
      const item = results[i]
      let displayName = item.name
      if (item.admin1 !== undefined && item.admin1 !== null) {
        displayName = displayName + ", " + item.admin1
      }
      if (item.country !== undefined && item.country !== null) {
        displayName = displayName + ", " + item.country
      }
      namesJson = namesJson + JSON.stringify(displayName)
      latsJson = latsJson + JSON.stringify(item.latitude)
      lonsJson = lonsJson + JSON.stringify(item.longitude)
      const country = item.country !== undefined ? item.country : ""
      countriesJson = countriesJson + JSON.stringify(country)
      first = false
    }
  }
  namesJson = namesJson + "]"
  latsJson = latsJson + "]"
  lonsJson = lonsJson + "]"
  countriesJson = countriesJson + "]"

  searchNames = JSON.parse(namesJson)
  searchLats = JSON.parse(latsJson)
  searchLons = JSON.parse(lonsJson)
  searchCountries = JSON.parse(countriesJson)
  searchCount = searchNames.length
}

export function searchCity(query: string): void {
  if (query.length < 2) {
    searchCount = 0
    searchNames = JSON.parse('[]')
    searchLats = JSON.parse('[]')
    searchLons = JSON.parse('[]')
    searchCountries = JSON.parse('[]')
    if (onResultsReady !== null) {
      onResultsReady()
    }
    return
  }

  isSearching = true

  const url = "https://geocoding-api.open-meteo.com/v1/search"
    + "?name=" + query
    + "&count=5"
    + "&language=en"

  fetchText(url).then(function (text: string) {
    isSearching = false
    const data = JSON.parse(text)
    parseGeocodingResponse(data)
    if (onResultsReady !== null) {
      onResultsReady()
    }
  })
}

export function clearSearch(): void {
  searchCount = 0
  searchNames = JSON.parse('[]')
  searchLats = JSON.parse('[]')
  searchLons = JSON.parse('[]')
  searchCountries = JSON.parse('[]')
  isSearching = false
}
