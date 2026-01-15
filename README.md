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

![Foundry Gauge Card Preview](https://via.placeholder.com/400x300?text=Foundry+Gauge+Card+Preview)

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
type: custom:foundry-gauge-card
entity: sensor.living_room_temperature
name: "Living Room"
min: 10
max: 35
unit: "°C"
```

**Humidity Sensor:**
```yaml
type: custom:foundry-gauge-card
entity: sensor.bathroom_humidity
name: "Bathroom Humidity"
min: 0
max: 100
unit: "%"
```

**Custom Range:**
```yaml
type: custom:foundry-gauge-card
entity: sensor.pressure
name: "Pressure"
min: 900
max: 1100
unit: "hPa"
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
