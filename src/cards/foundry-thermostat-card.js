
import { debounce, fireEvent, getActionConfig } from "./utils.js";
import { ensureLedFont } from "./fonts.js";

class FoundryThermostatCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._resizeObserver = null;
    this._entityError = null;

    this._boundHandleClick = () => this._handleAction("tap");
    this._boundHandleDblClick = () => this._handleAction("double_tap");
    this._boundHandleContextMenu = (e) => {
      e.preventDefault();
      this._handleAction("hold");
    };
  }

  set hass(hass) {
    this._hass = hass;
    if (!this.config) return;
    this.updateCard();
  }

  getRimStyleData(ringStyle, uid) {
    const styles = {
      brass: { grad: `brassRim-${uid}`, stroke: "#8B7355" },
      silver: { grad: `silverRim-${uid}`, stroke: "#999999" },
      chrome: { grad: `silverRim-${uid}`, stroke: "#999999" },
      copper: { grad: `copperRim-${uid}`, stroke: "#8B4513" },
      black: { grad: `blackRim-${uid}`, stroke: "#2b2b2b" },
      white: { grad: `whiteRim-${uid}`, stroke: "#cfcfcf" },
      blue: { grad: `blueRim-${uid}`, stroke: "#104E8B" },
      green: { grad: `greenRim-${uid}`, stroke: "#006400" },
      red: { grad: `redRim-${uid}`, stroke: "#8B0000" },
      none: { grad: null, stroke: "transparent" }
    };
    return styles[ringStyle] || styles.brass;
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

  render() {
    const config = this.config;
    const uid = this._uniqueId;
    const title = config.title || 'Temperature';

    const ringStyle = config.ring_style;
    const rimData = this.getRimStyleData(ringStyle, uid);

    // Config Colors
    const plateColor = config.plate_color;
    const plateTransparent = config.plate_transparent;
    const rivetColor = config.rivet_color;
    const fontBgColor = config.font_bg_color || '#ffffff';
    const titleFontColor = config.title_font_color || '#3e2723';

    // Appearance
    const wearLevel = config.wear_level !== undefined ? config.wear_level : 50;
    const glassEffectEnabled = config.glass_effect_enabled !== undefined ? config.glass_effect_enabled : true;
    const agedTexture = config.aged_texture !== undefined ? config.aged_texture : 'everywhere';
    const agedTextureIntensity = config.aged_texture_intensity !== undefined ? config.aged_texture_intensity : 50;
    const agedTextureOpacity = ((100 - agedTextureIntensity) / 100) * 1.0;
    const effectiveAgedTexture = (plateTransparent && agedTexture === 'everywhere') ? 'glass_only' : agedTexture;

    // Handle liquid_color being either array (standard) or string (hex/rgb from editor sometimes)
    let liquidColor = '#cc0000';
    if (config.liquid_color) {
      if (Array.isArray(config.liquid_color)) {
        liquidColor = `rgb(${config.liquid_color.join(',')})`;
      } else {
        liquidColor = config.liquid_color;
      }
    }

    this.darkenColor = (color, percent) => {
      if (color.startsWith('#')) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
      }
      if (color.startsWith('rgb')) {
        const [r, g, b] = color.match(/\d+/g).map(Number);
        const factor = 1 - (percent / 100);
        return `rgb(${Math.max(0, Math.round(r * factor))}, ${Math.max(0, Math.round(g * factor))}, ${Math.max(0, Math.round(b * factor))})`;
      }
      return color;
    };

    const plateWidth = 145;
    const plateHeight = 340;
    const plateX = 5;
    const plateY = 5;

    const rimWidth = 115;
    const rimHeight = 310;
    const rimX = 20;
    const rimY = 20;

    const width = 155;
    const height = 350;

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        ha-card { 
          background: transparent; 
          box-shadow: none; 
          width: 100%;
          display: flex;
          justify-content: center;
        }
        .card { 
          position: relative; 
          width: ${width}px; 
          height: ${height}px; 
          cursor: pointer;
        }
        .thermostat-svg {
          width: 100%;
          height: 100%;
          filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.3));
        }
        .title {
            font-family: 'Georgia', serif;
            font-size: 14px;
            font-weight: bold;
            opacity: 0.9;
            text-anchor: middle;
            pointer-events: none;
            letter-spacing: 1px;
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
      <ha-card tabindex="0">
        <div class="card" id="actionRoot">
          <svg class="thermostat-svg" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
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

              <linearGradient id="glassTube-${uid}" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:rgba(255,255,255,0.2)" />
                <stop offset="30%" style="stop-color:rgba(255,255,255,0.1)" />
                <stop offset="50%" style="stop-color:rgba(255,255,255,0)" />
                <stop offset="70%" style="stop-color:rgba(255,255,255,0.1)" />
                <stop offset="100%" style="stop-color:rgba(255,255,255,0.3)" />
              </linearGradient>

              <linearGradient id="liquidRad-${uid}" x1="0%" y1="0%" x2="100%" y2="0%">
                 <stop offset="0%" style="stop-color:${this.darkenColor(liquidColor, 20)}" />
                 <stop offset="40%" style="stop-color:${liquidColor}" />
                 <stop offset="60%" style="stop-color:${liquidColor}" />
                 <stop offset="100%" style="stop-color:${this.darkenColor(liquidColor, 40)}" />
              </linearGradient>
            </defs>

              <rect x="${plateX}" y="${plateY}" width="${plateWidth}" height="${plateHeight}" rx="15" ry="15" 
                    fill="${plateTransparent ? 'none' : plateColor}" 
                    stroke="${plateTransparent ? 'none' : '#888'}" stroke-width="0.5"
                    filter="${effectiveAgedTexture === 'everywhere' && !plateTransparent ? `url(#aged-${uid}) drop-shadow(1px 1px 2px rgba(0,0,0,0.3))` : 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))'}" />

            ${this.renderRivets(plateWidth, plateHeight, plateX, plateY)}

            ${this.renderSquareRim(ringStyle, uid, fontBgColor, glassEffectEnabled, rimX, rimY, rimWidth, rimHeight)}

            <g transform="translate(${rimX}, ${rimY})">
                
                <text x="57.5" y="28" class="title" style="fill: ${titleFontColor}">${title}</text>
                
                ${config.unit ? `<text x="57.5" y="42" class="title" style="font-size: 11px; fill:${titleFontColor}; opacity: 0.8;" text-anchor="middle">${config.unit}</text>` : ''}
                
                <g id="scale-group" transform="translate(10, 0)"></g>

                <g id="segments-group"></g>

                <rect x="47.5" y="50" width="20" height="245" rx="10" ry="10" fill="rgba(200,200,200,0.1)" stroke="rgba(0,0,0,0.2)" stroke-width="1" />

                ${(() => {
        const tubeWidth = 20;
        const tubeX = 47.5;
        const pct = config.mercury_width !== undefined ? config.mercury_width : 50;
        const widthPx = (tubeWidth * pct) / 100;
        const xPx = tubeX + (tubeWidth - widthPx) / 2;
        return `
                        <rect x="${xPx}" y="52" width="${widthPx}" height="241" rx="${widthPx / 2}" ry="${widthPx / 2}" fill="rgba(255,255,255,0.3)" stroke="rgba(0,0,0,0.1)" stroke-width="0.5" />
                        <rect id="liquid-col" x="${xPx}" y="100" width="${widthPx}" height="150" rx="${widthPx / 2}" ry="${widthPx / 2}" fill="url(#liquidRad-${uid})" />
                        `;
      })()}
                
                <g transform="translate(57.5, 295)">
                    <rect x="-12.5" y="0" width="25" height="15" fill="${this.darkenColor(rimData.stroke || '#444', 10)}" stroke="#444" stroke-width="0.5" />
                    <rect x="-15" y="5" width="30" height="5" fill="${this.darkenColor(rimData.stroke || '#444', 30)}" stroke="none" />
                </g>
            </g>

            ${this.renderWearMarks(wearLevel, height)}

          </svg>
        </div>
      </ha-card>
    `;

    this._attachActionListeners();
    this.drawScale(titleFontColor);
    this.drawSegments();
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

    const bevelX = x + 8;
    const bevelY = y + 8;
    const bevelW = w - 16;
    const bevelH = h - 16;

    const screenX = bevelX + 4;
    const screenY = bevelY + 4;
    const screenW = bevelW - 8;
    const screenH = bevelH - 8;

    return `
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="20" ry="20" fill="url(#${data.grad})" stroke="${data.stroke}" stroke-width="1"
            filter="drop-shadow(2px 2px 3px rgba(0,0,0,0.4))"/>
      
      <rect x="${screenX}" y="${screenY}" width="${screenW}" height="${screenH}" rx="10" ry="10" 
            fill="${bgColor}" stroke="none" />

      ${glassEffectEnabled ? `<path d="M ${screenX} ${screenY} L ${screenX + screenW} ${screenY} L ${screenX + screenW} ${screenY + screenH * 0.2} Q ${screenX + screenW / 2} ${screenY + screenH * 0.25} ${screenX} ${screenY + screenH * 0.2} Z" fill="url(#glassGrad-${uid})" clip-path="inset(1px round 9px)" style="pointer-events: none;" />` : ''}

      <rect x="${screenX}" y="${screenY}" width="${screenW}" height="${screenH}" rx="10" ry="10" 
            fill="none" stroke="rgba(0,0,0,0.5)" stroke-width="1" 
             style="box-shadow: inset 0 0 10px #000;"/>

      <rect x="${bevelX}" y="${bevelY}" width="${bevelW}" height="${bevelH}" rx="15" ry="15" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="2"/>
    `;
  }

  renderWearMarks(wearLevel, viewBoxHeight) {
    if (wearLevel === 0) return '';
    return `
        <circle cx="30" cy="40" r="2" fill="#8B7355" opacity="${Math.min(0.2 * (wearLevel / 50), 0.25)}"/>
        <circle cx="120" cy="${viewBoxHeight - 40}" r="1.5" fill="#8B7355" opacity="${Math.min(0.15 * (wearLevel / 50), 0.25)}"/>
    `;
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('You need to define an entity');
    }

    this.config = { ...config };

    if (!this.config.tap_action) this.config.tap_action = { action: "more-info" };
    if (this.config.ring_style === undefined) this.config.ring_style = 'brass';
    if (this.config.min === undefined) this.config.min = -40;
    if (this.config.max === undefined) this.config.max = 120;
    if (this.config.mercury_width === undefined) this.config.mercury_width = 50;
    if (this.config.segments_under_mercury === undefined) this.config.segments_under_mercury = true;

    this.config.plate_color = this.config.plate_color || '#8c7626';
    this.config.rivet_color = this.config.rivet_color || '#6a5816';
    this.config.font_bg_color = this.config.font_bg_color || '#ffffff';
    this.config.title_font_color = this.config.title_font_color || '#3e2723';

    this._uniqueId = Math.random().toString(36).substr(2, 9);
    this.render();
  }

  _attachActionListeners() {
    const root = this.shadowRoot?.getElementById("actionRoot");
    if (!root) return;
    root.removeEventListener("click", this._boundHandleClick);
    root.addEventListener("click", this._boundHandleClick, { passive: true });
  }

  _handleAction(kind) {
    if (!this._hass || !this.config) return;
    fireEvent(this, "hass-action", { config: this.config, action: kind });
  }

  _calculateTickInterval(min, max) {
    const range = max - min;
    if (range <= 10) return 1;
    if (range <= 20) return 2;
    if (range <= 50) return 5;
    if (range <= 100) return 10;
    if (range <= 200) return 20;
    return 50;
  }

  _valueToY(val) {
    const yTop = 55;
    const yBottom = 285;
    const min = this.config.min !== undefined ? this.config.min : -40;
    const max = this.config.max !== undefined ? this.config.max : 120;

    const pct = (val - min) / (max - min);
    return yBottom - pct * (yBottom - yTop);
  }

  drawScale(color) {
    const group = this.shadowRoot.getElementById('scale-group');
    if (!group) return;

    const tickColor = color || '#333';
    const min = this.config.min !== undefined ? this.config.min : -40;
    const max = this.config.max !== undefined ? this.config.max : 120;

    const range = max - min;
    let step = 20;
    if (range <= 20) step = 2;
    else if (range <= 50) step = 5;
    else if (range <= 100) step = 10;

    const subStep = step / 2;

    let svgContent = '';

    for (let v = Math.ceil(min / step) * step; v <= max; v += step) {
      const y = this._valueToY(v);
      svgContent += `<line x1="32" y1="${y}" x2="58" y2="${y}" stroke="${tickColor}" stroke-width="1.5" />`;
      svgContent += `<text x="29" y="${y + 3.5}" text-anchor="end" font-family="Arial" font-size="10" fill="${tickColor}" font-weight="bold">${v}</text>`;
    }

    for (let v = Math.ceil(min / subStep) * subStep; v <= max; v += subStep) {
      if (v % step === 0) continue;
      const y = this._valueToY(v);
      svgContent += `<line x1="38" y1="${y}" x2="58" y2="${y}" stroke="${tickColor}" stroke-width="1" />`;
    }

    group.innerHTML = svgContent;
  }

  drawSegments() {
    const segments = this.config.segments || [];
    const group = this.shadowRoot.getElementById('segments-group');
    if (!group || !segments.length) return;

    const behindMercury = this.config.segments_under_mercury === true;

    const xPos = behindMercury ? 47.5 : 72;
    const width = behindMercury ? 20 : 10;
    const opacity = behindMercury ? 0.35 : 0.8;

    let svgContent = '';

    segments.forEach(seg => {
      const from = seg.from !== undefined ? seg.from : 0;
      const to = seg.to !== undefined ? seg.to : 0;

      if (from >= to) return;

      const yTop = this._valueToY(to);
      const yBottom = this._valueToY(from);

      const height = Math.max(0, yBottom - yTop);

      svgContent += `<rect x="${xPos}" y="${yTop}" width="${width}" height="${height}" rx="2" ry="2" fill="${seg.color}" opacity="${opacity}" stroke="rgba(0,0,0,0.2)" stroke-width="0.5" />`;
    });

    group.innerHTML = svgContent;
  }

  updateCard() {
    if (!this._hass || !this.config) return;
    const entity = this._hass.states[this.config.entity];
    if (!entity) return;

    const val = parseFloat(entity.state);
    if (isNaN(val)) return;

    const yTop = 55;
    const yBottom = 285;
    const zeroY = this._valueToY(this.config.min);
    const valY = this._valueToY(val);

    const height = yBottom - valY;

    const liquidCol = this.shadowRoot.getElementById('liquid-col');
    if (liquidCol) {
      const liquidBottom = 295;
      const currentHeight = Math.max(0, liquidBottom - valY);

      liquidCol.setAttribute('y', valY);
      liquidCol.setAttribute('height', currentHeight);

      liquidCol.style.transition = `y ${this.config.animation_duration || 1.5}s ease-out, height ${this.config.animation_duration || 1.5}s ease-out`;
    }
  }
  static getConfigElement() {
    return document.createElement("foundry-thermostat-editor");
  }

  static getStubConfig() {
    return {
      entity: "sensor.temperature",
      min: 0,
      max: 100,
      ring_style: "brass",
      title: "Temp",
      unit: "°C",
      mercury_width: 50,
      segments_under_mercury: true,
      animation_duration: 1.5,
      plate_color: '#8c7626',
      rivet_color: '#6a5816',
      font_bg_color: '#ffffff',
      title_font_color: '#3e2723',
      segments: [
        { from: 0, to: 33, color: '#4CAF50' },
        { from: 33, to: 66, color: '#FFC107' },
        { from: 66, to: 100, color: '#F44336' }
      ]
    };
  }
}

if (!customElements.get("foundry-thermostat-card")) {
  customElements.define("foundry-thermostat-card", FoundryThermostatCard);
}


window.customCards = window.customCards || [];
window.customCards.push({
  type: "foundry-thermostat-card",
  name: "Foundry Thermostat Card",
  preview: true,
  description: "A vintage industrial style thermostat card"
});
