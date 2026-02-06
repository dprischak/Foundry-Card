//************************************************************************************************************
// Card Editor
//************************************************************************************************************
class FoundryGaugeCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    // 1. Sanitize config to ensure segments is always an array
    this._config = {
      ...config,
      segments: Array.isArray(config.segments) ? config.segments : [],
    };
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._form1) this._form1.hass = hass;
    if (this._form2) this._form2.hass = hass;
  }

  render() {
    if (!this._hass || !this._config) return;

    // 2. Initialize Root Structure (Runs once)
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

      // --- PART 2: Manual Segments (Middle) ---
      this._segmentsContainer = document.createElement('div');
      this._segmentsContainer.className = 'segments-section';
      this._root.appendChild(this._segmentsContainer);

      // --- PART 3: Bottom Settings (Appearance, Layout, Actions) ---
      this._form2 = document.createElement('ha-form');
      this._form2.addEventListener(
        'value-changed',
        this._handleFormChanged.bind(this)
      );
      this._root.appendChild(this._form2);

      // --- PART 4: Validation Messages and Reset Button ---
      this._validationContainer = document.createElement('div');
      this._root.appendChild(this._validationContainer);

      // Reset to defaults button
      const resetBtn = document.createElement('button');
      resetBtn.className = 'reset-btn';
      resetBtn.textContent = '⚠️ Reset to Default Configuration';
      resetBtn.title = 'Reset all settings to defaults (keeps entity)';
      resetBtn.addEventListener('click', () => this._resetToDefaults());
      this._root.appendChild(resetBtn);
    }

    // 3. Update Forms
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

    // 4. Render Segments (Middle)
    this._renderSegments();

    // 5. Show validation messages
    this._displayValidationMessages();
  }

  _displayValidationMessages() {
    if (!this._validationContainer) return;

    const messages = [];
    const config = this._config;

    // Validate min < max
    const min = config.min !== undefined ? config.min : 0;
    const max = config.max !== undefined ? config.max : 100;
    if (min >= max) {
      messages.push({
        type: 'error',
        text: '⚠️ Minimum value must be less than maximum value',
      });
    }

    // Validate segments
    const segments = config.segments || [];
    if (segments.length > 0) {
      segments.forEach((seg, idx) => {
        if (seg.from >= seg.to) {
          messages.push({
            type: 'warning',
            text: `⚠️ Segment ${idx + 1}: "From" should be less than "To"`,
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

    // Validate decimals
    if (
      config.decimals !== undefined &&
      (config.decimals < 0 || config.decimals > 10)
    ) {
      messages.push({
        type: 'warning',
        text: '⚠️ Decimals should be between 0 and 10',
      });
    }

    // Display messages
    if (messages.length > 0) {
      this._validationContainer.innerHTML = messages
        .map((msg) => `<div class="validation-${msg.type}">${msg.text}</div>`)
        .join('');
    } else {
      this._validationContainer.innerHTML = '';
    }
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
      title: '',
      min: 0,
      max: 100,
      unit: '',
      decimals: 0,
      segments: [
        { from: 0, to: 33, color: '#4CAF50' },
        { from: 33, to: 66, color: '#FFC107' },
        { from: 66, to: 100, color: '#F44336' },
      ],
      start_angle: 200,
      end_angle: 160,
      animation_duration: 1.2,
      title_font_size: 12,
      odometer_font_size: 60,
      odometer_vertical_position: 120,
      ring_style: 'brass',
      rivet_color: '#6d5d4b',
      plate_color: '#8c7626',
      plate_transparent: false,
      wear_level: 50,
      glass_effect_enabled: true,
      aged_texture: 'glass_only',
      aged_texture_intensity: 50,
      high_needle_enabled: false,
      high_needle_color: '#FF9800',
      high_needle_duration: 60,
      high_needle_length: 100,
      tap_action: { action: 'more-info' },
      hold_action: { action: 'more-info' },
      double_tap_action: { action: 'more-info' },
    });
  }

  // --- Segments Renderer (innerHTML) ---

  _renderSegments() {
    if (!this._segmentsContainer) return;

    const segments = this._config.segments || [];

    let html = `<div class="section-header">Color Ranges</div>`;

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

  _handleFormChanged(ev) {
    const newConfig = this._formToConfig(ev.detail.value);
    if (JSON.stringify(this._config) !== JSON.stringify(newConfig)) {
      this._updateConfig(newConfig);
    }
  }

  _configToForm(config) {
    const data = { ...config };

    data.appearance = {
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
    };

    data.layout = {
      title_font_size: config.title_font_size,
      odometer_font_size: config.odometer_font_size,
      odometer_vertical_position: config.odometer_vertical_position,
      start_angle: config.start_angle,
      end_angle: config.end_angle,
      animation_duration: config.animation_duration,
    };

    data.high_needle = {
      high_needle_enabled: config.high_needle_enabled,
      high_needle_color: this._hexToRgb(
        config.high_needle_color ?? '#FF9800'
      ) ?? [255, 152, 0],
      high_needle_duration: config.high_needle_duration,
      high_needle_length: config.high_needle_length,
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
      high_needle_color: this._config?.high_needle_color ?? '#FF9800',
    };

    Object.keys(formData).forEach((key) => {
      if (['appearance', 'layout', 'high_needle', 'actions'].includes(key))
        return;
      config[key] = formData[key];
    });

    if (formData.appearance) Object.assign(config, formData.appearance);
    if (formData.layout) Object.assign(config, formData.layout);
    if (formData.high_needle) Object.assign(config, formData.high_needle);

    // Only overwrite if conversion succeeds; otherwise keep existing hex
    const rc = this._rgbToHex(config.rivet_color);
    if (rc) config.rivet_color = rc;
    else config.rivet_color = defaults.rivet_color;

    const pc = this._rgbToHex(config.plate_color);
    if (pc) config.plate_color = pc;
    else config.plate_color = defaults.plate_color;

    const hn = this._rgbToHex(config.high_needle_color);
    if (hn) config.high_needle_color = hn;
    else config.high_needle_color = defaults.high_needle_color;

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

  // Schema 1: Top section (Entity, Title, Min/Max)
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
          {
            name: 'decimals',
            selector: { number: { min: 0, max: 5, mode: 'box' } },
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
    // Accept [r,g,b] OR {r,g,b} OR {color:[r,g,b]}
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

  // Schema 2: Bottom section (Appearance, Layout, Actions)
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
        ],
      },

      // Layout
      {
        name: 'layout',
        type: 'expandable',
        title: 'Layout & Text',
        schema: [
          {
            type: 'grid',
            name: '',
            schema: [
              {
                name: 'title_font_size',
                label: 'Title Font Size',
                selector: { number: { mode: 'box' } },
              },
              {
                name: 'odometer_font_size',
                label: 'Odometer Size',
                selector: { number: { mode: 'box' } },
              },
            ],
          },
          {
            name: 'odometer_vertical_position',
            label: 'Odometer Position Y',
            selector: { number: { mode: 'box' } },
          },
          {
            name: 'start_angle',
            label: 'Start Angle',
            selector: { number: { min: 0, max: 360, mode: 'slider' } },
          },
          {
            name: 'end_angle',
            label: 'End Angle',
            selector: { number: { min: 0, max: 360, mode: 'slider' } },
          },
          {
            name: 'animation_duration',
            label: 'Animation Duration (s)',
            selector: { number: { mode: 'box', step: 0.1, min: 0.1 } },
          },
        ],
      },

      // High Needle
      {
        name: 'high_needle',
        type: 'expandable',
        title: 'High Value Needle',
        schema: [
          {
            name: 'high_needle_enabled',
            label: 'Enable High Needle',
            selector: { boolean: {} },
          },
          {
            name: 'high_needle_color',
            label: 'Needle Color',
            selector: { color_rgb: {} },
          },
          {
            type: 'grid',
            name: '',
            schema: [
              {
                name: 'high_needle_duration',
                label: 'Hold Duration (s)',
                selector: { number: { mode: 'box' } },
              },
              {
                name: 'high_needle_length',
                label: 'Length (%)',
                selector: { number: { mode: 'box' } },
              },
            ],
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

if (!customElements.get('foundry-gauge-card-editor')) {
  customElements.define('foundry-gauge-card-editor', FoundryGaugeCardEditor);
}
