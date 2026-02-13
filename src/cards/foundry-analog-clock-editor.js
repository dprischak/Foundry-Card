import { loadThemes, applyTheme } from './themes.js';

class FoundryAnalogClockCardEditor extends HTMLElement {
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
      // Force complete re-creation by clearing root
      if (this._root && this._root.parentNode) {
        this._root.parentNode.removeChild(this._root);
      }
      this._root = null;
      this._form1 = null;
      this._form2 = null;
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

      // --- PART 1: Top Settings (Entity, Title, TimeZone) ---
      this._form1 = document.createElement('ha-form');
      this._form1.addEventListener(
        'value-changed',
        this._handleFormChanged.bind(this)
      );
      this._root.appendChild(this._form1);

      // --- PART 2: Appearance & Actions ---
      this._form2 = document.createElement('ha-form');
      this._form2.addEventListener(
        'value-changed',
        this._handleFormChanged.bind(this)
      );
      this._root.appendChild(this._form2);

      // Reset to defaults button
      const resetBtn = document.createElement('button');
      resetBtn.className = 'reset-btn';
      resetBtn.textContent = '⚠️ Reset to Default Configuration';
      resetBtn.title = 'Reset all settings to defaults';
      resetBtn.addEventListener('click', () => this._resetToDefaults());
      this._root.appendChild(resetBtn);
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

  _resetToDefaults() {
    if (
      !confirm(
        'Reset all settings to defaults? This will keep your entity but reset all other configuration.'
      )
    ) {
      return;
    }

    const entity = this._config.entity;
    this._updateConfig({
      entity: entity,
      title: 'Local Time',
      time_zone: '',
      second_hand_enabled: true,
      title_font_size: 12,
      ring_style: 'brass',
      rivet_color: '#6a5816',
      plate_color: '#8c7626',
      plate_transparent: false,
      wear_level: 50,
      glass_effect_enabled: true,
      aged_texture: 'everywhere',
      aged_texture_intensity: 50,
      tap_action: { action: 'more-info' },
      hold_action: { action: 'more-info' },
      double_tap_action: { action: 'more-info' },
    });
  }

