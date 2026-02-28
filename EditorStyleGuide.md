# Foundry Card Editor Style Guide

This document defines the standard structure, ordering, labeling, and property definitions for all Foundry Card editors. When creating or modifying a card editor, follow this guide to ensure consistency across the project.

---

## Group Ordering (Strict)

Groups **must** appear in the following order. Omit a group only if the card has zero properties for it. Never reorder groups.

| Order | Group Name                 | Expandable? | Notes                                              |
| ----- | -------------------------- | ----------- | -------------------------------------------------- |
| 1     | **Top Level**              | No          | Always present                                     |
| 2     | **Card-Specific Settings** | Yes         | Use a card-specific title (e.g., "Chart Settings") |
| 3     | **Color Ranges**           | Yes         | Color segment / threshold definitions              |
| 4     | **Appearance**             | Yes         | Physical / material properties                     |
| 5     | **Colors & Typography**    | Yes         | Element colors, text sizes, display toggles        |
| 6     | **Sub-Component Settings** | Yes         | Use a card-specific title (e.g., "Knob Settings")  |
| 7     | **Actions**                | Yes         | Tap / Hold / Double Tap actions                    |

---

## Group 1: Top Level

No expander. These fields appear at the root of the editor schema.

| YAML Key    | Label     | Selector                                      | Notes                               |
| ----------- | --------- | --------------------------------------------- | ----------------------------------- |
| `entity`    | _(auto)_  | `{ entity: {} }`                              | Required for all entity-based cards |
| `title`     | Title     | `{ text: {} }`                                |                                     |
| `min`       | Minimum   | `{ number: { mode: 'box' } }`                 | Cards with ranges                   |
| `max`       | Maximum   | `{ number: { mode: 'box' } }`                 | Cards with ranges                   |
| `unit`      | Unit      | `{ text: {} }`                                |                                     |
| `step`      | Step      | `{ number: { mode: 'box' } }`                 | Slider                              |
| `time_zone` | Time Zone | `{ text: {} }`                                | Clock cards                         |
| `decimals`  | Decimals  | `{ number: { mode: 'box', min: 0, max: 5 } }` | Gauge                               |

---

## Group 2: Card-Specific Settings

Expandable. Use a title specific to the card type.

| Card   | Group Title       | Contents                                                                   |
| ------ | ----------------- | -------------------------------------------------------------------------- |
| Button | Content Templates | `icon_template`, `name_template`, `state_template`                         |
| Chart  | Chart Settings    | `hours_to_show`, `bucket_count`, `chart_type`, `line_width`, `show_points` |
| Uptime | Uptime Settings   | `hours_to_show`, `update_interval`, `ok`, `ko`, `alias_ok`, `alias_ko`     |

---

## Group 3: Color Ranges

Expandable via `ha-expansion-panel` with header **"Color Ranges"**, `outlined: true`, `expanded: false`. This is a custom UI section (not ha-form).

| Card                        | Data Model | Fields per Entry      | Add Button Text   |
| --------------------------- | ---------- | --------------------- | ----------------- |
| Gauge / Chart / Thermometer | Segments   | `from`, `to`, `color` | + Add Color Range |
| Uptime                      | Thresholds | `value`, `color`      | + Add Color Range |

> [!NOTE]
> All color definition sections must use the title **"Color Ranges"** regardless of the underlying data model. The add button must read **"+ Add Color Range"**. Implementation must use `ha-expansion-panel` (not a plain div with section-header).

---

## Group 4: Appearance

Expandable with title **"Appearance"**. Contains physical, material, and hardware visual properties. Properties should appear in the order listed below.

| YAML Key                 | Label                   | Selector                                           | Dropdown Values                                                                                             | Notes                                                   |
| ------------------------ | ----------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `theme`                  | Theme                   | `{ select: { mode: 'dropdown' } }`                 | `'none'` + loaded theme names                                                                               | Always first in Appearance                              |
| `ring_style`             | Ring Style              | `{ select: { mode: 'dropdown' } }`                 | `'none'`, `'brass'`, `'silver'`, `'chrome'`, `'copper'`, `'black'`, `'white'`, `'blue'`, `'green'`, `'red'` | All cards must include `'none'`. Omit from Title card.  |
| `plate_color`            | Plate Color             | `{ color_rgb: {} }`                                |                                                                                                             | Grid with `rivet_color`                                 |
| `rivet_color`            | Rivet Color             | `{ color_rgb: {} }`                                |                                                                                                             | Grid with `plate_color`                                 |
| `plate_transparent`      | Transparent Plate       | `{ boolean: {} }`                                  |                                                                                                             |                                                         |
| `background_style`       | Background Style        | `{ select: { mode: 'dropdown' } }`                 | `'gradient'` (label: "Gradient"), `'solid'` (label: "Solid Color")                                          | Only on cards with a face                               |
| `face_color`             | Face Color (Solid Mode) | `{ color_rgb: {} }`                                |                                                                                                             | Only when `background_style` exists                     |
| `font_bg_color`          | Screen Background       | `{ color_rgb: {} }`                                |                                                                                                             | Grid with other colors when applicable                  |
| `glass_effect_enabled`   | Glass Effect            | `{ boolean: {} }`                                  |                                                                                                             |                                                         |
| `wear_level`             | Wear Level              | `{ number: { min: 0, max: 100, mode: 'slider' } }` |                                                                                                             |                                                         |
| `aged_texture`           | Aged Texture            | `{ select: { mode: 'dropdown' } }`                 | `'none'`, `'glass_only'`, `'everywhere'`                                                                    | Title card: only `'none'` and `'everywhere'` (no glass) |
| `aged_texture_intensity` | Texture Intensity       | `{ number: { min: 0, max: 100, mode: 'slider' } }` |                                                                                                             |                                                         |

