import { loadThemes, applyTheme } from './themes.js';

class FoundryDigitalClockCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._themes = {};
    this._themesLoaded = false;
  }

  setConfig(config) {
    this._config = { ...config };
    this.render();
    if (!this._themesLoaded) {
      this._loadThemes();
    }
  }

  async _loadThemes() {
    try {
      this._themes = await loadThemes();
      this._themesLoaded = true;
      this.render();
    } catch (e) {
      console.error('Error loading themes:', e);
    }
  }

  set hass(hass) {
    this._hass = hass;
    if (this._form1) this._form1.hass = hass;
    if (this._form2) this._form2.hass = hass;
  }

  render() {
    if (!this._hass || !this._config) return;

    if (!this._root) {
      this._root = document.createElement('div');
      const style = document.createElement('style');
      style.textContent = `
        .card-config { display: flex; flex-direction: column; gap: 16px; }
        .reset-btn {
          background-color: var(--secondary-text-color, #757575);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          font-size: 14px;
          margin-top: 12px;
          width: 100%;
        }
        .reset-btn:hover {
          background-color: var(--error-color, #db4437);
        }
      `;
      this.shadowRoot.appendChild(style);
      this.shadowRoot.appendChild(this._root);

      this._form1 = document.createElement('ha-form');
      this._form1.addEventListener(
        'value-changed',
        this._handleFormChanged.bind(this)
      );
      this._root.appendChild(this._form1);

      this._form2 = document.createElement('ha-form');
      this._form2.addEventListener(
        'value-changed',
        this._handleFormChanged.bind(this)
      );
      this._root.appendChild(this._form2);
    }

    if (this._form1) this._form1.hass = this._hass;
    if (this._form2) this._form2.hass = this._hass;

    const formData = this._configToForm(this._config);

    this._form1.schema = this._getSchemaTop(formData);
    this._form1.data = formData;
    this._form1.computeLabel = this._computeLabel;

    this._form2.schema = this._getSchemaBottom(formData);
    this._form2.data = formData;
    this._form2.computeLabel = this._computeLabel;
  }

  async _handleFormChanged(ev) {
    let newConfig = this._formToConfig(ev.detail.value);

    // Check if theme changed
    if (
      newConfig.theme &&
      newConfig.theme !== this._config.theme &&
      this._themes &&
      this._themes[newConfig.theme]
    ) {
      newConfig = applyTheme(newConfig, this._themes[newConfig.theme]);
    }

    // Remove theme from config so it doesn't persist in YAML
    delete newConfig.theme;

    if (JSON.stringify(this._config) !== JSON.stringify(newConfig)) {
      this._config = newConfig;
      this.dispatchEvent(
        new CustomEvent('config-changed', {
          detail: { config: this._config },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  _configToForm(config) {
    const data = { ...config };
    data.appearance = {
      ring_style: config.ring_style ?? 'brass',
      font_bg_color: this._hexToRgb(config.font_bg_color ?? '#ffffff') ?? [
        255, 255, 255,
      ],
      font_color: this._hexToRgb(config.font_color ?? '#000000') ?? [0, 0, 0],
      title_color: this._hexToRgb(
        config.title_color || config.title_font_color || '#3e2723'
      ) ?? [62, 39, 35],
      rivet_color: this._hexToRgb(config.rivet_color ?? '#6d5d4b') ?? [
        109, 93, 75,
      ],
      plate_color: this._hexToRgb(config.plate_color ?? '#f5f5f5') ?? [
        245, 245, 245,
      ],
      plate_transparent: config.plate_transparent ?? false,
      wear_level: config.wear_level ?? 50,
      glass_effect_enabled: config.glass_effect_enabled ?? true,
      aged_texture: config.aged_texture ?? 'everywhere',
      aged_texture_intensity: config.aged_texture_intensity ?? 50,
    };
    data.layout = {
      title_font_size: config.title_font_size ?? 14,
      use_24h_format: config.use_24h_format ?? true,
      show_seconds: config.show_seconds ?? true,
    };

    return data;
  }

  _formToConfig(formData) {
    const config = { ...this._config };

    // Copy top-level
    Object.keys(formData).forEach((key) => {
      if (['appearance', 'layout'].includes(key)) return;
      config[key] = formData[key];
    });

    // Copy appearance
    if (formData.appearance) {
      Object.assign(config, formData.appearance);
      // Convert colors back to hex
      config.font_bg_color = this._rgbToHex(config.font_bg_color);
      config.font_color = this._rgbToHex(config.font_color);
      config.title_color = this._rgbToHex(config.title_color);
      config.rivet_color = this._rgbToHex(config.rivet_color);
      config.plate_color = this._rgbToHex(config.plate_color);
    }

    // Copy layout
    if (formData.layout) {
      Object.assign(config, formData.layout);
    }

    return config;
  }

  _getSchemaTop(_formData) {
    return [
      { name: 'entity', selector: { entity: {} } },
      { name: 'title', selector: { text: {} } },
      {
        name: 'time_zone',
        label: 'Time Zone',
        selector: {
          select: {
            mode: 'dropdown',
            options: [
              { value: '', label: 'Local Time' },
              { value: 'Etc/UTC', label: 'UTC' },
              { value: 'America/New_York', label: 'New York (Eastern)' },
              { value: 'America/Chicago', label: 'Chicago (Central)' },
              { value: 'America/Denver', label: 'Denver (Mountain)' },
              { value: 'America/Los_Angeles', label: 'Los Angeles (Pacific)' },
              { value: 'America/Phoenix', label: 'Phoenix (MST)' },
              { value: 'America/Anchorage', label: 'Anchorage (Alaska)' },
              { value: 'Pacific/Honolulu', label: 'Honolulu (Hawaii)' },
              { value: 'Europe/London', label: 'London (GMT/BST)' },
              { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
              { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
              { value: 'Europe/Moscow', label: 'Moscow (MSK)' },
              { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
              { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
              { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)' },
              { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
              { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
              { value: 'Pacific/Auckland', label: 'Auckland (NZST/NZDT)' },
            ],
          },
        },
      },
      {
        name: 'layout',
        type: 'expandable',
        title: 'Layout & Text',
        schema: [
          {
            name: 'title_font_size',
            label: 'Title Font Size',
            selector: { number: { mode: 'box' } },
          },
          {
            name: 'use_24h_format',
            label: 'Use 24h Format',
            selector: { boolean: {} },
          },
          {
            name: 'show_seconds',
            label: 'Show Seconds',
            selector: { boolean: {} },
          },
        ],
      },
    ];
  }

  _getSchemaBottom(_formData) {
    return [
      {
        name: 'appearance',
        type: 'expandable',
        title: 'Appearance',
        schema: [
          {
            name: 'theme',
            label: 'Theme',
            selector: {
              select: {
                mode: 'dropdown',
                options: [
                  { value: 'none', label: 'None/Custom' },
                  ...Object.keys(this._themes || {}).map((t) => ({
                    value: t,
                    label: t.charAt(0).toUpperCase() + t.slice(1),
                  })),
                ],
              },
            },
          },
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
                name: 'title_color',
                label: 'Title Color',
                selector: { color_rgb: {} },
              },
              {
                name: 'plate_color',
                label: 'Plate Color',
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
            label: 'Aged Texture Style',
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
    // Make sure values are valid
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

if (!customElements.get('foundry-digital-clock-editor')) {
  customElements.define(
    'foundry-digital-clock-editor',
    FoundryDigitalClockCardEditor
  );
}
