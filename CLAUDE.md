# CLAUDE.md — Perry Weather App

## What This Is

A native weather app written in TypeScript, compiled to native ARM64 via the Perry compiler. Three platform entry points share common modules for weather data, geocoding, UI components, and formatting.

## Build Commands

```bash
# macOS — compile and run
perry compile src/main.ts -o weather --target macos && ./weather

# iOS Simulator
perry compile src/main_ios.ts -o weather_ios --target ios-simulator

# Android (requires ANDROID_NDK_HOME)
perry compile src/main_android.ts -o weather_android --target android

# Xcode (regenerate project from project.yml first)
cd xcode && xcodegen generate
xcodebuild -scheme "Weather" build          # macOS
xcodebuild -scheme "Weather iOS" build      # iOS
```

## Architecture

- **Entry points**: `main.ts` (macOS), `main_ios.ts` (iOS), `main_android.ts` (Android)
- **Shared modules**: `weather_api.ts`, `geocoding_api.ts`, `ui_current.ts`, `ui_forecast.ts`, `ui_chart.ts`, `ui_search.ts`, `weather_icons.ts`, `colors.ts`, `formatting.ts`
- **UI pattern**: Module-level mutable state + `rebuild()` function that clears and recreates the widget tree from scratch (`widgetClearChildren` then re-add)
- **Async**: `fetchText(url).then(text => JSON.parse(text))` with a 100ms timer that drains promises via the native runtime

## Perry-Specific Patterns (Important)

These are compiler constraints — do not "fix" these patterns:

- **`fetchText` not `fetch`**: The `fetch()` codegen loses typing on the response object. Always use `fetchText(url).then(text => JSON.parse(text))`.
- **String-returning getters**: Functions returning `number` across modules crash (SIGILL). Workaround: return `"" + value` (string) and `parseFloat()` in callers. See all the `*Str()` getters in `weather_api.ts`.
- **`JSON.parse('[]')` for empty arrays**: Perry doesn't support `[]` literal initialization for typed arrays. Use `JSON.parse('[]')` instead.
- **Parallel arrays**: Perry doesn't support `Set`, `Map`, or complex object arrays. Collections use parallel arrays (e.g., `hourlyTemps[]` + `hourlyTimes[]`).
- **No cross-module `export let`**: Module variables aren't exported. Use getter functions instead.

## File Roles

| File | Purpose |
|------|---------|
| `weather_api.ts` | Open-Meteo API client, stores weather state, exposes string getters |
| `geocoding_api.ts` | City search via Open-Meteo geocoding API |
| `ui_current.ts` | Builds the current conditions display (macOS layout) |
| `ui_forecast.ts` | Builds the 5-day forecast cards/rows |
| `ui_chart.ts` | Draws 24-hour temperature chart on a native Canvas widget |
| `ui_search.ts` | Search bar and city result list |
| `weather_icons.ts` | Maps WMO weather codes to emoji icons and descriptions |
| `colors.ts` | Determines text color (light/dark) based on weather category |
| `formatting.ts` | Temperature (C), wind (km/h), humidity (%) formatting |

## Perry UI API

Widgets are created via factory functions and composed with `widgetAddChild`:

```typescript
import { Text, Button, HStack, VStackWithInsets, widgetAddChild, textSetFontSize } from "perry/ui"

const row = HStack(8)                    // 8px spacing
const label = Text("Hello")
textSetFontSize(label, 16)
widgetAddChild(row, label)
```

System APIs (location, clipboard, preferences) are in `"perry/system"`.

## Backend (Perry Compiler Side)

The Perry compiler repo (`perry/`) contains platform backends:
- `crates/perry-ui-macos/` — AppKit widgets + CoreLocation
- `crates/perry-ui-ios/` — UIKit widgets + CoreLocation
- `crates/perry-ui-android/` — Android Views via JNI + LocationManager

Adding a new native function requires changes in 4 places (see FFI Pattern in the compiler repo).
