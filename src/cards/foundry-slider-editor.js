class FoundrySliderEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    this._config = { ...config };
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._form) this._form.hass = hass;
  }

  render() {
    if (!this._hass || !this._config) return;
    if (!this._root) {
      this._root = document.createElement('div');
      const style = document.createElement('style');
      style.textContent = `
        .card-config { display:flex; flex-direction:column; gap:12px; }
      `;
      this.shadowRoot.appendChild(style);
      this.shadowRoot.appendChild(this._root);

      this._form = document.createElement('ha-form');
      this._form.addEventListener('value-changed', this._handleFormChanged.bind(this));
      this._root.appendChild(this._form);
    }

    if (this._form) this._form.hass = this._hass;

    const formData = this._configToForm(this._config);
    this._form.schema = this._getSchema();
    this._form.data = formData;
    this._form.computeLabel = (s) => s.label || s.name;
  }

  _handleFormChanged(ev) {
    const newConfig = this._formToConfig(ev.detail.value);
    if (JSON.stringify(this._config) !== JSON.stringify(newConfig)) {
      this._config = newConfig;
      this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config }, bubbles: true, composed: true }));
    }
  }

  _configToForm(config) {
    const data = { ...config };
    data.appearance = {
      ring_style: config.ring_style ?? 'brass',
      font_bg_color: this._hexToRgb(config.font_bg_color ?? '#ffffff') ?? [255,255,255],
      font_color: this._hexToRgb(config.font_color ?? '#000000') ?? [0,0,0],
      rivet_color: this._hexToRgb(config.rivet_color ?? '#6d5d4b') ?? [109,93,75],
      plate_color: this._hexToRgb(config.plate_color ?? '#f5f5f5') ?? [245,245,245],
      slider_color: this._hexToRgb(config.slider_color ?? '#444444') ?? [68,68,68],
      knob_color: this._hexToRgb(config.knob_color ?? '#c9a961') ?? [201,169,97],
      plate_transparent: config.plate_transparent ?? false,
      show_value: config.show_value ?? true
    };
    return data;
  }

  _formToConfig(formData) {
    const config = { ...this._config };
    Object.keys(formData).forEach(k => {
      if (k === 'appearance') return;
      config[k] = formData[k];
    });
    if (formData.appearance) {
      Object.assign(config, formData.appearance);
      config.font_bg_color = this._rgbToHex(config.font_bg_color);
      config.font_color = this._rgbToHex(config.font_color);
      config.rivet_color = this._rgbToHex(config.rivet_color);
      config.plate_color = this._rgbToHex(config.plate_color);
      config.slider_color = this._rgbToHex(config.slider_color);
      config.knob_color = this._rgbToHex(config.knob_color);
    }
    return config;
  }

  _getSchema() {
    return [
      { name: 'entity', selector: { entity: {} } },
      { name: 'title', selector: { text: {} } },
      { name: 'min', label: 'Minimum', selector: { number: { mode: 'box' } } },
      { name: 'max', label: 'Maximum', selector: { number: { mode: 'box' } } },
      { name: 'step', label: 'Step', selector: { number: { mode: 'box' } } },
      { name: 'value', label: 'Initial Value', selector: { number: { mode: 'box' } } },
      { name: 'orientation', label: 'Orientation', selector: { select: { options: [ { value: 'vertical', label: 'Vertical' }, { value: 'horizontal', label: 'Horizontal' } ] } } },
      { name: 'value_position', label: 'Value Position', selector: { select: { options: [ { value: 'above', label: 'Above' }, { value: 'below', label: 'Below' }, { value: 'left', label: 'Left' }, { value: 'right', label: 'Right' } ] } } },
      {
        name: 'appearance',
        type: 'expandable',
        title: 'Appearance',
        schema: [
          { name: 'ring_style', label: 'Ring Style', selector: { select: { options: [ { value: 'brass', label: 'Brass' }, { value: 'silver', label: 'Silver' }, { value: 'chrome', label: 'Chrome' }, { value: 'copper', label: 'Copper' }, { value: 'black', label: 'Black' }, { value: 'white', label: 'White' }, { value: 'blue', label: 'Blue' }, { value: 'green', label: 'Green' }, { value: 'red', label: 'Red' } ] } } },
          { type: 'grid', name: '', schema: [ { name: 'font_bg_color', label: 'Value Background', selector: { color_rgb: {} } }, { name: 'font_color', label: 'Value Color', selector: { color_rgb: {} } }, { name: 'plate_color', label: 'Plate Color', selector: { color_rgb: {} } }, { name: 'rivet_color', label: 'Rivet Color', selector: { color_rgb: {} } } ] },
          { type: 'grid', name: '', schema: [ { name: 'slider_color', label: 'Track Color', selector: { color_rgb: {} } }, { name: 'knob_color', label: 'Knob Color', selector: { color_rgb: {} } } ] },
          { name: 'plate_transparent', label: 'Transparent Plate', selector: { boolean: {} } },
          { name: 'show_value', label: 'Show Value', selector: { boolean: {} } }
        ]
      }
    ];
  }

  _hexToRgb(hex) {
    if (typeof hex !== 'string') return null;
    const h = hex.replace('#','').trim();
    if (h.length !== 6) return null;
    const r = parseInt(h.slice(0,2),16);
    const g = parseInt(h.slice(2,4),16);
    const b = parseInt(h.slice(4,6),16);
    if ([r,g,b].some(Number.isNaN)) return null;
    return [r,g,b];
  }

  _rgbToHex(input) {
    let rgb = input;
    if (rgb && typeof rgb === 'object' && !Array.isArray(rgb)) {
      if (Array.isArray(rgb.color)) rgb = rgb.color;
      else if ('r' in rgb && 'g' in rgb && 'b' in rgb) rgb = [rgb.r, rgb.g, rgb.b];
    }
    if (!Array.isArray(rgb) || rgb.length !== 3) return null;
    const [r,g,b] = rgb.map((n) => Math.max(0, Math.min(255, Math.round(Number(n)))));
    const toHex = (n) => n.toString(16).padStart(2,'0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
}

if (!customElements.get('foundry-slider-editor')) {
  customElements.define('foundry-slider-editor', FoundrySliderEditor);
}