---

## Group 5: Colors & Typography

Expandable with title **"Colors & Typography"**. Contains element colors, text sizes, and display toggles.

### Common Properties

| YAML Key               | Label              | Selector                                       | Notes                      |
| ---------------------- | ------------------ | ---------------------------------------------- | -------------------------- |
| `title_color`          | Title Color        | `{ color_rgb: {} }`                            |                            |
| `font_color`           | Digital Font Color | `{ color_rgb: {} }`                            |                            |
| `number_color`         | Number Color       | `{ color_rgb: {} }`                            | Cards with numbered scales |
| `primary_tick_color`   | Major Tick Color   | `{ color_rgb: {} }`                            | Cards with tick marks      |
| `secondary_tick_color` | Minor Tick Color   | `{ color_rgb: {} }`                            | Cards with tick marks      |
| `title_font_size`      | Title Font Size    | `{ number: { mode: 'box', min: 6, max: 48 } }` |                            |

### Card-Specific Properties

| YAML Key                     | Label                  | Selector                                           | Card(s)       |
| ---------------------------- | ---------------------- | -------------------------------------------------- | ------------- |
| `needle_color`               | Needle Color           | `{ color_rgb: {} }`                                | Gauge         |
| `hour_hand_color`            | Hour Hand              | `{ color_rgb: {} }`                                | Analog Clock  |
| `minute_hand_color`          | Minute Hand            | `{ color_rgb: {} }`                                | Analog Clock  |
| `second_hand_color`          | Second Hand            | `{ color_rgb: {} }`                                | Analog Clock  |
| `second_hand_enabled`        | Show Second Hand       | `{ boolean: {} }`                                  | Analog Clock  |
| `liquid_color`               | Mercury Color          | `{ color_rgb: {} }`                                | Thermometer   |
| `slider_color`               | Track Color            | `{ color_rgb: {} }`                                | Slider        |
| `card_width`                 | Card Max Width         | `{ number: { mode: 'box' } }`                      | Button        |
| `use_24h_format`             | 24-Hour Format         | `{ boolean: {} }`                                  | Digital Clock |
| `show_seconds`               | Show Seconds           | `{ boolean: {} }`                                  | Digital Clock |
| `show_value`                 | Show Value             | `{ boolean: {} }`                                  | Slider        |
| `odometer_font_size`         | Odometer Size          | `{ number: { mode: 'box' } }`                      | Gauge         |
| `odometer_vertical_position` | Odometer Position Y    | `{ number: { mode: 'box' } }`                      | Gauge         |
| `start_angle`                | Start Angle            | `{ number: { min: 0, max: 360, mode: 'slider' } }` | Gauge         |
| `end_angle`                  | End Angle              | `{ number: { min: 0, max: 360, mode: 'slider' } }` | Gauge         |
| `animation_duration`         | Animation Duration (s) | `{ number: { mode: 'box', step: 0.1, min: 0.1 } }` | Gauge         |
| `line_color`                 | Line Color             | `{ color_rgb: {} }`                                | Chart         |
| `grid_minor_color`           | Grid Minor Color       | `{ color_rgb: {} }`                                | Chart         |

---

## Group 6: Sub-Component Settings

Expandable. Use a title specific to the sub-component.

| Card   | Group Title       | Contents                                                                                 |
| ------ | ----------------- | ---------------------------------------------------------------------------------------- |
| Slider | Knob Settings     | `knob_color`, `knob_border_color`, `knob_size`, `knob_border_width`                      |
| Gauge  | High Value Needle | `high_needle_enabled`, `high_needle_color`, `high_needle_duration`, `high_needle_length` |

---

## Group 7: Actions

Expandable with title **"Actions"**. Provides Tap, Hold, and Double Tap action configuration.

Each action type has:
| YAML Key Pattern | Label Pattern | Selector |
|---|---|---|
| `{type}_action_action` | `{Label} Action` | Dropdown: `'more-info'`, `'toggle'`, `'navigate'`, `'call-service'`, `'shake'`, `'none'` |
| `{type}_action_navigation_path` | Navigation Path | `{ text: {} }` — shown when action = `'navigate'` |
| `{type}_action_service` | Service | `{ text: {} }` — shown when action = `'call-service'` |
| `{type}_action_target_entity` | Target Entity | `{ entity: {} }` — shown when action = `'call-service'` |

---

## Color Handling

- **Config storage**: Colors are stored as hex strings (e.g., `'#3e2723'`).
- **Form display**: `ha-form` `color_rgb` selector requires `[r, g, b]` arrays.
- **Conversion**: Every editor must implement `_hexToRgb(hex)` and `_rgbToHex(rgb)` helpers.
- **Theme overrides**: When a user manually changes a theme-controlled property, set `theme: 'none'` and preserve all other themed values.

---

## Reset to Default

Editors that include a "Reset to Default Configuration" button should reset all properties **except** `entity` (or `entities`). The button uses the class `reset-btn` and fires a `config-changed` event with the reset config.
