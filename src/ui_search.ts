// Search bar with city results dropdown
import {
  HStack, HStackWithInsets, Text, TextField, Button, VStackWithInsets,
  textSetColor, textSetFontSize, textSetFontWeight,
  buttonSetBordered,
  widgetAddChild, widgetClearChildren,
  widgetSetBackgroundColor, widgetSetCornerRadius,
} from "perry/ui"
import {
  getSearchNames, getSearchLats, getSearchLons, getSearchCountStr,
  searchCity, clearSearch, getIsSearching,
} from "./geocoding_api"

export function buildSearchBar(
  container: any,
  onCitySelected: (name: string, lat: number, lon: number) => void,
  onQueryChange: (text: string) => void,
  onLocationTap: () => void,
  textR: number, textG: number, textB: number,
  dimR: number, dimG: number, dimB: number,
): any {
  const field = TextField("Search city...", function (text: string) {
    onQueryChange(text)
  })

  const locBtn = Button("Location", function () { onLocationTap() })
  buttonSetBordered(locBtn, 0)
  textSetFontSize(locBtn, 14)
  textSetColor(locBtn, textR, textG, textB, 0.8)

  const row = HStackWithInsets(8, 10, 14, 10, 14)
  widgetSetBackgroundColor(row, 1.0, 1.0, 1.0, 0.15)
  widgetSetCornerRadius(row, 12)
  widgetAddChild(row, field)
  widgetAddChild(row, locBtn)

  widgetAddChild(container, row)
  return field
}

export function buildSearchResults(
  container: any,
  onCitySelected: (name: string, lat: number, lon: number) => void,
  textR: number, textG: number, textB: number,
  dimR: number, dimG: number, dimB: number,
): void {
  if (getIsSearching()) {
    const loading = Text("Searching...")
    textSetFontSize(loading, 13)
    textSetColor(loading, dimR, dimG, dimB, 1.0)
    widgetAddChild(container, loading)
    return
  }

  const count = parseFloat(getSearchCountStr())
  if (count === 0) return

  const names = getSearchNames()
  const lats = getSearchLats()
  const lons = getSearchLons()

  for (let i = 0; i < count; i++) {
    const name = names[i]
    const lat = lats[i]
    const lon = lons[i]

    const card = VStackWithInsets(8, 12, 8, 12, 4)
    widgetSetBackgroundColor(card, 1.0, 1.0, 1.0, 0.15)
    widgetSetCornerRadius(card, 8)

    const btn = Button(name, function () {
      onCitySelected(name, lat, lon)
    })
    textSetFontSize(btn, 15)
    buttonSetBordered(btn, 0)
    widgetAddChild(card, btn)

    widgetAddChild(container, card)
  }
}
