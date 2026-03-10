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

class FoundryButtonEditor extends HTMLElement {
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
      // Force form re-creation by removing and clearing it
      if (this._form && this._form.parentNode) {
        this._form.parentNode.removeChild(this._form);
      }
      this._form = null;
      // Force UI update
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

    // Create form if it doesn't exist
    if (!this._form) {
      this._form = document.createElement('ha-form');
      this._form.computeLabel = this._computeLabel;
      this._form.addEventListener('value-changed', (ev) =>
        this._handleFormChanged(ev)
      );
      this._root.appendChild(this._form);
    }

    // Update form data and schema
    this._form.hass = this._hass;
    this._form.data = this._configToForm(this._config);
    this._form.schema = this._getSchema();
  }

  async _handleFormChanged(ev) {
    let newConfig = this._formToConfig(ev.detail.value);

    // 1. Theme Selection Logic
    // If the theme CHANGED really, apply the new theme values
    if (
      newConfig.theme &&
      newConfig.theme !== this._config.theme &&
      this._themes &&
      this._themes[newConfig.theme]
    ) {
      // Apply the theme values to the config
      newConfig = applyTheme(newConfig, this._themes[newConfig.theme]);
      // NOTE: We do NOT delete newConfig.theme anymore. We want to persist it.
    }
    // 2. Manual Override Logic
    // If the theme is set (and didn't just change in this event), check if any controlled properties changed.
    else if (
      this._config.theme &&
      this._config.theme !== 'none' &&
      this._config.theme !== 'entity' &&
      newConfig.theme === this._config.theme
    ) {
      const themeData = this._themes ? this._themes[this._config.theme] : null;
      if (!themeData) {
        if (JSON.stringify(this._config) !== JSON.stringify(newConfig)) {
          this._config = newConfig;
          fireEvent(this, 'config-changed', { config: this._config });
        }
        return;
      }

      const themedConfig = applyTheme({ ...this._config }, themeData);

      // List of properties that themes control
      const themeProperties = [
        'plate_color',
        'rivet_color',
        'ring_style',
        'title_color',
        'font_color',
        'font_bg_color',
        'number_color',
        'primary_tick_color',
        'secondary_tick_color',
        'background_style',
        'face_color',
        'liquid_color',
        'needle_color',
        'plate_transparent',
        'glass_effect_enabled',
        'wear_level',
        'aged_texture',
        'aged_texture_intensity',
        'slider_color',
        'knob_color',
        'tick_color',
      ];

      // Check if any of these changed compared to themed values
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
        // User manually changed a value. Detach from theme, preserve themed values.
        newConfig = mergedConfig;
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

    // Defaults for styles to match schema
    data.theme = sourceConfig.theme ?? 'none';
    data.themeentity = sourceConfig.themeentity ?? '';
    data.ring_style = sourceConfig.ring_style ?? 'brass';
    data.plate_color = this._hexToRgb(
      sourceConfig.plate_color ?? '#f5f5f5'
    ) ?? [245, 245, 245];
    data.font_bg_color = this._hexToRgb(
      sourceConfig.font_bg_color ?? '#ffffff'
    ) ?? [255, 255, 255];
    data.font_color = this._hexToRgb(sourceConfig.font_color ?? '#000000') ?? [
      0, 0, 0,
    ];
    data.plate_transparent = sourceConfig.plate_transparent ?? false;
    data.wear_level = sourceConfig.wear_level ?? 50;
    data.glass_effect_enabled = sourceConfig.glass_effect_enabled ?? true;
    data.aged_texture = sourceConfig.aged_texture ?? 'everywhere';
    data.aged_texture_intensity = sourceConfig.aged_texture_intensity ?? 50;

    // Group: Actions
    data.actions = {};
    ['tap', 'hold', 'double_tap'].forEach((type) => {
      const conf = config[`${type}_action`] || {};
      data.actions[`${type}_action_action`] = conf.action || 'more-info';
      data.actions[`${type}_action_navigation_path`] =
        conf.navigation_path || '';
      data.actions[`${type}_action_url_path`] = conf.url_path || '';
      data.actions[`${type}_action_service`] =
        conf.service || conf.perform_action || '';
      data.actions[`${type}_action_target_entity`] =
        conf.target?.entity_id || '';
    });

    // Clean up leaked flat action keys
    delete data.tap_action;
    delete data.hold_action;
    delete data.double_tap_action;

    return data;
  }

  _formToConfig(formData) {
    const config = { ...this._config };

    // Copy flat form data, skipping grouped keys
    Object.keys(formData).forEach((key) => {
      if (key === 'actions') return;
      config[key] = formData[key];
    });

    // Convert Colors back to Hex
    if (config.plate_color)
      config.plate_color = this._rgbToHex(config.plate_color);
    if (config.font_bg_color)
      config.font_bg_color = this._rgbToHex(config.font_bg_color);
    if (config.font_color)
      config.font_color = this._rgbToHex(config.font_color);

    // Unmarshal actions group back to config
    if (formData.actions) {
      ['tap', 'hold', 'double_tap'].forEach((type) => {
        const group = formData.actions;
        const actionType = group[`${type}_action_action`];
        const newAction = { action: actionType };

        if (actionType === 'navigate') {
          newAction.navigation_path = group[`${type}_action_navigation_path`];
        } else if (actionType === 'url') {
          newAction.url_path = group[`${type}_action_url_path`];
        } else if (
          actionType === 'call-service' ||
          actionType === 'perform-action'
        ) {
          newAction.service = group[`${type}_action_service`];
          const targetEnt = group[`${type}_action_target_entity`];
          if (targetEnt) newAction.target = { entity_id: targetEnt };
        }
        config[`${type}_action`] = newAction;
      });
    }

    // Remove group keys that might have leaked into config
    delete config.actions;

    return config;
  }

  _getSchema() {
    const formData = this._form ? this._form.data : {};
    const actionData = formData?.actions || {};

    return [
      {
        name: 'entity',
        label: 'Entity (Optional)',
        selector: { entity: {} },
      },
      {
        name: 'icon',
        label: 'Icon',
        selector: { icon: {} },
      },
      {
        name: '',
        type: 'expandable',
        title: 'Content Templates (Jinja2 Supported)',
        schema: [
          {
            name: 'primary_info',
            label: 'Primary Info',
            selector: { template: {} },
          },
          {
            name: 'secondary_info',
            label: 'Secondary Info',
            selector: { template: {} },
          },
          {
            name: 'secondary_info_2',
            label: 'Secondary Info 2',
            selector: { template: {} },
          },
          {
            name: 'icon_color',
            label: 'Icon Color',
            selector: { template: {} },
          },
        ],
      },
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
          ...(formData.theme === 'entity'
            ? [
                {
                  name: 'themeentity',
                  label: 'Theme Entity',
                  selector: { entity: {} },
                },
              ]
            : []),
          {
            name: 'ring_style',
            label: 'Ring Style',
            selector: {
              select: {
                mode: 'dropdown',
                options: [
                  { value: 'none', label: 'None' },
                  { value: 'brass', label: 'Brass' },
                  { value: 'silver', label: 'Silver' },
                  { value: 'chrome', label: 'Chrome' },
                  { value: 'copper', label: 'Copper' },
                  { value: 'purple', label: 'Purple' },
                  { value: 'orange', label: 'Orange' },
                  { value: 'yellow', label: 'Yellow' },
                  { value: 'teal', label: 'Teal' },
                  { value: 'gold', label: 'Gold' },
                  { value: 'titanium', label: 'Titanium' },
                  { value: 'carbon', label: 'Carbon' },
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
                name: 'plate_color',
                label: 'Plate Color',
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
            label: 'Wear Level',
            selector: { number: { min: 0, max: 100, mode: 'slider' } },
          },
          {
            name: 'aged_texture',
            label: 'Aged Texture',
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
            name: 'font_color',
            label: 'Digital Font Color',
            selector: { color_rgb: {} },
          },
          {
            name: 'card_width',
            label: 'Card Max Width (px)',
            selector: { number: { min: 100, max: 500, mode: 'box' } },
          },
        ],
      },
      // Actions
      {
        name: 'actions',
        type: 'expandable',
        title: 'Actions',
        schema: [
          ...this._getActionSchema('tap', 'Tap', actionData),
          ...this._getActionSchema('hold', 'Hold', actionData),
          ...this._getActionSchema('double_tap', 'Double Tap', actionData),
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

  _getActionSchema(type, label, actionData) {
    const actionKey = `${type}_action_action`;
    const currentAction = actionData ? actionData[actionKey] : 'more-info';

    const schema = [
      {
        name: actionKey,
        label: `${label} Action`,
        selector: {
          select: {
            mode: 'dropdown',
            options: [
              { value: 'more-info', label: 'More Info' },
              { value: 'toggle', label: 'Toggle' },
              { value: 'navigate', label: 'Navigate' },
              { value: 'url', label: 'URL' },
              { value: 'call-service', label: 'Call Service' },
              { value: 'perform-action', label: 'Perform Action' },
              { value: 'assist', label: 'Assist' },
              { value: 'none', label: 'None' },
            ],
          },
        },
      },
    ];

    if (currentAction === 'navigate') {
      schema.push({
        name: `${type}_action_navigation_path`,
        label: 'Navigation Path',
        selector: { text: {} },
      });
    }

    if (currentAction === 'url') {
      schema.push({
        name: `${type}_action_url_path`,
        label: 'URL Path',
        selector: { text: {} },
      });
    }

    if (
      currentAction === 'call-service' ||
      currentAction === 'perform-action'
    ) {
      schema.push({
        name: `${type}_action_service`,
        label: 'Service',
        selector: { text: {} },
      });
      schema.push({
        name: `${type}_action_target_entity`,
        label: 'Target Entity',
        selector: { entity: {} },
      });
    }

    return schema;
  }

  _computeLabel(schema) {
    if (schema.label) return schema.label;
    return schema.name;
  }
}

customElements.define('foundry-button-editor', FoundryButtonEditor);
