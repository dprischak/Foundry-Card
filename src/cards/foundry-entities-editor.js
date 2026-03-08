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
      // Force form re-creation by clearing them
      this._entitiesForm = null;
      this._settingsForm = null;
      this._toggleBtn = null;
      this._renderedMode = null;
      // Force UI update
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
                .entity-row-container {
                  display: flex;
                  align-items: flex-start;
                  gap: 8px;
                  background: var(--secondary-background-color, rgba(0,0,0,0.03));
                  padding: 8px;
                  border-radius: 4px;
                  margin-bottom: 8px;
                }
                .move-buttons {
                  display: flex;
                  flex-direction: column;
                  gap: 4px;
                  margin-top: 4px;
                }
                .move-btn {
                  background: transparent;
                  border: 1px solid var(--primary-color);
                  color: var(--primary-color);
                  border-radius: 4px;
                  cursor: pointer;
                  padding: 2px 8px;
                  font-size: 12px;
                }
                .move-btn:hover {
                  background: var(--primary-color);
                  color: var(--text-primary-color);
                }
                .entity-form {
                  flex-grow: 1;
                }
                .empty-entities {
                  padding: 16px;
                  text-align: center;
                  font-style: italic;
                  opacity: 0.7;
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
    header.textContent = 'Edit Entity Details & Order';
    this._root.appendChild(header);

    const entities = this._config.entities || [];

    if (entities.length === 0) {
      const msg = document.createElement('div');
      msg.className = 'empty-entities';
      msg.textContent = 'No entities selected. Go back to add entities.';
      this._root.appendChild(msg);
      return;
    }

    entities.forEach((entity, index) => {
      const row = document.createElement('div');
      row.className = 'entity-row-container';

      // Move Buttons
      const btnContainer = document.createElement('div');
      btnContainer.className = 'move-buttons';

      const upBtn = document.createElement('button');
      upBtn.className = 'move-btn';
      upBtn.textContent = '↑';
      upBtn.disabled = index === 0;
      upBtn.onclick = () => this._moveEntity(index, -1);
      if (index === 0) upBtn.style.opacity = '0.3';

      const downBtn = document.createElement('button');
      downBtn.className = 'move-btn';
      downBtn.textContent = '↓';
      downBtn.disabled = index === entities.length - 1;
      downBtn.onclick = () => this._moveEntity(index, 1);
      if (index === entities.length - 1) downBtn.style.opacity = '0.3';

      btnContainer.appendChild(upBtn);
      btnContainer.appendChild(downBtn);
      row.appendChild(btnContainer);

      // Entity Form
      const formContainer = document.createElement('div');
      formContainer.className = 'entity-form';
      const form = document.createElement('ha-form');
      form.hass = this._hass;
      form.computeLabel = this._computeLabel;

      // Schema for this single entity
      const entName = typeof entity === 'string' ? entity : entity.entity;
      const isNumeric = this._isNumericEntity(entName);
      const schema = [
        {
          name: '',
          type: 'expandable',
          title: `${entName}`,
          expanded: true, // Keep open for easier editing
          schema: [
            { name: 'name', label: 'Name Override', selector: { text: {} } },
            {
              name: 'secondary_info',
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
            ...(isNumeric
              ? [
                  {
                    name: 'decimals',
                    label: 'Decimal Places',
                    selector: { number: { min: 0, max: 6, mode: 'box' } },
                  },
                ]
              : []),
          ],
        },
      ];

      // Data for this single entity
      const data = {
        name: typeof entity === 'object' ? entity.name : '',
        secondary_info:
          typeof entity === 'object' ? entity.secondary_info : 'none',
        decimals:
          typeof entity === 'object' && entity.decimals !== undefined
            ? entity.decimals
            : '',
      };

      form.schema = schema;
      form.data = data;
      form.addEventListener('value-changed', (ev) =>
        this._handleSingleEntityChange(index, ev.detail.value)
      );

      formContainer.appendChild(form);
      row.appendChild(formContainer);
      this._root.appendChild(row);
    });
  }

  _updateAdvancedUI() {
    const entities = this._config.entities || [];
    const rows = this._root.querySelectorAll('.entity-row-container');

    // Simple length check to decide if we need full rebuild (e.g. entity added/removed outside this view)
    if (entities.length !== rows.length) {
      this._root.innerHTML = '';
      this._buildAdvancedUI();
      return;
    }

    rows.forEach((row, index) => {
      const entity = entities[index];
      const form = row.querySelector('ha-form');
      if (!form) return;

      const entName = typeof entity === 'string' ? entity : entity.entity;
      const isNumeric = this._isNumericEntity(entName);

      // Update Schema (Title might change if reordered)
      const schema = [
        {
          name: '',
          type: 'expandable',
          title: `${entName}`,
          expanded: true,
          schema: [
            { name: 'name', label: 'Name Override', selector: { text: {} } },
            {
              name: 'secondary_info',
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
            ...(isNumeric
              ? [
                  {
                    name: 'decimals',
                    label: 'Decimal Places',
                    selector: { number: { min: 0, max: 6, mode: 'box' } },
                  },
                ]
              : []),
          ],
        },
      ];

      // Update Data
      const data = {
        name: typeof entity === 'object' ? entity.name : '',
        secondary_info:
          typeof entity === 'object' ? entity.secondary_info : 'none',
        decimals:
          typeof entity === 'object' && entity.decimals !== undefined
            ? entity.decimals
            : '',
      };

      form.schema = schema;
      form.data = data;
      // Note: We do NOT update event listeners.
      // The listener created in build is `(ev) => this._handleSingleEntityChange(index, ...)`
      // This closure captures `index`.
      // Since DOM Node at `index` always corresponds to `entities[index]`, this is correct.

      // Update Buttons
      const buttons = row.querySelectorAll('.move-btn');
      if (buttons.length === 2) {
        const upBtn = buttons[0];
        const downBtn = buttons[1];

        upBtn.disabled = index === 0;
        upBtn.style.opacity = index === 0 ? '0.3' : '1';

        downBtn.disabled = index === entities.length - 1;
        downBtn.style.opacity = index === entities.length - 1 ? '0.3' : '1';
      }
    });
  }

  _isNumericEntity(entityId) {
    if (!this._hass || !entityId) return false;
    const stateObj = this._hass.states[entityId];
    if (!stateObj) return false;
    const state = stateObj.state;
    return !isNaN(parseFloat(state)) && isFinite(state);
  }

  _moveEntity(index, direction) {
    const newIndex = index + direction;
    const entities = [...(this._config.entities || [])];

    if (newIndex < 0 || newIndex >= entities.length) return;

    // Swap
    [entities[index], entities[newIndex]] = [
      entities[newIndex],
      entities[index],
    ];

    const newConfig = { ...this._config, entities };
    this._config = newConfig;
    fireEvent(this, 'config-changed', { config: this._config });
    this.render(); // Rebuild UI
  }

  _handleSingleEntityChange(index, value) {
    const entities = [...(this._config.entities || [])];
    const currentEntity = entities[index];
    const currentEntityId =
      typeof currentEntity === 'string' ? currentEntity : currentEntity.entity;

    // Check if we need to convert string to object or update object
    const newName = value.name;
    const newInfo = value.secondary_info;
    const newDecimals =
      value.decimals !== '' &&
      value.decimals !== undefined &&
      value.decimals !== null
        ? parseInt(value.decimals, 10)
        : undefined;

    // If all empty/default, revert to string
    if (
      (!newName || newName === '') &&
      (!newInfo || newInfo === 'none') &&
      newDecimals === undefined
    ) {
      entities[index] = currentEntityId;
    } else {
      const entityObj = {
        entity: currentEntityId,
        name: newName,
        secondary_info: newInfo,
      };
      if (newDecimals !== undefined) {
        entityObj.decimals = newDecimals;
      }
      entities[index] = entityObj;
    }

    const newConfig = { ...this._config, entities };
    this._config = newConfig;
    fireEvent(this, 'config-changed', { config: this._config });
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
    this._toggleBtn.textContent = 'Edit Entity Details / Order →';
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
      config.theme && config.theme !== 'none' && this._themes
        ? this._themes[config.theme]
        : null;
    const sourceConfig = themeData
      ? applyTheme({ ...config }, themeData)
      : { ...config };
    const data = { ...sourceConfig };

    // Ensure entities is an array of strings for the picker
    if (Array.isArray(sourceConfig.entities)) {
      data.entities = sourceConfig.entities
        .map((e) => {
          if (typeof e === 'string') return e;
          return e.entity || '';
        })
        .filter(Boolean);
    } else {
      data.entities = [];
    }

    // Defaults
    data.theme = sourceConfig.theme ?? 'none';
    data.title = sourceConfig.title ?? 'Entities';
    data.title_font_size = sourceConfig.title_font_size ?? 14;
    data.title_color = this._hexToRgb(
      sourceConfig.title_color ?? '#3e2723'
    ) ?? [62, 39, 35];
    data.ring_style = sourceConfig.ring_style ?? 'brass';
    data.font_bg_color = this._hexToRgb(
      sourceConfig.font_bg_color ?? '#ffffff'
    ) ?? [255, 255, 255];
    data.font_color = this._hexToRgb(sourceConfig.font_color ?? '#000000') ?? [
      0, 0, 0,
    ];
    data.rivet_color = this._hexToRgb(
      sourceConfig.rivet_color ?? '#6d5d4b'
    ) ?? [109, 93, 75];
    data.plate_color = this._hexToRgb(
      sourceConfig.plate_color ?? '#f5f5f5'
    ) ?? [245, 245, 245];
    data.plate_transparent = sourceConfig.plate_transparent ?? false;
    data.wear_level = sourceConfig.wear_level ?? 50;
    data.glass_effect_enabled = sourceConfig.glass_effect_enabled ?? true;
    data.aged_texture = sourceConfig.aged_texture ?? 'everywhere';
    data.aged_texture_intensity = sourceConfig.aged_texture_intensity ?? 50;

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

  _getSchemaTop() {
    return [
      {
        name: 'entities',
        label: 'Entities (List Management)',
        selector: { entity: { multiple: true } },
      },
      { name: 'title', label: 'Title', selector: { text: {} } },
      {
        name: '',
        type: 'expandable',
        title: 'Colors & Typography',
        schema: [
          {
            name: 'title_font_size',
            label: 'Title Font Size',
            selector: { number: { mode: 'box' } },
          },
          {
            type: 'grid',
            name: '',
            schema: [
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
            ],
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

if (!customElements.get('foundry-entities-editor')) {
  customElements.define('foundry-entities-editor', FoundryEntitiesEditor);
}
