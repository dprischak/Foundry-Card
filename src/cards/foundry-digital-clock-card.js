import { fireEvent, getActionConfig } from "./utils.js";

const FOUNDRY_DIGITAL_FONT = "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";

class FoundryDigitalClockCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._timer = null;
  }
  ensureLedFont() {
    const FONT_STYLE_ID = "foundry-digital-led-font";
    if (document.getElementById(FONT_STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = FONT_STYLE_ID;
    style.textContent = `
      @font-face {
        font-family: 'ds-digitalnormal';
        src: url("data:font/woff2;base64,${FOUNDRY_DIGITAL_FONT}") format("woff2");
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
    `;
    document.head.appendChild(style);
  }

  setConfig(config) {
    this.config = { ...config };

    if (!this.config.tap_action) {
      this.config.tap_action = { action: "more-info" };
    }

    // Defaults
    this.config.ring_style = this.config.ring_style || 'brass';
    this.config.title_font_size = this.config.title_font_size !== undefined ? this.config.title_font_size : 14;
    this.config.plate_color = this.config.plate_color || '#f5f5f5';
    this.config.plate_transparent = this.config.plate_transparent !== undefined ? this.config.plate_transparent : false;
    this.config.rivet_color = this.config.rivet_color || '#6d5d4b';
    this.config.font_bg_color = this.config.font_bg_color || '#ffffff';
    this.config.font_color = this.config.font_color || '#000000';
    this.config.use_24h_format = this.config.use_24h_format !== undefined ? this.config.use_24h_format : true;

    this.config.show_seconds = this.config.show_seconds !== undefined ? this.config.show_seconds : true;
    this.config.wear_level = this.config.wear_level !== undefined ? this.config.wear_level : 50;
    this.config.glass_effect_enabled = this.config.glass_effect_enabled !== undefined ? this.config.glass_effect_enabled : true;
    this.config.aged_texture = this.config.aged_texture !== undefined ? this.config.aged_texture : 'everywhere';
    this.config.aged_texture_intensity = this.config.aged_texture_intensity !== undefined ? this.config.aged_texture_intensity : 50;

    // Random ID for gradients
    this._uniqueId = Math.random().toString(36).substr(2, 9);
    this.ensureLedFont();
    this.render();
    this._startClock();
  }

  set hass(hass) {
    this._hass = hass;
  }

  connectedCallback() {
    this._startClock();
  }

  disconnectedCallback() {
    this._stopClock();
  }

  _startClock() {
    this._stopClock();
    this._updateTime();
    this._timer = setInterval(() => this._updateTime(), 1000);
  }

  _stopClock() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }

  _updateTime() {
    if (!this.shadowRoot) return;

    const now = new Date();
    let time = now;

    // Time Zone Handling
    if (this.config.time_zone) {
      try {
        const tzString = new Date().toLocaleString("en-US", { timeZone: this.config.time_zone });
        time = new Date(tzString);
      } catch (e) {
        console.warn("Invalid time zone:", this.config.time_zone);
      }
    }

    let hoursNum = time.getHours();
    let isPm = hoursNum >= 12;

    if (this.config.use_24h_format === false) {
      hoursNum = hoursNum % 12;
      hoursNum = hoursNum ? hoursNum : 12; // the hour '0' should be '12'
    }

    const hours = hoursNum.toString().padStart(2, '0');
    let minutes = time.getMinutes().toString().padStart(2, '0');
    let seconds = time.getSeconds().toString().padStart(2, '0');

    // If 12h format and PM, append dot to seconds (or minutes if seconds hidden)
    // If 12h format and PM, we will show dot in pmIndicator element
    const showPm = (this.config.use_24h_format === false && isPm);

    const timeFull = (this.config.show_seconds !== false)
      ? `${hours}:${minutes}:${seconds}`
      : `${hours}:${minutes}`;

    const timeHours = this.shadowRoot.getElementById('timeHours');
    const timeMinutes = this.shadowRoot.getElementById('timeMinutes');
    const timeSeconds = this.shadowRoot.getElementById('timeSeconds');
    const pmIndicator = this.shadowRoot.getElementById('pmIndicator');

    if (timeHours) timeHours.textContent = hours;
    if (timeMinutes) timeMinutes.textContent = minutes;
    if (timeSeconds) timeSeconds.textContent = seconds;
    if (pmIndicator) pmIndicator.textContent = showPm ? "." : "";
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
    const fontBgColor = config.font_bg_color;
    const fontColor = config.font_color;

    // New features
    const wearLevel = config.wear_level !== undefined ? config.wear_level : 50;
    const glassEffectEnabled = config.glass_effect_enabled !== undefined ? config.glass_effect_enabled : true;
    const agedTexture = config.aged_texture !== undefined ? config.aged_texture : 'everywhere';
    const agedTextureIntensity = config.aged_texture_intensity !== undefined ? config.aged_texture_intensity : 50;
    const agedTextureOpacity = ((100 - agedTextureIntensity) / 100) * 1.0;
    const effectiveAgedTexture = (plateTransparent && agedTexture === 'everywhere') ? 'glass_only' : agedTexture;
    const agedTextureEnabled = effectiveAgedTexture === 'glass_only';

    // Hardcoded font for time - Renamed to avoid conflicts
    // const timeFontFamily = 'FoundryDigitalLED, monospace'; 
    const titleFontFamily = 'Georgia, serif';

    this.shadowRoot.innerHTML = `
      <style>
        @font-face {
          font-family: 'ds-digitalnormal';
          src: url("data:font/woff2;base64,${FOUNDRY_DIGITAL_FONT}") format("woff2");
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
        .flip-digit {
          font-family: 'ds-digitalnormal', monospace; 
        }

        .digit-item {
          font-family: 'ds-digitalnormal', monospace;
        }
        :host {
          display: block;
          padding: 0px;
        }
        ha-card {
          container-type: inline-size;
        }
        .card {
          background: transparent;
          padding: 0px;
          position: relative;
          cursor: pointer;          
        }
        .clock-container {
          position: relative;
          width: 100%;
          max-width: 520px; /* Allowed to be wider */
          margin: 0 auto;
          container-type: inline-size;
          aspect-ratio: 26 / 15;
        }
        .clock-svg {
          width: 100%;
          height: 100%;
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
      <ha-card role="img" aria-label="${title ? title : 'Foundry Digital Clock'}" tabindex="0">
        <div class="card" id="actionRoot">
          <div class="clock-container" role="presentation">
            <svg class="clock-svg" viewBox="0 0 260 150" xmlns="http://www.w3.org/2000/svg" role="presentation" aria-hidden="true">
              <defs>
                <!-- Gradient for clock face/background -->
                <radialGradient id="clockFace-${uid}" cx="50%" cy="50%">
                  <stop offset="0%" style="stop-color:${fontBgColor};stop-opacity:1" />
                  <stop offset="100%" style="stop-color:${this.adjustColor(fontBgColor, -20)};stop-opacity:1" />
                </radialGradient>
                
                <!-- Gradients for Rims -->
                ${this.renderGradients(uid)}

                <!-- Aged texture -->
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
              
              <!-- 1. The Plate (Base) -->
              <!-- Wider and shorter: 260x140 (ViewBox 260) -->
              <rect x="5" y="10" width="250" height="130" rx="20" ry="20" 
                    fill="${plateTransparent ? 'none' : plateColor}" 
                    stroke="${plateTransparent ? 'none' : '#888'}" stroke-width="0.5"
                    filter="${effectiveAgedTexture === 'everywhere' && !plateTransparent ? `url(#aged-${uid}) drop-shadow(1px 1px 2px rgba(0,0,0,0.3))` : 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))'}" />

              <!-- 2. The Rivets -->
              ${this.renderRivets()}

              <!-- 3. The Ring (Wider) -->
              ${this.renderSquareRim(ringStyle, uid, fontBgColor, glassEffectEnabled)}
              
              <!-- Title text -->
              ${title ? `<text x="130" y="28" text-anchor="middle" font-size="${titleFontSize}" font-weight="bold" fill="#3e2723" font-family="${titleFontFamily}" style="text-shadow: 1px 1px 2px rgba(255,255,255,0.2); pointer-events: none;">${title}</text>` : ''}
              
              <!-- Digital Time -->
              ${this.config.show_seconds !== false
        ? `
                  <!-- Layout with Seconds: H:M:S -->
                  <!-- Center 130. Minutes centered at 130. Tightened spacing. -->
                  <g font-size="44" font-family="ds-digitalnormal" fill="${fontColor}" dominant-baseline="middle" style="text-shadow: 0 0 5px ${fontColor}; pointer-events: none; letter-spacing: 2px;">
                    <text id="timeHours"   x="92"  y="75" text-anchor="end">--</text>
                    <text id="timeSep1"    x="100" y="73" text-anchor="middle">:</text>
                    <text id="timeMinutes" x="130" y="75" text-anchor="middle">--</text>
                    <text id="timeSep2"    x="160" y="73" text-anchor="middle">:</text>
                    <text id="timeSeconds" x="168" y="75" text-anchor="start">--</text>
                    <text id="pmIndicator" x="214" y="75" text-anchor="start"></text>
                  </g>
                `
        : `
                  <!-- Layout without Seconds: H:M -->
                  <!-- Center 130. Colon at 130. -->
                  <g font-size="44" font-family="ds-digitalnormal" fill="${fontColor}" dominant-baseline="middle" style="text-shadow: 0 0 5px ${fontColor}; pointer-events: none; letter-spacing: 2px;">
                    <text id="timeHours"   x="122" y="75" text-anchor="end">--</text>
                    <text id="timeSep1"    x="130" y="73" text-anchor="middle">:</text>
                    <text id="timeMinutes" x="138" y="75" text-anchor="start">--</text>
                    <text id="pmIndicator" x="184" y="75" text-anchor="start"></text>
                  </g>
                `
      }
              
              <!-- Wear Marks -->
              ${this.renderWearMarks(wearLevel)}

            </svg>
          </div>
        </div>
      </ha-card>
    `;
    this._attachActionListeners();
  }

  renderRivets() {
    // Plate 5,10 -> 215,140
    // Corners: 20,25 | 200,25 | 20,125 | 200,125
    const rivets = [
      { cx: 20, cy: 25 },
      { cx: 240, cy: 25 },
      { cx: 20, cy: 125 },
      { cx: 240, cy: 125 }
    ];

    return rivets.map(r => `
      <g>
        <circle cx="${r.cx}" cy="${r.cy}" r="4" class="rivet"/>
        <circle cx="${r.cx}" cy="${r.cy}" r="2.5" class="screw-detail"/>
        <line x1="${r.cx - 3}" y1="${r.cy}" x2="${r.cx + 3}" y2="${r.cy}" class="screw-detail" transform="rotate(45, ${r.cx}, ${r.cy})"/>
      </g>
    `).join('');
  }

  renderWearMarks(wearLevel) {
    if (wearLevel === 0) return '';
    const baseOpacity = (wearLevel / 100) * 0.25;
    // Approximated coords for 220x150
    const allMarks = [
      { type: 'circle', cx: 50, cy: 45, r: 2, fill: '#8B7355', baseOpacity: 0.2 },
      { type: 'circle', cx: 210, cy: 56, r: 1.5, fill: '#8B7355', baseOpacity: 0.15 },
      { type: 'circle', cx: 77, cy: 90, r: 1, fill: '#6d5d4b', baseOpacity: 0.2 },
      { type: 'ellipse', cx: 163, cy: 37, rx: 3, ry: 1.5, fill: '#8B7355', baseOpacity: 0.1 },
      { type: 'circle', cx: 38, cy: 105, r: 1.2, fill: '#8B7355', baseOpacity: 0.12 },
      { type: 'circle', cx: 220, cy: 97, r: 1.8, fill: '#6d5d4b', baseOpacity: 0.18 },
      { type: 'ellipse', cx: 55, cy: 67, rx: 2, ry: 1, fill: '#8B7355', baseOpacity: 0.08 },
      { type: 'circle', cx: 152, cy: 108, r: 0.8, fill: '#6d5d4b', baseOpacity: 0.15 },
      { type: 'circle', cx: 238, cy: 48, r: 1.3, fill: '#8B7355', baseOpacity: 0.1 },
      { type: 'ellipse', cx: 27, cy: 75, rx: 2.5, ry: 1.2, fill: '#6d5d4b', baseOpacity: 0.09 }
    ];
    const markCount = Math.ceil((wearLevel / 100) * allMarks.length);
    const marksToShow = allMarks.slice(0, markCount);
    return marksToShow.map(mark => {
      const opacity = Math.min(mark.baseOpacity * (wearLevel / 50), 0.25);
      return `<${mark.type} cx="${mark.cx}" cy="${mark.cy}" ${mark.r ? `r="${mark.r}"` : `rx="${mark.rx}" ry="${mark.ry}"`} fill="${mark.fill}" opacity="${opacity}"/>`;
    }).join('');
  }

  // ... helper methods for color, common gradients etc ...
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

  renderGradients(uid) {
    return `
        <!-- Brass -->
        <linearGradient id="brassRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#c9a961;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#ddc68f;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#b8944d;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#d4b877;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#a68038;stop-opacity:1" />
        </linearGradient>
        <!-- Silver/Chrome -->
        <linearGradient id="silverRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#e8e8e8;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#ffffff;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#c0c0c0;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#e0e0e0;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#b0b0b0;stop-opacity:1" />
        </linearGradient>
        <!-- White -->
        <linearGradient id="whiteRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
           <stop offset="0%"   style="stop-color:#f6f6f6;stop-opacity:1" />
           <stop offset="100%" style="stop-color:#cfcfcf;stop-opacity:1" />
        </linearGradient>
         <!-- Black -->
        <linearGradient id="blackRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
           <stop offset="0%"   style="stop-color:#3a3a3a;stop-opacity:1" />
           <stop offset="100%" style="stop-color:#141414;stop-opacity:1" />
        </linearGradient>
        <!-- Copper -->
        <linearGradient id="copperRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   style="stop-color:#c77c43;stop-opacity:1" />
          <stop offset="25%"  style="stop-color:#e1a06a;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#9a5c2a;stop-opacity:1" />
          <stop offset="75%"  style="stop-color:#d7925a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#7b461f;stop-opacity:1" />
        </linearGradient>
        <!-- Blue -->
        <linearGradient id="blueRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   style="stop-color:#2a6fdb;stop-opacity:1" />
          <stop offset="25%"  style="stop-color:#5ea2ff;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#1f4f9e;stop-opacity:1" />
          <stop offset="75%"  style="stop-color:#4f8fe6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#163b76;stop-opacity:1" />
        </linearGradient>
        <!-- Green -->
        <linearGradient id="greenRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   style="stop-color:#2fbf71;stop-opacity:1" />
          <stop offset="25%"  style="stop-color:#6fe0a6;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#1f7a49;stop-opacity:1" />
          <stop offset="75%"  style="stop-color:#53cf8e;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#165a36;stop-opacity:1" />
        </linearGradient>
        <!-- Red -->
        <linearGradient id="redRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   style="stop-color:#e53935;stop-opacity:1" />
          <stop offset="25%"  style="stop-color:#ff6f6c;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#9e1f1c;stop-opacity:1" />
          <stop offset="75%"  style="stop-color:#e85a57;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6f1513;stop-opacity:1" />
        </linearGradient>
      `;
  }



  renderSquareRim(ringStyle, uid, bgColor, glassEffectEnabled) {
    const data = this.getRimStyleData(ringStyle, uid);
    if (!data) return "";

    // Box Geometry
    // Plate is 260x150. (Rect 5,10 -> 255,140)
    // Ring Width: 220, Height 80.
    // Center is 130, 75.
    // X = 130 - 110 = 20.
    // Y = 75 - 40 = 35.

    return `
      <!-- Outer Frame (The Ring) -->
      <rect x="20" y="35" width="220" height="80" rx="20" ry="20" fill="url(#${data.grad})" stroke="${data.stroke}" stroke-width="1"
            filter="drop-shadow(2px 2px 3px rgba(0,0,0,0.4))"/>
      
      <!-- Inner Bevel (Inset) -->
      <rect x="28" y="43" width="204" height="64" rx="15" ry="15" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="2"/>
      
      <!-- Face Background (Screen) -->
      <rect x="32" y="47" width="196" height="56" rx="10" ry="10" fill="${bgColor}" stroke="rgba(0,0,0,0.5)" stroke-width="1" 
             style="box-shadow: inset 0 0 10px #000;"/>
      
      <!-- Glass Glare on Screen -->
      ${glassEffectEnabled ? `<path d="M 35 50 Q 130 70 225 50 L 225 90 Q 130 100 35 90 Z" fill="white" opacity="0.05" clip-path="inset(0px round 10px)" />` : ''}
    `;
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

  _attachActionListeners() {
    const root = this.shadowRoot?.getElementById("actionRoot");
    if (!root) return;
    root.onclick = () => {
      const tap = getActionConfig(this.config, "tap_action", { action: "more-info" });
      if (tap.action !== 'none') {
        if (this.config.entity) {
          this._handleAction("tap");
        }
      }
    };
  }

  _handleAction(kind) {
    if (!this._hass || !this.config) return;
    const entityId = this.config.entity;
    if (!entityId) return;
    const tap = getActionConfig(this.config, "tap_action", { action: "more-info" });
    const actionConfig = tap;
    const action = actionConfig?.action;
    if (!action || action === "none") return;
    if (action === "more-info") {
      fireEvent(this, "hass-more-info", { entityId });
    }
  }

  static getConfigElement() {
    return document.createElement("foundry-digital-clock-editor");
  }

  static getStubConfig() {
    return {
      entity: "sun.sun",
      title: "Local Time",
      title_font_size: 12,
      ring_style: 'brass',
      rivet_color: '#6a5816',
      plate_color: '#8c7626',
      plate_transparent: false,
      font_bg_color: '#ffffff',
      font_color: '#000000',
      use_24h_format: true,
      show_seconds: true,
      wear_level: 50,
      glass_effect_enabled: true,
      aged_texture: 'everywhere',
      aged_texture_intensity: 50,
    }
  }
}


if (!customElements.get('foundry-digital-clock-card')) {
  customElements.define('foundry-digital-clock-card', FoundryDigitalClockCard);
}


window.customCards = window.customCards || [];
window.customCards.push({
  type: "foundry-digital-clock-card",
  name: "Foundry Digital Clock",
  preview: true,
  description: "A digital clock with square ring and LED font."
});
