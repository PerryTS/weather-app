# Perry Weather

A native cross-platform weather app built with the [Perry](https://www.perryts.com) TypeScript-to-native compiler. One TypeScript codebase compiles to native ARM64 executables for macOS, iOS, and Android — no runtime, no VM, no bridge.

## Features

- Live weather data from [Open-Meteo](https://open-meteo.com/) (free, no API key)
- Current conditions with temperature, humidity, wind speed, and feels-like
- 24-hour temperature chart drawn on a native canvas
- 5-day forecast
- City search via geocoding API
- Location support (CoreLocation on macOS/iOS, LocationManager on Android)
- Dynamic background gradients based on weather conditions
- Keyboard shortcuts on macOS (Cmd+R refresh, Cmd+L search, Cmd+G location)

## Project Structure

```
src/
  main.ts              # macOS entry point
  main_ios.ts          # iOS/iPadOS entry point
  main_android.ts      # Android entry point
  weather_api.ts       # Open-Meteo API client
  geocoding_api.ts     # City search / geocoding
  ui_current.ts        # Current weather UI builder
  ui_forecast.ts       # 5-day forecast UI builder
  ui_chart.ts          # Temperature chart (canvas drawing)
  ui_search.ts         # Search bar and results
  weather_icons.ts     # Weather code to emoji/description mapping
  colors.ts            # Theme colors based on weather
  formatting.ts        # Temperature, wind, humidity formatters
xcode/
  project.yml          # XcodeGen project spec (macOS + iOS targets)
  WeatherMac/          # macOS assets, Info.plist, entitlements
  WeatheriOS/          # iOS assets, Info.plist
perry.toml             # Perry project config
```

## Building

### Prerequisites

- [Perry compiler](https://www.perryts.com) (`perry` binary in PATH or at a known location)
- Xcode 16+ (for macOS/iOS targets)
- [XcodeGen](https://github.com/yonaskolb/XcodeGen) (to generate `.xcodeproj` from `project.yml`)

### macOS

```bash
# Build the Perry compiler (if building from source)
cd /path/to/perry && cargo build --release

# Compile directly
perry compile src/main.ts -o weather --target macos
./weather

# Or via Xcode (uses post-build script to compile with Perry)
cd xcode && xcodegen generate
open Weather.xcodeproj
# Build and run the "Weather" scheme
```

### iOS

```bash
# Compile for simulator
perry compile src/main_ios.ts -o weather_ios --target ios-simulator
xcrun simctl install booted weather_ios.app

# Or via Xcode
cd xcode && xcodegen generate
# Build and run the "Weather iOS" scheme
```

### Android

```bash
# Compile (requires ANDROID_NDK_HOME)
perry compile src/main_android.ts -o weather_android --target android
# Build APK with gradle, install on device
```

## How It Works

Perry compiles TypeScript directly to native ARM64 machine code via Cranelift. The UI layer uses platform-native widgets:

- **macOS**: AppKit (NSTextField, NSButton, NSStackView, etc.)
- **iOS**: UIKit (UILabel, UIButton, UIStackView, etc.)
- **Android**: Android Views (TextView, Button, LinearLayout, etc.) via JNI

There is no JavaScript runtime, no WebView, and no React Native bridge. The compiled binary is a standard native executable (4.4 MB on macOS) that links directly against platform frameworks.

## License

MIT
