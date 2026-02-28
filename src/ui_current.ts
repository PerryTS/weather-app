// Current weather display builder
import {
  HStack, Text, VStackWithInsets, Spacer,
  textSetColor, textSetFontSize, textSetFontWeight,
  widgetAddChild,
} from "perry/ui"
import { formatTemp, formatTempFull, formatWind, formatHumidity, formatTempSigned } from "./formatting"
import { weatherIcon, weatherDescription } from "./weather_icons"
import {
  getCurrentTempStr, getCurrentHumidityStr, getCurrentWindSpeedStr,
  getCurrentWeatherCodeStr, getFeelsLikeStr,
} from "./weather_api"

export function buildCurrentWeather(container: any, cityName: string, textR: number, textG: number, textB: number, dimR: number, dimG: number, dimB: number): void {
  // City name
  const city = Text(cityName)
  textSetFontSize(city, 28)
  textSetFontWeight(city, 28, 1.0)
  textSetColor(city, textR, textG, textB, 1.0)
  widgetAddChild(container, city)

  // Weather description
  const desc = Text(weatherDescription(parseFloat(getCurrentWeatherCodeStr())))
  textSetFontSize(desc, 16)
  textSetColor(desc, dimR, dimG, dimB, 1.0)
  widgetAddChild(container, desc)

  // Big temperature + icon row
  const tempRow = HStack(12)

  const icon = Text(weatherIcon(parseFloat(getCurrentWeatherCodeStr())))
  textSetFontSize(icon, 48)
  widgetAddChild(tempRow, icon)

  const bigTemp = Text(formatTempFull(parseFloat(getCurrentTempStr())))
  textSetFontSize(bigTemp, 64)
  textSetFontWeight(bigTemp, 64, 0.3)
  textSetColor(bigTemp, textR, textG, textB, 1.0)
  widgetAddChild(tempRow, bigTemp)

  widgetAddChild(container, tempRow)

  // Feels like
  const feelsRow = HStack(4)
  const feelsLabel = Text("Feels like " + formatTemp(parseFloat(getFeelsLikeStr())))
  textSetFontSize(feelsLabel, 15)
  textSetColor(feelsLabel, dimR, dimG, dimB, 1.0)
  widgetAddChild(feelsRow, feelsLabel)
  widgetAddChild(container, feelsRow)

  // Spacer
  const spacer = Text(" ")
  textSetFontSize(spacer, 8)
  widgetAddChild(container, spacer)

  // Details row: wind + humidity
  const detailsRow = HStack(24)

  // Wind
  const windBox = VStackWithInsets(4, 0, 0, 0, 0)
  const windLabel = Text("Wind")
  textSetFontSize(windLabel, 12)
  textSetColor(windLabel, dimR, dimG, dimB, 1.0)
  widgetAddChild(windBox, windLabel)
  const windValue = Text(formatWind(parseFloat(getCurrentWindSpeedStr())))
  textSetFontSize(windValue, 18)
  textSetFontWeight(windValue, 18, 0.6)
  textSetColor(windValue, textR, textG, textB, 1.0)
  widgetAddChild(windBox, windValue)
  widgetAddChild(detailsRow, windBox)

  // Humidity
  const humBox = VStackWithInsets(4, 0, 0, 0, 0)
  const humLabel = Text("Humidity")
  textSetFontSize(humLabel, 12)
  textSetColor(humLabel, dimR, dimG, dimB, 1.0)
  widgetAddChild(humBox, humLabel)
  const humValue = Text(formatHumidity(parseFloat(getCurrentHumidityStr())))
  textSetFontSize(humValue, 18)
  textSetFontWeight(humValue, 18, 0.6)
  textSetColor(humValue, textR, textG, textB, 1.0)
  widgetAddChild(humBox, humValue)
  widgetAddChild(detailsRow, humBox)

  widgetAddChild(container, detailsRow)
}
