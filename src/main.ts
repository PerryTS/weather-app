// Perry Weather — macOS entry point
import {
  App, HStack, Text, Button, ScrollView, TextField, Spacer,
  VStackWithInsets,
  textSetColor, textSetFontSize, textSetFontWeight,
  buttonSetBordered, textfieldFocus, textfieldSetString,
  scrollviewSetChild, scrollviewSetOffset,
  widgetAddChild, widgetClearChildren,
  addKeyboardShortcut,
  appSetTimer,
  widgetSetBackgroundGradient,
} from "perry/ui"
import { requestLocation } from "perry/system"
import {
  getCurrentWeatherCodeStr, getIsLoading, getHasData, getErrorMessage,
  fetchWeather, setOnDataReady,
} from "./weather_api"
import {
  searchCity, clearSearch, setOnResultsReady,
} from "./geocoding_api"
import { buildCurrentWeather } from "./ui_current"
import { buildForecast } from "./ui_forecast"
import { buildTemperatureChart } from "./ui_chart"
import { buildSearchBar, buildSearchResults } from "./ui_search"
import { weatherCategory } from "./weather_icons"
import { needsLightText } from "./colors"

// --- State ---
let cityName = "Berlin"
let latitude = 52.52
let longitude = 13.41
// --- Text color state (derived from weather) ---
let textR = 1.0
let textG = 1.0
let textB = 1.0
let dimR = 1.0
let dimG = 1.0
let dimB = 1.0

// --- Layout ---
const wrapper = VStackWithInsets(0, 0, 0, 0, 0)
const contentArea = VStackWithInsets(8, 16, 16, 16, 16)
const searchBarContainer = VStackWithInsets(0, 16, 0, 16, 0)
const searchResultsContainer = VStackWithInsets(4, 16, 0, 16, 0)
widgetAddChild(wrapper, searchBarContainer)
widgetAddChild(wrapper, searchResultsContainer)
widgetAddChild(wrapper, contentArea)

// --- Always-visible search bar ---
const searchField = buildSearchBar(searchBarContainer, onCitySelected, onQueryChange, textR, textG, textB, dimR, dimG, dimB)

const scroll = ScrollView()
scrollviewSetChild(scroll, wrapper)

// --- Background gradient ---
function updateBackground(): void {
  if (!getHasData()) {
    // Default: clear day gradient (#4A90D9 -> #87CEEB)
    widgetSetBackgroundGradient(wrapper,
      0.29, 0.56, 0.85, 1.0,
      0.53, 0.81, 0.92, 1.0,
      0)
    textR = 1.0
    textG = 1.0
    textB = 1.0
    dimR = 1.0
    dimG = 1.0
    dimB = 1.0
    return
  }

  const codeStr = getCurrentWeatherCodeStr()
  const code = parseFloat(codeStr)
  const category = weatherCategory(code)

  if (category === "clear") {
    // Clear day: #4A90D9 -> #87CEEB
    widgetSetBackgroundGradient(wrapper,
      0.29, 0.56, 0.85, 1.0,
      0.53, 0.81, 0.92, 1.0,
      0)
  } else if (category === "cloudy") {
    // Cloudy: #8E9EAB -> #B8C6D0
    widgetSetBackgroundGradient(wrapper,
      0.56, 0.62, 0.67, 1.0,
      0.72, 0.78, 0.82, 1.0,
      0)
  } else if (category === "rain") {
    // Rain: #5D6D7E -> #7F8C8D
    widgetSetBackgroundGradient(wrapper,
      0.36, 0.43, 0.49, 1.0,
      0.50, 0.55, 0.55, 1.0,
      0)
  } else if (category === "snow") {
    // Snow: #D5E5F2 -> #ECF0F1
    widgetSetBackgroundGradient(wrapper,
      0.84, 0.90, 0.95, 1.0,
      0.93, 0.94, 0.95, 1.0,
      0)
  }

  if (needsLightText(category)) {
    textR = 1.0
    textG = 1.0
    textB = 1.0
    dimR = 1.0
    dimG = 1.0
    dimB = 1.0
  } else {
    textR = 0.15
    textG = 0.15
    textB = 0.15
    dimR = 0.3
    dimG = 0.3
    dimB = 0.3
  }
}

