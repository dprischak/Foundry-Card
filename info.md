# Foundry Card

A collection of custom dashboard cards for Home Assistant.

## Cards Included

### Foundry Gauge Card
A custom card for displaying sensor data in a foundry gauge style.

## Installation

### HACS (Recommended)
1. Open HACS in your Home Assistant instance
2. Go to "Frontend"
3. Click the three dots in the top right corner
4. Select "Custom repositories"
5. Add this repository URL
6. Select "Lovelace" as the category
7. Click "Add"
8. Install "Foundry Card"
9. Restart Home Assistant

### Manual Installation
1. Download `foundry-cards.js` from the latest release
2. Copy it to `config/www/` in your Home Assistant installation
3. Add the following to your `configuration.yaml`:
   ```yaml
   lovelace:
     resources:
       - url: /local/foundry-cards.js
         type: module
   ```
4. Restart Home Assistant

## Usage

Add a card to your dashboard with the following configuration:

```yaml
type: custom:foundry-gauge-card
entity: sensor.your_sensor
name: "Gauge Name"
```

## Configuration Options

| Name | Type | Default | Description |
|------|------|---------|-------------|
| entity | string | **Required** | Entity ID of the sensor |
| name | string | Entity name | Name to display |
| min | number | 0 | Minimum value |
| max | number | 100 | Maximum value |
| unit | string | Entity unit | Unit to display |

## Support

For issues and feature requests, please use the [GitHub issue tracker](https://github.com/dprischak/Foundry-Card/issues).
