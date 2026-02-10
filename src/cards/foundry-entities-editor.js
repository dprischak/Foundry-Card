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

class FoundryEntitiesEditor extends HTMLElement {
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
                .sub-config { display: flex; flex-direction: column; gap: 8px; }
                .toggle-button { 
                    background: var(--primary-color); 
                    color: var(--text-primary-color);
                    border: none; 
                    padding: 8px 16px; 
                    border-radius: 4px; 
                    cursor: pointer;
                    align-self: flex-start;
                    font-weight: 500;
                    margin-top: -8px; 
                    margin-bottom: 8px;
                }
                .toggle-button:hover {
                    background: var(--primary-color-dark, var(--primary-color));
                }
                .header {
                    font-size: 16px;
                    font-weight: bold;
                    margin-bottom: 8px;
                }
            `;
      this.shadowRoot.appendChild(style);
      this.shadowRoot.appendChild(this._root);
    }

    const targetMode = this._advancedMode ? 'advanced' : 'standard';

    // Rebuild DOM only if mode changes
    if (this._renderedMode !== targetMode) {
      this._root.innerHTML = '';
      this._renderedMode = targetMode;

      if (this._advancedMode) {
        this._buildAdvancedUI();
      } else {
        this._buildStandardUI();
      }
    }

    // Always update data/schema on existing elements
    if (this._advancedMode) {
      this._updateAdvancedUI();
    } else {
      this._updateStandardUI();
    }
  }

  _buildAdvancedUI() {
    const btn = document.createElement('button');
    btn.className = 'toggle-button';
    btn.textContent = '← Back to Settings';
    btn.onclick = () => {
      this._advancedMode = false;
      this.render();
    };
    this._root.appendChild(btn);

    const header = document.createElement('div');
    header.className = 'header';
    header.textContent = 'Edit Entity Details';
    this._root.appendChild(header);

    this._advancedForm = document.createElement('ha-form');
    this._advancedForm.computeLabel = this._computeLabel;
    this._advancedForm.addEventListener('value-changed', (ev) =>
      this._handleFormChangedAdvanced(ev)
    );
    this._root.appendChild(this._advancedForm);
  }

  _updateAdvancedUI() {
    if (this._advancedForm) {
      this._advancedForm.hass = this._hass;
      this._advancedForm.data = this._configToFormAdvanced(this._config);
      this._advancedForm.schema = this._getSchemaAdvanced();
    }
  }

  _buildStandardUI() {
    // 1. Entities Form
    this._entitiesForm = document.createElement('ha-form');
    this._entitiesForm.computeLabel = this._computeLabel;
    this._entitiesForm.addEventListener('value-changed', (ev) =>
      this._handleFormChanged(ev)
    );
    this._root.appendChild(this._entitiesForm);

    // 2. Toggle Button
    // We recreate this button every time we build standard UI,
    // visibility is toggled by styling or removal in update if needed, but easiest here.
    this._toggleBtn = document.createElement('button');
    this._toggleBtn.className = 'toggle-button';
    this._toggleBtn.textContent = 'Edit Entity Details / Overrides →';
    this._toggleBtn.onclick = () => {
      this._advancedMode = true;
      this.render();
    };
    this._root.appendChild(this._toggleBtn);

    // 3. Settings Form
    this._settingsForm = document.createElement('ha-form');
    this._settingsForm.computeLabel = this._computeLabel;
    this._settingsForm.addEventListener('value-changed', (ev) =>
      this._handleFormChanged(ev)
    );
    this._root.appendChild(this._settingsForm);
  }

  _updateStandardUI() {
    const formData = this._configToForm(this._config);

    if (this._entitiesForm) {
      this._entitiesForm.hass = this._hass;
      this._entitiesForm.data = formData;
      this._entitiesForm.schema = [this._getSchemaTop()[0]];
    }

    if (this._toggleBtn) {
      // Only show button if we have entities
      const hasEntities =
        this._config.entities && this._config.entities.length > 0;
      this._toggleBtn.style.display = hasEntities ? 'block' : 'none';
    }

    if (this._settingsForm) {
      this._settingsForm.hass = this._hass;
      this._settingsForm.data = formData;
      this._settingsForm.schema = [
        this._getSchemaTop()[1],
        ...this._getSchemaBottom(),
      ];
    }
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
      fireEvent(this, 'config-changed', { config: this._config });
    }
  }

  _handleFormChangedAdvanced(ev) {
    const newConfig = this._formToConfigAdvanced(ev.detail.value);
    this._config = newConfig;
    fireEvent(this, 'config-changed', { config: this._config });
  }

  _configToForm(config) {
    const data = { ...config };

    // Ensure entities is an array of strings for the picker
    if (Array.isArray(config.entities)) {
      data.entities = config.entities
        .map((e) => {
          if (typeof e === 'string') return e;
          return e.entity || '';
        })
        .filter(Boolean);
    } else {
      data.entities = [];
    }

    // Defaults
    data.title = config.title ?? 'Entities';
    data.title_font_size = config.title_font_size ?? 14;
    data.title_color = this._hexToRgb(config.title_color ?? '#3e2723') ?? [
      62, 39, 35,
    ];
    data.ring_style = config.ring_style ?? 'brass';
    data.font_bg_color = this._hexToRgb(config.font_bg_color ?? '#ffffff') ?? [
      255, 255, 255,
    ];
    data.font_color = this._hexToRgb(config.font_color ?? '#000000') ?? [
      0, 0, 0,
    ];
    data.rivet_color = this._hexToRgb(config.rivet_color ?? '#6d5d4b') ?? [
      109, 93, 75,
    ];
    data.plate_color = this._hexToRgb(config.plate_color ?? '#f5f5f5') ?? [
      245, 245, 245,
    ];
    data.plate_transparent = config.plate_transparent ?? false;
    data.wear_level = config.wear_level ?? 50;
    data.glass_effect_enabled = config.glass_effect_enabled ?? true;
    data.aged_texture = config.aged_texture ?? 'everywhere';
    data.aged_texture_intensity = config.aged_texture_intensity ?? 50;

    return data;
  }

  _configToFormAdvanced(config) {
    const data = {};
    if (Array.isArray(config.entities)) {
      config.entities.forEach((e, i) => {
        const entityObj = typeof e === 'string' ? { entity: e } : e;
        data[`name_${i}`] = entityObj.name || '';
        data[`info_${i}`] = entityObj.secondary_info || 'none';
      });
    }
    return data;
  }

  _formToConfig(formData) {
    // preserve existing config objects
    const existingEntities = this._config.entities || [];

    let mergedEntities = existingEntities;

    // Only update entities from form data if the field 'entities' was actually present in the form data
    // This handles the split form scenario where 'formData' might come from the settings form (no entities)
    if (formData.entities !== undefined) {
      const newEntities = formData.entities || [];
      const lookup = new Map();
      existingEntities.forEach((e) => {
        if (typeof e === 'string') lookup.set(e, e);
        else if (e && e.entity) lookup.set(e.entity, e);
      });

      mergedEntities = newEntities.map((id) => lookup.get(id) || id);
    }

    const config = { ...this._config, ...formData };

    // If we computed new entities (or preserved them), ensure they are set
    if (formData.entities !== undefined) {
      config.entities = mergedEntities;
    }

    if (config.title_color)
      config.title_color = this._rgbToHex(config.title_color);
    if (config.font_bg_color)
      config.font_bg_color = this._rgbToHex(config.font_bg_color);
    if (config.font_color)
      config.font_color = this._rgbToHex(config.font_color);
    if (config.rivet_color)
      config.rivet_color = this._rgbToHex(config.rivet_color);
    if (config.plate_color)
      config.plate_color = this._rgbToHex(config.plate_color);

    return config;
  }

  _formToConfigAdvanced(formData) {
    // Create a deep copy of config to modify entities
    const config = { ...this._config };

    if (Array.isArray(config.entities)) {
      // Map over existing entities and update them with form data
      config.entities = config.entities.map((e, i) => {
        const currentEntityId = typeof e === 'string' ? e : e.entity;
        const newName = formData[`name_${i}`];
        const newInfo = formData[`info_${i}`];

        // If no custom fields, revert to string to keep config clean
        if ((!newName || newName === '') && (!newInfo || newInfo === 'none')) {
          return currentEntityId;
        }

        return {
          entity: currentEntityId,
          name: newName,
          secondary_info: newInfo,
        };
      });
    }
    return config;
  }

  _getSchemaTop() {
    return [
      {
        name: 'entities',
        label: 'Entities (List Management)',
        selector: { entity: { multiple: true } },
      },
      {
        name: '',
        type: 'expandable',
        title: 'Layout & Text',
        schema: [
          { name: 'title', label: 'Title', selector: { text: {} } },
          {
            name: 'title_font_size',
            label: 'Title Font Size',
            selector: { number: { mode: 'box' } },
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

  _getSchemaAdvanced() {
    const entities = this._config.entities || [];
    const schema = [];

    entities.forEach((e, i) => {
      const entId = typeof e === 'string' ? e : e.entity;
      schema.push({
        name: '',
        type: 'expandable',
        title: `${entId}`,
        schema: [
          { name: `name_${i}`, label: 'Name Override', selector: { text: {} } },
          {
            name: `info_${i}`,
            label: 'Secondary Info',
            selector: {
              select: {
                mode: 'dropdown',
                options: [
                  { value: 'none', label: 'None' },
                  { value: 'entity-id', label: 'Entity ID' },
                  { value: 'state', label: 'State' },
                  { value: 'last-updated', label: 'Last Updated' },
                  { value: 'last-changed', label: 'Last Changed' },
                ],
              },
            },
          },
        ],
      });
    });

    if (schema.length === 0) {
      schema.push({
        name: '',
        type: 'constant',
        value: 'No entities selected. Go back to add entities.',
      });
    }

    return schema;
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

if (!customElements.get('foundry-entities-editor')) {
  customElements.define('foundry-entities-editor', FoundryEntitiesEditor);
}
