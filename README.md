# Foundry Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)
[![GitHub release](https://img.shields.io/github/release/dprischak/Foundry-Card.svg)](https://github.com/dprischak/Foundry-Card/releases)
[![License](https://img.shields.io/github/license/dprischak/Foundry-Card.svg)](LICENSE)

A collection of custom dashboard cards for Home Assistant, designed with industrial and vintage aesthetics.

## Cards Included

### 🌡️ Steam Gauge Card
Display your sensor data with a beautiful steam gauge visualization featuring:
- Customizable min/max values
- Smooth needle animation
- Theme-aware colors
- Responsive design

![Steam Gauge Card Preview](https://via.placeholder.com/400x300?text=Steam+Gauge+Card+Preview)

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

1. Download `steam-gauge-card.js` from the [latest release](https://github.com/dprischak/Foundry-Card/releases)
2. Copy it to `<config>/www/` directory (create the `www` folder if it doesn't exist)
3. Add the resource to your Lovelace dashboard:
   - Go to Settings → Dashboards → Resources
   - Click "Add Resource"
   - URL: `/local/steam-gauge-card.js`
   - Resource type: JavaScript Module
4. Refresh your browser

## Usage

### Steam Gauge Card

Add the card to your dashboard:

```yaml
type: custom:steam-gauge-card
entity: sensor.temperature
name: "Temperature"
min: 0
max: 100
unit: "°C"
```

#### Configuration Options

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `entity` | string | **Required** | Entity ID of the sensor to display |
| `name` | string | Entity name | Display name for the gauge |
| `min` | number | 0 | Minimum value on the gauge |
| `max` | number | 100 | Maximum value on the gauge |
| `unit` | string | Entity unit | Unit of measurement to display |

#### Example Configurations

**Temperature Sensor:**
```yaml
type: custom:steam-gauge-card
entity: sensor.living_room_temperature
name: "Living Room"
min: 10
max: 35
unit: "°C"
```

**Humidity Sensor:**
```yaml
type: custom:steam-gauge-card
entity: sensor.bathroom_humidity
name: "Bathroom Humidity"
min: 0
max: 100
unit: "%"
```

**Custom Range:**
```yaml
type: custom:steam-gauge-card
entity: sensor.pressure
name: "Pressure"
min: 900
max: 1100
unit: "hPa"
```

## Development

Want to contribute or customize the cards?

1. Clone the repository
2. Make your changes to the files in `dist/`
3. Test in your Home Assistant instance
4. Submit a pull request

## Roadmap

Future cards planned for the Foundry Card collection:
- Analog Clock Card
- Vintage Meter Card
- Industrial Switch Card
- Retro Display Card

## Support

If you encounter any issues or have feature requests:
- [Open an issue](https://github.com/dprischak/Foundry-Card/issues)
- [Start a discussion](https://github.com/dprischak/Foundry-Card/discussions)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Credits

Created by [dprischak](https://github.com/dprischak)

---

If you find this project useful, consider giving it a ⭐ on GitHub!