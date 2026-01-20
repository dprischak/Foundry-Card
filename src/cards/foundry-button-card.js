import { handleAction } from "./utils.js";
import { ensureLedFont } from "./fonts.js";

class FoundryButtonCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._subscribedTemplates = new Map();
  }

  // ... (existing code)



  setConfig(config) {
    this.config = { ...config };
    // ... snip ...




    // Defaults
    this.config.ring_style = this.config.ring_style || 'brass';
    this.config.plate_color = this.config.plate_color || '#f5f5f5';
    this.config.plate_transparent = this.config.plate_transparent !== undefined ? this.config.plate_transparent : false;
    this.config.font_bg_color = this.config.font_bg_color || '#ffffff';
    this.config.font_color = this.config.font_color || '#000000';

    this.config.wear_level = this.config.wear_level !== undefined ? this.config.wear_level : 50;
    this.config.glass_effect_enabled = this.config.glass_effect_enabled !== undefined ? this.config.glass_effect_enabled : true;
    this.config.aged_texture = this.config.aged_texture !== undefined ? this.config.aged_texture : 'everywhere';
    this.config.aged_texture_intensity = this.config.aged_texture_intensity !== undefined ? this.config.aged_texture_intensity : 50;

    this.config.icon_color = this.config.icon_color || 'var(--primary-text-color)';

    this._uniqueId = Math.random().toString(36).substr(2, 9);
    ensureLedFont();
  }

  set hass(hass) {
    this._hass = hass;
    this._updateTemplateSubscriptions();
    this._updateRender();
  }

  connectedCallback() {
    this._updateTemplateSubscriptions();
  }

  disconnectedCallback() {
    this._unsubscribeAll();
  }

  _unsubscribeAll() {
    this._subscribedTemplates.forEach(unsub => {
      if (typeof unsub === 'function') unsub();
      else if (unsub && unsub.then) unsub.then(u => u && u());
    });
    this._subscribedTemplates.clear();
  }

  async _updateTemplateSubscriptions() {
    if (!this._hass || !this.config) return;

    // Fields that support templating
    const templates = {
      primary_info: this.config.primary_info,
      secondary_info: this.config.secondary_info,
      secondary_info_2: this.config.secondary_info_2,
      icon_color: this.config.icon_color
    };

    for (const [key, template] of Object.entries(templates)) {
      if (!template || typeof template !== 'string') continue;

      // Check if it looks like a template
      if (!template.includes('{{') && !template.includes('{%')) {
        // Static value, just store it directly if not already set (or if changed)
        if (this[`_${key}`] !== template) {
          this[`_${key}`] = template;
          this._requestRender();
        }
        continue;
      }

      // It's a template, subscription needed
      // Key for map is field name
      if (this._subscribedTemplates.has(key)) continue; // Already subscribed

      try {
        const unsub = await this._hass.connection.subscribeMessage(
          (result) => {
            this[`_${key}`] = result.result;
            this._requestRender();
          },
          {
            type: "render_template",
            template: template,
            variables: {
              entity: this.config.entity,
              user: this._hass.user.name,
            },
          }
        );
        this._subscribedTemplates.set(key, unsub);
      } catch (e) {
        console.error("Error subscribing to template", e);
        this[`_${key}`] = `Error: ${e.message}`;
        this._requestRender();
      }
    }
  }

  _requestRender() {
    if (!this._renderPending) {
      this._renderPending = true;
      requestAnimationFrame(() => {
        this._renderPending = false;
        this._updateRender();
      });
    }
  }


  _updateRender() {
    if (!this.shadowRoot) return;

    // If we haven't rendered the skeleton yet, do so
    if (!this.shadowRoot.getElementById('actionRoot')) {
      this.renderSkeleton();
    }

    this.updateContent();
  }

  renderSkeleton() {
    const config = this.config;
    const uid = this._uniqueId;
    const ringStyle = config.ring_style;
    const plateColor = config.plate_color;
    const plateTransparent = config.plate_transparent;
    const fontBgColor = config.font_bg_color;
    // const fontColor = config.font_color; // Used in text update

    const wearLevel = config.wear_level !== undefined ? config.wear_level : 50;
    const glassEffectEnabled = config.glass_effect_enabled !== undefined ? config.glass_effect_enabled : true;
    const agedTexture = config.aged_texture !== undefined ? config.aged_texture : 'everywhere';
    const agedTextureIntensity = config.aged_texture_intensity !== undefined ? config.aged_texture_intensity : 50;
    const agedTextureOpacity = ((100 - agedTextureIntensity) / 100) * 1.0;
    const effectiveAgedTexture = (plateTransparent && agedTexture === 'everywhere') ? 'glass_only' : agedTexture;

    // Dimensions for 100x100ish button
    const width = 110;
    const height = 110;

    // Plate dimensions
    const plateWidth = width - 10;
    const plateHeight = height - 10;
    const plateX = 5;
    const plateY = 5;

    // Rim dimensions - thinner
    const rimWidth = plateWidth - 10;
    const rimHeight = plateHeight - 10;
    const rimX = plateX + 5;
    const rimY = plateY + 5;


    this.shadowRoot.innerHTML = `
      <style>
        .digital-font {
          font-family: 'ds-digitaldot', monospace; 
        }
        :host {
          display: block;
          height: 100%;
        }
        ha-card {
          background: transparent;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .card {
          position: relative;
          cursor: pointer;
          width: 100%;
          max-width: 280px; /* Increased max size */
          container-type: inline-size; /* Measure this element, not the grid */
        }
        .container {
          position: relative;
          width: 100%;
          height: auto;
        }
        .vector-svg {
          width: 100%;
          height: auto;
          filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.3));
        }
      </style>
      <ha-card role="button" tabindex="0">
        <div class="card" id="actionRoot">
          <div class="container" role="presentation">
            <svg class="vector-svg" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="screenGrad-${uid}" cx="50%" cy="50%">
                  <stop offset="0%" style="stop-color:${fontBgColor};stop-opacity:1" />
                  <stop offset="100%" style="stop-color:${this.adjustColor(fontBgColor, -20)};stop-opacity:1" />
                </radialGradient>
                ${this.renderGradients(uid)}
                
                <filter id="aged-${uid}" x="-50%" y="-50%" width="200%" height="200%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise"/>
                  <feColorMatrix in="noise" type="saturate" values="0" result="desaturatedNoise"/>
                  <feComponentTransfer result="grainTexture">
                    <feFuncR type="linear" slope="${1 - agedTextureOpacity}" intercept="${agedTextureOpacity}"/>
                    <feFuncG type="linear" slope="${1 - agedTextureOpacity}" intercept="${agedTextureOpacity}"/>
                    <feFuncB type="linear" slope="${1 - agedTextureOpacity}" intercept="${agedTextureOpacity}"/>
                  </feComponentTransfer>
                  <feBlend in="SourceGraphic" in2="grainTexture" mode="multiply" result="blended"/>
                  <feComposite in="blended" in2="SourceGraphic" operator="in"/>
                </filter>
              </defs>
              
              <!-- Plate -->
              <rect x="${plateX}" y="${plateY}" width="${plateWidth}" height="${plateHeight}" rx="15" ry="15" 
                    fill="${plateTransparent ? 'none' : plateColor}" 
                    stroke="${plateTransparent ? 'none' : '#888'}" stroke-width="0.5"
                    filter="${effectiveAgedTexture === 'everywhere' && !plateTransparent ? `url(#aged-${uid}) drop-shadow(1px 1px 2px rgba(0,0,0,0.3))` : 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))'}" />

              <!-- Ring & Screen -->
              ${this.renderSquareRim(ringStyle, uid, fontBgColor, glassEffectEnabled, rimX, rimY, rimWidth, rimHeight)}
              
              <!-- Content Group -->
               <g id="content-group" font-family="ds-digitaldot" text-anchor="middle" style="pointer-events: none;">
                   <!-- Icon -->
                   <g id="icon-container" transform="translate(${width / 2}, 35)">
                        <!-- Placeholder for icon, will render via HA Icon element if possible or font icon -->
                   </g>

                   <!-- Text Lines -->
                   <text id="primary-text" x="${width / 2}" y="60" font-size="12" fill="${this.config.font_color}">--</text>
                   <text id="secondary-text" x="${width / 2}" y="75" font-size="9" fill="${this.config.font_color}" opacity="0.8">--</text>
                   <text id="secondary-text-2" x="${width / 2}" y="88" font-size="9" fill="${this.config.font_color}" opacity="0.8">--</text>
               </g>

              <!-- Wear Marks -->
              ${this.renderWearMarks(wearLevel, height)}

            </svg>
             <!-- HTML Overlay for Icon (easier to use HA-ICON) -->
             <div style="position: absolute; top: 15%; left: 0; width: 100%; text-align: center; pointer-events: none;">
                <ha-icon id="icon-element" icon="${this.config.icon || 'mdi:help'}" style="color: var(--primary-text-color); --mdc-icon-size: 25cqmin;"></ha-icon>
             </div>
          </div>
        </div>
      </ha-card>
    `;



    // Bind click for tap action
    const card = this.shadowRoot.querySelector("ha-card");
    card.addEventListener("click", this._handleTap.bind(this));
  }



  _handleTap(e) {
    if (e) {
      e.stopPropagation();
    }
    const config = this.config;
    if (!config || !config.tap_action) return;

    if (config.tap_action.action === "none") return;

    handleAction(this, this._hass, config, config.tap_action);
  }

  updateContent() {
    // Update Texts
    const pText = this.shadowRoot.getElementById('primary-text');
    const sText = this.shadowRoot.getElementById('secondary-text');
    const sText2 = this.shadowRoot.getElementById('secondary-text-2');
    const iconEl = this.shadowRoot.getElementById('icon-element');

    if (pText) pText.textContent = this._primary_info || '';
    if (sText) sText.textContent = this._secondary_info || '';
    if (sText2) sText2.textContent = this._secondary_info_2 || '';

    if (iconEl && this._icon_color) {
      iconEl.style.color = this._icon_color;
    }
    if (iconEl && this.config.icon) {
      iconEl.setAttribute("icon", this.config.icon);
    }
  }


  renderRivets(w, h, x, y) {
    // Removed rivets as per requirement
    return '';
  }

  renderSquareRim(ringStyle, uid, bgColor, glassEffectEnabled, x, y, w, h) {
    const data = this.getRimStyleData(ringStyle, uid);
    if (!data) return "";

    // Inner bevel inset - thinner
    const bevelX = x + 4;
    const bevelY = y + 4;
    const bevelW = w - 8;
    const bevelH = h - 8;

    // Screen inset
    const screenX = bevelX + 3;
    const screenY = bevelY + 3;
    const screenW = bevelW - 6;
    const screenH = bevelH - 6;

    return `
      <!-- Outer Frame (The Ring) -->
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" ry="12" fill="url(#${data.grad})" stroke="${data.stroke}" stroke-width="1"
            filter="drop-shadow(2px 2px 3px rgba(0,0,0,0.4))"/>
      
      <!-- Inner Bevel -->
      <rect x="${bevelX}" y="${bevelY}" width="${bevelW}" height="${bevelH}" rx="10" ry="10" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="1.5"/>
      
      <!-- Face Background (Screen) -->
      <rect x="${screenX}" y="${screenY}" width="${screenW}" height="${screenH}" rx="8" ry="8" 
            fill="${bgColor}" stroke="rgba(0,0,0,0.5)" stroke-width="1" 
             style="box-shadow: inset 0 0 10px #000;"/>
      
      <!-- Glass Glare -->
      ${glassEffectEnabled ? `<path d="M ${screenX + 8} ${screenY} L ${screenX + screenW - 8} ${screenY} Q ${screenX + screenW} ${screenY} ${screenX + screenW} ${screenY + 8} L ${screenX + screenW} ${screenY + screenH * 0.2} Q ${screenX + screenW / 2} ${screenY + screenH * 0.25} ${screenX} ${screenY + screenH * 0.2} L ${screenX} ${screenY + 8} Q ${screenX} ${screenY} ${screenX + 8} ${screenY} Z" fill="url(#glassGrad-${uid})" style="pointer-events: none;" />` : ''}
    `;
  }

  // Reuse from Entities Card / Digital Clock
  renderWearMarks(wearLevel, viewBoxHeight) {
    if (wearLevel === 0) return '';
    // Reduced wear marks for smaller size
    return `
        <circle cx="20" cy="20" r="1" fill="#8B7355" opacity="${Math.min(0.2 * (wearLevel / 50), 0.25)}"/>
        <circle cx="${viewBoxHeight - 20}" cy="${viewBoxHeight - 20}" r="0.8" fill="#8B7355" opacity="${Math.min(0.15 * (wearLevel / 50), 0.25)}"/>
    `;
  }

  adjustColor(color, percent) {
    if (!color) return color;
    if (color.startsWith('#')) {
      let num = parseInt(color.replace("#", ""), 16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) + amt,
        G = (num >> 8 & 0x00FF) + amt,
        B = (num & 0x0000FF) + amt;
      return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    return color;
  }

  getRimStyleData(ringStyle, uid) {
    switch (ringStyle) {
      case "brass": return { grad: `brassRim-${uid}`, stroke: "#8B7355" };
      case "silver":
      case "chrome": return { grad: `silverRim-${uid}`, stroke: "#999999" };
      case "white": return { grad: `whiteRim-${uid}`, stroke: "#cfcfcf" };
      case "black": return { grad: `blackRim-${uid}`, stroke: "#2b2b2b" };
      case "copper": return { grad: `copperRim-${uid}`, stroke: "#8B4513" };
      case "blue": return { grad: `blueRim-${uid}`, stroke: "#104E8B" };
      case "green": return { grad: `greenRim-${uid}`, stroke: "#006400" };
      case "red": return { grad: `redRim-${uid}`, stroke: "#8B0000" };
      default: return { grad: `brassRim-${uid}`, stroke: "#8B7355" };
    }
  }

  renderGradients(uid) {
    // Reduced gradients for conciseness, same logic as entities card just reused
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

  static getConfigElement() {
    return document.createElement("foundry-button-editor");
  }

  static get supportsCardResize() {
    return true;
  }

  static getGridOptions() {
    return {
      rows: 3,
      columns: 6,
      min_rows: 2,
      min_columns: 4,
      max_rows: 4,
      max_columns: 8,
    };
  }

  static getLayoutOptions() {
    return {
      grid_rows: 3,
      grid_columns: 6,
      grid_min_rows: 2,
      grid_min_columns: 4,
      grid_max_rows: 4,
      grid_max_columns: 8,

      // Fallback
      rows: 3,
      columns: 6,
    };
  }

  static getStubConfig() {
    return {
      entity: "light.sun_porch",
      icon: "mdi:lightbulb",
      primary_info: "Porch",
      secondary_info: "{{ states('light.sun_porch') }}",
      icon_color: "{{ 'amber' if states('light.sun_porch') == 'on' else 'grey' }}",
      ring_style: 'brass',
      plate_color: '#8c7626',
      font_bg_color: '#ffffff',
      font_color: '#000000',
      wear_level: 50,
      glass_effect_enabled: true,
      aged_texture: 'everywhere',
      aged_texture_intensity: 50,
      grid_options: {
        rows: 4,
        columns: 6,
      }
    }
  }
}

if (!customElements.get('foundry-button-card')) {
  customElements.define('foundry-button-card', FoundryButtonCard);
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "foundry-button-card",
  name: "Foundry Button",
  preview: true,
  description: "A compact industrial button card."
});
