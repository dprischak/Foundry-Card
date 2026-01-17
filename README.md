# Foundry Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)
[![GitHub release](https://img.shields.io/github/release/dprischak/Foundry-Card.svg)](https://github.com/dprischak/Foundry-Card/releases)
[![License](https://img.shields.io/github/license/dprischak/Foundry-Card.svg)](LICENSE)

A collection of custom dashboard cards for Home Assistant, designed with industrial and vintage aesthetics.

## Cards Included

### 🌡️ Foundry Gauge Card
Display your sensor data with a beautiful foundry gauge visualization featuring:
- Customizable min/max values
- Smooth needle animation
- Theme-aware colors
- Responsive design

<img src="https://github.com/dprischak/Foundry-Card/blob/main/media/preview.png?raw=true" width="300" alt="Preview"/>

### 📊 Foundry Chart Card
Display historical data with a vintage polygraph-style chart recorder featuring:
- Support for up to 4 entities simultaneously
- Vintage "paper scroll" chart with grid lines
- Pivoting pen indicators on the right side
- Real-time data collection and display
- Customizable colors for each entity
- Same vintage aesthetic as other Foundry cards

## Installation

### HACS (Recommended)

1. Open HACS in your Home Assistant instance
2. Click on "Frontend"
3. Click the three dots in the top right corner
4. Select "Custom repositories"
5. Add `https://github.com/dprischak/Foundry-Card` as the repository
6. Select "Lovelace" as the category
7. Click "Add"
8. Find "Foundry Card" in the list and click "Install"
9. Restart Home Assistant

### Manual Installation

1. Download `foundry-cards.js` from the [latest release](https://github.com/dprischak/Foundry-Card/releases)
2. Copy it to `<config>/www/` directory (create the `www` folder if it doesn't exist)
3. Add the resource to your Lovelace dashboard:
   - Go to Settings → Dashboards → Resources
   - Click "Add Resource"
   - URL: `/local/foundry-cards.js`
   - Resource type: JavaScript Module
4. Refresh your browser

## Usage

### Foundry Gauge Card

Add the card to your dashboard:

```yaml
type: custom:foundry-gauge-card
entity: sensor.temperature
name: "Temperature"
min: 0
max: 100
unit: "°C"
```

### Design Features

- **Vintage Aesthetic**: Aged beige/cream background with subtle texture
- **Aged Texture System**: Procedural noise-based texture that can be applied to gauge face only or everywhere
  - Three modes: none, glass_only (default), or everywhere
  - Adjustable intensity (0-100) for fine control over the vintage appearance
  - High-quality filtering prevents washed-out colors
- **Brass Rim**: Gradient brass border with realistic metallic sheen
- **Rivets**: Decorative corner rivets for industrial look
- **Wear Marks**: Configurable age spots and wear marks (0-100 wear level) for authenticity
- **Glass Effect**: Optional subtle highlight overlay simulating glass cover
- **Transparent Plate Option**: Can make the background transparent to show dashboard background
- **Red Needle**: Bold red needle with shadow and highlight
- **Flip Display**: Digital odometer-style display with smooth rolling animation
- **Configurable Odometer**: Adjustable size (25-200) and vertical position (50-150px)
- **Smooth Animation**: Configurable animation duration (default 1.2s) with ease-out transition
- **High Needle Tracking**: Optional high value needle that tracks peak values for a configurable duration
- **Multi-line Titles**: Support for up to 3 lines of text in title using `\n`
- **Decorative Rings**: Choice of brass (default), silver, or no ring styles
- **Customizable Plate**: Adjustable plate color for the gauge face

#### Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `entity` | string | **Yes** | - | Entity ID to display |
| `title` | string | No | - | Card title (supports multi-line with `\n`) |
| `min` | number | No | 0 | Minimum gauge value |
| `max` | number | No | 100 | Maximum gauge value |
| `unit` | string | No | '' | Unit of measurement |
| `decimals` | number | No | 0 | Number of decimal places to display |
| `segments` | array | No | See below | Color segments configuration |
| `start_angle` | number | No | 200 | Start angle of gauge arc (0 = top, clockwise) |
| `end_angle` | number | No | 160 | End angle of gauge arc (0 = top, clockwise) |
| `animation_duration` | number | No | 1.2 | Animation duration in seconds |
| `title_font_size` | number | No | 12 | Font size for the title text |
| `odometer_font_size` | number | No | 60 | Size of the odometer display (25-200) |
| `odometer_vertical_position` | number | No | 120 | Vertical position of odometer in pixels (50-150) |
| `ring_style` | string | No | 'brass' | Decorative ring style: 'none', 'brass', or 'silver' |
| `rivet_color` | string | No | '#6a5816' | Color of the decorative rivets (hex color code) |
| `plate_color` | string | No | '#8c7626' | Color of the gauge face plate (hex color code) |
| `high_needle_enabled` | boolean | No | false | Enable the high value tracking needle |
| `high_needle_color` | string | No | '#FF9800' | Color of the high needle (hex color code) |
| `high_needle_duration` | number | No | 60 | Duration in seconds to track the high value |
| `high_needle_length` | number | No | 75 | Length of the high needle as percentage (25-150) |
| `plate_transparent` | boolean | No | false | Make the plate transparent (shows background) |
| `wear_level` | number | No | 50 | Amount of wear marks and age spots (0-100) |
| `glass_effect_enabled` | boolean | No | true | Enable glass effect overlay |
| `aged_texture` | string | No | 'everywhere' | Aged texture mode: 'none', 'glass_only', or 'everywhere' |
| `aged_texture_intensity` | number | No | 50 | Intensity of aged texture effect (0-100, higher = more visible) |
| `tap_action` | object | No | `{action: 'more-info'}` | Action to perform on tap (see Actions below) |
| `hold_action` | object | No | `{action: 'more-info'}` | Action to perform on hold (see Actions below) |
| `double_tap_action` | object | No | `{action: 'more-info'}` | Action to perform on double tap (see Actions below) |

#### Example Configurations

**Temperature Sensor:**
```yaml
type: custom:foundry-gauge-card
entity: sensor.living_room_temperature
title: Living Room
min: 50
max: 90
unit: °F
segments:
  - from: 50
    to: 68
    color: "#1100ff"
  - from: 68
    to: 78
    color: "#44ff00"
  - from: 78
    to: 90
    color: "#F44336"
```
<img src="https://github.com/dprischak/Foundry-Card/blob/main/media/temperature.png?raw=true" width="300" alt="Preview"/>

**Humidity Sensor:**
```yaml
type: custom:foundry-gauge-card
entity: sensor.bathroom_humidity
title: Bathroom\nHumidity
min: 0
max: 100
unit: "%"
segments:
  - from: 0
    to: 30
    color: "#1100ff"
  - from: 30
    to: 50
    color: "#44ff00"
  - from: 50
    to: 85
    color: "#f9bc39"
  - from: 85
    to: 100
    color: "#F44336"
```
<img src="https://github.com/dprischak/Foundry-Card/blob/main/media/bathroom.png?raw=true" width="300" alt="Preview"/>


**Heavily weathered industrial gauge**
```yaml
type: custom:Foundry-Card
entity: sensor.sumppump_fill_rate
title: Sump Pump\nFill Rate
aged_texture: everywhere
aged_texture_intensity: 80
plate_transparent: false
plate_color: "#d4d4c8"
unit: cm/min
decimals: 1
min: -3
max: 3
rivet_color: "#6a5816"
high_needle_color: "#0040ff"
high_needle_enabled: true
high_needle_length: 75
high_needle_duration: 720
segments:
  - from: -3
    to: 1.3
    color: "#00ff11"
  - from: 1.3
    to: 2
    color: "#fff700"
  - from: 2
    to: 2.5
    color: "#f9bc39"
  - from: 2.5
    to: 3
    color: "#F44336"
```
<img src="https://github.com/dprischak/Foundry-Card/blob/main/media/sump.png?raw=true" width="300" alt="Heavily weathered industrial"/>

### Segment Options

Each segment in the `segments` array can have:

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `from` | number | **Yes** | Start value of the segment |
| `to` | number | **Yes** | End value of the segment |
| `color` | string | **Yes** | Hex color code for the segment |

### Angle Configuration

The gauge arc can be customized using `start_angle` and `end_angle`:

- **Angle System**: 0° = top of gauge, angles increase clockwise
- **start_angle**: Where the gauge arc begins (default: 200°)
- **end_angle**: Where the gauge arc ends (default: 160°)
- The gauge automatically handles wrapping around 360°
- The needle will always travel along the shortest arc and never cross the "dead zone"

**Common angle configurations:**
- Default (200° to 160°): Classic lower 3/4 arc
- Full semicircle (270° to 90°): Bottom half
- Upper arc (180° to 0°): Top half
- Custom ranges for specific aesthetic needs

### Actions

The card supports tap, hold, and double-tap actions like standard Home Assistant cards. Actions can be configured using `tap_action`, `hold_action`, and `double_tap_action`.

**Available action types:**
- `more-info`: Show entity more-info dialog (default)
- `navigate`: Navigate to a different view
- `call-service`: Call a Home Assistant service
- `toggle`: Toggle the entity
- `shake`: Custom shake animation (needle moves away and returns)
- `none`: No action

**Shake Action Example:**
```yaml
type: custom:steam-gauge-card
entity: sensor.temperature
title: Temperature
tap_action:
  action: shake  # Tap to shake the gauge
```

The shake action creates a fun visual effect where the needle moves 10-50% away from the current value and then smoothly returns to the actual value over 3 seconds.

**Standard Action Examples:**
```yaml
# Navigate to another view
tap_action:
  action: navigate
  navigation_path: /lovelace/energy

# Call a service
tap_action:
  action: call-service
  service: light.turn_on
  service_data:
    entity_id: light.living_room

# Toggle an entity
tap_action:
  action: toggle

# No action on tap
tap_action:
  action: none
```

### High Needle Tracking

The high needle feature tracks the highest (peak) value reached over a configurable time period. This is useful for monitoring maximum temperatures, peak power usage, or any metric where you want to see how high the value has climbed.

**Features:**
- High value tracking needle (customizable color) that marks the highest value
- Automatically resets after the configured duration (default 60 seconds)
- Adjustable needle length (25-150% of standard needle)
- Smooth animations synchronized with main needle

### Aged Texture Effects

The gauge features a realistic aged texture system that adds vintage character to the display. The texture uses procedural noise to simulate the appearance of aged, weathered gauges from the steam era.

**Configuration Options:**
- **`aged_texture`**: Controls where the texture is applied
  - `'none'`: No aged texture effect
  - `'glass_only'`: Applies texture only to the gauge face (default) - creates a subtle aged glass appearance
  - `'everywhere'`: Applies texture to both the background plate and gauge face - creates a fully weathered vintage look
  
- **`aged_texture_intensity`**: Controls the strength of the texture effect (0-100)
  - `0`: No visible texture (clean, modern look)
  - `50`: Moderate texture (default) - balanced vintage appearance
  - `100`: Maximum texture - heavily aged, weathered appearance
  - Higher values make the texture more prominent and visible

### Foundry Chart Card

Add the card to your dashboard:

```yaml
type: custom:foundry-chart-card
entity: sensor.temperature
entity2: sensor.humidity
title: "Environmental Monitor"
chart_height: 300
hours_to_show: 1
```

### Design Features

The Foundry Chart Card features a vintage polygraph-style recorder design:

- **Vintage Aesthetic**: Aged paper background with grid lines simulating chart paper
- **Multiple Entities**: Support for up to 4 entities charted simultaneously
- **Historical Data**: Automatically loads historical data from Home Assistant
- **Pivoting Pens**: Mechanical pen arms that pivot from the right side, following the chart lines
- **Real-time Updates**: Data collected every 2 seconds and merged with historical data
- **Scrolling Effect**: Chart displays the configured time range with smooth transitions
- **Color Coding**: Each entity has its own customizable color for easy identification
- **Entity Labels**: Automatic display of entity names and current values on the right side
- **Shared Styling**: Uses the same brass rim, rivets, and aged texture options as other Foundry cards

#### Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `entity` | string | **Yes** | - | First entity ID to chart |
| `entity2` | string | No | - | Second entity ID to chart |
| `entity3` | string | No | - | Third entity ID to chart |
| `entity4` | string | No | - | Fourth entity ID to chart |
| `title` | string | No | 'Chart Recorder' | Card title |
| `chart_height` | number | No | 300 | Height of the chart in pixels (100-800) |
| `hours_to_show` | number | No | 1 | Hours of historical data to display (0.25-24) |
| `pen_thickness` | number | No | 1.5 | Thickness of the pen lines (0.5-5) |
| `color` | string | No | '#C41E3A' | Color for entity 1 (hex color code) |
| `color2` | string | No | '#1E3AC4' | Color for entity 2 (hex color code) |
| `color3` | string | No | '#1EC43A' | Color for entity 3 (hex color code) |
| `color4` | string | No | '#C4A61E' | Color for entity 4 (hex color code) |
| `ring_style` | string | No | 'brass' | Decorative ring style: 'none', 'brass', 'silver', or 'black' |
| `rivet_color` | string | No | '#6d5d4b' | Color of the decorative rivets (hex color code) |
| `plate_color` | string | No | '#f0ebe1' | Color of the background plate (hex color code) |
| `plate_transparent` | boolean | No | false | Make the plate transparent (shows background) |
| `wear_level` | number | No | 50 | Amount of wear marks and age spots (0-100) |
| `aged_texture` | string | No | 'everywhere' | Aged texture mode: 'none', 'glass_only', or 'everywhere' |
| `aged_texture_intensity` | number | No | 50 | Intensity of aged texture effect (0-100) |
| `tap_action` | object | No | `{action: 'more-info'}` | Action to perform on tap |
| `hold_action` | object | No | `{action: 'more-info'}` | Action to perform on hold |
| `double_tap_action` | object | No | `{action: 'more-info'}` | Action to perform on double tap |

#### Example Configurations

**Multi-Sensor Environmental Monitor:**
```yaml
type: custom:foundry-chart-card
entity: sensor.living_room_temperature
entity2: sensor.living_room_humidity
entity3: sensor.living_room_pressure
title: "Living Room Environment"
chart_height: 400
hours_to_show: 2
color: "#C41E3A"
color2: "#1E3AC4"
color3: "#1EC43A"
ring_style: brass
wear_level: 60
```

**Energy Monitoring:**
```yaml
type: custom:foundry-chart-card
entity: sensor.house_power_consumption
entity2: sensor.solar_power_production
title: "Power Monitor"
chart_height: 300
hours_to_show: 6
color: "#F44336"
color2: "#4CAF50"
ring_style: black
aged_texture: everywhere
aged_texture_intensity: 70
```

**Temperature Comparison:**
```yaml
type: custom:foundry-chart-card
entity: sensor.indoor_temperature
entity2: sensor.outdoor_temperature
entity3: sensor.basement_temperature
entity4: sensor.attic_temperature
title: "Temperature Zones"
chart_height: 350
hours_to_show: 4
color: "#C41E3A"
color2: "#1E3AC4"
color3: "#1EC43A"
color4: "#C4A61E"
```

## Development

Want to contribute or customize the cards?

### Prerequisites

1. **Install Node.js**
   - Download and install Node.js from [nodejs.org](https://nodejs.org/), which includes `npm`.


### Setting Up Your Development Environment

1. **Clone the Repository**
   ```bash
   git clone https://github.com/dprischak/Foundry-Card.git
   cd Foundry-Card
   ```
   
2. **Install Dependencies**
   ```bash
   npm install
   ```
### Development Workflow

1. **Create a branch and make the changes into that branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. Make Your Changes:
   - Write clean, readable code
   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation if needed 

3. **Build the Project**
   ```bash
   npm run build
   ```

4. Commit your changes
   ```bash
   git add .
   git commit -m "feat: add new feature" # or "fix: resolve bug"
   ```
   
5. Push and Create a Pull Request:
   ```bash
   git push origin feature/your-feature-name
   ```

Then open a pull request on GitHub with a clear description of your changes.

### Ways to Contribute

- **Report Bugs:** Open an issue with detailed steps to reproduce
- **Suggest Features:** Share your ideas for improvements
- **Fix Issues:** Look for open issues and submit fixes
- **Improve Documentation:** Help make the docs clearer and more comprehensive

## Roadmap

Future cards planned for the Foundry Card collection:
- Analog Clock Card
- Vintage Thermometer Card
- Industrial Button Card
- Retro Sliders
- Seismic Graph Card
- Industrial Uptime Card
- Industrial Energy Map
- Industrical Climate Card


## Support

If you encounter any issues or have feature requests:
- [Open an issue](https://github.com/dprischak/Foundry-Card/issues)
- [Start a discussion](https://github.com/dprischak/Foundry-Card/discussions)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Credits

Created by [dprischak](https://github.com/dprischak) and [KeithSobo](https://github.com/KeithSobo)

---

If you find this project useful, consider giving it a ⭐ on GitHub!
