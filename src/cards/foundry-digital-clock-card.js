import { fireEvent, getActionConfig } from './utils.js';
import { ensureLedFont } from './fonts.js';

class FoundryDigitalClockCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._timer = null;
  }

  setConfig(config) {
    this.config = { ...config };

    if (!this.config.tap_action) {
      this.config.tap_action = { action: 'more-info' };
    }

    // Defaults
    this.config.ring_style = this.config.ring_style || 'brass';
    this.config.title_font_size =
      this.config.title_font_size !== undefined
        ? this.config.title_font_size
        : 14;
    this.config.plate_color = this.config.plate_color || '#f5f5f5';
    this.config.plate_transparent =
      this.config.plate_transparent !== undefined
        ? this.config.plate_transparent
        : false;
    this.config.rivet_color = this.config.rivet_color || '#6d5d4b';
    this.config.font_bg_color = this.config.font_bg_color || '#ffffff';
    this.config.font_color = this.config.font_color || '#000000';
    this.config.use_24h_format =
      this.config.use_24h_format !== undefined
        ? this.config.use_24h_format
        : true;

    this.config.show_seconds =
      this.config.show_seconds !== undefined ? this.config.show_seconds : true;
    this.config.wear_level =
      this.config.wear_level !== undefined ? this.config.wear_level : 50;
    this.config.glass_effect_enabled =
      this.config.glass_effect_enabled !== undefined
        ? this.config.glass_effect_enabled
        : true;
    this.config.aged_texture =
      this.config.aged_texture !== undefined
        ? this.config.aged_texture
        : 'everywhere';
    this.config.aged_texture_intensity =
      this.config.aged_texture_intensity !== undefined
        ? this.config.aged_texture_intensity
        : 50;

    // Random ID for gradients
    this._uniqueId = Math.random().toString(36).substr(2, 9);
    ensureLedFont();
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
        const tzString = new Date().toLocaleString('en-US', {
          timeZone: this.config.time_zone,
        });
        time = new Date(tzString);
      } catch (_e) {
        console.warn('Invalid time zone:', this.config.time_zone);
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

    // If 12h format and PM, we will show dot in pmIndicator element
    const showPm = this.config.use_24h_format === false && isPm;

    const timeFull =
      this.config.show_seconds !== false
        ? `${hours}:${minutes}:${seconds}`
        : `${hours}:${minutes}`;

    const timeDisplay = this.shadowRoot.getElementById('timeDisplay');
    const pmIndicator = this.shadowRoot.getElementById('pmIndicator');

    if (timeDisplay) timeDisplay.textContent = timeFull;
    if (pmIndicator) pmIndicator.textContent = showPm ? '.' : '';
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
    const glassEffectEnabled =
      config.glass_effect_enabled !== undefined
        ? config.glass_effect_enabled
        : true;
    const agedTexture =
      config.aged_texture !== undefined ? config.aged_texture : 'everywhere';
    const agedTextureIntensity =
      config.aged_texture_intensity !== undefined
        ? config.aged_texture_intensity
        : 50;
    const agedTextureOpacity = ((100 - agedTextureIntensity) / 100) * 1.0;
    const effectiveAgedTexture =
      plateTransparent && agedTexture === 'everywhere'
        ? 'glass_only'
        : agedTexture;
    // agedTextureEnabled removed as unused

    // Hardcoded font for time - Renamed to avoid conflicts
    // const timeFontFamily = 'FoundryDigitalLED, monospace';
    const titleFontFamily = 'Georgia, serif';

    this.shadowRoot.innerHTML = `
      <style>
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
              ${
                this.config.show_seconds !== false
                  ? `
                  <!-- Layout with Seconds: H:M:S -->
                  <g font-size="50" font-family="ds-digitalnormal" fill="${fontColor}" dominant-baseline="middle" stroke="${fontColor}" stroke-width="0.2" style="pointer-events: none; letter-spacing: 2px;">
                    <text id="timeDisplay" x="130" y="75" text-anchor="middle">--:--:--</text>
                    <text id="pmIndicator" x="205" y="75" text-anchor="start"></text>
                  </g>
                `
                  : `
                  <!-- Layout without Seconds: H:M -->
                  <g font-size="55" font-family="ds-digitalnormal" fill="${fontColor}" dominant-baseline="middle" stroke="${fontColor}" stroke-width="0.2" style="pointer-events: none; letter-spacing: 2px;">
                    <text id="timeDisplay" x="130" y="75" text-anchor="middle">--:--</text>
                    <text id="pmIndicator" x="185" y="75" text-anchor="start"></text>
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
      { cx: 240, cy: 125 },
    ];

    return rivets
      .map(
        (r) => `
      <g>
        <circle cx="${r.cx}" cy="${r.cy}" r="4" class="rivet"/>
        <circle cx="${r.cx}" cy="${r.cy}" r="2.5" class="screw-detail"/>
        <line x1="${r.cx - 3}" y1="${r.cy}" x2="${r.cx + 3}" y2="${r.cy}" class="screw-detail" transform="rotate(45, ${r.cx}, ${r.cy})"/>
      </g>
    `
      )
      .join('');
  }

  renderWearMarks(wearLevel) {
    if (wearLevel === 0) return '';
    // baseOpacity removed
    // Approximated coords for 220x150
    const allMarks = [
      {
        type: 'circle',
        cx: 50,
        cy: 45,
        r: 2,
        fill: '#8B7355',
        baseOpacity: 0.2,
      },
      {
        type: 'circle',
        cx: 210,
        cy: 56,
        r: 1.5,
        fill: '#8B7355',
        baseOpacity: 0.15,
      },
      {
        type: 'circle',
        cx: 77,
        cy: 90,
        r: 1,
        fill: '#6d5d4b',
        baseOpacity: 0.2,
      },
      {
        type: 'ellipse',
        cx: 163,
        cy: 37,
        rx: 3,
        ry: 1.5,
        fill: '#8B7355',
        baseOpacity: 0.1,
      },
      {
        type: 'circle',
        cx: 38,
        cy: 105,
        r: 1.2,
        fill: '#8B7355',
        baseOpacity: 0.12,
      },
      {
        type: 'circle',
        cx: 220,
        cy: 97,
        r: 1.8,
        fill: '#6d5d4b',
        baseOpacity: 0.18,
      },
      {
        type: 'ellipse',
        cx: 55,
        cy: 67,
        rx: 2,
        ry: 1,
        fill: '#8B7355',
        baseOpacity: 0.08,
      },
      {
        type: 'circle',
        cx: 152,
        cy: 108,
        r: 0.8,
        fill: '#6d5d4b',
        baseOpacity: 0.15,
      },
      {
        type: 'circle',
        cx: 238,
        cy: 48,
        r: 1.3,
        fill: '#8B7355',
        baseOpacity: 0.1,
      },
      {
        type: 'ellipse',
        cx: 27,
        cy: 75,
        rx: 2.5,
        ry: 1.2,
        fill: '#6d5d4b',
        baseOpacity: 0.09,
      },
    ];
    const markCount = Math.ceil((wearLevel / 100) * allMarks.length);
    const marksToShow = allMarks.slice(0, markCount);
    return marksToShow
      .map((mark) => {
        const opacity = Math.min(mark.baseOpacity * (wearLevel / 50), 0.25);
        return `<${mark.type} cx="${mark.cx}" cy="${mark.cy}" ${mark.r ? `r="${mark.r}"` : `rx="${mark.rx}" ry="${mark.ry}"`} fill="${mark.fill}" opacity="${opacity}"/>`;
      })
      .join('');
  }

  // ... helper methods for color, common gradients etc ...
  adjustColor(color, percent) {
    if (!color) return color;
    if (color.startsWith('#')) {
      let num = parseInt(color.replace('#', ''), 16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) + amt,
        G = ((num >> 8) & 0x00ff) + amt,
        B = (num & 0x0000ff) + amt;
      return (
        '#' +
        (
          0x1000000 +
          (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
          (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
          (B < 255 ? (B < 1 ? 0 : B) : 255)
        )
          .toString(16)
          .slice(1)
      );
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
        <linearGradient id="glassGrad-${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#aaccff;stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:#aaccff;stop-opacity:0" />
        </linearGradient>
      `;
  }

  renderSquareRim(ringStyle, uid, bgColor, glassEffectEnabled) {
    const data = this.getRimStyleData(ringStyle, uid);
    if (!data) return '';

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

      <!-- Face Background (Screen Color) -->
      <rect x="32" y="47" width="196" height="56" rx="10" ry="10" fill="${bgColor}" stroke="none" />

      <!-- Glass Glare on Screen (Top 20% approx) -->
      <!-- Screen: x=32, w=196. Top=47. -->
      ${glassEffectEnabled ? `<path d="M 32 47 L 228 47 L 228 58 Q 130 62 32 58 Z" fill="url(#glassGrad-${uid})" clip-path="inset(1px round 9px)" style="pointer-events: none;" />` : ''}

      <!-- Screen Frame (Shadow & Border) - Drawn ON TOP -->
      <rect x="32" y="47" width="196" height="56" rx="10" ry="10" 
            fill="none" stroke="rgba(0,0,0,0.5)" stroke-width="1" 
             style="box-shadow: inset 0 0 10px #000;"/>

      <!-- Inner Bevel (Inset) - Drawn LAST to overlap edges -->
      <rect x="28" y="43" width="204" height="64" rx="15" ry="15" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="2"/>
    `;
  }

  getRimStyleData(ringStyle, uid) {
    switch (ringStyle) {
      case 'brass':
        return { grad: `brassRim-${uid}`, stroke: '#8B7355' };
      case 'silver':
      case 'chrome':
        return { grad: `silverRim-${uid}`, stroke: '#999999' };
      case 'white':
        return { grad: `whiteRim-${uid}`, stroke: '#cfcfcf' };
      case 'black':
        return { grad: `blackRim-${uid}`, stroke: '#2b2b2b' };
      case 'copper':
        return { grad: `copperRim-${uid}`, stroke: '#8B4513' };
      case 'blue':
        return { grad: `blueRim-${uid}`, stroke: '#104E8B' };
      case 'green':
        return { grad: `greenRim-${uid}`, stroke: '#006400' };
      case 'red':
        return { grad: `redRim-${uid}`, stroke: '#8B0000' };
      default:
        return { grad: `brassRim-${uid}`, stroke: '#8B7355' };
    }
  }

  _attachActionListeners() {
    const root = this.shadowRoot?.getElementById('actionRoot');
    if (!root) return;
    root.onclick = () => {
      const tap = getActionConfig(this.config, 'tap_action', {
        action: 'more-info',
      });
      if (tap.action !== 'none') {
        if (this.config.entity) {
          this._handleAction('tap');
        }
      }
    };
  }

  _handleAction(_kind) {
    if (!this._hass || !this.config) return;
    const entityId = this.config.entity;
    if (!entityId) return;
    const tap = getActionConfig(this.config, 'tap_action', {
      action: 'more-info',
    });
    const actionConfig = tap;
    const action = actionConfig?.action;
    if (!action || action === 'none') return;
    if (action === 'more-info') {
      fireEvent(this, 'hass-more-info', { entityId });
    }
  }

  static getConfigElement() {
    return document.createElement('foundry-digital-clock-editor');
  }

  static getStubConfig() {
    return {
      entity: 'sun.sun',
      title: 'Local Time',
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
    };
  }
}

if (!customElements.get('foundry-digital-clock-card')) {
  customElements.define('foundry-digital-clock-card', FoundryDigitalClockCard);
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'foundry-digital-clock-card',
  name: 'Foundry Digital Clock',
  preview: true,
  description: 'A digital clock with square ring and LED font.',
});