// --- Rebuild ---
function rebuild(): void {
  widgetClearChildren(contentArea)
  updateBackground()

  if (getIsLoading()) {
    buildLoadingView(contentArea)
    return
  }

  if (getErrorMessage().length > 0) {
    buildErrorView(contentArea)
    return
  }

  if (!getHasData()) {
    buildWelcomeView(contentArea)
    return
  }
  buildCurrentWeather(contentArea, cityName, textR, textG, textB, dimR, dimG, dimB)

  const chartSpacer = Text(" ")
  textSetFontSize(chartSpacer, 12)
  widgetAddChild(contentArea, chartSpacer)

  buildTemperatureChart(contentArea, 660, textR, textG, textB, dimR, dimG, dimB, 200)

  const forecastSpacer = Text(" ")
  textSetFontSize(forecastSpacer, 12)
  widgetAddChild(contentArea, forecastSpacer)

  buildForecast(contentArea, textR, textG, textB, dimR, dimG, dimB)

  // Footer
  const footer = Text("Built with Perry — TypeScript compiled to native")
  textSetFontSize(footer, 11)
  textSetColor(footer, dimR, dimG, dimB, 0.6)
  widgetAddChild(contentArea, footer)

  scrollviewSetOffset(scroll, 0)
}

function rebuildSearchResults(): void {
  widgetClearChildren(searchResultsContainer)
  buildSearchResults(searchResultsContainer, onCitySelected, textR, textG, textB, dimR, dimG, dimB)
}

// --- View builders ---
function buildLoadingView(container: any): void {
  const spacer = Text(" ")
  textSetFontSize(spacer, 40)
  widgetAddChild(container, spacer)

  const msg = Text("Loading weather data...")
  textSetFontSize(msg, 18)
  textSetColor(msg, textR, textG, textB, 1.0)
  widgetAddChild(container, msg)
}

function buildErrorView(container: any): void {
  const spacer = Text(" ")
  textSetFontSize(spacer, 40)
  widgetAddChild(container, spacer)

  const title = Text("Error")
  textSetFontSize(title, 22)
  textSetFontWeight(title, 22, 1.0)
  textSetColor(title, 0.9, 0.2, 0.2, 1.0)
  widgetAddChild(container, title)

  const msg = Text(getErrorMessage())
  textSetFontSize(msg, 14)
  textSetColor(msg, 0.9, 0.3, 0.3, 1.0)
  widgetAddChild(container, msg)
}

function buildWelcomeView(container: any): void {
  const spacer1 = Text(" ")
  textSetFontSize(spacer1, 40)
  widgetAddChild(container, spacer1)

  const title = Text("Perry Weather")
  textSetFontSize(title, 32)
  textSetFontWeight(title, 32, 1.0)
  textSetColor(title, textR, textG, textB, 1.0)
  widgetAddChild(container, title)

  const subtitle = Text("One codebase. Six platforms. Zero runtime.")
  textSetFontSize(subtitle, 15)
  textSetColor(subtitle, dimR, dimG, dimB, 1.0)
  widgetAddChild(container, subtitle)

  const spacer2 = Text(" ")
  textSetFontSize(spacer2, 16)
  widgetAddChild(container, spacer2)

  const hint1 = Text("Cmd+R  Refresh weather data")
  textSetFontSize(hint1, 13)
  textSetColor(hint1, dimR, dimG, dimB, 0.8)
  widgetAddChild(container, hint1)

  const hint2 = Text("Cmd+L  Search for a city")
  textSetFontSize(hint2, 13)
  textSetColor(hint2, dimR, dimG, dimB, 0.8)
  widgetAddChild(container, hint2)

  const hint3 = Text("Cmd+G  Use my location")
  textSetFontSize(hint3, 13)
  textSetColor(hint3, dimR, dimG, dimB, 0.8)
  widgetAddChild(container, hint3)

  const spacer3 = Text(" ")
  textSetFontSize(spacer3, 16)
  widgetAddChild(container, spacer3)

  const tech = Text("Built with Perry — TypeScript compiled to native ARM64")
  textSetFontSize(tech, 13)
  textSetColor(tech, dimR, dimG, dimB, 0.6)
  widgetAddChild(container, tech)

  const author = Text("by Skelpo GmbH")
  textSetFontSize(author, 13)
  textSetColor(author, dimR, dimG, dimB, 0.6)
  widgetAddChild(container, author)
}

// --- Search ---
function onQueryChange(text: string): void {
  searchCity(text)
}

function onCitySelected(name: string, lat: number, lon: number): void {
  // Extract just the city name (before first comma)
  let displayName = name
  const commaIdx = name.indexOf(",")
  if (commaIdx > 0) {
    displayName = name.substring(0, commaIdx)
  }
  cityName = displayName
  latitude = lat
  longitude = lon
  textfieldSetString(searchField, "")
  widgetClearChildren(searchResultsContainer)
  clearSearch()
  fetchWeather(latitude, longitude)
  rebuild()
}

