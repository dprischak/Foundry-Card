## v26.2.2

### 🚀 New Features

- **Theme Support:** Added a new theme selector to all cards, allowing for quick aesthetic changes.
- **Color Standardization:** Standardized `title_color` across all cards, with backward compatibility for `title_font_color`.

### 🛠️ Improvements

- **Issue #31:** Fixed Readme link to the latest release

## v26.2.1

### 📅 Version Changes

- **Version Change:** Moving from sequential versioning to year.month.patch versioning.

### 📦 Build Changes

- **Linter:** Added Linter to ensure code quality.
- **Format:** Added format to ensure consistent code style.

### 🛠️ Improvements

- **Issue #18:** Added title color to entites, uptime and digital clock
- **Issue #19:** Added additional color options to the guage and analog clock cards

### 🐛 Defect Fixes

- **Issue #21:** Unable to change thermostat card color ranges in visual editor
- **Issue:** Gague card odometer glitches
- **Issue:** Gague card odometer 3,8,9 where always slightly higher then the other numbers

### 🚀 New Cards

#### 🌡️ Foundry Home Thermostat

**A vintage-style thermostat controller.**

- **Odometer Controls:** Unique rolling odometer displays for setting values.
- **Interactive:** Clickable overlays for easy adjustment of temperature and modes.
- **Dual Setpoint:** Full support for Heat/Cool mode with high and low targets.

## v5.0

### 🚀 New Cards

#### ⚡ Foundry Uptime Card

**A vintage uptime monitor.**

- **Industrial Visualization:** Simulates an industrial vacuum tube display with metallic dividers.
- **History Tracking:** Detailed circular history tracking for any binary sensor.
- **Status Thresholds:** Color-coded visual feedback based on uptime score.
- **Customizable:** Options for "up"/"down" states, update intervals, and history duration.

### 🛠️ Improvements

- **Documentation:** Updated README with comprehensive documentation for the Uptime Card and general fixes.

## v4.01

### 📦 Readme fixes

- **Installation:** Added standard HACS installation instructions.
- **Image Location:** Pulling images from the repo instead of a CDN.
- **Header information:** Added header information to the readme.

## v4.0

### 📦 HACS Support

- **Full Integration:** Added `hacs.json` and GitHub Actions for seamless HACS support.
- **Automated Validation:** New workflow ensures the repository always meets HACS standards.

### 🧹 Improvements

- **Standardized Naming:** Renamed the main release file from `foundry-cards.js` to `foundry-card.js` to match the project name and convention.
- **Cleanup:** Removed redundant files (`info.md`, `preview.png`) to streamline the repository.

## v3.0

### 🚀 New Cards

#### 📋 Foundry Entities Card

**A vintage digital display for entity lists.**

- **Digital VFD/LCD Aesthetic:** Retro digital styling for monitoring multiple entities in one view.
- **Rich Data:** Supports secondary information like 'last-updated', 'last-changed', or other entity attributes.
- **Fully Configurable:** Customizable fonts, glass effects, and industrial casing options.

#### 🔘 Foundry Button Card

**A tactile industrial push-button.**

- **Interactive:** Realistic press animations
- **Status Indicators:** Configurable LED style indicators for state feedback.
- **Templating:** Full Jinja2 support for labels and icon control.

### 🛠️ Improvements

#### 🌡️ Thermostat Card Refinement

- **Visual Cleanup:** improved alignment.
- **Enhanced Scale:** Hash marks now extend across the full tube width for better readability.
- **Color Sync:** Scale text colors now match the title font color configuration.

#### 📚 Documentation

- **Configuration Tables:** Added comprehensive configuration options for Thermostat and Entities cards.
- **New Visuals:** Updated README with new preview images for all cards.

## v2.0

### 🚀 New Cards

#### 🕰️ Foundry Analog Clock Card

**New industrial analog timepiece.**

- **Authentic Design:** Features smooth second-hand movement and multiple casing finishes (Brass, Silver, Copper, etc.).
- **Global Time:** Built-in time zone support with a dropdown selector.
- **Configurable:** Options for ring styles, plate transparency, glass effects, and rivet headers.

#### 📟 Foundry Digital Clock Card

**New industrial digital display.**

- **Vintage Style:** 7-segment LED look with a dedicated embedded font.
- **Customizable:** Detailed control over 12h/24h formats, PM indicators, and color themes.
- **Visual Effects:** Includes wear levels, aged gradients, and screen glow effects.

#### 🌡️ Foundry Thermostat Card

**New Industrial liquid-in-glass thermometer.**

- **Realistic Animation:** Fluid mercury column that reacts to temperature changes.
- **Detailed Scale:** Clear markings with customizable ranges (min/max).
- **Segmented Zones:** Color-coded temperature zones that can be rendered behind the liquid tube.

### 🛠️ Enhancements & Fixes

- **Documentation:** Complete overhaul of `README.md` with comprehensive configuration tables and new preview images for all cards.
- **Refactoring:** Shared font logic refactored for better performance and maintainability.
- **Bug Fixes:**
  - Improved stability to prevent loading crashes.

## v1.0

- Initial Release of the Foundry Card collection.
- Contains just the Gauge Card.
