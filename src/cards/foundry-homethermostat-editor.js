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

class FoundryHomeThermostatEditor extends HTMLElement {
  setConfig(config) {
    this._config = { ...config };
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  render() {
    if (!this._hass || !this._config) return;

    const schema = this._getSchema();
    const data = this._configToForm(this._config);

    const element = this.querySelector('ha-form');
    if (element) {
      element.hass = this._hass;
      element.data = data;
      element.schema = schema;
      element.computeLabel = this._computeLabel;
      return;
    }

    const container = document.createElement('div');
    const form = document.createElement('ha-form');
    form.hass = this._hass;
    form.data = data;
    form.schema = schema;
    form.computeLabel = this._computeLabel;

    form.addEventListener('value-changed', (ev) => {
      this._handleFormChanged(ev);
    });

    container.appendChild(form);
    this.innerHTML = '';
    this.appendChild(container);
  }

  _handleFormChanged(ev) {
    const newConfig = this._formToConfig(ev.detail.value);
    this._config = newConfig;
    fireEvent(this, 'config-changed', { config: this._config });
  }

  _getSchema() {
    return [
      {
        name: 'entity',
        label: 'Entity (Climate)',
        selector: { entity: { domain: 'climate' } },
      },
      {
        name: 'title',
        label: 'Title',
        selector: { text: {} },
      },
      // Scale removed as requested
      {
        name: '',
        type: 'expandable',
        title: 'Appearance',
        schema: [
          {
            name: 'ring_style',
            label: 'Ring Style',
            selector: {
              select: {
                mode: 'dropdown',
                options: [
                  { value: 'brass', label: 'Brass' },
                  { value: 'silver', label: 'Silver' },
                  { value: 'chrome', label: 'Chrome' },
                  { value: 'copper', label: 'Copper' },
                  { value: 'black', label: 'Black' },
                  { value: 'white', label: 'White' },
                  { value: 'blue', label: 'Blue' },
                  { value: 'green', label: 'Green' },
                  { value: 'red', label: 'Red' },
                ],
              },
            },
          },
          {
            type: 'grid',
            name: '',
            schema: [
              {
                name: 'font_bg_color',
                label: 'Screen Background',
                selector: { color_rgb: {} },
              },
              {
                name: 'font_color',
                label: 'Digital Font Color',
                selector: { color_rgb: {} },
              },
              {
                name: 'plate_color',
                label: 'Plate Color',
                selector: { color_rgb: {} },
              },
              {
                name: 'title_color',
                label: 'Title Color',
                selector: { color_rgb: {} },
              },
              {
                name: 'rivet_color',
                label: 'Rivet Color',
                selector: { color_rgb: {} },
              },
            ],
          },
          {
            name: 'plate_transparent',
            label: 'Transparent Plate',
            selector: { boolean: {} },
          },
          {
            name: 'glass_effect_enabled',
            label: 'Glass Effect',
            selector: { boolean: {} },
          },
          {
            name: 'wear_level',
            label: 'Wear Level (%)',
            selector: { number: { min: 0, max: 100, mode: 'slider' } },
          },
          {
            name: 'aged_texture',
            label: 'Aged Texture/Noise',
            selector: {
              select: {
                mode: 'dropdown',
                options: [
                  { value: 'none', label: 'None' },
                  { value: 'glass_only', label: 'Glass Only' },
                  { value: 'everywhere', label: 'Everywhere' },
                ],
              },
            },
          },
          {
            name: 'aged_texture_intensity',
            label: 'Texture Intensity (%)',
            selector: { number: { min: 0, max: 100, mode: 'slider' } },
          },
        ],
      },
    ];
  }

  _configToForm(config) {
    const data = { ...config };

    // Defaults
    data.title = config.title ?? 'Thermostat';

    data.ring_style = config.ring_style ?? 'brass';

    data.title_color = this._hexToRgb(config.title_color ?? '#3e2723') ?? [62, 39, 35];
    data.font_bg_color = this._hexToRgb(config.font_bg_color ?? '#1a1a1a') ?? [26, 26, 26];
    data.font_color = this._hexToRgb(config.font_color ?? '#ff0055') ?? [255, 0, 85];
    data.rivet_color = this._hexToRgb(config.rivet_color ?? '#6d5d4b') ?? [109, 93, 75];
    data.plate_color = this._hexToRgb(config.plate_color ?? '#2b2b2b') ?? [43, 43, 43];

    data.plate_transparent = config.plate_transparent ?? false;
    data.wear_level = config.wear_level ?? 50;
    data.glass_effect_enabled = config.glass_effect_enabled ?? true;
    data.aged_texture = config.aged_texture ?? 'everywhere';
    data.aged_texture_intensity = config.aged_texture_intensity ?? 50;

    return data;
  }

  _formToConfig(formData) {
    const config = { ...this._config, ...formData };

    if (config.title_color) config.title_color = this._rgbToHex(config.title_color);
    if (config.font_bg_color) config.font_bg_color = this._rgbToHex(config.font_bg_color);
    if (config.font_color) config.font_color = this._rgbToHex(config.font_color);
    if (config.rivet_color) config.rivet_color = this._rgbToHex(config.rivet_color);
    if (config.plate_color) config.plate_color = this._rgbToHex(config.plate_color);

    return config;
  }

  _hexToRgb(hex) {
    if (typeof hex !== 'string') return null;
    const h = hex.replace('#', '').trim();
    if (h.length !== 6) return null;
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    if ([r, g, b].some(Number.isNaN)) return null;
    return [r, g, b];
  }

  _rgbToHex(input) {
    let rgb = input;
    if (rgb && typeof rgb === 'object' && !Array.isArray(rgb)) {
      if (Array.isArray(rgb.color)) rgb = rgb.color;
      else if ('r' in rgb && 'g' in rgb && 'b' in rgb)
        rgb = [rgb.r, rgb.g, rgb.b];
    }
    if (!Array.isArray(rgb) || rgb.length !== 3) return null;
    const [r, g, b] = rgb.map((n) =>
      Math.max(0, Math.min(255, Math.round(Number(n))))
    );
    const toHex = (n) => n.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  _computeLabel(schema) {
    if (schema.label) return schema.label;
    return schema.name;
  }
}

customElements.define('foundry-homethermostat-editor', FoundryHomeThermostatEditor);
