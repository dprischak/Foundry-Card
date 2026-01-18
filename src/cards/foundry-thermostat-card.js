
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
    const title = config.title || 'Temperature';

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
    const width = 125; // Adjusted to user preference
    const height = 320;

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        ha-card { 
          background: transparent; 
          box-shadow: none; 
          width: ${width}px;
          margin: 0 auto;
        }
        .card { 
          position: relative; 
          width: ${width}px; 
          height: ${height}px; 
          border-radius: 6px; 
          cursor: pointer;
        }
        .thermostat-svg {
          width: 100%;
          height: 100%;
          border-radius: 6px;
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
                  <stop offset="0%"   style="stop-color:#e0e0e0;stop-opacity:1" />
                  <stop offset="20%"  style="stop-color:#ffffff;stop-opacity:1" />
                  <stop offset="50%"  style="stop-color:#f5f5f5;stop-opacity:1" />
                  <stop offset="80%"  style="stop-color:#ffffff;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#d0d0d0;stop-opacity:1" />
              </linearGradient>

              <linearGradient id="blueRim-${uid}" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   style="stop-color:#0d2644;stop-opacity:1" />
                  <stop offset="20%"  style="stop-color:#1e4c7c;stop-opacity:1" />
                  <stop offset="50%"  style="stop-color:#3e7cb3;stop-opacity:1" />
                  <stop offset="80%"  style="stop-color:#1e4c7c;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#0a1e35;stop-opacity:1" />
              </linearGradient>

              <linearGradient id="greenRim-${uid}" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   style="stop-color:#0b301e;stop-opacity:1" />
                  <stop offset="20%"  style="stop-color:#2fbf71;stop-opacity:1" />
                  <stop offset="50%"  style="stop-color:#69e69c;stop-opacity:1" />
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
            <rect x="5" y="5" width="115" height="310" rx="3" ry="3" 
                  fill="${rimData.grad ? `url(#${rimData.grad})` : rimData.color}" 
                  stroke="#333" stroke-width="1" />
            
            <!-- Inner Recess -->
            <rect x="15" y="45" width="95" height="250" fill="#fff" stroke="#999" stroke-width="0.5" />
            
            <!-- Top Cap Detail -->
            <path d="M 5 45 L 120 45" stroke="#666" stroke-width="1" />

            <!-- Title - Centered at 63 -->
            <text x="63" y="22" class="title" style="fill: ${ringStyle === 'black' || ringStyle === 'blue' || ringStyle === 'red' || ringStyle === 'green' ? '#e0e0e0' : '#3e2723'}">${title}</text>
            
            <!-- Unit Text -->
            ${config.unit ? `<text x="63" y="38" class="title" style="font-size: 11px; fill: ${ringStyle === 'black' || ringStyle === 'blue' || ringStyle === 'red' || ringStyle === 'green' ? '#e0e0e0' : '#3e2723'}; opacity: 0.8;" text-anchor="middle">${config.unit}</text>` : ''}
            
            <!-- Scale Group -->
            <g id="scale-group" transform="translate(15, 0)"></g>

            <!-- Segments Group -->
            <g id="segments-group"></g>

            <!-- Glass Tube - x=53 -->
            <rect x="53" y="50" width="20" height="245" rx="10" ry="10" fill="rgba(200,200,200,0.1)" stroke="rgba(0,0,0,0.2)" stroke-width="1" />

            <!-- Dynamic Mercury Calculation -->
            ${(() => {
        const tubeWidth = 20;
        const tubeX = 53;
        const pct = config.mercury_width !== undefined ? config.mercury_width : 50;
        const widthPx = (tubeWidth * pct) / 100;
        const xPx = tubeX + (tubeWidth - widthPx) / 2;

        // Store for drawSegments to reuse
        this._mercuryGeom = { x: xPx, width: widthPx };

        return `
                  <!-- Empty Bore -->
                  <rect x="${xPx}" y="52" width="${widthPx}" height="241" rx="${widthPx / 2}" ry="${widthPx / 2}" fill="rgba(255,255,255,0.3)" stroke="rgba(0,0,0,0.1)" stroke-width="0.5" />
                  
                  <!-- Liquid Column -->
                  <rect id="liquid-col" x="${xPx}" y="100" width="${widthPx}" height="150" rx="${widthPx / 2}" ry="${widthPx / 2}" fill="url(#liquidRad-${uid})" />
                `;
      })()}
            
            <!-- Glass Highlight Overlay -->
            <rect x="53" y="50" width="20" height="245" rx="10" ry="10" fill="url(#glassTube-${uid})" pointer-events="none" />
            
            <!-- Bulb at Bottom - Center 63 -->
            <g transform="translate(63, 295)">
                <rect x="-12.5" y="0" width="25" height="15" fill="${this.darkenColor(rimData.color, 10)}" stroke="#444" stroke-width="0.5" />
                <rect x="-15" y="5" width="30" height="5" fill="${this.darkenColor(rimData.color, 30)}" stroke="none" />
            </g>

          </svg>
        </div>
      </ha-card>
    `;

    this._attachActionListeners();
    this.drawScale();
    this.drawSegments();
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
    if (this.config.mercury_width === undefined) this.config.mercury_width = 50;
    if (this.config.segments_under_mercury === undefined) this.config.segments_under_mercury = true;

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

  // Map value to Y coordinate (pixels relative to SVG)
  // Adjusted alignment: 
  // yTop=35 (Lower than 25 to avoid cutoff)
  // yBottom=265 (Lower than 235 to close gap with bulb)
  _valueToY(val) {
    const yTop = 55;   // Shifted down 20px
    const yBottom = 285; // Shifted down 20px
    const min = this.config.min !== undefined ? this.config.min : -40;
    const max = this.config.max !== undefined ? this.config.max : 120;

    // Linear mapping
    // val = min -> y = yBottom
    // val = max -> y = yTop

    // Normalize val to 0..1 based on range
    const pct = (val - min) / (max - min);
    // Invert pct because pixel Y grows downward
    return yBottom - pct * (yBottom - yTop);
  }

  drawScale() {
    const group = this.shadowRoot.getElementById('scale-group');
    if (!group) return;

    const min = this.config.min !== undefined ? this.config.min : -40;
    const max = this.config.max !== undefined ? this.config.max : 120;

    // Heuristic for steps
    const range = max - min;
    let step = 20;
    if (range <= 20) step = 2;
    else if (range <= 50) step = 5;
    else if (range <= 100) step = 10;

    // Subdivisions (half step)
    const subStep = step / 2;

    let svgContent = '';

    // Major ticks and numbers
    for (let v = Math.ceil(min / step) * step; v <= max; v += step) {
      const y = this._valueToY(v);

      // Left tick (Shortened to 12px)
      svgContent += `<line x1="39" y1="${y}" x2="51" y2="${y}" stroke="#333" stroke-width="1.5" />`;

      // Text aligned w/ tick (Shifted left to 37)
      svgContent += `<text x="37" y="${y + 3.5}" text-anchor="end" font-family="Arial" font-size="10" fill="#333" font-weight="bold">${v}</text>`;
    }

    // Minor ticks
    for (let v = Math.ceil(min / subStep) * subStep; v <= max; v += subStep) {
      if (v % step === 0) continue;
      const y = this._valueToY(v);
      // Left minor tick (Shortened)
      svgContent += `<line x1="45" y1="${y}" x2="51" y2="${y}" stroke="#555" stroke-width="1" />`;
    }

    group.innerHTML = svgContent;
  }

  drawSegments() {
    const segments = this.config.segments || [];
    const group = this.shadowRoot.getElementById('segments-group');
    if (!group || !segments.length) return;

    // Check configuration option
    const behindMercury = this.config.segments_under_mercury === true;

    // Geometry based on config
    // Default (Side): x=78 
    // Behind Tube: always fills the glass tube (x=53, w=20)
    const xPos = behindMercury ? 53 : 78;
    const width = behindMercury ? 20 : 10;
    const opacity = behindMercury ? 0.35 : 0.8;

    let svgContent = '';

    segments.forEach(seg => {
      const from = seg.from !== undefined ? seg.from : 0;
      const to = seg.to !== undefined ? seg.to : 0;

      // Skip invalid
      if (from >= to) return;

      // Map values to Y
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

    const yTop = 55;   // Shifted down 20px
    const yBottom = 285; // Shifted down 20px
    const zeroY = this._valueToY(this.config.min);
    const valY = this._valueToY(val);

    // Height is distance from bottom of scale to current value Y
    const height = yBottom - valY;

    // Add generous visual base to connect with bulb
    // Bulb top is now around y=295 (shifted 20px from 275).

    const liquidCol = this.shadowRoot.getElementById('liquid-col');
    if (liquidCol) {
      const liquidBottom = 295; // Connects to bulb
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
      min: 0,
      max: 100,
      ring_style: "brass",
      title: "Temperature",
      mercury_width: 50,
      segments_under_mercury: true,
      animation_duration: 1.5,
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
