import { ensureLedFont } from './fonts.js';

class FoundryHomeThermostatCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._selectedTarget = 'low'; // 'low' or 'high'
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('Please define a climate entity');
    }

    this.config = { ...config };

    // Defaults
    this.config.title = this.config.title !== undefined ? this.config.title : 'Thermostat';

    // Appearance defaults
    this.config.plate_color = this.config.plate_color || '#f5f5f5';
    this.config.rivet_color = this.config.rivet_color || '#6d5d4b';
    this.config.ring_style = this.config.ring_style || 'brass';
    this.config.font_color = this.config.font_color || '#000000';
    this.config.font_bg_color = this.config.font_bg_color || '#ffffff';
    this.config.title_color = this.config.title_color || '#3e2723';

    this.config.wear_level = this.config.wear_level !== undefined ? this.config.wear_level : 50;
    this.config.glass_effect_enabled = this.config.glass_effect_enabled !== undefined ? this.config.glass_effect_enabled : true;
    this.config.plate_transparent = this.config.plate_transparent !== undefined ? this.config.plate_transparent : false;
    this.config.aged_texture = this.config.aged_texture !== undefined ? this.config.aged_texture : 'everywhere';
    this.config.aged_texture_intensity = this.config.aged_texture_intensity !== undefined ? this.config.aged_texture_intensity : 50;

    this._uniqueId = Math.random().toString(36).substr(2, 9);
    ensureLedFont();

    // Force re-render of structure on config change
    this._rendered = false;
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this.shadowRoot || !this.config) return;
    this._updateValues();
  }

  _updateValues() {
    if (!this._hass || !this.config) return;

    // If not rendered yet, render structure
    if (!this._rendered) {
      this.render();
      return;
    }

    const stateObj = this._hass.states[this.config.entity];
    if (!stateObj) return;
    const attributes = stateObj.attributes;
    const mode = stateObj.state;

    // 1. Update Top Screen Values
    this._updateScreenValues(stateObj, attributes);

    // 2. Determine Display Values
    const isDualMode = (mode === 'heat_cool' || mode === 'auto') && (attributes.target_temp_high != null && attributes.target_temp_low != null);

    let targetDisplayVal = '--';
    let selectorDisplayVal = this._selectedTarget.toUpperCase();

    if (isDualMode) {
      let val = this._selectedTarget === 'high' ? attributes.target_temp_high : attributes.target_temp_low;
      targetDisplayVal = (val !== undefined && val !== null) ? val : '--';
    } else {
      let val = attributes.temperature;
      targetDisplayVal = (val !== undefined && val !== null) ? val : '--';
    }

    // 3. Update Odometers
    // Words
    this.updateWordOdometer(`odo-selector-${this._uniqueId}`, selectorDisplayVal);
    this.updateWordOdometer(`odo-mode-${this._uniqueId}`, (stateObj.state || '').toUpperCase());
    this.updateWordOdometer(`odo-fan-${this._uniqueId}`, (attributes.fan_mode || 'AUTO').toUpperCase());
    this.updateWordOdometer(`odo-preset-${this._uniqueId}`, (attributes.preset_mode || 'NONE').toUpperCase());

    // Numbers (Temp)
    this.updateNumericOdometer(`odo-setpoint-${this._uniqueId}`, targetDisplayVal);
  }

  _updateScreenValues(stateObj, attributes) {
    const currentTemp = attributes.current_temperature !== undefined && attributes.current_temperature !== null ? attributes.current_temperature : '--';
    let humidity = '--';
    if (attributes.current_humidity !== undefined && attributes.current_humidity !== null) {
      humidity = attributes.current_humidity;
    } else if (attributes.humidity !== undefined && attributes.humidity !== null) {
      humidity = attributes.humidity;
    }
    const hvacAction = attributes.hvac_action || stateObj.state || 'off';
    const actionText = hvacAction.toUpperCase();

    const root = this.shadowRoot;
    const elTemp = root.getElementById(`screen-temp-${this._uniqueId}`);
    const elHum = root.getElementById(`screen-hum-${this._uniqueId}`);
    const elAction = root.getElementById(`screen-action-${this._uniqueId}`);

    if (elTemp) elTemp.innerHTML = `${currentTemp}<tspan font-size="28" dy="-20">°</tspan>`;
    if (elHum) elHum.textContent = humidity !== '--' ? humidity + '%' : '--';
    if (elAction) elAction.textContent = actionText;
  }

  updateWordOdometer(id, inValue) {
    const container = this.shadowRoot.getElementById(id);
    if (!container) return;

    let value = String(inValue || '').replace(/_/g, ' ');
    // If empty string (e.g. selector in single mode), show blank
    if (!value) value = '';

    const lastValue = container.dataset.lastValue;
    if (value === lastValue) return;
    container.dataset.lastValue = value;

    const isLong = value.length > 7;
    const fontSizeClass = isLong ? 'small' : '';

    // If first render (no lastValue), render directly
    if (lastValue === undefined) {
      container.innerHTML = `<div class="word-window"><div class="word-reel"><div class="word-item ${fontSizeClass}">${value}</div></div></div>`;
      return;
    }

    // Animate: Slide old out, new in. 
    // We create a reel vertically: Old top, New bottom. TranslateY moves up.
    // Old is at 0px. New is at 24px (height).
    // We start at translateY(0). Animate to translateY(-24px).

    container.innerHTML = `
        <div class="word-window">
            <div class="word-reel" style="transform: translateY(0);">
                <div class="word-item ${isLong ? 'small' : ''}">${lastValue}</div>
                <div class="word-item ${isLong ? 'small' : ''}">${value}</div>
            </div>
        </div>
      `;

    // Trigger reflow
    const reel = container.querySelector('.word-reel');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        reel.style.transition = 'transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)';
        reel.style.transform = 'translateY(-24px)';

        // Cleanup
        setTimeout(() => {
          container.innerHTML = `<div class="word-window"><div class="word-reel"><div class="word-item ${fontSizeClass}">${value}</div></div></div>`;
        }, 500);
      });
    });
  }

  updateNumericOdometer(id, value) {
    const container = this.shadowRoot.getElementById(id);
    if (!container) return;

    let strVal = String(value);
    if (value === undefined || value === null) strVal = '--';

    // Ensure structure exists
    let numericRow = container.querySelector('.numeric-row');
    if (!numericRow) {
      container.innerHTML = `<div class="numeric-row"></div>`;
      numericRow = container.querySelector('.numeric-row');
    }

    const chars = strVal.split('');
    const currentSlots = Array.from(numericRow.children);

    // Add slots if needed
    while (currentSlots.length < chars.length) {
      const slot = document.createElement('div');
      slot.className = 'digit-strip-window';

      const strip = document.createElement('div');
      strip.className = 'digit-strip';

      // Populate strip: [-, ., 0..9]
      // Order matters for index mapping
      const charset = ['-', '.', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
      charset.forEach(char => {
        const item = document.createElement('div');
        item.className = 'strip-char';
        item.textContent = char;
        strip.appendChild(item);
      });

      slot.appendChild(strip);
      numericRow.appendChild(slot);
      currentSlots.push(slot);
    }

    // Remove extra slots
    while (currentSlots.length > chars.length) {
      numericRow.removeChild(numericRow.lastChild);
      currentSlots.pop();
    }

    // Update loops
    const charset = ['-', '.', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']; // Indicies 0..11
    const charHeight = 24; // px

    chars.forEach((char, i) => {
      const slot = currentSlots[i];
      const strip = slot.querySelector('.digit-strip');

      let index = charset.indexOf(char);
      if (index === -1) index = 2; // Default to '0' or something if unknown

      const targetY = index * -charHeight;

      // Animate
      strip.style.transition = 'transform 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)';
      strip.style.transform = `translateY(${targetY}px)`;
    });
  }

  static getConfigElement() {
    return document.createElement('foundry-homethermostat-editor');
  }

  static getStubConfig() {
    return {
      entity: 'climate.example',
      title: 'Thermostat',
      ring_style: 'brass',
      plate_color: '#8c7626',
      title_color: '#3e2723',
      font_bg_color: '#ffffff',
      font_color: '#000000',
    };
  }

  render() {
    if (!this.config || !this._hass) return;
    this._rendered = true;

    const width = 300;
    const height = 440;
    const padding = 10;
    const plateW = width - (padding * 2);
    const plateH = height - (padding * 2);
    const uid = this._uniqueId;

    const {
      plate_color, rivet_color, font_color, font_bg_color, ring_style,
      wear_level, glass_effect_enabled, title, title_color,
      plate_transparent, aged_texture, aged_texture_intensity
    } = this.config;

    const agedTextureOpacity = ((100 - aged_texture_intensity) / 100) * 1.0;
    const effectiveAgedTexture = plate_transparent && aged_texture === 'everywhere' ? 'glass_only' : aged_texture;

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        ha-card { background: transparent; container-type: inline-size; }
        .card { position: relative; cursor: pointer; }
        .vector-svg { width: 100%; height: auto; filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.3)); }
        .digital-text { font-family: 'ds-digitaldot', monospace; pointer-events: none; }
        .label-text { font-family: 'Georgia', serif; font-weight: bold; fill: #ccc; font-size: 10px; text-anchor: middle; pointer-events: none; }
        .rivet { fill: ${rivet_color}; filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.4)); pointer-events: none; }
        .screw-detail { stroke: #4a4034; stroke-width: 0.5; fill: none; pointer-events: none; }
        
        .knob-arrow { cursor: pointer; transition: fill 0.2s; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5)); }
        .knob-arrow:hover { fill: #fff; }
        .knob-hit-area { fill: transparent; cursor: pointer; }

        /* Odometer Common */
        .odometer-container {
            width: 100%;
            height: 100%;
            background: #111;
            color: #fff;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            font-family: 'Courier New', monospace;
            font-weight: bold;
            user-select: none;
        }

        /* Word Odometer (Vertical Roll) */
        .word-reel {
            display: flex;
            flex-direction: column;
            align-items: center;
            /* Will animate transform translateY */
        }
        .word-item {
            height: 30px; /* Matches foreignObject height */
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            white-space: nowrap;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .word-item.small {
            font-size: 10px;
            letter-spacing: 0px;
        }

        /* Numeric Odometer (Digit Strips) */
        .numeric-row {
            display: flex;
            gap: 1px;
            justify-content: center;
            align-items: center;
        }
        .digit-strip-window {
            width: 14px;
            height: 24px;
            overflow: hidden;
            background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 50%, #0a0a0a 100%);
            border: 1px solid #333;
            border-radius: 2px;
            position: relative;
        }
        .digit-strip {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            display: flex;
            flex-direction: column;
            will-change: transform;
        }
        .strip-char {
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            color: #fff;
        }
        /* Word Window Styling */
        .word-window {
            width: 100%;
            height: 24px;
            overflow: hidden;
            background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 50%, #0a0a0a 100%);
            border: 1px solid #333;
            border-radius: 2px;
            position: relative;
            box-shadow: inset 0 1px 2px rgba(255,255,255,0.1); 
        }
        .word-reel {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            /* transform will be applied via JS */
        }
        .word-item {
            height: 24px;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            white-space: nowrap;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #f0f0f0;
            text-shadow: 0 1px 1px rgba(0,0,0,0.5);
        }
        .word-item.small {
            font-size: 10px;
            letter-spacing: 0px;
        }

        /* Overlay Styles */
        .overlay-container {
            display: none;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 10;
            justify-content: center;
            align-items: center;
            border-radius: 15px; /* Match card radius */
        }
        .overlay-content {
            background: #2a2a2a;
            border: 2px solid #8B7355; 
            border-radius: 8px;
            padding: 10px;
            width: 80%;
            max-height: 80%;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.5);
        }
        .overlay-title {
            color: #ccc;
            text-align: center;
            font-family: 'Georgia', serif;
            font-weight: bold;
            margin-bottom: 5px;
            text-transform: uppercase;
        }
        .overlay-option {
            background: #111;
            color: #fff;
            padding: 10px;
            border-radius: 4px;
            text-align: center;
            cursor: pointer;
            font-family: monospace;
            font-size: 16px;
            border: 1px solid #444;
            transition: background 0.2s;
        }
        .overlay-option:hover {
            background: #333;
            border-color: #8B7355;
        }
        .overlay-option.active {
            background: #8B7355;
            color: #000;
            font-weight: bold;
        }
        .overlay-input-group {
            display: flex;
            gap: 5px;
        }
        .overlay-input {
            flex: 1;
            background: #000;
            color: #fff;
            border: 1px solid #444;
            padding: 10px;
            font-size: 18px;
            text-align: center;
            border-radius: 4px;
        }
        .overlay-btn {
            background: #8B7355;
            color: #000;
            border: none;
            padding: 10px 15px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
        }
        .odometer-hit-area {
            fill: transparent;
            cursor: pointer;
        }
      </style>
      <ha-card>
        <div class="card" id="card-root">
          <svg class="vector-svg" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              ${this.renderGradients(uid)}
              ${this.renderFilters(uid, agedTextureOpacity)}
            </defs>

            <!-- Plate -->
            <rect x="${padding}" y="${padding}" width="${plateW}" height="${plateH}" rx="15" ry="15"
                  fill="${plate_transparent ? 'none' : plate_color}" 
                  stroke="${plate_transparent ? 'none' : '#444'}" stroke-width="2"
                  filter="${effectiveAgedTexture === 'everywhere' && !plate_transparent ? `url(#aged-${uid})` : ''}" />

            ${this.renderRivets(width, height, padding)}
            <text x="${width / 2}" y="40" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="20" fill="${title_color}" style="text-shadow: 1px 1px 2px rgba(255,255,255,0.2); pointer-events: none;">${title}</text>

            <!-- Screen -->
            <g transform="translate(${width / 2 - 120}, 50)">
                ${this.renderTopScreen(uid, ring_style, font_bg_color, font_color, glass_effect_enabled, 0, '--', '')}
            </g>

            <!-- Controls -->
            <g transform="translate(${width / 2}, 215)">
                <g transform="translate(-75, 0)">
                   ${this.renderOdometerGroup(uid, 'odo-selector', 'SELECTOR', 'selector', ring_style, title_color)}
                </g>
                <g transform="translate(75, 0)">
                   ${this.renderOdometerGroup(uid, 'odo-setpoint', 'TEMP', 'setpoint', ring_style, title_color)}
                </g>
            </g>

            <g transform="translate(${width / 2}, 330)">
                 <g transform="translate(-85, 0)">
                    ${this.renderOdometerGroup(uid, 'odo-mode', 'MODE', 'mode', ring_style, title_color)}
                 </g>
                 <g transform="translate(0, 0)">
                    ${this.renderOdometerGroup(uid, 'odo-fan', 'FAN', 'fan', ring_style, title_color)}
                 </g>
                 <g transform="translate(85, 0)">
                    ${this.renderOdometerGroup(uid, 'odo-preset', 'PRESET', 'preset', ring_style, title_color)}
                 </g>
            </g>
            
            ${this.renderWearMarks(width, height, wear_level)}
          </svg>
          
          <!-- Interaction Overlay -->
          <div id="overlay-${uid}" class="overlay-container">
               <div id="overlay-content-${uid}" class="overlay-content">
                  <!-- Injected via JS -->
               </div>
          </div>
        </div>
      </ha-card>
    `;

    this.shadowRoot.querySelectorAll('.knob-hit-area').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this._handleAction(el.dataset.type, el.dataset.dir);
      });
    });

    this.shadowRoot.querySelectorAll('.odometer-hit-area').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this._handleDisplayClick(el.dataset.type);
      });
    });

    // Close overlay on backdrop click
    const overlay = this.shadowRoot.getElementById(`overlay-${uid}`);
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this._closeOverlay();
        }
      });
    }

    this._updateValues();
  }

  // ... (keep handleAction, renderGradients, separate renderOdometerGroup function not in class text here but logic below)

  _closeOverlay() {
    const overlay = this.shadowRoot.getElementById(`overlay-${this._uniqueId}`);
    if (overlay) overlay.style.display = 'none';
  }

  _handleDisplayClick(type) {
    const entityId = this.config.entity;
    const stateObj = this._hass.states[entityId];
    if (!stateObj) return;
    const attr = stateObj.attributes;

    const overlay = this.shadowRoot.getElementById(`overlay-${this._uniqueId}`);
    const content = this.shadowRoot.getElementById(`overlay-content-${this._uniqueId}`);
    if (!overlay || !content) return;

    let title = type.toUpperCase();
    let html = '';

    if (type === 'setpoint') {
      const isDualMode = (stateObj.state === 'heat_cool' || stateObj.state === 'auto') && (attr.target_temp_high != null && attr.target_temp_low != null);
      let currentVal;
      if (isDualMode) {
        currentVal = this._selectedTarget === 'high' ? attr.target_temp_high : attr.target_temp_low;
      } else {
        currentVal = attr.temperature;
      }
      if (currentVal === undefined) currentVal = attr.current_temperature || 0;

      title = 'SET TEMPERATURE';
      html = `
            <div class="overlay-title">${title}</div>
            <div class="overlay-input-group">
                <input type="number" id="overlay-input-${this._uniqueId}" class="overlay-input" value="${currentVal}" step="${attr.target_temp_step || 0.5}">
                <button class="overlay-btn" id="overlay-set-btn-${this._uniqueId}">SET</button>
            </div>
        `;
    }
    else {
      // List Selection
      let options = [];
      let current = '';

      if (type === 'selector') {
        options = ['low', 'high'];
        current = this._selectedTarget;
      } else if (type === 'mode') {
        options = attr.hvac_modes || [];
        current = stateObj.state;
      } else if (type === 'fan') {
        options = attr.fan_modes || [];
        current = attr.fan_mode;
      } else if (type === 'preset') {
        options = [...(attr.preset_modes || [])];
        if (!options.includes('none') && !options.includes('None')) options.unshift('none');
        current = attr.preset_mode || 'none';
      }

      if (options.length === 0) return; // Nothing to show

      html = `<div class="overlay-title">SELECT ${title}</div>`;
      options.forEach(opt => {
        const label = opt.toUpperCase().replace(/_/g, ' ');
        const isActive = (opt.toLowerCase() === (current || '').toLowerCase());
        html += `<div class="overlay-option ${isActive ? 'active' : ''}" data-value="${opt}">${label}</div>`;
      });
    }

    content.innerHTML = html;
    overlay.style.display = 'flex';

    // Attach handlers
    if (type === 'setpoint') {
      const btn = this.shadowRoot.getElementById(`overlay-set-btn-${this._uniqueId}`);
      const input = this.shadowRoot.getElementById(`overlay-input-${this._uniqueId}`);
      btn.onclick = () => {
        const val = parseFloat(input.value);
        this._handleAction('setpoint', null, val); // Overloading _handleAction or make new one
        this._closeOverlay();
      };
    } else {
      content.querySelectorAll('.overlay-option').forEach(el => {
        el.onclick = () => {
          const val = el.dataset.value;
          if (type === 'selector') {
            this._selectedTarget = val;
            this._updateValues();
          } else {
            // Map to existing action logic, but we need 'specific value' not 'up/down'
            this._applyDirectValue(type, val);
          }
          this._closeOverlay();
        };
      });
    }
  }

  _applyDirectValue(type, value) {
    if (type === 'mode') {
      this._hass.callService('climate', 'set_hvac_mode', { entity_id: this.config.entity, hvac_mode: value });
    } else if (type === 'fan') {
      this._hass.callService('climate', 'set_fan_mode', { entity_id: this.config.entity, fan_mode: value });
    } else if (type === 'preset') {
      this._hass.callService('climate', 'set_preset_mode', { entity_id: this.config.entity, preset_mode: value });
    }
  }

  // Update handleAction to accept absolute value for setpoint
  _handleAction(type, direction, absoluteValue = null) {
    const entityId = this.config.entity;
    const stateObj = this._hass.states[entityId];
    if (!stateObj) return;
    const attr = stateObj.attributes;
    const mode = stateObj.state;

    if (type === 'selector') {
      this._selectedTarget = this._selectedTarget === 'low' ? 'high' : 'low';
      this._updateValues();
    }
    else if (type === 'setpoint') {
      const isDualMode = (mode === 'heat_cool' || mode === 'auto') && (attr.target_temp_high != null && attr.target_temp_low != null);
      let currentVal;
      let min = attr.min_temp || 7;
      let max = attr.max_temp || 35;
      let step = attr.target_temp_step || 1;

      if (isDualMode) {
        currentVal = this._selectedTarget === 'high' ? attr.target_temp_high : attr.target_temp_low;
      } else {
        currentVal = attr.temperature;
      }

      if (currentVal === undefined || currentVal === null) {
        if (attr.current_temperature != null) currentVal = attr.current_temperature;
        else return;
      }

      let newVal;
      if (absoluteValue !== null) {
        newVal = absoluteValue;
      } else {
        let step = attr.target_temp_step || 1;
        newVal = direction === 'up' ? currentVal + step : currentVal - step;
      }
      newVal = Math.max(min, Math.min(max, newVal));

      const serviceData = { entity_id: entityId };
      if (isDualMode) {
        if (this._selectedTarget === 'high') {
          serviceData.target_temp_high = newVal;
          serviceData.target_temp_low = attr.target_temp_low;
        } else {
          serviceData.target_temp_low = newVal;
          serviceData.target_temp_high = attr.target_temp_high;
        }
      } else {
        serviceData.temperature = newVal;
      }
      this._hass.callService('climate', 'set_temperature', serviceData);
    }
    else if (type === 'mode') {
      const modes = attr.hvac_modes || [];
      if (modes.length === 0) return;
      let idx = modes.indexOf(stateObj.state);
      if (idx === -1) idx = 0;
      idx = direction === 'up' ? (idx + 1) % modes.length : (idx - 1 + modes.length) % modes.length;
      this._hass.callService('climate', 'set_hvac_mode', { entity_id: entityId, hvac_mode: modes[idx] });
    }
    else if (type === 'fan') {
      const modes = attr.fan_modes || [];
      if (modes.length === 0) return;
      let idx = modes.indexOf(attr.fan_mode);
      if (idx === -1) idx = 0;
      idx = direction === 'up' ? (idx + 1) % modes.length : (idx - 1 + modes.length) % modes.length;
      this._hass.callService('climate', 'set_fan_mode', { entity_id: entityId, fan_mode: modes[idx] });
    }
    else if (type === 'preset') {
      const modes = attr.preset_modes || [];
      if (modes.length === 0) return;
      let current = attr.preset_mode || 'none';
      let activeModes = [...modes];
      if (!activeModes.includes('none') && !activeModes.includes('None')) activeModes.unshift('none');
      let idx = activeModes.indexOf(current);
      if (idx === -1) idx = 0;
      idx = direction === 'up' ? (idx + 1) % activeModes.length : (idx - 1 + activeModes.length) % activeModes.length;
      const newPreset = activeModes[idx];
      this._hass.callService('climate', 'set_preset_mode', { entity_id: entityId, preset_mode: newPreset === 'none' ? 'none' : newPreset });
    }
  }

  renderGradients(uid) {
    return `
        <linearGradient id="brassRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#c9a961;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#ddc68f;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#b8944d;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#d4b877;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#a68038;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="silverRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#e8e8e8;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#ffffff;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#c0c0c0;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#e0e0e0;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#b0b0b0;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="whiteRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
           <stop offset="0%"   style="stop-color:#f6f6f6;stop-opacity:1" />
           <stop offset="100%" style="stop-color:#cfcfcf;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="blackRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
           <stop offset="0%"   style="stop-color:#3a3a3a;stop-opacity:1" />
           <stop offset="100%" style="stop-color:#141414;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="copperRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   style="stop-color:#c77c43;stop-opacity:1" />
          <stop offset="25%"  style="stop-color:#e1a06a;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#9a5c2a;stop-opacity:1" />
          <stop offset="75%"  style="stop-color:#d7925a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#7b461f;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="blueRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   style="stop-color:#2a6fdb;stop-opacity:1" />
          <stop offset="25%"  style="stop-color:#5ea2ff;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#1f4f9e;stop-opacity:1" />
          <stop offset="75%"  style="stop-color:#4f8fe6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#163b76;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="greenRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   style="stop-color:#2fbf71;stop-opacity:1" />
          <stop offset="25%"  style="stop-color:#6fe0a6;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#1f7a49;stop-opacity:1" />
          <stop offset="75%"  style="stop-color:#53cf8e;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#165a36;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="redRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   style="stop-color:#e53935;stop-opacity:1" />
          <stop offset="25%"  style="stop-color:#ff6f6c;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#9e1f1c;stop-opacity:1" />
          <stop offset="75%"  style="stop-color:#e85a57;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6f1513;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="glassGrad-${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#aaccff;stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:#aaccff;stop-opacity:0" />
        </linearGradient>
     `;
  }

  renderFilters(uid, opacity) {
    if (!opacity) opacity = 0.5;
    return `
        <filter id="aged-${uid}" x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise"/>
          <feColorMatrix in="noise" type="saturate" values="0" result="desaturatedNoise"/>
          <feComponentTransfer result="grainTexture">
            <feFuncR type="linear" slope="${1 - opacity}" intercept="${opacity}"/>
            <feFuncG type="linear" slope="${1 - opacity}" intercept="${opacity}"/>
            <feFuncB type="linear" slope="${1 - opacity}" intercept="${opacity}"/>
          </feComponentTransfer>
          <feBlend in="SourceGraphic" in2="grainTexture" mode="multiply" result="blended"/>
          <feComposite in="blended" in2="SourceGraphic" operator="in"/>
        </filter>
      `;
  }

  renderRivets(w, h, p) {
    const inset = p + 10;
    const coords = [[inset, inset], [w - inset, inset], [inset, h - inset], [w - inset, h - inset]];
    return coords.map(([cx, cy]) => `
        <g>
            <circle cx="${cx}" cy="${cy}" r="4" class="rivet" />
            <circle cx="${cx}" cy="${cy}" r="2.5" class="screw-detail" />
            <line x1="${cx - 3}" y1="${cy}" x2="${cx + 3}" y2="${cy}" class="screw-detail" transform="rotate(45, ${cx}, ${cy})" />
        </g>
      `).join('');
  }

  renderWearMarks(w, h, level) {
    if (!level || level <= 0) return '';
    const opacity = Math.min(0.2, level / 200);
    return `
      <g opacity="${opacity}" fill="none" stroke="#000" stroke-width="0.5">
          <path d="M 20 60 Q 40 70 60 50" />
          <path d="M ${w - 40} ${h - 30} L ${w - 20} ${h - 50}" />
          <path d="M 50 ${h - 60} Q 60 ${h - 40} 80 ${h - 70}" />
      </g>
    `;
  }

  getRimStyleData(ringStyle, uid) {
    switch (ringStyle) {
      case 'brass': return { grad: `brassRim-${uid}`, stroke: '#8B7355' };
      case 'silver': case 'chrome': return { grad: `silverRim-${uid}`, stroke: '#999999' };
      case 'white': return { grad: `whiteRim-${uid}`, stroke: '#cfcfcf' };
      case 'black': return { grad: `blackRim-${uid}`, stroke: '#2b2b2b' };
      case 'copper': return { grad: `copperRim-${uid}`, stroke: '#8B4513' };
      case 'blue': return { grad: `blueRim-${uid}`, stroke: '#104E8B' };
      case 'green': return { grad: `greenRim-${uid}`, stroke: '#006400' };
      case 'red': return { grad: `redRim-${uid}`, stroke: '#8B0000' };
      default: return { grad: `brassRim-${uid}`, stroke: '#8B7355' };
    }
  }

  renderSquareRim(ringStyle, uid, bgColor, glassEffectEnabled, x, y, w, h) {
    const data = this.getRimStyleData(ringStyle, uid);
    const bevelX = x + 8; const bevelY = y + 8; const bevelW = w - 16; const bevelH = h - 16;
    const screenX = bevelX + 4; const screenY = bevelY + 4; const screenW = bevelW - 8; const screenH = bevelH - 8;

    return `
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="20" ry="20" fill="url(#${data.grad})" stroke="${data.stroke}" stroke-width="1" filter="drop-shadow(2px 2px 3px rgba(0,0,0,0.4))"/>
      <rect x="${screenX}" y="${screenY}" width="${screenW}" height="${screenH}" rx="10" ry="10" fill="${bgColor}" stroke="none" />
      ${glassEffectEnabled ? `<path d="M ${screenX} ${screenY} L ${screenX + screenW} ${screenY} L ${screenX + screenW} ${screenY + screenH * 0.2} Q ${screenX + screenW / 2} ${screenY + screenH * 0.25} ${screenX} ${screenY + screenH * 0.2} Z" fill="url(#glassGrad-${uid})" clip-path="inset(1px round 9px)" style="pointer-events: none;" />` : ''}
      <rect x="${screenX}" y="${screenY}" width="${screenW}" height="${screenH}" rx="10" ry="10" fill="none" stroke="rgba(0,0,0,0.5)" stroke-width="1" style="box-shadow: inset 0 0 10px #000;"/>
      <rect x="${bevelX}" y="${bevelY}" width="${bevelW}" height="${bevelH}" rx="15" ry="15" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="2"/>
    `;
  }

  renderTopScreen(uid, ringStyle, bg, color, glass, temp, humidity, action) {
    const w = 240; const h = 120;
    const x = 0; const y = 0; // Relative
    const rimSvg = this.renderSquareRim(ringStyle, uid, bg, glass, x, y, w, h);

    return `
        ${rimSvg}
        <g transform="translate(${x + w / 2}, ${y + h / 2})">
             <!-- Temp -->
            <text id="screen-temp-${uid}" x="0" y="15" text-anchor="middle" class="digital-text" font-size="52" fill="${color}" style="filter: drop-shadow(0 0 2px ${color});">${temp}<tspan font-size="28" dy="-20">°</tspan></text>
            
            <!-- Label -->
            <text x="0" y="-35" text-anchor="middle" class="digital-text" font-size="14" fill="${color}" opacity="0.8">CURRENT</text>
            
            <!-- Bottom Row -->
            <g transform="translate(0, 42)">
                 <!-- Humidity -->
                <text x="-70" y="0" text-anchor="middle" class="digital-text" font-size="14" fill="${color}" opacity="0.8">RH</text>
                <text id="screen-hum-${uid}" x="-40" y="0" text-anchor="middle" class="digital-text" font-size="18" fill="${color}">${humidity}</text>
                
                <!-- Action -->
                <text id="screen-action-${uid}" x="50" y="0" text-anchor="middle" class="digital-text" font-size="18" fill="${color}">${action}</text>
            </g>
        </g>
      `;
  }

  renderOdometerGroup(uid, idKey, knobLabel, type, ringStyle, labelColor) {
    const rim = this.getRimStyleData(ringStyle, uid);
    const arrowColor = labelColor || '#555';
    const odoId = `${idKey}-${uid}`;

    return `
        <!-- Odometer Window (Ring) -->
        <rect x="-50" y="-35" width="100" height="34" rx="2" fill="url(#${rim.grad})" stroke="${rim.stroke}" stroke-width="1" />
        
        <!-- Inner Black Background & ForeignObject Odometer -->
        <foreignObject x="-48" y="-33" width="96" height="30" style="pointer-events: none;">
            <div id="${odoId}" class="odometer-container" xmlns="http://www.w3.org/1999/xhtml"></div>
        </foreignObject>
        
        <!-- Hit Area Overlay for Click Interaction -->
        <rect class="odometer-hit-area" data-type="${type}" x="-50" y="-35" width="100" height="34" rx="2" />

        <!-- Knob Graphic -->
        <g transform="translate(0, 25)">
            <g class="knob-arrow-group" transform="translate(-28, 0) scale(0.8)">
                <path class="knob-arrow" d="M -5 0 L 5 -8 L 5 8 Z" fill="${arrowColor}" />
                <rect class="knob-hit-area" data-type="${type}" data-dir="down" x="-10" y="-15" width="25" height="30" />
            </g>
            <g class="knob-arrow-group" transform="translate(28, 0) scale(0.8)">
                <path class="knob-arrow" d="M 5 0 L -5 -8 L -5 8 Z" fill="${arrowColor}" />
                <rect class="knob-hit-area" data-type="${type}" data-dir="up" x="-15" y="-15" width="25" height="30" />
            </g>
            <circle r="22" fill="#222" stroke="#111" stroke-width="1" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.5))" />
            <circle r="20" fill="none" stroke="#444" stroke-width="1" stroke-dasharray="2 2" opacity="0.6" />
            <circle r="12" fill="url(#${rim.grad})" stroke="#000" stroke-width="0.5" />
            <circle r="3" fill="#111" />
            <text x="0" y="38" class="label-text" style="fill: ${labelColor || '#888'};">${knobLabel}</text>
        </g>
      `;
  }
}

customElements.define('foundry-homethermostat-card', FoundryHomeThermostatCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'foundry-homethermostat-card',
  name: 'Foundry Home Thermostat',
  description: 'Industrial style thermostat control',
});
