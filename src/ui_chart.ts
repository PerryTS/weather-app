// Temperature chart — 24h line chart using Canvas API
// This is the hero feature: native drawing on every platform
import {
  Text, VStackWithInsets, HStack,
  textSetColor, textSetFontSize, textSetFontWeight,
  widgetAddChild,
  Canvas,
  canvasClear, canvasBeginPath, canvasMoveTo, canvasLineTo,
  canvasStroke, canvasFillGradient,
} from "perry/ui"
import { formatTemp, formatHour } from "./formatting"
import { getHourlyTemps, getHourlyTimes } from "./weather_api"

const PADDING_LEFT = 40
const PADDING_RIGHT = 20
const PADDING_TOP = 25
const PADDING_BOTTOM = 25

export function buildTemperatureChart(container: any, chartWidth: number, textR: number, textG: number, textB: number, dimR: number, dimG: number, dimB: number, chartHeight: number): void {
  const CHART_HEIGHT = chartHeight
  const hourlyTemps = getHourlyTemps()
  const hourlyTimes = getHourlyTimes()
  if (hourlyTemps.length === 0) return

  // Section header
  const header = Text("24-Hour Temperature")
  textSetFontSize(header, 16)
  textSetFontWeight(header, 16, 0.6)
  textSetColor(header, textR, textG, textB, 1.0)
  widgetAddChild(container, header)

  const spacer = Text(" ")
  textSetFontSize(spacer, 4)
  widgetAddChild(container, spacer)

  // Find min/max for scaling
  let minTemp = hourlyTemps[0]
  let maxTemp = hourlyTemps[0]
  for (let i = 1; i < hourlyTemps.length; i++) {
    if (hourlyTemps[i] < minTemp) minTemp = hourlyTemps[i]
    if (hourlyTemps[i] > maxTemp) maxTemp = hourlyTemps[i]
  }

  // Add padding to range
  const range = maxTemp - minTemp
  const padding = range < 2 ? 2 : range * 0.15
  minTemp = minTemp - padding
  maxTemp = maxTemp + padding

  // Create canvas
  const canvas = Canvas(chartWidth, CHART_HEIGHT)

  // Clear and draw
  canvasClear(canvas)

  const plotWidth = chartWidth - PADDING_LEFT - PADDING_RIGHT
  const plotHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM

  // Draw temperature line
  canvasBeginPath(canvas)
  for (let i = 0; i < hourlyTemps.length; i++) {
    const x = PADDING_LEFT + (i / (hourlyTemps.length - 1)) * plotWidth
    const tempNorm = (hourlyTemps[i] - minTemp) / (maxTemp - minTemp)
    // Flip Y axis (canvas 0,0 is top-left)
    const y = PADDING_TOP + (1 - tempNorm) * plotHeight

    if (i === 0) {
      canvasMoveTo(canvas, x, y)
    } else {
      canvasLineTo(canvas, x, y)
    }
  }
  // Stroke the line (white with some transparency)
  canvasStroke(canvas, 1.0, 1.0, 1.0, 0.9, 2.5)

  // Draw gradient fill under the line
  canvasBeginPath(canvas)
  for (let i = 0; i < hourlyTemps.length; i++) {
    const x = PADDING_LEFT + (i / (hourlyTemps.length - 1)) * plotWidth
    const tempNorm = (hourlyTemps[i] - minTemp) / (maxTemp - minTemp)
    const y = PADDING_TOP + (1 - tempNorm) * plotHeight

    if (i === 0) {
      canvasMoveTo(canvas, x, y)
    } else {
      canvasLineTo(canvas, x, y)
    }
  }
  // Close path along bottom edge
  const lastX = PADDING_LEFT + plotWidth
  canvasLineTo(canvas, lastX, PADDING_TOP + plotHeight)
  canvasLineTo(canvas, PADDING_LEFT, PADDING_TOP + plotHeight)
  // Fill with gradient (semi-transparent white to clear)
  canvasFillGradient(canvas, 1.0, 1.0, 1.0, 0.3, 1.0, 1.0, 1.0, 0.0, 0)

  widgetAddChild(container, canvas)

  // Time labels below chart
  const labelsRow = HStack(0)
  const labelCount = 6  // Show 6 time labels across the chart
  const step = Math.floor(hourlyTemps.length / (labelCount - 1))
  for (let i = 0; i < labelCount; i++) {
    let idx = i * step
    if (idx >= hourlyTimes.length) idx = hourlyTimes.length - 1
    const label = Text(formatHour(hourlyTimes[idx]))
    textSetFontSize(label, 11)
    textSetColor(label, dimR, dimG, dimB, 1.0)
    widgetAddChild(labelsRow, label)
    if (i < labelCount - 1) {
      const spacerLabel = Text("      ")
      textSetFontSize(spacerLabel, 11)
      widgetAddChild(labelsRow, spacerLabel)
    }
  }
  widgetAddChild(container, labelsRow)

  // Min/max labels
  const rangeRow = HStack(8)
  const minLabel = Text("Low: " + formatTemp(minTemp + padding))
  textSetFontSize(minLabel, 12)
  textSetColor(minLabel, dimR, dimG, dimB, 1.0)
  widgetAddChild(rangeRow, minLabel)
  const maxLabel = Text("High: " + formatTemp(maxTemp - padding))
  textSetFontSize(maxLabel, 12)
  textSetColor(maxLabel, dimR, dimG, dimB, 1.0)
  widgetAddChild(rangeRow, maxLabel)
  widgetAddChild(container, rangeRow)
}
