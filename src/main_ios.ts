// Perry Weather — iOS/iPadOS entry point
import {
  App, HStack, HStackWithInsets, Text, Button, ScrollView, TextField, Spacer,
  VStackWithInsets,
  textSetColor, textSetFontSize, textSetFontWeight,
  buttonSetBordered, textfieldFocus, textfieldSetString,
  scrollviewSetChild, scrollviewSetOffset,
  widgetAddChild, widgetClearChildren,
  addKeyboardShortcut,
  appSetTimer,
  widgetSetBackgroundGradient,
  widgetSetBackgroundColor, widgetSetCornerRadius,
} from "perry/ui"
import { requestLocation } from "perry/system"
import {
  getCurrentWeatherCodeStr, getCurrentTempStr, getCurrentHumidityStr,
  getCurrentWindSpeedStr, getFeelsLikeStr,
  getIsLoading, getHasData, getErrorMessage,
  fetchWeather, setOnDataReady,
} from "./weather_api"
import {
  searchCity, clearSearch, setOnResultsReady,
} from "./geocoding_api"
import { buildTemperatureChart } from "./ui_chart"
import { buildSearchBar, buildSearchResults } from "./ui_search"
import { weatherCategory, weatherIcon, weatherDescription } from "./weather_icons"
import { needsLightText } from "./colors"
import { formatTempFull, formatTemp, formatWind, formatHumidity } from "./formatting"
import { buildForecastRow } from "./ui_forecast"

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
const searchBarContainer = VStackWithInsets(0, 4, 16, 6, 16)
const searchResultsContainer = VStackWithInsets(6, 0, 16, 0, 16)
const contentArea = VStackWithInsets(12, 4, 16, 32, 16)
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
    widgetSetBackgroundGradient(scroll,
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
    widgetSetBackgroundGradient(scroll,
      0.29, 0.56, 0.85, 1.0,
      0.53, 0.81, 0.92, 1.0,
      0)
  } else if (category === "cloudy") {
    widgetSetBackgroundGradient(scroll,
      0.56, 0.62, 0.67, 1.0,
      0.72, 0.78, 0.82, 1.0,
      0)
  } else if (category === "rain") {
    widgetSetBackgroundGradient(scroll,
      0.36, 0.43, 0.49, 1.0,
      0.50, 0.55, 0.55, 1.0,
      0)
  } else if (category === "snow") {
    widgetSetBackgroundGradient(scroll,
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

  // --- City name + refresh ---
  const headerRow = HStack(8)
  const city = Text(cityName)
  textSetFontSize(city, 34)
  textSetFontWeight(city, 34, 1.0)
  textSetColor(city, textR, textG, textB, 1.0)
  widgetAddChild(headerRow, city)
  widgetAddChild(headerRow, Spacer())
  const locBtn = Button("📍", function () { handleLocation() })
  textSetFontSize(locBtn, 20)
  buttonSetBordered(locBtn, 0)
  widgetAddChild(headerRow, locBtn)
  const refreshBtn = Button("↻", function () { handleRefresh() })
  textSetFontSize(refreshBtn, 22)
  buttonSetBordered(refreshBtn, 0)
  widgetAddChild(headerRow, refreshBtn)
  widgetAddChild(contentArea, headerRow)

  // --- Condition ---
  const desc = Text(weatherDescription(parseFloat(getCurrentWeatherCodeStr())))
  textSetFontSize(desc, 17)
  textSetColor(desc, dimR, dimG, dimB, 1.0)
  widgetAddChild(contentArea, desc)

  // --- Icon + Big temperature ---
  const tempRow = HStack(8)
  const icon = Text(weatherIcon(parseFloat(getCurrentWeatherCodeStr())))
  textSetFontSize(icon, 52)
  widgetAddChild(tempRow, icon)
  const bigTemp = Text(formatTempFull(parseFloat(getCurrentTempStr())))
  textSetFontSize(bigTemp, 68)
  textSetFontWeight(bigTemp, 68, 0.2)
  textSetColor(bigTemp, textR, textG, textB, 1.0)
  widgetAddChild(tempRow, bigTemp)
  widgetAddChild(contentArea, tempRow)

  // --- Feels like ---
  const feels = Text("Feels like " + formatTemp(parseFloat(getFeelsLikeStr())))
  textSetFontSize(feels, 15)
  textSetColor(feels, dimR, dimG, dimB, 1.0)
  widgetAddChild(contentArea, feels)

  // === Details Glass Card ===
  const detailsCard = HStackWithInsets(0, 0, 0, 0, 0)
  widgetSetBackgroundColor(detailsCard, 1.0, 1.0, 1.0, 0.15)
  widgetSetCornerRadius(detailsCard, 16)

  const windBox = VStackWithInsets(4, 16, 20, 16, 20)
  const windLabel = Text("Wind")
  textSetFontSize(windLabel, 13)
  textSetColor(windLabel, dimR, dimG, dimB, 1.0)
  widgetAddChild(windBox, windLabel)
  const windValue = Text(formatWind(parseFloat(getCurrentWindSpeedStr())))
  textSetFontSize(windValue, 20)
  textSetFontWeight(windValue, 20, 0.6)
  textSetColor(windValue, textR, textG, textB, 1.0)
  widgetAddChild(windBox, windValue)
  widgetAddChild(detailsCard, windBox)

  widgetAddChild(detailsCard, Spacer())

  const humBox = VStackWithInsets(4, 16, 20, 16, 20)
  const humLabel = Text("Humidity")
  textSetFontSize(humLabel, 13)
  textSetColor(humLabel, dimR, dimG, dimB, 1.0)
  widgetAddChild(humBox, humLabel)
  const humValue = Text(formatHumidity(parseFloat(getCurrentHumidityStr())))
  textSetFontSize(humValue, 20)
  textSetFontWeight(humValue, 20, 0.6)
  textSetColor(humValue, textR, textG, textB, 1.0)
  widgetAddChild(humBox, humValue)
  widgetAddChild(detailsCard, humBox)

  widgetAddChild(contentArea, detailsCard)

  // === Chart Glass Card ===
  const chartCard = VStackWithInsets(8, 16, 14, 16, 14)
  widgetSetBackgroundColor(chartCard, 1.0, 1.0, 1.0, 0.15)
  widgetSetCornerRadius(chartCard, 16)
  buildTemperatureChart(chartCard, 330, textR, textG, textB, dimR, dimG, dimB, 140)
  widgetAddChild(contentArea, chartCard)

  // === Forecast Glass Card ===
  const forecastCard = VStackWithInsets(8, 14, 6, 14, 6)
  widgetSetBackgroundColor(forecastCard, 1.0, 1.0, 1.0, 0.15)
  widgetSetCornerRadius(forecastCard, 16)
  const forecastHeader = Text("5-Day Forecast")
  textSetFontSize(forecastHeader, 16)
  textSetFontWeight(forecastHeader, 16, 0.6)
  textSetColor(forecastHeader, textR, textG, textB, 1.0)
  widgetAddChild(forecastCard, forecastHeader)
  buildForecastRow(forecastCard, textR, textG, textB, dimR, dimG, dimB)
  widgetAddChild(contentArea, forecastCard)

  // --- Footer ---
  const footer = Text("Built with Perry")
  textSetFontSize(footer, 11)
  textSetColor(footer, dimR, dimG, dimB, 0.4)
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
  textSetFontSize(spacer, 60)
  widgetAddChild(container, spacer)

  const msg = Text("Loading...")
  textSetFontSize(msg, 20)
  textSetColor(msg, textR, textG, textB, 1.0)
  widgetAddChild(container, msg)
}

function buildErrorView(container: any): void {
  const spacer = Text(" ")
  textSetFontSize(spacer, 60)
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
  textSetFontSize(spacer1, 60)
  widgetAddChild(container, spacer1)

  const title = Text("Perry Weather")
  textSetFontSize(title, 34)
  textSetFontWeight(title, 34, 1.0)
  textSetColor(title, textR, textG, textB, 1.0)
  widgetAddChild(container, title)

  const subtitle = Text("A native iOS weather app")
  textSetFontSize(subtitle, 16)
  textSetColor(subtitle, dimR, dimG, dimB, 1.0)
  widgetAddChild(container, subtitle)

  const spacer2 = Text(" ")
  textSetFontSize(spacer2, 20)
  widgetAddChild(container, spacer2)

  const hint = Text("Tap Refresh to load weather data")
  textSetFontSize(hint, 14)
  textSetColor(hint, dimR, dimG, dimB, 0.7)
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

// --- Keyboard shortcuts (iPad external keyboard) ---
addKeyboardShortcut("r", 1, function () { handleRefresh() })
addKeyboardShortcut("l", 1, function () { handleSearch() })

// --- Timer for async bridge ---
appSetTimer(100, function () { drainAsync() })

// --- Initial state ---
rebuild()
fetchWeather(latitude, longitude)

console.log("Perry Weather iOS ready")

App({
  title: "Perry Weather",
  width: 0,
  height: 0,
  body: scroll,
})
