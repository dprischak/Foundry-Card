import { loadThemes, applyTheme } from './themes.js';

class FoundrySliderEditor extends HTMLElement {
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
    if (this._form) this._form.hass = hass;
  }

  render() {
    if (!this._hass || !this._config) return;
    if (!this._root) {
      this._root = document.createElement('div');
      const style = document.createElement('style');
      style.textContent = `
        .card-config { display:flex; flex-direction:column; gap:12px; }
        .actions { display:flex; justify-content:flex-end; }
      `;
      this.shadowRoot.appendChild(style);
      this.shadowRoot.appendChild(this._root);

      this._form = document.createElement('ha-form');
      this._form.addEventListener(
        'value-changed',
        this._handleFormChanged.bind(this)
      );
      this._root.appendChild(this._form);

      this._actions = document.createElement('div');
      this._actions.classList.add('actions');

      this._restoreButton = document.createElement('ha-button');
      this._restoreButton.textContent = 'Restore Defaults';
      this._restoreButton.addEventListener(
        'click',
        this._restoreDefaults.bind(this)
      );

      this._actions.appendChild(this._restoreButton);
      this._root.appendChild(this._actions);
    }

    if (this._form) this._form.hass = this._hass;

    const formData = this._configToForm(this._config);
    this._form.schema = this._getSchema();
    this._form.data = formData;
    this._form.computeLabel = (s) => s.label || s.name;
  }

  _handleFormChanged(ev) {
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

  _restoreDefaults() {
    const defaults = {
      type: 'custom:foundry-slider-card',
      title: 'Slider',
      min: 0,
      max: 100,
      step: 1,
      value: 50,
      ring_style: 'brass',
      face_color: '#ffffff',
      plate_color: '#8c7626',
      plate_transparent: false,
      rivet_color: '#6a5816',
      slider_color: '#444444',
      knob_color: '#c9a961',
      knob_shape: 'square',
      knob_size: 100,
      tick_color: 'rgba(0,0,0,0.22)',
      font_bg_color: '#ffffff',
      font_color: '#000000',
      title_color: '#3e2723',
      title_font_size: 14,
      value_font_size: 36,
      show_value: true,
      grid_options: {
        columns: 6,
        rows: 6,
      },
      wear_level: 50,
      aged_texture: 'everywhere',
      aged_texture_intensity: 50,
    };

    this._config = { ...defaults };
    this.render();
    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: { config: this._config },
        bubbles: true,
        composed: true,
      })
    );
  }

  _configToForm(config) {
    const data = { ...config };
    data.appearance = {
      ring_style: config.ring_style ?? 'brass',
      face_color: this._hexToRgb(
        config.face_color ??
          config.background_color ??
          config.plate_color ??
          config.slider_background_color ??
          '#8c7626'
      ) ?? [140, 118, 38],
      plate_color: this._hexToRgb(config.plate_color ?? '#8c7626') ?? [
        140, 118, 38,
      ],
      title_color: this._hexToRgb(config.title_color ?? '#3e2723') ?? [
        62, 39, 35,
      ],
      plate_transparent: config.plate_transparent ?? false,
      rivet_color: this._hexToRgb(config.rivet_color ?? '#6a5816') ?? [
        106, 88, 22,
      ],
      slider_color: this._hexToRgb(config.slider_color ?? '#444444') ?? [
        68, 68, 68,
      ],
      tick_color: this._colorToRgb(config.tick_color) ?? [0, 0, 0],
    };
    data.knob_settings = {
      knob_shape: config.knob_shape ?? 'square',
      knob_size: config.knob_size ?? 100,
      knob_color: this._hexToRgb(config.knob_color ?? '#c9a961') ?? [
        201, 169, 97,
      ],
    };
    data.led_settings = {
      show_value: config.show_value ?? true,
      font_bg_color: this._hexToRgb(config.font_bg_color ?? '#ffffff') ?? [
        255, 255, 255,
      ],
      font_color: this._hexToRgb(config.font_color ?? '#000000') ?? [0, 0, 0],
      title_font_size: config.title_font_size ?? 14,
      value_font_size: config.value_font_size ?? 36,
    };
    data.effects = {
      wear_level: config.wear_level ?? 50,
      aged_texture: (config.aged_texture ?? 'everywhere') !== 'none',
      aged_texture_intensity: config.aged_texture_intensity ?? 50,
    };
    return data;
  }

  _formToConfig(formData) {
    const config = { ...this._config };

    // Copy top-level fields
    Object.keys(formData).forEach((k) => {
      if (
        ['appearance', 'knob_settings', 'led_settings', 'effects'].includes(k)
      )
        return;
      config[k] = formData[k];
    });

    // Merge appearance settings
    if (formData.appearance) {
      Object.assign(config, formData.appearance);
      config.face_color = this._rgbToHex(config.face_color);
      delete config.background_color;
      config.plate_color = this._rgbToHex(config.plate_color);
      config.title_color = this._rgbToHex(config.title_color);
      config.rivet_color = this._rgbToHex(config.rivet_color);
      config.slider_color = this._rgbToHex(config.slider_color);
      config.tick_color = this._rgbToHex(config.tick_color);
    }

    // Merge knob settings
    if (formData.knob_settings) {
      Object.assign(config, formData.knob_settings);
      config.knob_color = this._rgbToHex(config.knob_color);
    }

    // Merge LED settings
    if (formData.led_settings) {
      Object.assign(config, formData.led_settings);
      config.font_bg_color = this._rgbToHex(config.font_bg_color);
      config.font_color = this._rgbToHex(config.font_color);
    }

    // Merge effects
    if (formData.effects) {
      Object.assign(config, formData.effects);
      config.aged_texture = config.aged_texture ? 'everywhere' : 'none';
    }

    return config;
  }

  _getSchema() {
    return [
      { name: 'entity', selector: { entity: {} } },
      { name: 'title', selector: { text: {} } },
      { name: 'min', label: 'Minimum', selector: { number: { mode: 'box' } } },
      { name: 'max', label: 'Maximum', selector: { number: { mode: 'box' } } },
      {
        name: 'step',
        label: 'Step',
        selector: { number: { mode: 'box', step: 0.1 } },
      },
      {
        name: 'value',
        label: 'Initial Value',
        selector: { number: { mode: 'box' } },
      },
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
                name: 'face_color',
                label: 'Face Color',
                selector: { color_rgb: {} },
              },
              {
                name: 'plate_color',
                label: 'Plate Color',
                selector: { color_rgb: {} },
              },
            ],
          },
          {
            type: 'grid',
            name: '',
            schema: [
              {
                name: 'title_color',
                label: 'Title Color',
                selector: { color_rgb: {} },
              },
            ],
          },
          {
            type: 'grid',
            name: '',
            schema: [
              {
                name: 'rivet_color',
                label: 'Rivet Color',
                selector: { color_rgb: {} },
              },
            ],
          },
          {
            type: 'grid',
            name: '',
            schema: [
              {
                name: 'slider_color',
                label: 'Track Color',
                selector: { color_rgb: {} },
              },
              {
                name: 'tick_color',
                label: 'Tick Mark Color',
                selector: { color_rgb: {} },
              },
            ],
          },
          {
            name: 'plate_transparent',
            label: 'Transparent Plate',
            selector: { boolean: {} },
          },
        ],
      },
      {
        name: 'knob_settings',
        type: 'expandable',
        title: 'Knob Settings',
        schema: [
          {
            name: 'knob_shape',
            label: 'Knob Shape',
            selector: {
              select: {
                options: [
                  { value: 'circular', label: 'Circular' },
                  { value: 'square', label: 'Square' },
                  { value: 'rectangular', label: 'Rectangular' },
                ],
              },
            },
          },
          {
            name: 'knob_size',
            label: 'Knob Size',
            selector: {
              number: {
                min: 0,
                max: 100,
                step: 1,
                mode: 'slider',
              },
            },
          },
          {
            name: 'knob_color',
            label: 'Knob Color',
            selector: { color_rgb: {} },
          },
        ],
      },
      {
        name: 'led_settings',
        type: 'expandable',
        title: 'LED Display',
        schema: [
          {
            name: 'show_value',
            label: 'Show Value',
            selector: { boolean: {} },
          },
          {
            type: 'grid',
            name: '',
            schema: [
              {
                name: 'font_bg_color',
                label: 'LED Background',
                selector: { color_rgb: {} },
              },
              {
                name: 'font_color',
                label: 'LED Text Color',
                selector: { color_rgb: {} },
              },
            ],
          },
          {
            type: 'grid',
            name: '',
            schema: [
              {
                name: 'title_font_size',
                label: 'Title Font Size',
                selector: {
                  number: {
                    min: 8,
                    max: 24,
                    mode: 'slider',
                  },
                },
              },
              {
                name: 'value_font_size',
                label: 'Value Font Size',
                selector: {
                  number: {
                    min: 20,
                    max: 60,
                    mode: 'slider',
                  },
                },
              },
            ],
          },
        ],
      },
      {
        name: 'effects',
        type: 'expandable',
        title: 'Visual Effects',
        schema: [
          {
            name: 'wear_level',
            label: 'Wear Level',
            selector: {
              number: {
                min: 0,
                max: 100,
                mode: 'slider',
                unit_of_measurement: '%',
              },
            },
          },
          {
            name: 'aged_texture',
            label: 'Aged Texture',
            selector: { boolean: {} },
          },
          {
            name: 'aged_texture_intensity',
            label: 'Texture Intensity',
            selector: {
              number: {
                min: 0,
                max: 100,
                mode: 'slider',
                unit_of_measurement: '%',
              },
            },
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

  _colorToRgb(color) {
    if (!color) return null;
    if (Array.isArray(color) && color.length === 3) return color;
    if (typeof color === 'string') {
      const hex = this._hexToRgb(color);
      if (hex) return hex;
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
      if (match) {
        return [Number(match[1]), Number(match[2]), Number(match[3])];
      }
    }
    return null;
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
}

if (!customElements.get('foundry-slider-editor')) {
  customElements.define('foundry-slider-editor', FoundrySliderEditor);
}
