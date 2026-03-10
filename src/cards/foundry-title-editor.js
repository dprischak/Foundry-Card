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

class FoundryTitleEditor extends HTMLElement {
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
      this._form = null;
      this._renderedMode = null;
      this.render();
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
    }

    if (!this._form) {
      this._root.innerHTML = '';
      this._form = document.createElement('ha-form');
      this._form.computeLabel = this._computeLabel;
      this._form.addEventListener('value-changed', (ev) =>
        this._handleFormChanged(ev)
      );
      this._root.appendChild(this._form);
    }

    this._form.hass = this._hass;
    this._form.data = this._configToForm(this._config);
    this._form.schema = this._getSchema();
  }

  async _handleFormChanged(ev) {
    let newConfig = this._formToConfig(ev.detail.value);

    // Theme changed — apply theme values
    if (
      newConfig.theme &&
      newConfig.theme !== this._config.theme &&
      this._themes &&
      this._themes[newConfig.theme]
    ) {
      newConfig = applyTheme(newConfig, this._themes[newConfig.theme]);
    }
    // Theme unchanged but a themed property was manually overridden
    else if (
      this._config.theme &&
      this._config.theme !== 'none' &&
      this._config.theme !== 'entity' &&
      newConfig.theme === this._config.theme
    ) {
      const themeData = this._themes ? this._themes[this._config.theme] : null;
      if (themeData) {
        const themedConfig = applyTheme({ ...this._config }, themeData);
        const themeProperties = [
          'plate_color',
          'rivet_color',
          'title_color',
          'plate_transparent',
          'aged_texture',
          'aged_texture_intensity',
        ];

        const overriddenProps = themeProperties.filter(
          (prop) =>
            JSON.stringify(newConfig[prop]) !==
            JSON.stringify(themedConfig[prop])
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
    }

    if (JSON.stringify(this._config) !== JSON.stringify(newConfig)) {
      this._config = newConfig;
      fireEvent(this, 'config-changed', { config: this._config });
    }
  }

  _configToForm(config) {
    const themeData =
      config.theme &&
      config.theme !== 'none' &&
      config.theme !== 'entity' &&
      this._themes
        ? this._themes[config.theme]
        : null;
    const sourceConfig = themeData
      ? applyTheme({ ...config }, themeData)
      : { ...config };

    const data = { ...sourceConfig };

    data.theme = sourceConfig.theme ?? 'none';
    data.themeentity = sourceConfig.themeentity ?? '';
    data.title = sourceConfig.title ?? 'Title';
    data.title_font_size = sourceConfig.title_font_size ?? 18;
    data.title_color = this._hexToRgb(
      sourceConfig.title_color ?? '#3e2723'
    ) ?? [62, 39, 35];
    data.plate_color = this._hexToRgb(
      sourceConfig.plate_color ?? '#f5f5f5'
    ) ?? [245, 245, 245];
    data.rivet_color = this._hexToRgb(
      sourceConfig.rivet_color ?? '#6d5d4b'
    ) ?? [109, 93, 75];
    data.plate_transparent = sourceConfig.plate_transparent ?? false;
    data.aged_texture = sourceConfig.aged_texture ?? 'everywhere';
    data.aged_texture_intensity = sourceConfig.aged_texture_intensity ?? 50;

    return data;
  }

  _formToConfig(formData) {
    const config = { ...this._config, ...formData };

    if (config.title_color)
      config.title_color = this._rgbToHex(config.title_color);
    if (config.plate_color)
      config.plate_color = this._rgbToHex(config.plate_color);
    if (config.rivet_color)
      config.rivet_color = this._rgbToHex(config.rivet_color);

    return config;
  }

  _getSchema() {
    return [
      { name: 'title', label: 'Title', selector: { text: {} } },
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
                  { value: 'entity', label: 'Entity' },
                  ...Object.keys(this._themes || {}).map((t) => ({
                    value: t,
                    label: t.charAt(0).toUpperCase() + t.slice(1),
                  })),
                ],
              },
            },
          },
          ...(this._config && this._config.theme === 'entity'
            ? [
                {
                  name: 'themeentity',
                  label: 'Theme Entity',
                  selector: { entity: {} },
                },
              ]
            : []),
          {
            type: 'grid',
            name: '',
            schema: [
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
            name: 'aged_texture',
            label: 'Aged Texture',
            selector: {
              select: {
                mode: 'dropdown',
                options: [
                  { value: 'none', label: 'None' },
                  { value: 'everywhere', label: 'Everywhere' },
                ],
              },
            },
          },
          {
            name: 'aged_texture_intensity',
            label: 'Texture Intensity',
            selector: { number: { min: 0, max: 100, mode: 'slider' } },
          },
        ],
      },
      {
        name: '',
        type: 'expandable',
        title: 'Colors & Typography',
        schema: [
          {
            name: 'title_color',
            label: 'Title Color',
            selector: { color_rgb: {} },
          },
          {
            name: 'title_font_size',
            label: 'Title Font Size',
            selector: { number: { mode: 'box', min: 6, max: 48 } },
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

if (!customElements.get('foundry-title-editor')) {
  customElements.define('foundry-title-editor', FoundryTitleEditor);
}