  _updateConfig(updates) {
    this._config = { ...this._config, ...updates };
    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: { config: this._config },
        bubbles: true,
        composed: true,
      })
    );
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
      newConfig.theme === this._config.theme
    ) {
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
        'hour_hand_color',
        'minute_hand_color',
        'second_hand_color',
      ];

      // Check if any of these changed
      const hasOverride = themeProperties.some(
        (prop) =>
          JSON.stringify(newConfig[prop]) !== JSON.stringify(this._config[prop])
      );

      if (hasOverride) {
        // User manually changed a value. Detach from theme.
        newConfig.theme = 'none';
      }
    }

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
      theme: config.theme ?? 'none',
      ring_style: config.ring_style,
      rivet_color: this._hexToRgb(config.rivet_color ?? '#6a5816') ?? [
        106, 88, 22,
      ],
      plate_color: this._hexToRgb(config.plate_color ?? '#8c7626') ?? [
        140, 118, 38,
      ],
      plate_transparent: config.plate_transparent,
      wear_level: config.wear_level,
      glass_effect_enabled: config.glass_effect_enabled,
      aged_texture: config.aged_texture,
      aged_texture_intensity: config.aged_texture_intensity,
      second_hand_enabled: config.second_hand_enabled,
      background_style: config.background_style,
      face_color: this._hexToRgb(config.face_color ?? '#f8f8f0') ?? [
        248, 248, 240,
      ],
      hour_hand_color: this._hexToRgb(config.hour_hand_color ?? '#3e2723') ?? [
        62, 39, 35,
      ],
      minute_hand_color: this._hexToRgb(
        config.minute_hand_color ?? '#3e2723'
      ) ?? [62, 39, 35],
      second_hand_color: this._hexToRgb(
        config.second_hand_color ?? '#C41E3A'
      ) ?? [196, 30, 58],
    };

    data.style_fonts_ticks = {
      title_color: this._hexToRgb(
        config.title_color || config.title_font_color || '#3e2723'
      ) ?? [62, 39, 35],
      number_color: this._hexToRgb(config.number_color ?? '#3e2723') ?? [
        62, 39, 35,
      ],
      primary_tick_color: this._hexToRgb(
        config.primary_tick_color ?? '#3e2723'
      ) ?? [62, 39, 35],
      secondary_tick_color: this._hexToRgb(
        config.secondary_tick_color ?? '#5d4e37'
      ) ?? [93, 78, 55],
    };

    data.layout = {
      title_font_size: config.title_font_size,
    };

    data.actions = {};
    ['tap', 'hold', 'double_tap'].forEach((type) => {
      const conf = config[`${type}_action`] || {};
      data.actions[`${type}_action_action`] = conf.action || 'more-info';
      data.actions[`${type}_action_navigation_path`] =
        conf.navigation_path || '';
      data.actions[`${type}_action_service`] = conf.service || '';
      data.actions[`${type}_action_target_entity`] =
        conf.target?.entity_id || '';
    });

    return data;
  }

  _formToConfig(formData) {
    const config = { ...this._config };
    const defaults = {
      rivet_color: this._config?.rivet_color ?? '#6a5816',
      plate_color: this._config?.plate_color ?? '#8c7626',
      face_color: this._config?.face_color ?? '#f8f8f0',

      title_color:
        this._config?.title_color ??
        this._config?.title_font_color ??
        '#3e2723',
      number_color: this._config?.number_color ?? '#3e2723',
      primary_tick_color: this._config?.primary_tick_color ?? '#3e2723',
      secondary_tick_color: this._config?.secondary_tick_color ?? '#5d4e37',
      hour_hand_color: this._config?.hour_hand_color ?? '#3e2723',
      minute_hand_color: this._config?.minute_hand_color ?? '#3e2723',
      second_hand_color: this._config?.second_hand_color ?? '#C41E3A',
    };

    Object.keys(formData).forEach((key) => {
      if (
        ['appearance', 'layout', 'actions', 'style_fonts_ticks'].includes(key)
      )
        return;
      config[key] = formData[key];
    });

    if (formData.appearance) Object.assign(config, formData.appearance);
    if (formData.layout) Object.assign(config, formData.layout);
    if (formData.style_fonts_ticks)
      Object.assign(config, formData.style_fonts_ticks);

    const rc = this._rgbToHex(config.rivet_color);
    if (rc) config.rivet_color = rc;
    else config.rivet_color = defaults.rivet_color;

    const pc = this._rgbToHex(config.plate_color);
    if (pc) config.plate_color = pc;
    else config.plate_color = defaults.plate_color;

    const fc = this._rgbToHex(config.face_color);
    if (fc) config.face_color = fc;
    else config.face_color = defaults.face_color;

    const tfc = this._rgbToHex(config.title_color);
    if (tfc) config.title_color = tfc;
    else config.title_color = defaults.title_color;

    const nc = this._rgbToHex(config.number_color);
    if (nc) config.number_color = nc;
    else config.number_color = defaults.number_color;

    const ptc = this._rgbToHex(config.primary_tick_color);
    if (ptc) config.primary_tick_color = ptc;
    else config.primary_tick_color = defaults.primary_tick_color;

    const stc = this._rgbToHex(config.secondary_tick_color);
    if (stc) config.secondary_tick_color = stc;
    else config.secondary_tick_color = defaults.secondary_tick_color;

    const hhc = this._rgbToHex(config.hour_hand_color);
    if (hhc) config.hour_hand_color = hhc;
    else config.hour_hand_color = defaults.hour_hand_color;

    const mhc = this._rgbToHex(config.minute_hand_color);
    if (mhc) config.minute_hand_color = mhc;
    else config.minute_hand_color = defaults.minute_hand_color;

    const shc = this._rgbToHex(config.second_hand_color);
    if (shc) config.second_hand_color = shc;
    else config.second_hand_color = defaults.second_hand_color;

    if (formData.actions) {
      ['tap', 'hold', 'double_tap'].forEach((type) => {
        const group = formData.actions;
        const actionType = group[`${type}_action_action`];
        const newAction = { action: actionType };

        if (actionType === 'navigate') {
          newAction.navigation_path = group[`${type}_action_navigation_path`];
        } else if (actionType === 'call-service') {
          newAction.service = group[`${type}_action_service`];
          const targetEnt = group[`${type}_action_target_entity`];
          if (targetEnt) newAction.target = { entity_id: targetEnt };
        }
        config[`${type}_action`] = newAction;
      });
    }

    return config;
  }

  _computeLabel(schema) {
    if (schema.label) return schema.label;
    if (schema.name === 'entity') return 'Entity (Optional)';
    return schema.name
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  _getSchemaTop(_formData) {
    return [
      {
        name: 'entity',
        selector: { entity: {} },
      },
      {
        type: 'grid',
        name: '',
        schema: [
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
                  {
                    value: 'America/Los_Angeles',
                    label: 'Los Angeles (Pacific)',
                  },
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
    if ([r, g, b].some((n) => Number.isNaN(n))) return null;
    const toHex = (n) => n.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  _getSchemaBottom(formData) {
    const actionData = formData.actions || {};

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
                  { value: 'none', label: 'None' },
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
                name: 'rivet_color',
                label: 'Rivet Color',
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
            name: 'second_hand_enabled',
            label: 'Show Second Hand',
            selector: { boolean: {} },
          },
          {
            name: 'wear_level',
            label: 'Wear Level',
            selector: { number: { min: 0, max: 100, mode: 'slider' } },
          },
          {
            name: 'glass_effect_enabled',
            label: 'Glass Effect',
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
          {
            name: 'background_style',
            label: 'Background Style',
            selector: {
              select: {
                mode: 'dropdown',
                options: [
                  { value: 'gradient', label: 'Default Gradient' },
                  { value: 'solid', label: 'Solid Color' },
                ],
              },
            },
          },
          {
            name: 'face_color',
            label: 'Face Color (Solid Mode)',
            selector: { color_rgb: {} },
          },
          {
            type: 'grid',
            name: '',
            schema: [
              {
                name: 'hour_hand_color',
                label: 'Hour Hand',
                selector: { color_rgb: {} },
              },
              {
                name: 'minute_hand_color',
                label: 'Minute Hand',
                selector: { color_rgb: {} },
              },
              {
                name: 'second_hand_color',
                label: 'Second Hand',
                selector: { color_rgb: {} },
              },
            ],
          },
        ],
      },
      {
        name: 'style_fonts_ticks',
        type: 'expandable',
        title: 'Fonts & Ticks',
        schema: [
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
                name: 'number_color',
                label: 'Number Color',
                selector: { color_rgb: {} },
              },
            ],
          },
          {
            type: 'grid',
            name: '',
            schema: [
              {
                name: 'primary_tick_color',
                label: 'Primary Tick Color',
                selector: { color_rgb: {} },
              },
              {
                name: 'secondary_tick_color',
                label: 'Secondary Tick Color',
                selector: { color_rgb: {} },
              },
            ],
          },
        ],
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
        ],
      },
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
              { value: 'call-service', label: 'Call Service' },
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

    if (currentAction === 'call-service') {
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
}

if (!customElements.get('foundry-analog-clock-editor')) {
  customElements.define(
    'foundry-analog-clock-editor',
    FoundryAnalogClockCardEditor
  );
}
