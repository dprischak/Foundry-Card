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

class FoundryBarChartEditor extends HTMLElement {
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
    if (!this._root) {
      this.render();
      return;
    }
    if (this._form1) this._form1.hass = hass;
    if (this._form2) this._form2.hass = hass;
  }

  render() {
    if (!this._hass || !this._config) return;

    if (!this._root) {
      this._root = document.createElement('div');
      this._root.className = 'card-config';
      const style = document.createElement('style');
      style.textContent = `
                .card-config { display: flex; flex-direction: column; gap: 16px; }
                .segments-section {
                  margin-top: 4px;
                  margin-bottom: 4px;
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
                .input-group select {
                  width: 100%;
                  padding: 8px;
                  box-sizing: border-box;
                  border: 1px solid var(--divider-color, #ccc);
                  border-radius: 4px;
                  background: var(--card-background-color, #fff);
                  color: var(--primary-text-color);
                }
                .input-group input[type='color'] {
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
            `;
      this.shadowRoot.appendChild(style);
      this.shadowRoot.appendChild(this._root);

      this._form1 = document.createElement('ha-form');
      this._form1.computeLabel = this._computeLabel;
      this._form1.addEventListener('value-changed', (ev) =>
        this._handleFormChanged(ev)
      );
      this._root.appendChild(this._form1);

      // Color Ranges panel
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
      this._form2.schema = this._getSchemaBottom(data);
    }

    this._renderSegments();
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
        'bar_color',
        'bar_padding',
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

  _renderSegments() {
    if (!this._segmentsContainer) return;

    const segments = this._config.segments || [];

    let html = '';
    if (segments.length === 0) {
      html += `<div style="font-style: italic; color: var(--secondary-text-color); margin-bottom: 12px;">No segments defined.</div>`;
    }

    segments.forEach((segment, index) => {
      const fromValue = segment.from !== undefined ? segment.from : 0;
      const toValue = segment.to !== undefined ? segment.to : 0;
      const colorValue = segment.color || '#4CAF50';

      html += `
        <div class="segment-row">
          <div class="input-group">
            <label>From</label>
            <input type="number" class="seg-input" data-idx="${index}" data-key="from" value="${fromValue}">
          </div>
          <div class="input-group">
            <label>To</label>
            <input type="number" class="seg-input" data-idx="${index}" data-key="to" value="${toValue}">
          </div>
          <div class="input-group">
            <label>Color</label>
            <input type="color" class="seg-input" data-idx="${index}" data-key="color" value="${colorValue}">
          </div>
          <button class="remove-btn" data-idx="${index}" title="Remove">
            <svg style="width:24px;height:24px" viewBox="0 0 24 24">
              <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </button>
        </div>
      `;
    });

    const blendWidth = Number(this._config.segment_blend_width) || 0;
    const barRangeBlend = this._config.bar_range_blend || 'single';

    html += `<button id="add-btn" class="add-btn">+ Add Color Range</button>`;
    html += `
      <div class="segment-row" style="margin-top: 12px;">
        <div class="input-group">
          <label>Segment Blend Width</label>
          <input id="segment-blend-width" type="number" min="0" step="0.1" value="${blendWidth}">
        </div>
        <div class="input-group">
          <label>Bar Range Blend</label>
          <select id="bar-range-blend">
            <option value="single" ${barRangeBlend === 'single' ? 'selected' : ''}>Single Color</option>
            <option value="gradient" ${barRangeBlend === 'gradient' ? 'selected' : ''}>Gradient Bar</option>
          </select>
        </div>
      </div>
    `;
    this._segmentsContainer.innerHTML = html;

    this._segmentsContainer.querySelectorAll('.seg-input').forEach((input) => {
      input.addEventListener('change', (event) => {
        const index = Number.parseInt(event.target.dataset.idx);
        const key = event.target.dataset.key;
        let value = event.target.value;
        if (key !== 'color') value = Number(value);
        this._updateSegment(index, key, value);
      });
    });

    this._segmentsContainer
      .querySelectorAll('.remove-btn')
      .forEach((button) => {
        button.addEventListener('click', (event) => {
          const target = event.target.closest('.remove-btn');
          if (target) {
            this._removeSegment(Number.parseInt(target.dataset.idx));
          }
        });
      });

    const addButton = this._segmentsContainer.querySelector('#add-btn');
    if (addButton) {
      addButton.addEventListener('click', () => this._addSegment());
    }

    const blendWidthInput = this._segmentsContainer.querySelector(
      '#segment-blend-width'
    );
    if (blendWidthInput) {
      blendWidthInput.addEventListener('change', (event) => {
        const blendWidth = Math.max(0, Number(event.target.value) || 0);
        this._updateConfig({ segment_blend_width: blendWidth });
      });
    }

    const barRangeBlendSelect =
      this._segmentsContainer.querySelector('#bar-range-blend');
    if (barRangeBlendSelect) {
      barRangeBlendSelect.addEventListener('change', (event) => {
        const barRangeBlend = event.target.value || 'single';
        this._updateConfig({ bar_range_blend: barRangeBlend });
      });
    }
  }

  _updateSegment(index, key, value) {
    const segments = [...(this._config.segments || [])];
    if (segments[index]) {
      segments[index] = { ...segments[index], [key]: value };
      this._updateConfig({ segments });
    }
  }

  _addSegment() {
    const segments = [...(this._config.segments || [])];
    const lastSegment = segments[segments.length - 1];
    const from = Number.isFinite(lastSegment?.to) ? lastSegment.to : 0;
    const to = from + 10;
    segments.push({ from, to, color: '#4CAF50' });
    this._updateConfig({ segments });
  }

  _removeSegment(index) {
    const segments = [...(this._config.segments || [])];
    segments.splice(index, 1);
    this._updateConfig({ segments });
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
    data.show_inspect_value = sourceConfig.show_inspect_value ?? true;
    data.segment_blend_width = sourceConfig.segment_blend_width ?? 0;
    data.aged_texture = sourceConfig.aged_texture ?? 'everywhere';
    data.aged_texture_intensity = sourceConfig.aged_texture_intensity ?? 50;

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
    if (sourceConfig.bar_color)
      data.bar_color = this._hexToRgb(sourceConfig.bar_color);
    if (sourceConfig.grid_minor_color)
      data.grid_minor_color = this._hexToRgb(sourceConfig.grid_minor_color);
    if (sourceConfig.grid_major_color)
      data.grid_major_color = this._hexToRgb(sourceConfig.grid_major_color);

    return data;
  }

  _formToConfig(formData) {
    const config = { ...this._config };
    Object.keys(formData).forEach((key) => {
      if (key === 'actions') return;
      config[key] = formData[key];
    });
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
    if (formData.bar_color) config.bar_color = ensureHex(formData.bar_color);
    if (formData.grid_minor_color)
      config.grid_minor_color = ensureHex(formData.grid_minor_color);
    if (formData.grid_major_color)
      config.grid_major_color = ensureHex(formData.grid_major_color);

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
      { name: 'title', label: 'Title', selector: { text: {} } },
      {
        name: '',
        type: 'expandable',
        title: 'Chart Settings',
        schema: [
          {
            name: 'hours_to_show',
            label: 'Hours to Show (type in for a higher value)',
            selector: { number: { min: 1, max: 336 } },
          },
          {
            name: 'bucket_count',
            label: 'Number of Data Points',
            selector: { number: { min: 10, max: 336 } },
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
            name: 'bar_padding',
            label: 'Bar Padding',
            selector: { number: { min: 1, max: 6, mode: 'slider' } },
          },
          {
            name: 'fill_under_line',
            label: 'Fill Under Line',
            selector: { boolean: {} },
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
          {
            name: 'show_inspect_value',
            label: 'Show Inspect Y Value',
            selector: { boolean: {} },
          },
          {
            name: 'show_x_axis_minmax',
            label: 'Show X Axis Min/Max',
            selector: { boolean: {} },
          },
          {
            name: 'show_y_axis_minmax',
            label: 'Show Y Axis Min/Max',
            selector: { boolean: {} },
          },
        ],
      },
    ];
  }

  _getSchemaBottom(formData) {
    const actionData = formData?.actions || {};
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
            name: 'font_bg_color',
            label: 'Screen Background',
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
      {
        name: '',
        type: 'expandable',
        title: 'Colors & Typography',
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
              {
                name: 'font_color',
                label: 'Digital Font Color',
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
                selector: { number: { mode: 'box', min: 6, max: 48 } },
              },
              {
                name: 'bar_color',
                label: 'Bar Color',
                selector: { color_rgb: {} },
              },
            ],
          },
          {
            type: 'grid',
            name: '',
            schema: [
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
            ],
          },
          {
            name: 'grid_opacity',
            label: 'Grid Opacity',
            selector: { number: { min: 0.1, max: 1, step: 0.1 } },
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

if (!customElements.get('foundry-bar-chart-editor')) {
  customElements.define('foundry-bar-chart-editor', FoundryBarChartEditor);
}
