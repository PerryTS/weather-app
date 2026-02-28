// Perry Weather — Android entry point
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

// --- Text color state ---
let textR = 1.0
let textG = 1.0
let textB = 1.0
let dimR = 1.0
let dimG = 1.0
let dimB = 1.0

// --- Layout ---
const wrapper = VStackWithInsets(0, 0, 0, 0, 0)
const toolbarRow = HStack(6)
const searchBarContainer = VStackWithInsets(0, 16, 0, 16, 0)
const searchResultsContainer = VStackWithInsets(4, 16, 0, 16, 0)
const contentArea = VStackWithInsets(8, 16, 16, 16, 16)
widgetAddChild(wrapper, toolbarRow)
widgetAddChild(wrapper, searchBarContainer)
widgetAddChild(wrapper, searchResultsContainer)
widgetAddChild(wrapper, contentArea)

// --- Always-visible search bar ---
const searchField = buildSearchBar(searchBarContainer, onCitySelected, onQueryChange, textR, textG, textB, dimR, dimG, dimB)

const scroll = ScrollView()
scrollviewSetChild(scroll, wrapper)

// --- Toolbar buttons ---
function makeToolbarButton(label: string, callback: any): any {
  const btn = Button(label, callback)
  textSetFontSize(btn, 15)
  return btn
}

const btnRefresh = makeToolbarButton("Refresh", function () { handleRefresh() })
const btnSearch = makeToolbarButton("Search", function () { handleSearch() })
const btnLocation = makeToolbarButton("Location", function () { handleLocation() })

widgetAddChild(toolbarRow, btnRefresh)
widgetAddChild(toolbarRow, btnSearch)
widgetAddChild(toolbarRow, btnLocation)

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

  const category = weatherCategory(parseFloat(getCurrentWeatherCodeStr()))

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

  buildTemperatureChart(contentArea, 358, textR, textG, textB, dimR, dimG, dimB, 150)

  const forecastSpacer = Text(" ")
  textSetFontSize(forecastSpacer, 12)
  widgetAddChild(contentArea, forecastSpacer)

  buildForecast(contentArea, textR, textG, textB, dimR, dimG, dimB)

  const footer = Text("Built with Perry — native Android, zero runtime")
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

  const subtitle = Text("A native Android weather app")
  textSetFontSize(subtitle, 15)
  textSetColor(subtitle, dimR, dimG, dimB, 1.0)
  widgetAddChild(container, subtitle)

  const spacer2 = Text(" ")
  textSetFontSize(spacer2, 16)
  widgetAddChild(container, spacer2)

  const tech = Text("Built with Perry — TypeScript compiled to native ARM64")
  textSetFontSize(tech, 13)
  textSetColor(tech, dimR, dimG, dimB, 0.6)
  widgetAddChild(container, tech)

  const hint = Text("Tap Refresh to load weather data")
  textSetFontSize(hint, 13)
  textSetColor(hint, dimR, dimG, dimB, 0.8)
  widgetAddChild(container, hint)
}

// --- Search ---
function onQueryChange(text: string): void {
  searchCity(text)
}

function onCitySelected(name: string, lat: number, lon: number): void {
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

// --- Callbacks ---
setOnDataReady(function () {
  rebuild()
})

setOnResultsReady(function () {
  rebuildSearchResults()
})

// --- Async drain ---
function drainAsync(): void {}

// --- Keyboard shortcuts (external keyboard) ---
addKeyboardShortcut("r", 1, function () { handleRefresh() })
addKeyboardShortcut("l", 1, function () { handleSearch() })

// --- Timer for async bridge ---
appSetTimer(100, function () { drainAsync() })

// --- Initial state ---
rebuild()
fetchWeather(latitude, longitude)

console.log("Perry Weather Android ready")

App({
  title: "Perry Weather",
  width: 0,
  height: 0,
  body: scroll,
})
