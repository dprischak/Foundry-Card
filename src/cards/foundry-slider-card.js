import { fireEvent, getActionConfig } from "./utils.js";
import { ensureLedFont } from "./fonts.js";

class FoundrySliderCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._uniqueId = Math.random().toString(36).substr(2, 9);
  }

  setConfig(config) {
    this.config = { ...config };
    
    // Basic Slider Settings
    this.config.min = this.config.min !== undefined ? this.config.min : 0;
    this.config.max = this.config.max !== undefined ? this.config.max : 100;
    this.config.step = this.config.step !== undefined ? this.config.step : 1;
    this.config.value = this.config.value !== undefined ? this.config.value : this.config.min;
    
    // Brass Theme Defaults (from digital clock)
    this.config.ring_style = this.config.ring_style || "brass";
    this.config.plate_color = this.config.plate_color || "#8c7626";
    this.config.plate_transparent = this.config.plate_transparent !== undefined ? this.config.plate_transparent : false;
    this.config.rivet_color = this.config.rivet_color || "#6a5816";
    this.config.knob_color = this.config.knob_color || "#c9a961";
    this.config.font_color = this.config.font_color || "#000000";
    this.config.font_bg_color = this.config.font_bg_color || "#ffffff";
    
    // Slider-specific colors
    this.config.slider_color = this.config.slider_color || "#444444";
    this.config.tick_color = this.config.tick_color || "rgba(0,0,0,0.22)";
    
    // Display Settings
    this.config.show_value = this.config.show_value !== undefined ? this.config.show_value : true;
    this.config.led_position = this.config.led_position || "right"; // 'left' or 'right'
    this.config.title_font_size = this.config.title_font_size !== undefined ? this.config.title_font_size : 14;
    this.config.value_font_size = this.config.value_font_size !== undefined ? this.config.value_font_size : 36;
    
    // Knob Settings
    this.config.knob_shape = this.config.knob_shape || "square"; // 'circular', 'square', 'rectangular'
    this.config.knob_size = this.config.knob_size !== undefined ? this.config.knob_size : 48;
    
    // Visual Effects (from digital clock)
    this.config.wear_level = this.config.wear_level !== undefined ? this.config.wear_level : 50;
    this.config.glass_effect_enabled = this.config.glass_effect_enabled !== undefined ? this.config.glass_effect_enabled : true;
    this.config.aged_texture = this.config.aged_texture !== undefined ? this.config.aged_texture : 'everywhere';
    this.config.aged_texture_intensity = this.config.aged_texture_intensity !== undefined ? this.config.aged_texture_intensity : 50;

    ensureLedFont();
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
  }

  render() {
    const cfg = this.config;
    const uid = this._uniqueId;
    const title = cfg.title || '';
    
    // SVG SIZING CONSTANTS - Easy to customize
    const SVG_WIDTH = 150;
    const SVG_HEIGHT = 260;
    const KNOB_BORDER_WIDTH = 3; // Fixed at 3px, but as a constant
    const TRACK_WIDTH_MULTIPLIER = 0.375; // Track width = knob_size * this multiplier
    
    // Layout Constants
    const PLATE_PADDING = 8;
    const PLATE_X = 5;
    const PLATE_Y = 10;
    const PLATE_WIDTH = SVG_WIDTH - (PLATE_X * 2);
    const PLATE_HEIGHT = SVG_HEIGHT - (PLATE_Y * 2);
    
    // Calculate knob dimensions based on shape
    const knobSize = cfg.knob_size;
    let knobWidth, knobHeight, knobBorderRadius;
    
    switch (cfg.knob_shape) {
      case 'circular':
        knobWidth = knobSize;
        knobHeight = knobSize;
        knobBorderRadius = '50%';
        break;
      case 'rectangular':
        knobWidth = knobSize;
        knobHeight = Math.round(knobSize * 1.33); // 3:4 ratio
        knobBorderRadius = '10px';
        break;
      case 'square':
      default:
        knobWidth = knobSize;
        knobHeight = knobSize;
        knobBorderRadius = '10px';
        break;
    }
    
    // Track dimensions - centered horizontally
    const trackWidth = knobSize * TRACK_WIDTH_MULTIPLIER; // Dynamic based on knob size
    const trackX = (SVG_WIDTH / 2) - (trackWidth / 2);
    const trackTopY = 50;
    const trackBottomY = 180;  // Made shorter to accommodate LED below
    const trackHeight = trackBottomY - trackTopY;
    const trackCenterY = (trackTopY + trackBottomY) / 2;
    const sliderInputHeight = trackHeight + knobHeight;
    const sliderInputTop = trackTopY - (knobHeight / 2);
    
    // LED Display positioning - below track, centered
    const displayChars = this._getLedCharCount(cfg);
    const ledCharWidth = cfg.value_font_size * 0.45;
    const ledPaddingX = Math.max(6, Math.round(cfg.value_font_size * 0.2));
    const ledWidth = Math.max(50, Math.round((displayChars * ledCharWidth) + (ledPaddingX * 2)));
    const ledHeight = 50;
    const ledX = (SVG_WIDTH / 2) - (ledWidth / 2);
    const ledY = trackBottomY + 15; // Positioned below the track
    
    // Tick mark positioning
    const tickStartX = trackX + trackWidth + 5;
    const tickMajorLength = 12;
    const tickMinorLength = 6;
    
    // Visual effects
    const wearLevel = cfg.wear_level;
    const glassEffectEnabled = cfg.glass_effect_enabled;
    const agedTexture = cfg.aged_texture;
    const agedTextureIntensity = cfg.aged_texture_intensity;
    const agedTextureOpacity = ((100 - agedTextureIntensity) / 100) * 1.0;
    const effectiveAgedTexture = (cfg.plate_transparent && agedTexture === 'everywhere') ? 'glass_only' : agedTexture;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          padding: 0;
        }
        ha-card {
          container-type: inline-size;
          overflow: visible;
          height: 100%;
        }
        .card {
          background: transparent;
          padding: 0;
          position: relative;
          cursor: pointer;
          height: 100%;
        }
        .slider-container {
          position: relative;
          width: 100%;
          height: 100%;
          margin: 0 auto;
          container-type: inline-size;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .slider-svg {
          width: 100%;
          height: 100%;
          filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.3));
        }
        .rivet {
          fill: ${cfg.rivet_color};
          filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.4));
        }
        .screw-detail {
          stroke: #4a4034;
          stroke-width: 0.5;
          fill: none;
        }
        
        /* HTML input range overlay */
        .slider-input-container {
          position: absolute;
          top: ${((sliderInputTop / SVG_HEIGHT) * 100).toFixed(2)}%;
          left: ${((trackX + trackWidth / 2) / SVG_WIDTH * 100).toFixed(2)}%;
          width: 100%;
          height: ${((sliderInputHeight / SVG_HEIGHT) * 100).toFixed(2)}%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: all;
        }
        
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          width: 100%;
          height: ${(trackWidth / SVG_WIDTH * 100).toFixed(2)}cqi;
          writing-mode: bt-lr;
          -webkit-writing-mode: bt-lr;
          transform-origin: center center;
          transform: rotate(270deg);
          cursor: pointer;
          margin: 0;
        }
        
        /* Hide default track */
        input[type="range"]::-webkit-slider-runnable-track {
          background: transparent;
          height: ${(trackWidth / SVG_WIDTH * 100).toFixed(2)}cqi;
          border: none;
        }
        input[type="range"]::-moz-range-track {
          background: transparent;
          height: ${(trackWidth / SVG_WIDTH * 100).toFixed(2)}cqi;
          border: none;
        }
        
        /* Thumb/Knob styling */
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: ${(knobWidth / SVG_WIDTH * 100).toFixed(2)}cqi;
          height: ${(knobHeight / SVG_WIDTH * 100).toFixed(2)}cqi;
          margin-top: calc(-${(knobHeight / SVG_WIDTH * 100).toFixed(2)}cqi / 2 + ${(trackWidth / SVG_WIDTH * 100).toFixed(2)}cqi / 2);
          border-radius: ${knobBorderRadius};
          background: linear-gradient(180deg, 
            ${this.adjustColor(cfg.knob_color, 40)} 0%, 
            ${cfg.knob_color} 50%, 
            ${this.adjustColor(cfg.knob_color, -15)} 100%);
          border: ${(KNOB_BORDER_WIDTH / SVG_WIDTH * 100).toFixed(2)}cqi solid ${this.adjustColor(cfg.knob_color, -30)};
          box-shadow: 0 0.4cqi 1.1cqi rgba(0,0,0,0.45), 
                      inset 0 0.4cqi 0.7cqi rgba(255,255,255,0.12), 
                      inset 0 -0.4cqi 0.5cqi rgba(0,0,0,0.25);
          cursor: grab;
        }
        
        input[type="range"]::-moz-range-thumb {
          width: ${(knobWidth / SVG_WIDTH * 100).toFixed(2)}cqi;
          height: ${(knobHeight / SVG_WIDTH * 100).toFixed(2)}cqi;
          border-radius: ${knobBorderRadius};
          background: linear-gradient(180deg, 
            ${this.adjustColor(cfg.knob_color, 40)} 0%, 
            ${cfg.knob_color} 50%, 
            ${this.adjustColor(cfg.knob_color, -15)} 100%);
          border: ${(KNOB_BORDER_WIDTH / SVG_WIDTH * 100).toFixed(2)}cqi solid ${this.adjustColor(cfg.knob_color, -30)};
          box-shadow: 0 0.4cqi 1.1cqi rgba(0,0,0,0.45), 
                      inset 0 0.4cqi 0.7cqi rgba(255,255,255,0.12), 
                      inset 0 -0.4cqi 0.5cqi rgba(0,0,0,0.25);
          cursor: grab;
        }
        
        input[type="range"]:active::-webkit-slider-thumb {
          cursor: grabbing;
        }
        
        input[type="range"]:active::-moz-range-thumb {
          cursor: grabbing;
        }
      </style>
      
      <ha-card role="img" aria-label="${title ? title : 'Foundry Slider'}" tabindex="0">
        <div class="card" id="actionRoot">
          <div class="slider-container">
            <svg class="slider-svg" viewBox="0 0 ${SVG_WIDTH} ${SVG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <!-- Radial gradient for LED display background -->
                <radialGradient id="ledBg-${uid}" cx="50%" cy="50%">
                  <stop offset="0%" style="stop-color:${cfg.font_bg_color};stop-opacity:1" />
                  <stop offset="100%" style="stop-color:${this.adjustColor(cfg.font_bg_color, -20)};stop-opacity:1" />
                </radialGradient>
                
                <!-- Rim Gradients -->
                ${this.renderGradients(uid)}
                
                <!-- Track Gradient -->
                <linearGradient id="trackGradient-${uid}" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style="stop-color:${this.adjustColor(cfg.slider_color, 25)};stop-opacity:1" />
                  <stop offset="50%" style="stop-color:${cfg.slider_color};stop-opacity:1" />
                  <stop offset="100%" style="stop-color:${this.adjustColor(cfg.slider_color, -8)};stop-opacity:1" />
                </linearGradient>
                
                <!-- Aged texture filter -->
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
              
              <!-- Base Plate -->
              <rect x="${PLATE_X}" y="${PLATE_Y}" width="${PLATE_WIDTH}" height="${PLATE_HEIGHT}" 
                    rx="20" ry="20"
                    fill="${cfg.plate_transparent ? 'none' : cfg.plate_color}"
                    stroke="${cfg.plate_transparent ? 'none' : '#888'}" 
                    stroke-width="0.5"
                    filter="${effectiveAgedTexture === 'everywhere' && !cfg.plate_transparent ? `url(#aged-${uid}) drop-shadow(1px 1px 2px rgba(0,0,0,0.3))` : 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))'}" />
              
              <!-- Decorative Rim -->
              ${this.renderSquareRim(cfg.ring_style, uid, cfg.font_bg_color, glassEffectEnabled)}
              
              <!-- Corner Rivets -->
              ${this.renderRivets()}
              
              <!-- Slider Track -->
              <rect x="${trackX}" y="${trackTopY}" width="${trackWidth}" height="${trackHeight}"
                    rx="${trackWidth / 2}" ry="${trackWidth / 2}"
                    fill="${cfg.slider_color}"
                    stroke="rgba(0,0,0,0.3)"
                    stroke-width="1"
                    style="box-shadow: inset 0 2px 6px rgba(0,0,0,0.45);" />
              
              <!-- Inner track shadow effect -->
              <rect x="${trackX + 1}" y="${trackTopY + 2}" width="${trackWidth - 2}" height="${trackHeight - 4}"
                    rx="${(trackWidth - 2) / 2}" ry="${(trackWidth - 2) / 2}"
                    fill="url(#trackGradient-${uid})"
                    opacity="0.4" />
              
              <!-- Tick Marks -->
              ${this.renderTickMarks(cfg, trackTopY, trackBottomY, tickStartX, tickMajorLength, tickMinorLength)}
              
              <!-- Title -->
              ${title ? `<text x="${SVG_WIDTH / 2}" y="30" text-anchor="middle" font-size="${cfg.title_font_size}" font-weight="bold" fill="#3e2723" font-family="Georgia, serif" style="text-shadow: 1px 1px 2px rgba(255,255,255,0.2); pointer-events: none;">${title}</text>` : ''}
              
              <!-- LED Display Box -->
              ${cfg.show_value ? this.renderLEDDisplay(uid, cfg, ledX, ledY, ledWidth, ledHeight, glassEffectEnabled) : ''}
              
              <!-- Wear Marks -->
              ${this.renderWearMarks(wearLevel)}
            </svg>
            
            <!-- HTML Input Range Overlay -->
            <div class="slider-input-container">
              <input id="slider" type="range" 
                     min="${cfg.min}" 
                     max="${cfg.max}" 
                     step="${cfg.step}" 
                     value="${cfg.value}" 
                     aria-label="Slider control"
                     aria-valuemin="${cfg.min}"
                     aria-valuemax="${cfg.max}"
                     aria-valuenow="${cfg.value}" />
            </div>
          </div>
        </div>
      </ha-card>
    `;

    this._attachListeners();
    this._updateValueDisplay(cfg.value);
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
        <stop offset="0%" style="stop-color:#f6f6f6;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#cfcfcf;stop-opacity:1" />
      </linearGradient>
      <!-- Black -->
      <linearGradient id="blackRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#3a3a3a;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#141414;stop-opacity:1" />
      </linearGradient>
      <!-- Copper -->
      <linearGradient id="copperRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#c77c43;stop-opacity:1" />
        <stop offset="25%" style="stop-color:#e1a06a;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#9a5c2a;stop-opacity:1" />
        <stop offset="75%" style="stop-color:#d7925a;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#7b461f;stop-opacity:1" />
      </linearGradient>
      <!-- Blue -->
      <linearGradient id="blueRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#2a6fdb;stop-opacity:1" />
        <stop offset="25%" style="stop-color:#5ea2ff;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#1f4f9e;stop-opacity:1" />
        <stop offset="75%" style="stop-color:#4f8fe6;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#163b76;stop-opacity:1" />
      </linearGradient>
      <!-- Green -->
      <linearGradient id="greenRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#2fbf71;stop-opacity:1" />
        <stop offset="25%" style="stop-color:#6fe0a6;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#1f7a49;stop-opacity:1" />
        <stop offset="75%" style="stop-color:#53cf8e;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#165a36;stop-opacity:1" />
      </linearGradient>
      <!-- Red -->
      <linearGradient id="redRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#e53935;stop-opacity:1" />
        <stop offset="25%" style="stop-color:#ff6f6c;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#9e1f1c;stop-opacity:1" />
        <stop offset="75%" style="stop-color:#e85a57;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#6f1513;stop-opacity:1" />
      </linearGradient>
    `;
  }

  renderSquareRim(ringStyle, uid, bgColor, glassEffectEnabled) {
    const data = this.getRimStyleData(ringStyle, uid);
    if (!data) return "";

    // Rim positioned to frame the entire card
    // Outer rim: 10px from edge, 130px wide x 240px tall
    const rimX = 10;
    const rimY = 10;
    const rimWidth = 130;
    const rimHeight = 240;
    const rimRadius = 20;

    return `
      <!-- Outer Frame (The Ring) -->
      <rect x="${rimX}" y="${rimY}" width="${rimWidth}" height="${rimHeight}" 
            rx="${rimRadius}" ry="${rimRadius}" 
            fill="url(#${data.grad})" 
            stroke="${data.stroke}" 
            stroke-width="1"
            filter="drop-shadow(2px 2px 3px rgba(0,0,0,0.4))"/>
      
      <!-- Inner Bevel (Inset) -->
      <rect x="${rimX + 4}" y="${rimY + 4}" 
            width="${rimWidth - 8}" height="${rimHeight - 8}" 
            rx="${rimRadius - 5}" ry="${rimRadius - 5}" 
            fill="none" 
            stroke="rgba(0,0,0,0.2)" 
            stroke-width="2"/>
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

  renderRivets() {
    const rivets = [
      { cx: 5, cy: 5 },
      { cx: 145, cy: 5 },
      { cx: 5, cy: 255 },
      { cx: 145, cy: 255 }
    ];

    return rivets.map(r => `
      <g>
        <circle cx="${r.cx}" cy="${r.cy}" r="4" class="rivet"/>
        <circle cx="${r.cx}" cy="${r.cy}" r="2.5" class="screw-detail"/>
        <line x1="${r.cx - 3}" y1="${r.cy}" x2="${r.cx + 3}" y2="${r.cy}" 
              class="screw-detail" 
              transform="rotate(45, ${r.cx}, ${r.cy})"/>
      </g>
    `).join('');
  }

  renderTickMarks(cfg, trackTopY, trackBottomY, tickStartX, majorLength, minorLength) {
    const min = cfg.min;
    const max = cfg.max;
    const step = cfg.step;
    const tickColor = cfg.tick_color;
    
    const range = max - min;
    const trackHeight = trackBottomY - trackTopY;
    
    let ticks = '';
    
    // Major ticks at 10% intervals
    for (let i = 0; i <= 10; i++) {
      const percent = i / 10;
      const value = min + (range * percent);
      const y = trackBottomY - (trackHeight * percent); // Inverted: bottom is min
      
      ticks += `<line x1="${tickStartX}" y1="${y}" x2="${tickStartX + majorLength}" y2="${y}" 
                      stroke="${tickColor}" stroke-width="2" />`;
    }
    
    // Minor ticks at each step (if step is reasonable)
    const numSteps = range / step;
    if (numSteps > 0 && numSteps <= 100) {
      for (let i = 0; i <= numSteps; i++) {
        const value = min + (i * step);
        const percent = (value - min) / range;
        const y = trackBottomY - (trackHeight * percent);
        
        // Skip if this coincides with a major tick
        const isMajor = (i % Math.ceil(numSteps / 10)) === 0;
        if (!isMajor) {
          ticks += `<line x1="${tickStartX}" y1="${y}" x2="${tickStartX + minorLength}" y2="${y}" 
                          stroke="${tickColor}" stroke-width="1" />`;
        }
      }
    }
    
    return ticks;
  }

  renderLEDDisplay(uid, cfg, x, y, width, height, glassEffectEnabled) {
    const borderRadius = 8;
    
    return `
      <!-- LED Display Background -->
      <rect x="${x}" y="${y}" width="${width}" height="${height}" 
            rx="${borderRadius}" ry="${borderRadius}"
            fill="url(#ledBg-${uid})"
            stroke="rgba(0,0,0,0.5)"
            stroke-width="1" />
      
      <!-- Inner bevel -->
      <rect x="${x + 2}" y="${y + 2}" width="${width - 4}" height="${height - 4}" 
            rx="${borderRadius - 2}" ry="${borderRadius - 2}"
            fill="none"
            stroke="rgba(0,0,0,0.2)"
            stroke-width="1" />
      
      <!-- Glass glare effect -->
      ${glassEffectEnabled ? `
        <path d="M ${x + 4} ${y + 4} 
                 L ${x + width - 4} ${y + 4} 
                 L ${x + width - 4} ${y + height * 0.4} 
                 Q ${x + width / 2} ${y + height * 0.5} ${x + 4} ${y + height * 0.4} Z" 
              fill="white" 
              opacity="0.08" />
      ` : ''}
      
      <!-- Value Text -->
      <text id="valueDisplay" 
            x="${x + width / 2}" 
            y="${y + height / 2}" 
            text-anchor="middle" 
            dominant-baseline="middle"
            font-size="${cfg.value_font_size}" 
            font-family="ds-digitalnormal, monospace" 
            fill="${cfg.font_color}"
            style="text-shadow: 0 0 5px ${cfg.font_color}; pointer-events: none;">
        ${this._formatValue(cfg.value)}
      </text>
    `;
  }

  renderWearMarks(wearLevel) {
    if (wearLevel === 0) return '';
    
    const baseOpacity = (wearLevel / 100) * 0.25;
    
    // 12 wear marks positioned for vertical slider (avoiding track area x=60-90)
    const allMarks = [
      { type: 'circle', cx: 30, cy: 55, r: 1.8, fill: '#8B7355', baseOpacity: 0.18 },
      { type: 'ellipse', cx: 120, cy: 45, rx: 2.5, ry: 1.2, fill: '#6d5d4b', baseOpacity: 0.12 },
      { type: 'circle', cx: 45, cy: 95, r: 1.2, fill: '#8B7355', baseOpacity: 0.15 },
      { type: 'circle', cx: 128, cy: 88, r: 1.5, fill: '#6d5d4b', baseOpacity: 0.2 },
      { type: 'ellipse', cx: 22, cy: 140, rx: 2, ry: 1, fill: '#8B7355', baseOpacity: 0.1 },
      { type: 'circle', cx: 135, cy: 155, r: 1, fill: '#6d5d4b', baseOpacity: 0.15 },
      { type: 'circle', cx: 38, cy: 185, r: 1.3, fill: '#8B7355', baseOpacity: 0.12 },
      { type: 'ellipse', cx: 118, cy: 195, rx: 3, ry: 1.5, fill: '#8B7355', baseOpacity: 0.08 },
      { type: 'circle', cx: 25, cy: 225, r: 2, fill: '#6d5d4b', baseOpacity: 0.2 },
      { type: 'circle', cx: 125, cy: 238, r: 1.8, fill: '#8B7355', baseOpacity: 0.18 },
      { type: 'ellipse', cx: 60, cy: 70, rx: 1.5, ry: 0.8, fill: '#6d5d4b', baseOpacity: 0.09 },
      { type: 'circle', cx: 100, cy: 215, r: 0.8, fill: '#8B7355', baseOpacity: 0.1 }
    ];
    
    const markCount = Math.ceil((wearLevel / 100) * allMarks.length);
    const marksToShow = allMarks.slice(0, markCount);
    
    return marksToShow.map(mark => {
      const opacity = Math.min(mark.baseOpacity * (wearLevel / 50), 0.25);
      return `<${mark.type} cx="${mark.cx}" cy="${mark.cy}" ${mark.r ? `r="${mark.r}"` : `rx="${mark.rx}" ry="${mark.ry}"`} fill="${mark.fill}" opacity="${opacity}"/>`;
    }).join('');
  }

  _attachListeners() {
    const slider = this.shadowRoot.getElementById('slider');
    if (!slider) return;
    
    slider.oninput = (e) => this._onSliderInput(e);
    slider.onchange = (e) => this._onSliderChange(e);

    const root = this.shadowRoot.getElementById('actionRoot');
    if (root) {
      root.onclick = (e) => {
        // Don't trigger action if clicking on slider
        if (e.target.id !== 'slider') {
          this._handleAction('tap');
        }
      };
    }
  }

  _onSliderInput(e) {
    const v = e.target.value;
    this._updateValueDisplay(v);
    fireEvent(this, 'foundry-slider-input', { value: Number(v) });
  }

  _onSliderChange(e) {
    const v = e.target.value;
    this.config.value = Number(v);
    this._updateValueDisplay(v);
    fireEvent(this, 'foundry-slider-change', { value: Number(v) });
  }

  _updateValueDisplay(v) {
    const formatted = this._formatValue(v);
    const el = this.shadowRoot.getElementById('valueDisplay');
    if (el) el.textContent = formatted;
  }

  _getLedCharCount(cfg) {
    const minText = this._formatValue(cfg.min);
    const maxText = this._formatValue(cfg.max);
    const valText = this._formatValue(cfg.value);
    return Math.max(minText.length, maxText.length, valText.length);
  }

  _formatValue(v) {
    const cfg = this.config || {};
    const step = Number(cfg.step) || 1;
    const min = Number(cfg.min) || 0;
    const max = Number(cfg.max) || 0;

    const decimalPlaces = (() => {
      const s = String(step);
      if (s.indexOf('.') === -1) return 0;
      return s.split('.')[1].length;
    })();

    const num = Number(v);
    const allowSign = (Number(cfg.min) < 0) || (Number(cfg.max) < 0);
    const sign = allowSign ? (num < 0 ? '-' : '+') : '';
    const abs = Math.abs(num);

    const maxAbs = Math.max(Math.abs(min), Math.abs(max), 0);
    const intDigits = Math.max(String(Math.floor(maxAbs)).length, 1);

    const fixed = decimalPlaces > 0 ? abs.toFixed(decimalPlaces) : String(Math.floor(abs));
    const parts = String(fixed).split('.');
    const intPart = parts[0].padStart(intDigits, '0');
    const fracPart = parts[1] ? '.' + parts[1] : '';
    return `${sign}${intPart}${fracPart}`;
  }

  _handleAction(kind) {
    if (!this.config) return;
    const act = getActionConfig(this.config, 'tap_action', { action: 'none' });
    if (!act || act.action === 'none') return;
    if (act.action === 'more-info' && this.config.entity) {
      fireEvent(this, 'hass-more-info', { entityId: this.config.entity });
    }
  }

  adjustColor(color, percent) {
    if (!color) return color;
    if (color.startsWith('#')) {
      let num = parseInt(color.replace('#', ''), 16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) + amt,
        G = (num >> 8 & 0x00FF) + amt,
        B = (num & 0x0000FF) + amt;
      return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + 
                                 (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + 
                                 (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    return color;
  }

  static getConfigElement() {
    return document.createElement('foundry-slider-editor');
  }

  static getStubConfig() {
    return {
      title: 'Slider',
      min: 0,
      max: 100,
      step: 1,
      value: 50,
      led_position: 'right',
      ring_style: 'brass',
      plate_color: '#8c7626',
      rivet_color: '#6a5816',
      slider_color: '#444444',
      knob_color: '#c9a961',
      knob_shape: 'square',
      knob_size: 48,
      tick_color: 'rgba(0,0,0,0.22)',
      font_bg_color: '#ffffff',
      font_color: '#000000',
      title_font_size: 14,
      value_font_size: 36,
      show_value: true,
      wear_level: 50,
      glass_effect_enabled: true,
      aged_texture: 'everywhere',
      aged_texture_intensity: 50
    };
  }
}

if (!customElements.get('foundry-slider-card')) {
  customElements.define('foundry-slider-card', FoundrySliderCard);
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'foundry-slider-card',
  name: 'Foundry Slider',
  preview: true,
  description: 'A vertical retro-style slider with LED display and 70s aesthetic.'
});
