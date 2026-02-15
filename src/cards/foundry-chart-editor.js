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

import { loadThemes, applyTheme } from './themes.js';

class FoundryChartEditor extends HTMLElement {
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
      if (this._root && this._root.parentNode) {
        this._root.parentNode.removeChild(this._root);
      }
      this._root = null;
      this._form1 = null;
      this._form2 = null;
      if (!this._advancedMode) {
        this.render();
      }
    } catch (e) {
      console.error('Error loading themes:', e);
    }
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  render() {
    if (!this._hass || !this._config) return;

    if (!this._root) {
      this._root = document.createElement('div');
      this._root.className = 'card-config';
      const style = document.createElement('style');
      style.textContent = `
                .card-config { display: flex; flex-direction: column; gap: 16px; }
            `;
      this.shadowRoot.appendChild(style);
      this.shadowRoot.appendChild(this._root);

      this._form1 = document.createElement('ha-form');
      this._form1.computeLabel = this._computeLabel;
      this._form1.addEventListener('value-changed', (ev) =>
        this._handleFormChanged(ev)
      );
      this._root.appendChild(this._form1);

      this._form2 = document.createElement('ha-form');
      this._form2.computeLabel = this._computeLabel;
      this._form2.addEventListener('value-changed', (ev) =>
        this._handleFormChanged(ev)
      );
      this._root.appendChild(this._form2);
    }

    const data = this._configToForm(this._config);

    if (this._form1) {
      this._form1.hass = this._hass;
      this._form1.data = data;
      this._form1.schema = this._getSchemaTop();
    }

    if (this._form2) {
      this._form2.hass = this._hass;
      this._form2.data = data;
      this._form2.schema = this._getSchemaBottom();
    }
  }

  _updateConfig(updates) {
    this._config = { ...this._config, ...updates };
    fireEvent(this, 'config-changed', { config: this._config });
  }

  async _handleFormChanged(ev) {
    let newConfig = this._formToConfig(ev.detail.value);

    if (
      newConfig.theme &&
      newConfig.theme !== this._config.theme &&
      this._themes &&
      this._themes[newConfig.theme]
    ) {
      newConfig = applyTheme(newConfig, this._themes[newConfig.theme]);
    } else if (
      this._config.theme &&
      this._config.theme !== 'none' &&
      newConfig.theme === this._config.theme
    ) {
      const themeData = this._themes ? this._themes[this._config.theme] : null;
      if (!themeData) {
        if (JSON.stringify(this._config) !== JSON.stringify(newConfig)) {
          this._updateConfig(newConfig);
        }
        return;
      }

      const themedConfig = applyTheme({ ...this._config }, themeData);

      const themeProperties = [
        'plate_color',
        'rivet_color',
        'title_color',
        'font_color',
        'font_bg_color',
        'ring_style',
        'plate_transparent',
        'glass_effect_enabled',
        'wear_level',
        'aged_texture',
        'aged_texture_intensity',
        'line_color',
        'line_width',
        'fill_under_line',
        'grid_minor_color',
        'grid_major_color',
        'grid_opacity',
      ];

      const overriddenProps = themeProperties.filter(
        (prop) =>
          JSON.stringify(newConfig[prop]) !== JSON.stringify(themedConfig[prop])
      );

      if (overriddenProps.length > 0) {
        const mergedConfig = { ...themedConfig, ...newConfig, theme: 'none' };
        for (const prop of themeProperties) {
          if (!overriddenProps.includes(prop)) {
            mergedConfig[prop] = themedConfig[prop];
          }
        }
        newConfig = mergedConfig;
      }
    }

    if (JSON.stringify(this._config) !== JSON.stringify(newConfig)) {
      this._updateConfig(newConfig);
    }
  }

  _computeLabel(schema) {
    if (schema.label) return schema.label;
    return schema.name;
  }

  _configToForm(config) {
    const themeData =
      config.theme && config.theme !== 'none' && this._themes
        ? this._themes[config.theme]
        : null;
    const sourceConfig = themeData
      ? applyTheme({ ...config }, themeData)
      : { ...config };
    const data = { ...sourceConfig };
    data.theme = sourceConfig.theme ?? 'none';

    if (sourceConfig.font_bg_color)
      data.font_bg_color = this._hexToRgb(sourceConfig.font_bg_color);
    if (sourceConfig.font_color)
      data.font_color = this._hexToRgb(sourceConfig.font_color);
    if (sourceConfig.title_color)
      data.title_color = this._hexToRgb(sourceConfig.title_color);
    else if (sourceConfig.title_font_color)
      data.title_color = this._hexToRgb(sourceConfig.title_font_color);
    else data.title_color = [62, 39, 35];
    if (sourceConfig.plate_color)
      data.plate_color = this._hexToRgb(sourceConfig.plate_color);
    if (sourceConfig.rivet_color)
      data.rivet_color = this._hexToRgb(sourceConfig.rivet_color);
    if (sourceConfig.line_color)
      data.line_color = this._hexToRgb(sourceConfig.line_color);
    if (sourceConfig.grid_minor_color)
      data.grid_minor_color = this._hexToRgb(sourceConfig.grid_minor_color);
    if (sourceConfig.grid_major_color)
      data.grid_major_color = this._hexToRgb(sourceConfig.grid_major_color);

    return data;
  }

  _formToConfig(formData) {
    const config = { ...this._config, ...formData };
    const ensureHex = (val) => (Array.isArray(val) ? this._rgbToHex(val) : val);

    if (formData.font_bg_color)
      config.font_bg_color = ensureHex(formData.font_bg_color);
    if (formData.font_color) config.font_color = ensureHex(formData.font_color);
    if (formData.title_color)
      config.title_color = ensureHex(formData.title_color);
    if (formData.plate_color)
      config.plate_color = ensureHex(formData.plate_color);
    if (formData.rivet_color)
      config.rivet_color = ensureHex(formData.rivet_color);
    if (formData.line_color) config.line_color = ensureHex(formData.line_color);
    if (formData.grid_minor_color)
      config.grid_minor_color = ensureHex(formData.grid_minor_color);
    if (formData.grid_major_color)
      config.grid_major_color = ensureHex(formData.grid_major_color);

    return config;
  }

  _hexToRgb(hex) {
    if (!hex || typeof hex !== 'string') return undefined;
    if (!hex.startsWith('#')) return undefined;
    let c = hex.substring(1);
    if (c.length === 3)
      c = c
        .split('')
        .map((s) => s + s)
        .join('');
    if (c.length !== 6) return undefined;
    const num = parseInt(c, 16);
    return [num >> 16, (num >> 8) & 255, num & 255];
  }

  _rgbToHex(rgb) {
    if (!Array.isArray(rgb)) return rgb;
    return '#' + rgb.map((x) => x.toString(16).padStart(2, '0')).join('');
  }

  _getSchemaTop() {
    return [
      { name: 'entity', selector: { entity: {} } },
      {
        name: '',
        type: 'expandable',
        title: 'Chart Settings',
        schema: [
          {
            name: 'hours_to_show',
            label: 'Hours to Show',
            selector: { number: { min: 1, max: 168 } },
          },
          {
            name: 'bucket_count',
            label: 'Bucket Count',
            selector: { number: { min: 10, max: 200 } },
          },
          {
            name: 'bucket_minutes',
            label: 'Bucket Minutes (optional)',
            selector: { number: { min: 1, max: 180 } },
          },
          {
            name: 'update_interval',
            label: 'Update Interval (s)',
            selector: { number: { min: 10, max: 3600 } },
          },
          {
            name: 'min_value',
            label: 'Min Value (optional)',
            selector: { number: { mode: 'box' } },
          },
          {
            name: 'max_value',
            label: 'Max Value (optional)',
            selector: { number: { mode: 'box' } },
          },
          {
            name: 'value_precision',
            label: 'Value Precision',
            selector: { number: { min: 0, max: 6, mode: 'slider' } },
          },
          {
            name: 'aggregation',
            label: 'Aggregation',
            selector: {
              select: {
                mode: 'dropdown',
                options: [
                  { value: 'avg', label: 'Average' },
                  { value: 'min', label: 'Minimum' },
                  { value: 'max', label: 'Maximum' },
                ],
              },
            },
          },
          {
            name: 'show_footer',
            label: 'Show Footer',
            selector: { boolean: {} },
          },
        ],
      },
      {
        name: '',
        type: 'expandable',
        title: 'Chart Style',
        schema: [
          {
            name: 'line_color',
            label: 'Line Color',
            selector: { color_rgb: {} },
          },
          {
            name: 'line_width',
            label: 'Line Width',
            selector: { number: { min: 1, max: 6, mode: 'slider' } },
          },
          {
            name: 'fill_under_line',
            label: 'Fill Under Line',
            selector: { boolean: {} },
          },
          {
            name: 'grid_minor_color',
            label: 'Grid Minor Color',
            selector: { color_rgb: {} },
          },
          {
            name: 'grid_major_color',
            label: 'Grid Major Color',
            selector: { color_rgb: {} },
          },
          {
            name: 'grid_opacity',
            label: 'Grid Opacity',
            selector: { number: { min: 0.1, max: 1, step: 0.1 } },
          },
        ],
      },
    ];
  }

  _getSchemaBottom() {
    return [
      {
        name: '',
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
          { name: 'title', label: 'Title', selector: { text: {} } },
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
                label: 'Font Color',
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
        ],
      },
    ];
  }
}

if (!customElements.get('foundry-chart-editor')) {
  customElements.define('foundry-chart-editor', FoundryChartEditor);
}
