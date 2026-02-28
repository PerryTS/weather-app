// 5-day forecast card row builder
import {
  HStack, Text, VStackWithInsets, Spacer,
  textSetColor, textSetFontSize, textSetFontWeight,
  widgetAddChild,
} from "perry/ui"
import { formatTemp, formatDayName } from "./formatting"
import { weatherIcon } from "./weather_icons"
import {
  getForecastMaxTemps, getForecastMinTemps,
  getForecastCodes, getForecastDays,
} from "./weather_api"

export function buildForecast(container: any, textR: number, textG: number, textB: number, dimR: number, dimG: number, dimB: number): void {
  // Section header
  const header = Text("5-Day Forecast")
  textSetFontSize(header, 16)
  textSetFontWeight(header, 16, 0.6)
  textSetColor(header, textR, textG, textB, 1.0)
  widgetAddChild(container, header)

  const spacer = Text(" ")
  textSetFontSize(spacer, 4)
  widgetAddChild(container, spacer)

  buildForecastRow(container, textR, textG, textB, dimR, dimG, dimB)
}

export function buildForecastRow(container: any, textR: number, textG: number, textB: number, dimR: number, dimG: number, dimB: number): void {
  const row = HStack(4)

  const days = getForecastDays()
  const codes = getForecastCodes()
  const maxTemps = getForecastMaxTemps()
  const minTemps = getForecastMinTemps()

  for (let i = 0; i < days.length; i++) {
    const card = VStackWithInsets(6, 10, 6, 10, 6)

    // Day name
    let dayLabel = ""
    if (i === 0) {
      dayLabel = "Today"
    } else {
      dayLabel = formatDayName(days[i])
    }
    const dayText = Text(dayLabel)
    textSetFontSize(dayText, 12)
    textSetFontWeight(dayText, 12, 0.6)
    textSetColor(dayText, textR, textG, textB, 1.0)
    widgetAddChild(card, dayText)

    // Weather icon
    const icon = Text(weatherIcon(codes[i]))
    textSetFontSize(icon, 24)
    widgetAddChild(card, icon)

    // High temp
    const high = Text(formatTemp(maxTemps[i]))
    textSetFontSize(high, 15)
    textSetFontWeight(high, 15, 0.6)
    textSetColor(high, textR, textG, textB, 1.0)
    widgetAddChild(card, high)

    // Low temp
    const low = Text(formatTemp(minTemps[i]))
    textSetFontSize(low, 12)
    textSetColor(low, dimR, dimG, dimB, 1.0)
    widgetAddChild(card, low)

    widgetAddChild(row, card)
  }

  widgetAddChild(container, row)
}
