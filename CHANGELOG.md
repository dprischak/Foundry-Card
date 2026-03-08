## v26.3.2

### 🛠️ Improvements
- **Issue #92:** - Added additional themes
- **Issue #NA:** - Created a python script to create our GIF we use in our readme file.
- **Issue #100:** - Updated the themes to include the clock hands.
- **Issue #103:** - Entities, chart and barchart card: Added `clock_format` option (`local`, `12h`, `24h`) to control hour display for date/time timestamp entities.
- **Issue #86:** - Added multipler to the analog meter card for the units

### 🚀 New Cards

#### 📊 Foundry Bar Chart Card

A steampunk-styled bar chart for entity history:

- Configurable time range and data-point density
- Segment-based bar coloring with optional gradient blending
- Theme-aware styling with grid overlays
- Inspectable values and optional axis min/max labels

### 🐛 Defect Fixes
- **Issue #93:** - Colors and Typography are not saving correctly in the yaml for slider, analog clock, and gauge cards.
- **Issue #96:** - Button card is missing actions in the editor.
- **Issue #94:** - Pink theme is missing chart options
- **Issue #95:** - Aged intensity reduced for a few themes
- **Issue #88:** - Entities Card: Added option for date/time entities to allow for duration display.  Ex. showing "8 hours" instead of 3/7/2026 4:00:00.
- **Issue #87:** - Added units the analog meter card



## v26.3.1

### 🛠️ Improvements
- **Issue #82:** - Standardized the visual editors so they are all consistant
- **Issue #82:** - Added a EditorSyleGuide.md file to document the editor style guide
- **Issue #NA:** - Added Aged texture to the Uptime Card and editor

### 🚀 New Cards

#### 📊 Foundry Analog Meter Card

**A vintage VU-style analog meter in a landscape rectangular chassis.**

- **Landscape Design:** Wide rectangular form factor with a rectangular rim, matching the entities card style.
- **VU Meter Arc:** Numbers displayed below tick marks with thin connecting lines, like a classic VU meter.
- **PEAK LED:** Indicator that lights up with the highest color segment when the value meets its threshold.
- **Shake Action:** Custom tap/hold/double-tap action for a fun meter shake animation.
- **Full Theming:** Supports all standard Foundry ring styles, plate colors, aged textures, and custom themes.



## v26.2.3

### 🚀 Breaking Changes

- **Renaming:** The `Foundry Thermostat` card has been renamed to **Foundry Thermometer** card.
  - New type: `custom:foundry-thermometer-card`
  - Old type: `custom:foundry-thermostat-card` (removed)
  - Please update your dashboards to use the new card type.

### 🛠️ Improvements

- **Aged Texture** - Fixed the aged texture on all cards so we have a uniform look and feel.
- **Theme Cache** - Forced the cards to wait to the theme is loaded, if they use themes, before rendering the card.
- **Theme Cache** - Added a theme cache to prevent the browser from reloading the theme files on every page load.
- **Theme Cache Refresh** - Added a refreshcache=true to the url to force a refresh of the theme files.
- **Issue #NA** - Entities - Allow for moving entities up or down in the list in the editor.

### 🚀 New Cards

#### 🏷️ Foundry Title Card

**A decorative metallic title plate for grouping dashboard sections.**

- **Minimal Design:** Just a plate and a title — no screen, no ring, no entity data.
- **2 Centered Rivets:** One on the left, one on the right, vertically centered for a clean industrial look.
- **Fully Themed:** Supports all standard Foundry themes and custom themes via `userthemes.yaml`.
- **Visual Effects:** Plate color, title color, rivet color, transparent plate, and aged texture with adjustable intensity.

### 🐛 Defect Fixes

