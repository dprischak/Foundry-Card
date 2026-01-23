
const fireEvent = (node, type, detail, options) => {
  options = options || {};
  detail = detail === null || detail === undefined ? {} : detail;
  const event = new Event(type, {
    bubbles: options.bubbles === undefined ? true : options.bubbles,
    cancelable: Boolean(options.cancelable),
    composed: options.composed === undefined ? true : options.composed,
  });
  event.detail = detail;
  node.dispatchEvent(event);
  return event;
};

class FoundryThermostatEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  setConfig(config) {
    // Ensure segments is an array
    this._config = {
      ...config,
      segments: Array.isArray(config.segments) ? config.segments : []
    };
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  render() {
    if (!this._hass || !this._config) return;

    if (!this._root) {
      this._root = document.createElement("div");
      this._root.className = "card-config";
      const style = document.createElement("style");
      style.textContent = `
                .card-config { display: flex; flex-direction: column; gap: 16px; }
                
                /* Segment Styles */
                .segments-section {
                  margin: 8px 0;
                  padding: 16px;
                  background: var(--card-background-color, #fff);
                  border: 1px solid var(--divider-color, #e0e0e0);
                  border-radius: 4px;
                }
                .section-header {
                  font-weight: 500;
                  margin-bottom: 12px;
                  color: var(--primary-text-color);
                  font-size: 16px;
                }
                .segment-row {
                  display: flex;
                  gap: 8px;
                  align-items: flex-end;
                  margin-bottom: 12px;
                  background: var(--secondary-background-color, #f9f9f9);
                  padding: 10px;
                  border-radius: 4px;
                }
                .input-group {
                  flex: 1;
                  display: flex;
                  flex-direction: column;
                  gap: 4px;
                }
                .input-group label {
                  font-size: 11px;
                  color: var(--secondary-text-color);
                  text-transform: uppercase;
                  font-weight: 600;
                }
                .input-group input {
                  width: 100%;
                  padding: 8px;
                  box-sizing: border-box;
                  border: 1px solid var(--divider-color, #ccc);
                  border-radius: 4px;
                  background: var(--card-background-color, #fff);
                  color: var(--primary-text-color);
                }
                .input-group input[type="color"] {
                  height: 36px;
                  padding: 2px;
                  cursor: pointer;
                }
                .remove-btn {
                  background: none;
                  border: none;
                  color: var(--error-color, #db4437);
                  cursor: pointer;
                  padding: 8px;
                  height: 36px;
                  display: flex;
                  align-items: center;
                }
                .add-btn {
                  background-color: var(--primary-color, #03a9f4);
                  color: white;
                  border: none;
                  padding: 8px 16px;
                  border-radius: 4px;
                  cursor: pointer;
                  font-weight: 500;
                  font-size: 14px;
                  margin-top: 4px;
                }
            `;
      this.shadowRoot.appendChild(style);
      this.shadowRoot.appendChild(this._root);

      // Form 1: Entity, Range, Segments, Title Color
      this._form1 = document.createElement("ha-form");
      this._form1.computeLabel = this._computeLabel;
      this._form1.addEventListener("value-changed", (ev) => this._handleFormChanged(ev));
      this._root.appendChild(this._form1);

      // Segments UI
      this._segmentsContainer = document.createElement("div");
      this._segmentsContainer.className = "segments-section";
      this._root.appendChild(this._segmentsContainer);

      // Form 2: Appearance
      this._form2 = document.createElement("ha-form");
      this._form2.computeLabel = this._computeLabel;
      this._form2.addEventListener("value-changed", (ev) => this._handleFormChanged(ev));
      this._root.appendChild(this._form2);
    }

    const formData = this._configToForm(this._config);

    if (this._form1) {
      this._form1.hass = this._hass;
      this._form1.data = formData;
      this._form1.schema = this._getSchemaTop();
    }

    // Render Segments
    this._renderSegments();

    if (this._form2) {
      this._form2.hass = this._hass;
      this._form2.data = formData;
      this._form2.schema = this._getSchemaBottom();
    }
  }

