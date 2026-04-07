import { loadThemes, applyTheme } from './themes.js';

//************************************************************************************************************
// Card Editor
//************************************************************************************************************
class FoundryAnalogMeterCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._themes = {};
    this._themesLoaded = false;
  }

  setConfig(config) {
    this._config = {
      ...config,
      segments: Array.isArray(config.segments) ? config.segments : [],
    };
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
    if (this._form1) this._form1.hass = hass;
    if (this._form2) this._form2.hass = hass;
  }

  render() {
    if (!this._hass || !this._config) return;

    if (!this._root) {
      this._root = document.createElement('div');

      const style = document.createElement('style');
      style.textContent = `
        /* Layout adjustments */
        .card-config { display: flex; flex-direction: column; gap: 16px; }
        
        /* Segment Section Styling */
        .segments-section {
          margin-top: 8px;
          margin-bottom: 8px;
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
        .remove-btn:hover {
          background: rgba(219, 68, 55, 0.1);
          border-radius: 50%;
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
        .add-btn:hover {
          background-color: var(--primary-color-dark, #0288d1);
        }
        .validation-warning {
          background: var(--warning-color, #ff9800);
          color: white;
          padding: 8px 12px;
          border-radius: 4px;
          margin: 8px 0;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .validation-error {
          background: var(--error-color, #db4437);
          color: white;
          padding: 8px 12px;
          border-radius: 4px;
          margin: 8px 0;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
      `;
      this.shadowRoot.appendChild(style);
      this.shadowRoot.appendChild(this._root);

      // --- PART 1: Top Settings (Entity, Title, Min/Max) ---
      this._form1 = document.createElement('ha-form');
      this._form1.addEventListener(
        'value-changed',
        this._handleFormChanged.bind(this)
      );
      this._root.appendChild(this._form1);

      // --- PART 2: Color Ranges (Middle) ---
      this._segmentsPanel = document.createElement('ha-expansion-panel');
      this._segmentsPanel.header = 'Color Ranges';
      this._segmentsPanel.outlined = true;
      this._segmentsPanel.expanded = false;
      this._segmentsPanel.style.marginTop = '8px';
      this._segmentsPanel.style.marginBottom = '8px';

      this._segmentsContainer = document.createElement('div');
      this._segmentsContainer.className = 'segments-section';
      this._segmentsContainer.style.border = 'none';
      this._segmentsContainer.style.padding = '16px';

      this._segmentsPanel.appendChild(this._segmentsContainer);
      this._root.appendChild(this._segmentsPanel);

      // --- PART 3: Bottom Settings (Appearance, Colors & Typography, Actions) ---
      this._form2 = document.createElement('ha-form');
      this._form2.addEventListener(
        'value-changed',
        this._handleFormChanged.bind(this)
      );
      this._root.appendChild(this._form2);

      // --- PART 4: Validation Messages ---
      this._validationContainer = document.createElement('div');
      this._root.appendChild(this._validationContainer);
    }

    // Update Forms
    if (this._form1) this._form1.hass = this._hass;
    if (this._form2) this._form2.hass = this._hass;

    const formData = this._configToForm(this._config);

    // Setup Form 1 (Top)
    this._form1.schema = this._getSchemaTop(formData);
    this._form1.data = formData;
    this._form1.computeLabel = this._computeLabel;

    // Setup Form 2 (Bottom)
    this._form2.schema = this._getSchemaBottom(formData);
    this._form2.data = formData;
    this._form2.computeLabel = this._computeLabel;

    // Render Segments (Middle)
    this._renderSegments();

    // Show validation messages
    this._displayValidationMessages();
  }

  _displayValidationMessages() {
    if (!this._validationContainer) return;
    const config = this._config;
    const messages = [];

    // Check for min >= max
    const min = config.min !== undefined ? config.min : 0;
    const max = config.max !== undefined ? config.max : 100;
    if (min >= max) {
      messages.push({
        type: 'error',
        text: '❌ Minimum must be less than Maximum',
      });
    }

    // Check segments
    if (config.segments && config.segments.length > 0) {
      config.segments.forEach((seg, idx) => {
        if (seg.from >= seg.to) {
          messages.push({
            type: 'warning',
            text: `⚠️ Segment ${idx + 1}: 'From' must be less than 'To'`,
          });
        }
        if (seg.from < min || seg.to > max) {
          messages.push({
            type: 'warning',
            text: `⚠️ Segment ${idx + 1}: Range should be within min/max values`,
          });
        }
      });
    }

    if (messages.length > 0) {
      this._validationContainer.innerHTML = messages
        .map((msg) => `<div class="validation-${msg.type}">${msg.text}</div>`)
        .join('');
    } else {
      this._validationContainer.innerHTML = '';
    }
  }

  // --- Segments Renderer (innerHTML) ---

  _renderSegments() {
    if (!this._segmentsContainer) return;

    const segments = this._config.segments || [];

    let html = '';

    if (segments.length === 0) {
      html += `<div style="font-style: italic; color: var(--secondary-text-color); margin-bottom: 12px;">No segments defined.</div>`;
    }

    segments.forEach((seg, index) => {
      const fromVal = seg.from !== undefined ? seg.from : 0;
      const toVal = seg.to !== undefined ? seg.to : 0;
      const colVal = seg.color || '#000000';

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
          <button class="remove-btn" data-idx="${index}" title="Remove">
            <svg style="width:24px;height:24px" viewBox="0 0 24 24">
              <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </button>
        </div>
      `;
    });

    html += `<button id="add-btn" class="add-btn">+ Add Color Range</button>`;

    this._segmentsContainer.innerHTML = html;

    // Listeners
    this._segmentsContainer.querySelectorAll('.seg-input').forEach((input) => {
      input.addEventListener('change', (e) => {
        const idx = parseInt(e.target.dataset.idx);
        const key = e.target.dataset.key;
        let val = e.target.value;
        if (key !== 'color') val = Number(val);
        this._updateSegment(idx, key, val);
      });
    });

    this._segmentsContainer.querySelectorAll('.remove-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.target.closest('.remove-btn');
        if (target) {
          this._removeSegment(parseInt(target.dataset.idx));
        }
      });
    });

    const addBtn = this._segmentsContainer.querySelector('#add-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => this._addSegment());
    }
  }

  // --- Data Logic for Segments ---

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
    const from = last ? last.to : 0;
    const to = from + 10;
    segments.push({ from, to, color: '#4CAF50' });
    this._updateConfig({ segments });
  }

  _removeSegment(index) {
    const segments = [...(this._config.segments || [])];
    segments.splice(index, 1);
    this._updateConfig({ segments });
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

  // --- HA Form Logic ---

  async _handleFormChanged(ev) {
    let newConfig = this._formToConfig(ev.detail.value);

    // Helper: resolve the live theme data when theme === 'entity'
    const resolveLiveThemeData = () => {
      if (!this._hass || !newConfig.themeentity) return null;
      const liveThemeName = this._hass.states?.[newConfig.themeentity]?.state;
      return liveThemeName && this._themes?.[liveThemeName]
        ? this._themes[liveThemeName]
        : null;
    };

    // 1. Theme Selection Logic
    if (
      newConfig.theme &&
      newConfig.theme !== this._config.theme &&
      this._themes
    ) {
      if (newConfig.theme === 'entity') {
        // Switching TO entity theme: apply the live entity's theme values now
        const liveThemeData = resolveLiveThemeData();
        if (liveThemeData) {
          newConfig = applyTheme(newConfig, liveThemeData);
        }
      } else if (this._themes[newConfig.theme]) {
        newConfig = applyTheme(newConfig, this._themes[newConfig.theme]);
      }
      // NOTE: We do NOT delete newConfig.theme anymore. We want to persist it.
    }
    // 2. Manual Override Logic
    else if (
      this._config.theme &&
      this._config.theme !== 'none' &&
      newConfig.theme === this._config.theme
    ) {
      const themeData =
        this._config.theme === 'entity'
          ? resolveLiveThemeData()
          : (this._themes?.[this._config.theme] ?? null);
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
        'ring_style',
        'font_color',
        'font_bg_color',
        'number_color',
        'primary_tick_color',
        'secondary_tick_color',
        'background_style',
        'face_color',
        'needle_color',
        'plate_transparent',
        'glass_effect_enabled',
        'wear_level',
        'aged_texture',
        'aged_texture_intensity',
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

  _configToForm(config) {
    let themeData = null;
    if (config.theme && config.theme !== 'none' && this._themes) {
      if (config.theme === 'entity') {
        const liveThemeName =
          this._hass?.states?.[config.themeentity]?.state ?? null;
        themeData =
          liveThemeName && this._themes[liveThemeName]
            ? this._themes[liveThemeName]
            : null;
      } else {
        themeData = this._themes[config.theme] ?? null;
      }
    }
    const sourceConfig = themeData
      ? applyTheme({ ...config }, themeData)
      : { ...config };
    const data = { ...sourceConfig };

    data.appearance = {
      theme: sourceConfig.theme ?? 'none',
      themeentity: sourceConfig.themeentity ?? '',
      ring_style: sourceConfig.ring_style,
      rivet_color: this._hexToRgb(sourceConfig.rivet_color ?? '#6a5816') ?? [
        106, 88, 22,
      ],
      plate_color: this._hexToRgb(sourceConfig.plate_color ?? '#8c7626') ?? [
        140, 118, 38,
      ],
      plate_transparent: sourceConfig.plate_transparent,
      wear_level: sourceConfig.wear_level,
      glass_effect_enabled: sourceConfig.glass_effect_enabled,
      aged_texture: sourceConfig.aged_texture,
      aged_texture_intensity: sourceConfig.aged_texture_intensity,
      background_style: sourceConfig.background_style,
      face_color: this._hexToRgb(sourceConfig.face_color ?? '#f8f8f0') ?? [
        248, 248, 240,
      ],
    };

    data.style_fonts_ticks = {
      needle_color: this._hexToRgb(sourceConfig.needle_color ?? '#1a1a1a') ?? [
        26, 26, 26,
      ],
      number_color: this._hexToRgb(sourceConfig.number_color ?? '#3e2723') ?? [
        62, 39, 35,
      ],
      primary_tick_color: this._hexToRgb(
        sourceConfig.primary_tick_color ?? '#3e2723'
      ) ?? [62, 39, 35],
      secondary_tick_color: this._hexToRgb(
        sourceConfig.secondary_tick_color ?? '#5d4e37'
      ) ?? [93, 78, 55],
      title_font_size: sourceConfig.title_font_size,
      animation_duration: sourceConfig.animation_duration,
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
      rivet_color: this._config?.rivet_color ?? '#6d5d4b',
      plate_color: this._config?.plate_color ?? '#8c7626',
      face_color: this._config?.face_color ?? '#f8f8f0',

      needle_color: this._config?.needle_color ?? '#1a1a1a',
      number_color: this._config?.number_color ?? '#3e2723',
      primary_tick_color: this._config?.primary_tick_color ?? '#3e2723',
      secondary_tick_color: this._config?.secondary_tick_color ?? '#5d4e37',

      background_style: this._config?.background_style ?? 'gradient',
    };

    Object.keys(formData).forEach((key) => {
      if (['appearance', 'style_fonts_ticks', 'actions'].includes(key)) return;
      config[key] = formData[key];
    });

    if (formData.appearance) Object.assign(config, formData.appearance);
    if (formData.style_fonts_ticks)
      Object.assign(config, formData.style_fonts_ticks);

    // Only overwrite if conversion succeeds; otherwise keep existing hex
    const rc = this._rgbToHex(config.rivet_color);
    if (rc) config.rivet_color = rc;
    else config.rivet_color = defaults.rivet_color;

    const pc = this._rgbToHex(config.plate_color);
    if (pc) config.plate_color = pc;
    else config.plate_color = defaults.plate_color;

    const fc = this._rgbToHex(config.face_color);
    if (fc) config.face_color = fc;
    else config.face_color = defaults.face_color;

    const ndlz = this._rgbToHex(config.needle_color);
    if (ndlz) config.needle_color = ndlz;
    else config.needle_color = defaults.needle_color;

    const nc = this._rgbToHex(config.number_color);
    if (nc) config.number_color = nc;
    else config.number_color = defaults.number_color;

    const ptc = this._rgbToHex(config.primary_tick_color);
    if (ptc) config.primary_tick_color = ptc;
    else config.primary_tick_color = defaults.primary_tick_color;

    const stc = this._rgbToHex(config.secondary_tick_color);
    if (stc) config.secondary_tick_color = stc;
    else config.secondary_tick_color = defaults.secondary_tick_color;

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
    if (schema.name === 'entity') return 'Entity';
    return schema.name
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // --- Schemas ---

  // Schema 1: Top section (Entity, Title, Unit, Min/Max)
  _getSchemaTop(_formData) {
    return [
      {
        name: 'entity',
        selector: { entity: { domain: 'sensor' } },
      },
      {
        type: 'grid',
        name: '',
        schema: [
          { name: 'title', selector: { text: {} } },
          { name: 'unit', selector: { text: {} } },
        ],
      },
      {
        type: 'grid',
        name: '',
        schema: [
          { name: 'min', selector: { number: { mode: 'box' } } },
          { name: 'max', selector: { number: { mode: 'box' } } },
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

  // Schema 2: Bottom section (Appearance, Colors & Typography, Actions)
  _getSchemaBottom(formData) {
    const actionData = formData.actions || {};

    return [
      // Appearance
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
                  { value: 'entity', label: 'Entity' },
                  ...Object.keys(this._themes || {}).map((t) => ({
                    value: t,
                    label: t.charAt(0).toUpperCase() + t.slice(1),
                  })),
                ],
              },
            },
          },
          ...(formData.appearance?.theme === 'entity'
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
            name: 'background_style',
            label: 'Background Style',
            selector: {
              select: {
                mode: 'dropdown',
                options: [
                  { value: 'gradient', label: 'Gradient' },
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

      // Colors & Typography
      {
        name: 'style_fonts_ticks',
        type: 'expandable',
        title: 'Colors & Typography',
        schema: [
          {
            name: 'needle_color',
            label: 'Needle Color',
            selector: { color_rgb: {} },
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
                label: 'Major Tick Color',
                selector: { color_rgb: {} },
              },
              {
                name: 'secondary_tick_color',
                label: 'Minor Tick Color',
                selector: { color_rgb: {} },
              },
            ],
          },
          {
            name: 'title_font_size',
            label: 'Title Font Size',
            selector: { number: { mode: 'box', min: 6, max: 48 } },
          },
          {
            name: 'animation_duration',
            label: 'Animation Duration (s)',
            selector: { number: { mode: 'box', step: 0.1, min: 0.1 } },
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
              { value: 'shake', label: 'Shake (Custom)' },
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

if (!customElements.get('foundry-analog-meter-card-editor')) {
  customElements.define(
    'foundry-analog-meter-card-editor',
    FoundryAnalogMeterCardEditor
  );
}