- **Issue #NA:** Thermometer - Removed glass effect and made it look more like the slider.  
- **Issue #NA:** Clocks and Gauge - removed the background by making it transparent.
- **Issue #72:** Thermometer - Update to be same size and default as the slider
- **Issue #73:** Analog Clock and Guage - Make corners rounded.
- **Issue #NA:** Chart - Added `show_inspect_value` option in Chart Settings (visual editor) to control whether hover/drag inspection replaces the top-right value with the inspected Y value.
- **Issue #NA:** Chart - `show_inspect_value` now also controls the vertical inspect bar and defaults to on for existing cards in the visual editor.
- **Issue #NA:** Chart - Added `show_x_axis_minmax` and `show_y_axis_minmax` options to display X/Y axis min/max labels; when X labels are enabled, footer start/Now labels are hidden to prevent overlap.
- **Issue #NA:** Chart - Added configurable color ranges (`segments`) with optional boundary blending (`segment_blend_width`) and a Gauge-style range editor in Chart Settings.
- **Issue #61:** Slider - LED screen background is now a solid flat fill using `font_bg_color` (same as Entities card), removing the dark-ring radial gradient effect. Editor labels updated to "Screen Background" and "Digital Font Color" to match the Entities card.
- Fixed minor tick marks visibility on Slider card (increased limit to 250 steps)
- Removed unused `tick_color` (fallback) configuration from Slider card
- **Issue #58:** Slider - Title text now uses `number_color` config key (consistent with Gauge/Analog Clock cards). `title_color` has been removed from the editor. Existing YAML configs with `title_color` are automatically migrated.
- **Issue #57:** Slider - Added `background_style` option (`gradient` / `solid`). In gradient mode the screen face uses a subtle linear gradient. In solid mode the `face_color` is applied as a flat fill. The editor now labels this field "Face Color (Solid Mode)".
- **Issue #62:** Renamed Thermostat card to Thermometer card for better clarity.
- **Issue #64:** Thermometer - Added `background_style` and `face_color` options to Thermometer card (matches Gauge card style).
- **Issue** Consolidated Thermometer colors: `number_color` now controls Title, Unit, and Scale numbers. `title_color` and `font_color` are deprecated. Editor updated to show only "Number Color".
- **Issue #60:** Thermometer - Added missing "Chrome" ring style to the editor.
- **Issue #59:** Thermometer - Fixed theme loading in the editor where themes would not populate in the dropdown.
- **Issue #56:** Thermometer - Increased visibility of color segments when placed behind the mercury tube.
- **Issue #55:** Thermometer - Fixed major/minor tick alignment and coloring to respect theme settings.
- **Issue #50:** Entities - Fixed Date and Time to not be UTC but local time.
- **Issue #65:** Gauge and Analog Clock - Removed Title Color as the title is based on number color.


## v26.2.2

### 🚀 New Features

- **Theme Support:** Added a new theme selector to all cards, allowing for quick aesthetic changes.
- **Color Standardization:** Standardized `title_color` across all cards, with backward compatibility for `title_font_color`.

### New Cards

#### 🎚️ Foundry Slider Card

**A vertical retro-style slider control.**

- **Industrial Knob:** Metallic knob design that matches the selected ring style (brass, silver, chrome, etc.).
- **Adjustable Track:** Vertical slider track with configurable tick marks for precise value indication.
- **LED Display:** Digital LED-style value display with customizable fonts and colors.
- **Customizable Knob:** Multiple knob shapes (circular, square, rectangular) and adjustable size (0-100%).
- **Theme Support:** Full theme support with all the standard industrial ring styles and visual effects.
- **Visual Effects:** Includes wear levels, and aged texture effects for authentic vintage appearance.

#### 📈 Foundry Chart Card

**A vintage line chart for entity history.**

- **History Sampling:** Configurable time range and bucket sizing for smooth or detailed trends.
- **Aggregation Options:** Supports average, min, max, and last-value aggregation modes.
- **Grid Styling:** Separate major/minor grid colors with adjustable opacity.
- **Line Styling:** Custom line color, width, and optional fill under the line.

### Improvements

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