  _renderSegments() {
    if (!this._segmentsContainer) return;
    const segments = this._config.segments || [];

    let html = `<div class="section-header">Color Ranges (Right Side)</div>`;

    if (segments.length === 0) {
      html += `<div style="font-style: italic; color: var(--secondary-text-color); margin-bottom: 12px;">No segments defined.</div>`;
    }

    segments.forEach((seg, index) => {
      const fromVal = seg.from !== undefined ? seg.from : 0;
      const toVal = seg.to !== undefined ? seg.to : 0;
      const colVal = seg.color || "#000000";

      html += `
                <div class="segment-row">
                  <div class="input-group">
                    <label>From</label>
                    <input type="number" class="seg-input" data-idx="${index}" data-key="from" value="${fromVal}">
                  </div>
                  <div class="input-group">
                    <label>To</label>
                    <input type="number" class="seg-input" data-idx="${index}" data-key="to" value="${toVal}">
                  </div>
                  <div class="input-group">
                    <label>Color</label>
                    <input type="color" class="seg-input" data-idx="${index}" data-key="color" value="${colVal}">
                  </div>
                  <button class="remove-btn" data-idx="${index}" title="Remove">❌</button>
                </div>
            `;
    });

    html += `<button id="add-btn" class="add-btn">+ Add Color Range</button>`;
    this._segmentsContainer.innerHTML = html;

    // Listeners for inputs
    this._segmentsContainer.querySelectorAll('.seg-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const idx = parseInt(e.target.dataset.idx);
        const key = e.target.dataset.key;
        let val = e.target.value;
        if (key !== 'color') val = Number(val);
        this._updateSegment(idx, key, val);
      });
    });

    // Listeners for buttons
    this._segmentsContainer.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this._removeSegment(parseInt(e.target.dataset.idx)));
    });
    const addBtn = this._segmentsContainer.querySelector('#add-btn');
    if (addBtn) addBtn.addEventListener('click', () => this._addSegment());
  }

  _updateSegment(index, key, value) {
    const segments = [...(this._config.segments || [])];
    if (segments[index]) {
      segments[index] = { ...segments[index], [key]: value };
      this._updateConfig({ segments });
    }
  }

  _addSegment() {
    const segments = [...(this._config.segments || [])];
    const last = segments[segments.length - 1];
    const from = last ? last.to : (this._config.min || 0);
    const to = from + 10;
    segments.push({ from, to, color: "#4CAF50" });
    this._updateConfig({ segments });
  }

  _removeSegment(index) {
    const segments = [...(this._config.segments || [])];
    segments.splice(index, 1);
    this._updateConfig({ segments });
  }

  _updateConfig(updates) {
    this._config = { ...this._config, ...updates };
    fireEvent(this, "config-changed", { config: this._config });
  }

  _handleFormChanged(ev) {
    const newConfig = this._formToConfig(ev.detail.value);
    if (JSON.stringify(this._config) !== JSON.stringify(newConfig)) {
      this._updateConfig(newConfig);
    }
  }

  _configToForm(config) {
    const data = { ...config };

    // Color Conversions
    data.liquid_color = this._hexToRgb(config.liquid_color ?? "#cc0000") || [204, 0, 0];
    data.plate_color = this._hexToRgb(config.plate_color ?? "#f5f5f5") || [245, 245, 245];
    data.rivet_color = this._hexToRgb(config.rivet_color ?? "#6d5d4b") || [109, 93, 75];
    data.font_bg_color = this._hexToRgb(config.font_bg_color ?? "#ffffff") || [255, 255, 255];
    data.title_font_color = this._hexToRgb(config.title_font_color ?? "#3e2723") || [62, 39, 35];

    // Defaults
    data.ring_style = config.ring_style ?? "brass";
    data.min = config.min ?? -40;
    data.max = config.max ?? 120;
    data.mercury_width = config.mercury_width ?? 50;
    data.animation_duration = config.animation_duration ?? 1.5;
    data.segments_under_mercury = config.segments_under_mercury ?? true;

    data.plate_transparent = config.plate_transparent ?? false;
    data.glass_effect_enabled = config.glass_effect_enabled ?? true;
    data.wear_level = config.wear_level ?? 50;
    data.aged_texture = config.aged_texture ?? "everywhere";
    data.aged_texture_intensity = config.aged_texture_intensity ?? 50;

    return data;
  }

  _formToConfig(formData) {
    const config = { ...this._config, ...formData };

    if (config.liquid_color) config.liquid_color = this._rgbToHex(config.liquid_color);
    if (config.plate_color) config.plate_color = this._rgbToHex(config.plate_color);
    if (config.rivet_color) config.rivet_color = this._rgbToHex(config.rivet_color);
    if (config.font_bg_color) config.font_bg_color = this._rgbToHex(config.font_bg_color);
    if (config.title_font_color) config.title_font_color = this._rgbToHex(config.title_font_color);

    return config;
  }

  _getSchemaTop() {
    return [
      { name: "entity", selector: { entity: { domain: "sensor" } } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "title", selector: { text: {} } },
          { name: "title_font_color", label: "Title Color", selector: { color_rgb: {} } },
        ]
      },

      { name: "unit", selector: { text: {} } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "min", selector: { number: { mode: "box" } } },
          { name: "max", selector: { number: { mode: "box" } } },
          { name: "segments_under_mercury", label: "Segments Behind Liquid", selector: { boolean: {} } },
          {
            name: "mercury_width",
            label: "Mercury Width (%)",
            selector: { number: { min: 5, max: 100, mode: "slider" } }
          },
          {
            name: "animation_duration",
            label: "Anim. Duration (s)",
            selector: { number: { min: 0.1, max: 10, step: 0.1, mode: "box" } }
          }
        ]
      }
    ];
  }

  _getSchemaBottom() {
    return [
      {
        name: "",
        type: "expandable",
        title: "Appearance",
        schema: [
          {
            name: "ring_style",
            label: "Casing Style",
            selector: {
              select: {
                mode: "dropdown",
                options: [
                  { value: "brass", label: "Brass" },
                  { value: "silver", label: "Silver" },
                  { value: "copper", label: "Copper" },
                  { value: "black", label: "Black" },
                  { value: "white", label: "White" },
                  { value: "blue", label: "Blue" },
                  { value: "green", label: "Green" },
                  { value: "red", label: "Red" }
                ]
              }
            }
          },
          {
            type: "grid",
            name: "",
            schema: [
              { name: "liquid_color", label: "Mercury Color", selector: { color_rgb: {} } },
              { name: "plate_color", label: "Plate Color", selector: { color_rgb: {} } },
              { name: "rivet_color", label: "Rivet Color", selector: { color_rgb: {} } },
              { name: "font_bg_color", label: "Tube Background", selector: { color_rgb: {} } },
            ]
          },
          { name: "plate_transparent", label: "Transparent Plate", selector: { boolean: {} } },
          { name: "glass_effect_enabled", label: "Glass Effect", selector: { boolean: {} } },
          { name: "wear_level", label: "Wear Level (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
          {
            name: "aged_texture",
            label: "Aged Texture Style",
            selector: {
              select: {
                mode: "dropdown",
                options: [
                  { value: "none", label: "None" },
                  { value: "glass_only", label: "Glass Only" },
                  { value: "everywhere", label: "Everywhere" }
                ]
              }
            }
          },
          { name: "aged_texture_intensity", label: "Texture Intensity (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
          { name: "tap_action", label: "Tap Action", selector: { "ui-action": {} } }
        ]
      }
    ];
  }

  _hexToRgb(hex) {
    if (typeof hex !== "string") return null;
    const h = hex.replace("#", "").trim();
    if (h.length !== 6) return null;
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    if ([r, g, b].some(Number.isNaN)) return null;
    return [r, g, b];
  }

  _rgbToHex(input) {
    let rgb = input;
    if (rgb && typeof rgb === "object" && !Array.isArray(rgb)) {
      if (Array.isArray(rgb.color)) rgb = rgb.color;
      else if ("r" in rgb && "g" in rgb && "b" in rgb) rgb = [rgb.r, rgb.g, rgb.b];
    }
    if (!Array.isArray(rgb) || rgb.length !== 3) return null;
    const [r, g, b] = rgb.map((n) => Math.max(0, Math.min(255, Math.round(Number(n)))));
    const toHex = (n) => n.toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  _computeLabel(schema) {
    if (schema.label) return schema.label;
    return schema.name;
  }
}

if (!customElements.get("foundry-thermostat-editor")) {
  customElements.define("foundry-thermostat-editor", FoundryThermostatEditor);
}
