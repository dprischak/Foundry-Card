
import { debounce, fireEvent, getActionConfig } from "./utils.js";

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

  setConfig(config) {
    if (!config.entity) {
      throw new Error('You need to define an entity');
    }

    this.config = { ...config };

    // Defaults
    if (!this.config.tap_action) this.config.tap_action = { action: "more-info" };
    if (this.config.ring_style === undefined) this.config.ring_style = 'brass';
    if (this.config.min === undefined) this.config.min = -40;
    if (this.config.max === undefined) this.config.max = 120;

    this._uniqueId = Math.random().toString(36).substr(2, 9);
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this.config) return;
    this.updateCard();
  }

  getRimStyleData(ringStyle, uid) {
    const styles = {
      brass: { grad: `brassRim-${uid}`, color: '#c9a961' },
      silver: { grad: `silverRim-${uid}`, color: '#e8e8e8' },
      copper: { grad: `copperRim-${uid}`, color: '#c77c43' },
      black: { grad: `blackRim-${uid}`, color: '#3a3a3a' },
      white: { grad: `whiteRim-${uid}`, color: '#f6f6f6' },
      blue: { grad: `blueRim-${uid}`, color: '#2a6fdb' },
      green: { grad: `greenRim-${uid}`, color: '#2fbf71' },
      red: { grad: `redRim-${uid}`, color: '#e53935' },
      none: { grad: null, color: 'transparent' }
    };
    return styles[ringStyle] || styles.brass;
  }

  render() {
    const config = this.config;
    const uid = this._uniqueId;
    const title = config.title || 'PALMER';

    const ringStyle = config.ring_style;
    const rimData = this.getRimStyleData(ringStyle, uid);

    // Default red if not specified
    const liquidColor = config.liquid_color ? `rgb(${config.liquid_color.join(',')})` : '#cc0000';

    // Helper to darken color for 3D effect
    this.darkenColor = (color, percent) => {
      // If hex, convert to rgb
      if (color.startsWith('#')) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
      }
      // If rgb
      if (color.startsWith('rgb')) {
        const [r, g, b] = color.match(/\d+/g).map(Number);
        const factor = 1 - (percent / 100);
        return `rgb(${Math.max(0, Math.round(r * factor))}, ${Math.max(0, Math.round(g * factor))}, ${Math.max(0, Math.round(b * factor))})`;
      }
      return color;
    };

    // Dimensions
    const width = 100;
    const height = 300;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }
        ha-card {
          background: transparent;
          box-shadow: none;
          border: none;
        }
        .card {
          position: relative;
          width: ${width}px;
          height: ${height}px;
          margin: 0 auto;
          cursor: pointer;
        }
        .thermostat-svg {
          width: 100%;
          height: 100%;
          filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.3));
        }
        .title {
            font-family: 'Times New Roman', serif;
            font-weight: bold;
            text-anchor: middle;
            fill: #3e2723;
            font-size: 14px;
            letter-spacing: 1px;
        }
      </style>
      <ha-card tabindex="0">
        <div class="card" id="actionRoot">
          <svg class="thermostat-svg" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <!-- Metallic Gradients -->
              <linearGradient id="brassRim-${uid}" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:#b8944d;stop-opacity:1" />
                <stop offset="20%" style="stop-color:#ddc68f;stop-opacity:1" />
                <stop offset="50%" style="stop-color:#f9edc8;stop-opacity:1" />
                <stop offset="80%" style="stop-color:#ddc68f;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#a68038;stop-opacity:1" />
              </linearGradient>
              
              <linearGradient id="silverRim-${uid}" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:#999;stop-opacity:1" />
                <stop offset="20%" style="stop-color:#ddd;stop-opacity:1" />
                <stop offset="50%" style="stop-color:#fff;stop-opacity:1" />
                <stop offset="80%" style="stop-color:#ddd;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#888;stop-opacity:1" />
              </linearGradient>

              <linearGradient id="copperRim-${uid}" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:#8c4a32;stop-opacity:1" />
                <stop offset="20%" style="stop-color:#c27a5d;stop-opacity:1" />
                <stop offset="50%" style="stop-color:#e0a080;stop-opacity:1" />
                <stop offset="80%" style="stop-color:#c27a5d;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#6d3521;stop-opacity:1" />
              </linearGradient>

              <linearGradient id="blackRim-${uid}" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   style="stop-color:#1a1a1a;stop-opacity:1" />
                  <stop offset="20%"  style="stop-color:#333333;stop-opacity:1" />
                  <stop offset="50%"  style="stop-color:#4d4d4d;stop-opacity:1" />
                  <stop offset="80%"  style="stop-color:#333333;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#0d0d0d;stop-opacity:1" />
              </linearGradient>

              <linearGradient id="whiteRim-${uid}" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   style="stop-color:#d9d9d9;stop-opacity:1" />
                  <stop offset="20%"  style="stop-color:#f2f2f2;stop-opacity:1" />
                  <stop offset="50%"  style="stop-color:#ffffff;stop-opacity:1" />
                  <stop offset="80%"  style="stop-color:#f2f2f2;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#bfbfbf;stop-opacity:1" />
              </linearGradient>

              <linearGradient id="blueRim-${uid}" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   style="stop-color:#153d6e;stop-opacity:1" />
                  <stop offset="20%"  style="stop-color:#2a6fdb;stop-opacity:1" />
                  <stop offset="50%"  style="stop-color:#4f9bea;stop-opacity:1" />
                  <stop offset="80%"  style="stop-color:#2a6fdb;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#0d2645;stop-opacity:1" />
              </linearGradient>

              <linearGradient id="greenRim-${uid}" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   style="stop-color:#145233;stop-opacity:1" />
                  <stop offset="20%"  style="stop-color:#2fbf71;stop-opacity:1" />
                  <stop offset="50%"  style="stop-color:#5be398;stop-opacity:1" />
                  <stop offset="80%"  style="stop-color:#2fbf71;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#0b301e;stop-opacity:1" />
              </linearGradient>

              <linearGradient id="redRim-${uid}" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   style="stop-color:#7a1b19;stop-opacity:1" />
                  <stop offset="20%"  style="stop-color:#d32f2f;stop-opacity:1" />
                  <stop offset="50%"  style="stop-color:#ff6659;stop-opacity:1" />
                  <stop offset="80%"  style="stop-color:#d32f2f;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#4a0e0e;stop-opacity:1" />
              </linearGradient>

              <!-- Glass Tube Gradient -->
              <linearGradient id="glassTube-${uid}" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:rgba(255,255,255,0.2)" />
                <stop offset="30%" style="stop-color:rgba(255,255,255,0.1)" />
                <stop offset="50%" style="stop-color:rgba(255,255,255,0)" />
                <stop offset="70%" style="stop-color:rgba(255,255,255,0.1)" />
                <stop offset="100%" style="stop-color:rgba(255,255,255,0.3)" />
              </linearGradient>

              <!-- Liquid Gradient -->
              <linearGradient id="liquidRad-${uid}" x1="0%" y1="0%" x2="100%" y2="0%">
                 <stop offset="0%" style="stop-color:${this.darkenColor(liquidColor, 20)}" />
                 <stop offset="40%" style="stop-color:${liquidColor}" />
                 <stop offset="60%" style="stop-color:${liquidColor}" />
                 <stop offset="100%" style="stop-color:${this.darkenColor(liquidColor, 40)}" />
              </linearGradient>
            </defs>

            <!-- Casing -->
            <rect x="5" y="5" width="90" height="290" rx="3" ry="3" 
                  fill="${rimData.grad ? `url(#${rimData.grad})` : rimData.color}" 
                  stroke="#333" stroke-width="1" />
            
            <!-- Inner Recess (Scale Background) -->
            <rect x="15" y="25" width="70" height="250" fill="#fff" stroke="#999" stroke-width="0.5" />
            
            <!-- Top Cap Detail -->
            <path d="M 5 25 L 95 25" stroke="#666" stroke-width="1" />
            <text x="50" y="20" class="title" style="fill: ${ringStyle === 'black' || ringStyle === 'blue' || ringStyle === 'red' || ringStyle === 'green' ? '#e0e0e0' : '#3e2723'}">${title}</text>
            ${config.unit ? `<text x="75" y="45" class="title" style="font-size: 14px; fill: #333;" text-anchor="middle">${config.unit}</text>` : ''}
            
            <!-- Title/Logo embossed effect -->

            <!-- Scale Ticks & Numbers (Placeholder Group) -->
            <g id="scale-group" transform="translate(15, 0)"></g>

            <!-- Glass Tube -->
            <rect x="42" y="30" width="16" height="245" rx="8" ry="8" fill="rgba(200,200,200,0.1)" stroke="rgba(0,0,0,0.2)" stroke-width="1" />

            <!-- Empty Bore (The channel the liquid travels in) -->
            <rect x="45" y="32" width="10" height="241" rx="4" ry="4" fill="rgba(255,255,255,0.3)" stroke="rgba(0,0,0,0.1)" stroke-width="0.5" />

            <!-- Liquid Column -->
            <rect id="liquid-col" x="45" y="100" width="10" height="150" rx="4" ry="4" fill="url(#liquidRad-${uid})" />
            
            <!-- Glass Highlight Overlay -->
            <rect x="42" y="30" width="16" height="245" rx="8" ry="8" fill="url(#glassTube-${uid})" pointer-events="none" />
            
            <!-- Bulb at Bottom (Connector) -->
            <g transform="translate(50, 275)">
                <rect x="-10" y="0" width="20" height="15" fill="${this.darkenColor(rimData.color, 10)}" stroke="#444" stroke-width="0.5" />
                <rect x="-12" y="5" width="24" height="5" fill="${this.darkenColor(rimData.color, 30)}" stroke="none" />
            </g>

          </svg>
        </div>
      </ha-card>
    `;

    this._attachActionListeners();
    this.drawScale();
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

  // Map value to Y coordinate (pixels relative to SVG)
  // Adjusted alignment: 
  // yTop=35 (Lower than 25 to avoid cutoff)
  // yBottom=265 (Lower than 235 to close gap with bulb)
  _valueToY(value) {
    const min = this.config.min;
    const max = this.config.max;
    // Scale range
    const yTop = 35;
    const yBottom = 265;

    // Clamp
    const val = Math.max(min, Math.min(max, value));

    // Linear map
    const pct = (val - min) / (max - min);
    return yBottom - (pct * (yBottom - yTop));
  }

  drawScale() {
    const min = this.config.min;
    const max = this.config.max;
    const step = this._calculateTickInterval(min, max);
    const subStep = step / 2;

    const group = this.shadowRoot.getElementById('scale-group');
    if (!group) return;

    let svgContent = '';

    // Major ticks
    for (let v = Math.ceil(min / step) * step; v <= max; v += step) {
      const y = this._valueToY(v);

      // Left tick only
      svgContent += `<line x1="20" y1="${y}" x2="38" y2="${y}" stroke="#333" stroke-width="1.5" />`;

      // Text aligned w/ tick
      svgContent += `<text x="18" y="${y + 3.5}" text-anchor="end" font-family="Arial" font-size="10" fill="#333" font-weight="bold">${v}</text>`;
    }

    // Minor ticks
    for (let v = Math.ceil(min / subStep) * subStep; v <= max; v += subStep) {
      if (v % step === 0) continue;
      const y = this._valueToY(v);
      // Left minor tick
      svgContent += `<line x1="28" y1="${y}" x2="38" y2="${y}" stroke="#555" stroke-width="1" />`;
    }

    group.innerHTML = svgContent;
  }

  updateCard() {
    if (!this._hass || !this.config) return;
    const entity = this._hass.states[this.config.entity];
    if (!entity) return;

    const val = parseFloat(entity.state);
    if (isNaN(val)) return;

    const yTop = 35;
    const yBottom = 265;
    const zeroY = this._valueToY(this.config.min); // Should be yBottom
    const valY = this._valueToY(val);

    // Height is distance from bottom of scale to current value Y
    const height = yBottom - valY;

    // Add generous visual base to connect with bulb
    // Bulb top is around y=275.
    // The liquid column rect starts at y=valY and goes down.
    // Total height needs to reach the bulb connection.

    const liquidCol = this.shadowRoot.getElementById('liquid-col');
    if (liquidCol) {
      const liquidBottom = 275; // Connects to bulb
      const currentHeight = Math.max(0, liquidBottom - valY);

      liquidCol.setAttribute('y', valY);
      liquidCol.setAttribute('height', currentHeight);

      // Add transition for smooth animation
      liquidCol.style.transition = `y ${this.config.animation_duration || 1.5}s ease-out, height ${this.config.animation_duration || 1.5}s ease-out`;
    }
  }
  static getConfigElement() {
    return document.createElement("foundry-thermostat-editor");
  }

  static getStubConfig() {
    return {
      entity: "sensor.temperature",
      min: -40,
      max: 120,
      ring_style: "brass",
      title: "PALMER"
    };
  }
}

customElements.define("foundry-thermostat-card", FoundryThermostatCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "foundry-thermostat-card",
  name: "Foundry Thermostat Card",
  preview: true,
  description: "A vintage industrial style thermostat card"
});
