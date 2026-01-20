
import { fireEvent, getActionConfig } from "./utils.js";
import { ensureLedFont } from "./fonts.js";

class FoundryEntitiesCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    this.config = { ...config };

    if (!this.config.entities) {
      throw new Error("Entities list is required");
    }

    if (!this.config.tap_action) {
      this.config.tap_action = { action: "more-info" };
    }

    // Defaults
    this.config.ring_style = this.config.ring_style || 'brass';
    this.config.title = this.config.title !== undefined ? this.config.title : "Entities";
    this.config.title_font_size = this.config.title_font_size !== undefined ? this.config.title_font_size : 14;
    this.config.plate_color = this.config.plate_color || '#f5f5f5';
    this.config.plate_transparent = this.config.plate_transparent !== undefined ? this.config.plate_transparent : false;
    this.config.rivet_color = this.config.rivet_color || '#6d5d4b';
    this.config.font_bg_color = this.config.font_bg_color || '#ffffff';
    this.config.font_color = this.config.font_color || '#000000';

    this.config.wear_level = this.config.wear_level !== undefined ? this.config.wear_level : 50;
    this.config.glass_effect_enabled = this.config.glass_effect_enabled !== undefined ? this.config.glass_effect_enabled : true;
    this.config.aged_texture = this.config.aged_texture !== undefined ? this.config.aged_texture : 'everywhere';
    this.config.aged_texture_intensity = this.config.aged_texture_intensity !== undefined ? this.config.aged_texture_intensity : 50;

    this._uniqueId = Math.random().toString(36).substr(2, 9);
    ensureLedFont();
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    this._updateValues();
  }

  _updateValues() {
    if (!this.shadowRoot) return;
    if (!this._hass || !this.config) return;

    const now = new Date();

    this.config.entities.forEach((entityConf, index) => {
      let entityId = (typeof entityConf === 'string') ? entityConf : entityConf.entity;
      if (!entityId) return;

      const stateObj = this._hass.states[entityId];

      // Update State
      const stateEl = this.shadowRoot.getElementById(`state-${index}`);
      if (stateEl) {
        const stateStr = stateObj ? stateObj.state : "N/A";
        const unit = stateObj && stateObj.attributes.unit_of_measurement ? stateObj.attributes.unit_of_measurement : "";
        stateEl.textContent = `${stateStr}${unit ? ' ' + unit : ''}`;
      }

      // Update Secondary Info
      const secondaryEl = this.shadowRoot.getElementById(`secondary-${index}`);
      const secondaryType = (typeof entityConf === 'object') ? entityConf.secondary_info : null;

      if (secondaryEl && secondaryType && secondaryType !== 'none') {
        if (stateObj) {
          if (secondaryType === 'entity-id') {
            secondaryEl.textContent = entityId;
          } else if (secondaryType === 'state') {
            const unit = stateObj.attributes.unit_of_measurement || "";
            secondaryEl.textContent = `${stateObj.state}${unit ? ' ' + unit : ''}`;
          } else if (secondaryType === 'last-updated' || secondaryType === 'last-changed') {
            const tsStr = secondaryType === 'last-updated' ? stateObj.last_updated : stateObj.last_changed;
            const ts = new Date(tsStr);
            const diff = Math.floor((now - ts) / 1000);
            let secondary = "";
            if (diff < 60) secondary = `${diff}s ago`;
            else if (diff < 3600) secondary = `${Math.floor(diff / 60)}m ago`;
            else if (diff < 86400) secondary = `${Math.floor(diff / 3600)}h ago`;
            else secondary = `${Math.floor(diff / 86400)}d ago`;

            secondaryEl.textContent = secondary;
          }
        } else {
          secondaryEl.textContent = "";
        }
      }
    });
  }

  render() {
    const config = this.config;
    const title = config.title || '';
    const uid = this._uniqueId;
    const titleFontSize = config.title_font_size;
    const ringStyle = config.ring_style;
    const rivetColor = config.rivet_color;
    const plateColor = config.plate_color;
    const plateTransparent = config.plate_transparent;
    const fontBgColor = config.config_bg_color || config.font_bg_color; // fallback
    const fontColor = config.font_color;

    // Appearance
    const wearLevel = config.wear_level !== undefined ? config.wear_level : 50;
    const glassEffectEnabled = config.glass_effect_enabled !== undefined ? config.glass_effect_enabled : true;
    const agedTexture = config.aged_texture !== undefined ? config.aged_texture : 'everywhere';
    const agedTextureIntensity = config.aged_texture_intensity !== undefined ? config.aged_texture_intensity : 50;
    const agedTextureOpacity = ((100 - agedTextureIntensity) / 100) * 1.0;
    const effectiveAgedTexture = (plateTransparent && agedTexture === 'everywhere') ? 'glass_only' : agedTexture;

    const titleFontFamily = 'Georgia, serif';

    // Height Calculation
    const rowHeightSingle = 15;
    const rowHeightDouble = 26;

    let currentY = 12;
    const rowLayouts = config.entities.map(ent => {
      const isString = typeof ent === 'string';
      const hasSecondary = !isString && ent.secondary_info && ent.secondary_info !== 'none';
      const height = hasSecondary ? rowHeightDouble : rowHeightSingle;
      const y = currentY;
      currentY += height;
      return {
        original: ent,
        y,
        height,
        hasSecondary,
        // Extract core data for easier usage
        entityId: isString ? ent : ent.entity,
        name: isString ? ent : (ent.name || ent.entity),
        secondaryInfo: hasSecondary ? ent.secondary_info : null
      };
    });

    const totalContentHeight = currentY + 6; // padding
    const screenHeight = Math.max(totalContentHeight, 60); // Min height
    const rimHeight = screenHeight + 24; // surrounding rim
    const plateHeight = rimHeight + 50; // surrounding plate
    const viewBoxHeight = plateHeight + 20;

    // Rect dimensions
    const plateWidth = 250;
    const plateX = 5;
    const plateY = 10;

    // Rim dimensions
    const rimWidth = 220;
    const rimX = 20;
    const rimY = 35; // Top offset for rim

    this.shadowRoot.innerHTML = `
      <style>
        .digital-font {
          font-family: 'ds-digitalnormal', monospace; 
        }
        :host {
          display: block;
        }
        ha-card {
          container-type: inline-size;
          background: transparent;
        }
        .card {
          position: relative;
          cursor: pointer;          
        }
        .container {
          position: relative;
          width: 100%;
          max-width: 520px;
          margin: 0 auto;
        }
        .vector-svg {
          width: 100%;
          height: auto;
          filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.3));
        }
        .rivet {
          fill: ${rivetColor};
          filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.4));
        }
        .screw-detail {
          stroke: #4a4034;
          stroke-width: 0.5;
          fill: none;
        }
      </style>
      <ha-card role="img" aria-label="${title}" tabindex="0">
        <div class="card" id="actionRoot">
          <div class="container" role="presentation">
            <svg class="vector-svg" viewBox="0 0 260 ${viewBoxHeight}" xmlns="http://www.w3.org/2000/svg">
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
              <rect x="${plateX}" y="${plateY}" width="${plateWidth}" height="${plateHeight}" rx="20" ry="20" 
                    fill="${plateTransparent ? 'none' : plateColor}" 
                    stroke="${plateTransparent ? 'none' : '#888'}" stroke-width="0.5"
                    filter="${effectiveAgedTexture === 'everywhere' && !plateTransparent ? `url(#aged-${uid}) drop-shadow(1px 1px 2px rgba(0,0,0,0.3))` : 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))'}" />

              <!-- Rivets -->
              ${this.renderRivets(plateWidth, plateHeight, plateX, plateY)}

              <!-- Ring & Screen -->
              ${this.renderSquareRim(ringStyle, uid, fontBgColor, glassEffectEnabled, rimX, rimY, rimWidth, rimHeight)}
              
              <!-- Title -->
              ${title ? `<text x="130" y="28" text-anchor="middle" font-size="${titleFontSize}" font-weight="bold" fill="#3e2723" font-family="${titleFontFamily}" style="text-shadow: 1px 1px 2px rgba(255,255,255,0.2); pointer-events: none;">${title}</text>` : ''}
              
              <!-- Entities List -->
              <g transform="translate(${rimX + 12}, ${rimY + 12})" font-family="ds-digitaldot" font-size="8" fill="${fontColor}" style="text-shadow: 0 0 3px ${fontColor}; letter-spacing: 1px; pointer-events: none;">
                ${this.renderEntitiesLoop(rowLayouts)}
              </g>

              <!-- Wear Marks -->
              ${this.renderWearMarks(wearLevel, viewBoxHeight)}

            </svg>
          </div>
        </div>
      </ha-card>
    `;

    this.shadowRoot.querySelectorAll(".entity-row").forEach(row => {
      row.addEventListener("click", (e) => {
        e.stopPropagation();
        const entityId = row.getAttribute("data-entity-id");
        if (entityId) {
          fireEvent(this, "hass-more-info", { entityId });
        }
      });
    });

    this._updateValues();
  }

  renderEntitiesLoop(rowLayouts) {
    return rowLayouts.map((layout, i) => {
      const { entityId, name, hasSecondary, y, height } = layout;

      // Positioning logic
      const yTop = y;
      const yText = hasSecondary ? yTop : (yTop + 2); // Center single lines (approx)
      const ySecondary = yTop + 10;
      const yState = hasSecondary ? (yTop + 6) : (yTop + 2); // Align state

      const hitWidth = 220;

      return `
             <g class="entity-row" data-entity-id="${entityId}" style="cursor: pointer;">
                 <!-- Hit target for clicking -->
                 <rect x="0" y="${yTop - 6}" width="${hitWidth}" height="${height}" fill="transparent" pointer-events="all"/>
                 <text x="10" y="${yText}" text-anchor="start" style="pointer-events: none;">${name}</text>
                 ${hasSecondary ? `<text id="secondary-${i}" x="22" y="${ySecondary}" text-anchor="start" font-size="8" opacity="0.7" style="pointer-events: none;"></text>` : ''}
                 <text id="state-${i}" x="190" y="${yState}" text-anchor="end" style="pointer-events: none;">--</text>
             </g>
          `;
    }).join('');
  }

  renderRivets(w, h, x, y) {
    const offset = 15;
    const rivets = [
      { cx: x + offset, cy: y + offset },
      { cx: x + w - offset, cy: y + offset },
      { cx: x + offset, cy: y + h - offset },
      { cx: x + w - offset, cy: y + h - offset }
    ];

    return rivets.map(r => `
      <g>
        <circle cx="${r.cx}" cy="${r.cy}" r="4" class="rivet"/>
        <circle cx="${r.cx}" cy="${r.cy}" r="2.5" class="screw-detail"/>
        <line x1="${r.cx - 3}" y1="${r.cy}" x2="${r.cx + 3}" y2="${r.cy}" class="screw-detail" transform="rotate(45, ${r.cx}, ${r.cy})"/>
      </g>
    `).join('');
  }

  renderSquareRim(ringStyle, uid, bgColor, glassEffectEnabled, x, y, w, h) {
    const data = this.getRimStyleData(ringStyle, uid);
    if (!data) return "";

    // Inner bevel inset
    const bevelX = x + 8;
    const bevelY = y + 8;
    const bevelW = w - 16;
    const bevelH = h - 16;

    // Screen inset
    const screenX = bevelX + 4;
    const screenY = bevelY + 4;
    const screenW = bevelW - 8;
    const screenH = bevelH - 8;

    return `
      <!-- Outer Frame (The Ring) -->
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="20" ry="20" fill="url(#${data.grad})" stroke="${data.stroke}" stroke-width="1"
            filter="drop-shadow(2px 2px 3px rgba(0,0,0,0.4))"/>
      
      <!-- Face Background (Screen Color) -->
      <rect x="${screenX}" y="${screenY}" width="${screenW}" height="${screenH}" rx="10" ry="10" 
            fill="${bgColor}" stroke="none" />

      <!-- Glass Glare (Top 20%) -->
      ${glassEffectEnabled ? `<path d="M ${screenX} ${screenY} L ${screenX + screenW} ${screenY} L ${screenX + screenW} ${screenY + screenH * 0.2} Q ${screenX + screenW / 2} ${screenY + screenH * 0.25} ${screenX} ${screenY + screenH * 0.2} Z" fill="url(#glassGrad-${uid})" clip-path="inset(1px round 9px)" style="pointer-events: none;" />` : ''}

      <!-- Screen Frame (Shadow & Border) - Drawn ON TOP -->
      <rect x="${screenX}" y="${screenY}" width="${screenW}" height="${screenH}" rx="10" ry="10" 
            fill="none" stroke="rgba(0,0,0,0.5)" stroke-width="1" 
             style="box-shadow: inset 0 0 10px #000;"/>

      <!-- Inner Bevel -->
      <rect x="${bevelX}" y="${bevelY}" width="${bevelW}" height="${bevelH}" rx="15" ry="15" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="2"/>
    `;
  }

  // Reuse from Digital Clock
  renderWearMarks(wearLevel, viewBoxHeight) {
    if (wearLevel === 0) return '';
    const baseOpacity = (wearLevel / 100) * 0.25;
    return `
        <circle cx="50" cy="45" r="2" fill="#8B7355" opacity="${Math.min(0.2 * (wearLevel / 50), 0.25)}"/>
        <circle cx="210" cy="${viewBoxHeight - 40}" r="1.5" fill="#8B7355" opacity="${Math.min(0.15 * (wearLevel / 50), 0.25)}"/>
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
    return document.createElement("foundry-entities-editor");
  }

  static getStubConfig() {
    return {
      entities: [
        { entity: "sensor.sun_next_dawn", name: "Dawn" },
        { entity: "sensor.sun_next_dusk", name: "Dusk" }
      ],
      title: "Foundry Data",
      title_font_size: 14,
      ring_style: 'brass',
      rivet_color: '#6a5816',
      plate_color: '#8c7626',
      plate_transparent: false,
      font_bg_color: '#ffffff',
      font_color: '#000000',
      wear_level: 50,
      glass_effect_enabled: true,
      aged_texture: 'everywhere',
      aged_texture_intensity: 50,
    }
  }
}

if (!customElements.get('foundry-entities-card')) {
  customElements.define('foundry-entities-card', FoundryEntitiesCard);
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "foundry-entities-card",
  name: "Foundry Entities",
  preview: true,
  description: "A digital display for a list of entities."
});