// --- Action handlers ---
function handleLocation(): void {
  console.log("handleLocation called")
  requestLocation(function (lat: number, lon: number) {
    console.log("location callback fired")
    if (lat !== lat) {
      // NaN check — location failed or denied
      return
    }
    cityName = "My Location"
    latitude = lat
    longitude = lon
    textfieldSetString(searchField, "")
    widgetClearChildren(searchResultsContainer)
    clearSearch()
    fetchWeather(latitude, longitude)
    rebuild()
  })
}

function handleRefresh(): void {
  console.log("Refreshing weather")
  fetchWeather(latitude, longitude)
  rebuild()
}

function handleSearch(): void {
  textfieldFocus(searchField)
}

function handleEscape(): void {
  textfieldSetString(searchField, "")
  clearSearch()
  rebuildSearchResults()
}

// --- Callbacks ---
setOnDataReady(function () {
  rebuild()
})

setOnResultsReady(function () {
  rebuildSearchResults()
})

// --- Async bridge drain ---
// Timer calls js_stdlib_process_pending() via native timer,
// then invokes this callback to check if UI needs updating
function drainAsync(): void {
  // Timer callback — the native timer already calls js_stdlib_process_pending()
  // before this callback. Nothing else needed here.
}

// --- Keyboard shortcuts ---
addKeyboardShortcut("r", 1, function () { handleRefresh() })
addKeyboardShortcut("l", 1, function () { handleSearch() })
addKeyboardShortcut("g", 1, function () { handleLocation() })
addKeyboardShortcut("escape", 0, function () { handleEscape() })

// --- Timer for async bridge (100ms interval) ---
appSetTimer(100, function () { drainAsync() })

// --- Command-line city argument ---
// Usage: ./weather "London" or ./weather Paris
// --- Command-line city argument ---
// Perry compiler bug: assignments to module-level variables from inside a function
// don't always take effect. Inline the logic at module scope instead.
const args = process.argv
if (args.length > 2) {
  const cityArg = args[2]
  const lower = cityArg.toLowerCase()
  if (lower === "london") { cityName = "London"; latitude = 51.51; longitude = -0.13 }
  else if (lower === "paris") { cityName = "Paris"; latitude = 48.86; longitude = 2.35 }
  else if (lower === "tokyo") { cityName = "Tokyo"; latitude = 35.68; longitude = 139.69 }
  else if (lower === "new york" || lower === "nyc") { cityName = "New York"; latitude = 40.71; longitude = -74.01 }
  else if (lower === "sydney") { cityName = "Sydney"; latitude = -33.87; longitude = 151.21 }
  else if (lower === "cairo") { cityName = "Cairo"; latitude = 30.04; longitude = 31.24 }
  else if (lower === "mumbai") { cityName = "Mumbai"; latitude = 19.08; longitude = 72.88 }
  else if (lower === "moscow") { cityName = "Moscow"; latitude = 55.76; longitude = 37.62 }
  else if (lower === "rome") { cityName = "Rome"; latitude = 41.90; longitude = 12.50 }
  else if (lower === "dubai") { cityName = "Dubai"; latitude = 25.20; longitude = 55.27 }
  else if (lower === "singapore") { cityName = "Singapore"; latitude = 1.35; longitude = 103.82 }
  else if (lower === "san francisco" || lower === "sf") { cityName = "San Francisco"; latitude = 37.77; longitude = -122.42 }
  else if (lower === "los angeles" || lower === "la") { cityName = "Los Angeles"; latitude = 34.05; longitude = -118.24 }
  else if (lower === "chicago") { cityName = "Chicago"; latitude = 41.88; longitude = -87.63 }
  else if (lower === "toronto") { cityName = "Toronto"; latitude = 43.65; longitude = -79.38 }
  else if (lower === "beijing") { cityName = "Beijing"; latitude = 39.90; longitude = 116.40 }
  else if (lower === "bangkok") { cityName = "Bangkok"; latitude = 13.76; longitude = 100.50 }
  else if (lower === "amsterdam") { cityName = "Amsterdam"; latitude = 52.37; longitude = 4.90 }
  else if (lower === "lisbon") { cityName = "Lisbon"; latitude = 38.72; longitude = -9.14 }
  console.log("Weather for: " + cityName + " (" + latitude + ", " + longitude + ")")
}

// --- Initial state ---
// console.log("testing getCurrentWeatherCode: " + getCurrentWeatherCode())
rebuild()
fetchWeather(latitude, longitude)

console.log("Perry Weather ready")

App({
  title: "Perry Weather",
  width: 700,
  height: 900,
  body: scroll,
})
