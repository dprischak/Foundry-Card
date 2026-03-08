import { debounce, fireEvent, getActionConfig } from './utils.js';
import { loadThemes, applyTheme } from './themes.js';

class FoundryAnalogMeterCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._resizeObserver = null;

    // Shake animation tracking
    this._isShaking = false;
    this._shakeTargetAngle = null;

    // Needle angle tracking
    this._previousNeedleAngle = null;
    this._previousValue = null;

    // Error state tracking
    this._entityError = null;

    this._boundHandleClick = () => this._handleAction('tap');
    this._boundHandleDblClick = () => this._handleAction('double_tap');
    this._boundHandleContextMenu = (e) => {
      e.preventDefault();
      this._handleAction('hold');
    };
    this._boundHandleKeyDown = (e) => this._handleKeyDown(e);

    // Debounced resize handler
    this._debouncedReflow = debounce(() => {}, 100);
  }

  connectedCallback() {}

  disconnectedCallback() {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('You need to define an entity');
    }

    // HA may pass a frozen config object. Clone it before adding defaults.
    this.config = { ...config };

    // Validate and sanitize configuration
    this._validateConfig();

    const applyDefaultsAndRender = () => {
      // Default behavior like built-in cards
      if (!this.config.tap_action) {
        this.config.tap_action = { action: 'more-info' };
      }

      // Default ring style to brass if not specified
      if (this.config.ring_style === undefined) {
        this.config.ring_style = 'brass';
      }

      this._uniqueId =
        this._uniqueId || Math.random().toString(36).substr(2, 9);
      this.render();
      if (this._hass) {
        requestAnimationFrame(() => this.updateMeter());
      }
    };

    // Theme handling
    if (this.config.theme && this.config.theme !== 'none') {
      loadThemes().then((themes) => {
        if (themes[this.config.theme]) {
          this.config = applyTheme(this.config, themes[this.config.theme]);
        }
        applyDefaultsAndRender();
      });
    } else {
      applyDefaultsAndRender();
    }
  }

  _validateConfig() {
    const config = this.config;

    // Validate min/max
    const min = config.min !== undefined ? config.min : 0;
    const max = config.max !== undefined ? config.max : 100;
    if (min >= max) {
      console.warn(
        'Foundry Analog Meter Card: min value must be less than max value. Using defaults.'
      );
      this.config.min = 0;
      this.config.max = 100;
    }

    // Validate animation duration (must be positive)
    if (config.animation_duration !== undefined) {
      const duration = parseFloat(config.animation_duration);
      if (isNaN(duration) || duration <= 0) {
        console.warn(
          'Foundry Analog Meter Card: animation_duration must be positive. Using 1.2s.'
        );
        this.config.animation_duration = 1.2;
      } else {
        this.config.animation_duration = Math.min(duration, 10);
      }
    }

    // Validate wear level (0-100)
    if (config.wear_level !== undefined) {
      const wear = parseFloat(config.wear_level);
      if (isNaN(wear)) {
        this.config.wear_level = 50;
      } else {
        this.config.wear_level = Math.max(0, Math.min(100, wear));
      }
    }

    // Validate texture intensity (0-100)
    if (config.aged_texture_intensity !== undefined) {
      const intensity = parseFloat(config.aged_texture_intensity);
      if (isNaN(intensity)) {
        this.config.aged_texture_intensity = 20;
      } else {
        this.config.aged_texture_intensity = Math.max(
          0,
          Math.min(100, intensity)
        );
      }
    }
  }

  set hass(hass) {
    this._hass = hass;
    if (!this.config) return;
    if (!this.shadowRoot) return;
    this.updateMeter();
  }

  render() {
    const config = this.config;
    const title = config.title || '';
    const min = config.min !== undefined ? config.min : 0;
    const max = config.max !== undefined ? config.max : 100;
    const uid = this._uniqueId;
    const animationDuration =
      config.animation_duration !== undefined ? config.animation_duration : 1.2;
    const titleFontSize =
      config.title_font_size !== undefined ? config.title_font_size : 12;
    const unit = config.unit !== undefined ? config.unit : '';

    const ringStyle =
      config.ring_style !== undefined ? config.ring_style : 'brass';
    const rivetColor =
      config.rivet_color !== undefined ? config.rivet_color : '#6d5d4b';
    const plateColor =
      config.plate_color !== undefined ? config.plate_color : 'transparent';
    const plateTransparent =
      config.plate_transparent !== undefined ? config.plate_transparent : false;
    const wearLevel = config.wear_level !== undefined ? config.wear_level : 50;
    const glassEffectEnabled =
      config.glass_effect_enabled !== undefined
        ? config.glass_effect_enabled
        : true;
    const agedTexture =
      config.aged_texture !== undefined ? config.aged_texture : 'glass_only';
    const agedTextureIntensity =
      config.aged_texture_intensity !== undefined
        ? config.aged_texture_intensity
        : 20;
    const agedTextureOpacity = ((100 - agedTextureIntensity) / 100) * 1.0;
    // If plate is transparent and aged_texture is everywhere, treat as glass_only
    const effectiveAgedTexture =
      plateTransparent && agedTexture === 'everywhere'
        ? 'glass_only'
        : agedTexture;
    const agedTextureEnabled = effectiveAgedTexture === 'glass_only';
    const agedTextureOnFace =
      agedTextureEnabled || effectiveAgedTexture === 'everywhere';

    // Hard-coded VU meter angles
    // For a landscape VU meter, the arc sweeps from about -40° to +40° (a ~80° sweep)
    // In SVG coordinate system where 0=right, 90=down:
    // We want the arc from ~230° to ~310° (measuring clockwise from right)
    // That places the arc in the upper half spanning left-to-right
    const startAngleDeg = 222;
    const endAngleDeg = 318;
    this._startAngle = startAngleDeg;
    this._endAngle = endAngleDeg;
    this._animationDuration = animationDuration;

    // Rectangular viewBox: landscape orientation
    const vbWidth = 300;
    const vbHeight = 180;
    // Needle pivot point - below the visible face (hidden behind ring, like reference VU meter)
    const cx = 150;
    const cy = 170;
    // Arc radius for the needle (large so arc spans face width)
    const needleRadius = 130;

    // Store for use in drawing methods
    this._cx = cx;
    this._cy = cy;
    this._needleRadius = needleRadius;

    // Default segments if not specified
    const segments = config.segments || [
      { from: -20, to: 0, color: '#3e2723' },
      { from: 0, to: 3, color: '#F44336' },
    ];

    // Multiplier logic
    // Calculate the step size (distance between major ticks)
    // Ticks are 10 segments total
    const tickStep = (max - min) / 10;
    let multiplier = 1;
    let multiplierSuffix = '';

    if (tickStep >= 10000) {
      multiplier = 10000;
      multiplierSuffix = 'x10k';
    } else if (tickStep >= 1000) {
      multiplier = 1000;
      multiplierSuffix = 'x1k';
    } else if (tickStep >= 100) {
      multiplier = 100;
      multiplierSuffix = 'x100';
    }

    // Combine config unit with multiplier
    let displayUnit = unit;
    if (multiplierSuffix && unit) {
      displayUnit = `${unit} ${multiplierSuffix}`;
    } else if (multiplierSuffix && !unit) {
      displayUnit = multiplierSuffix;
    }

    // Plate and rim dimensions (rectangular)
    const plateX = 5;
    const plateY = 5;
    const plateW = vbWidth - 10;
    const plateH = vbHeight - 10;

    // Rim inset (must sit inside rivets which are at offset 15 from plate edges)
    const rimX = 35;
    const rimY = 32;
    const rimW = vbWidth - 70;
    const rimH = vbHeight - 64;

    // Face inset (screen area)
    const faceX = rimX + 8;
    const faceY = rimY + 8;
    const faceW = rimW - 16;
    const faceH = rimH - 16;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          padding: 0px;
        }
        ha-card {
          container-type: inline-size;
          background: transparent;
          box-shadow: none;
        }
        .card {
          background: transparent;
          padding: 0px;
          position: relative;
          cursor: pointer;
        }
        .meter-container {
          position: relative;
          width: 100%;
          max-width: 520px;
          margin: 0 auto;
          container-type: inline-size;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-3px) rotate(-0.5deg); }
          20%, 40%, 60%, 80% { transform: translateX(3px) rotate(0.5deg); }
        }
        .meter-container.shaking {
          animation: shake 0.25s ease-in-out;
        }
        .meter-svg {
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
        .peak-label {
          font-size: 6px;
          font-family: 'Arial', sans-serif;
          font-weight: bold;
          fill: ${config.number_color || '#3e2723'};
          text-anchor: middle;
        }
      </style>
      <ha-card role="img" aria-label="${title ? title.replace(/\\\\n/g, ' ') : 'Foundry analog meter'} showing ${config.entity}" tabindex="0">
        <div class="card" id="actionRoot">
          <div class="meter-container" role="presentation">
            <svg class="meter-svg" viewBox="0 0 ${vbWidth} ${vbHeight}" xmlns="http://www.w3.org/2000/svg" role="presentation" aria-hidden="true">
              <defs>
                <!-- Gradient for meter face -->
                <radialGradient id="meterFace-${uid}" cx="50%" cy="80%">
                  <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
                  <stop offset="85%" style="stop-color:#f8f8f0;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#d4d4c8;stop-opacity:1" />
                </radialGradient>
                
                <!-- Rim gradients -->
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
                  <stop offset="0%" style="stop-color:#f6f6f6;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#ffffff;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#dcdcdc;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#f0f0f0;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#cfcfcf;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="blueRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#2a6fdb;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#5ea2ff;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#1f4f9e;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#4f8fe6;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#163b76;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="greenRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#2fbf71;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#6fe0a6;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#1f7a49;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#53cf8e;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#165a36;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="redRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#e53935;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#ff6f6c;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#9e1f1c;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#e85a57;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#6f1513;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="blackRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#3a3a3a;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#555555;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#1f1f1f;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#444444;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#141414;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="copperRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#c77c43;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#e1a06a;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#9a5c2a;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#d7925a;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#7b461f;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="purpleRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#9c27b0;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#ce93d8;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#6a1b9a;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#ba68c8;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#4a148c;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="orangeRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#ef6c00;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#ffb74d;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#e65100;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#ffa726;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#bf360c;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="yellowRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#f9a825;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#fff176;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#f57f17;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#ffee58;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#e65100;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="tealRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#00897b;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#4db6ac;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#00695c;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#26a69a;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#004d40;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="goldRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#d4a017;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#f0d060;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#b8860b;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#e8c840;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#8b6914;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="titaniumRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#6e7b8b;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#94a3b3;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#546e7a;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#88979e;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#455a64;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="carbonRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#333333;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#0d0d0d;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#2a2a2a;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#050505;stop-opacity:1" />
                </linearGradient>
                
                <!-- Shadow filter -->
                <filter id="innerShadow-${uid}">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                  <feOffset dx="1" dy="1" result="offsetblur"/>
                  <feComponentTransfer>
                    <feFuncA type="linear" slope="0.5"/>
                  </feComponentTransfer>
                  <feMerge>
                    <feMergeNode/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                
                <!-- Aged texture -->
                <filter id="aged-${uid}" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB">
                  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise"/>
                  <feColorMatrix type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1" in="noise" result="desaturatedNoise" />
                  <feComponentTransfer result="grainTexture">
                    <feFuncR type="linear" slope="${1 - agedTextureOpacity}" intercept="${agedTextureOpacity}"/>
                    <feFuncG type="linear" slope="${1 - agedTextureOpacity}" intercept="${agedTextureOpacity}"/>
                    <feFuncB type="linear" slope="${1 - agedTextureOpacity}" intercept="${agedTextureOpacity}"/>
                  </feComponentTransfer>
                  <feComposite operator="arithmetic" k1="1" k2="0" k3="0" k4="0" in="grainTexture" in2="SourceGraphic" />
                </filter>
                
                <!-- Clip paths -->
                <clipPath id="faceClip-${uid}">
                  <rect x="${faceX}" y="${faceY}" width="${faceW}" height="${faceH}" rx="8" ry="8"/>
                </clipPath>
                <clipPath id="plateClip-${uid}">
                  <rect x="${plateX}" y="${plateY}" width="${plateW}" height="${plateH}" rx="20" ry="20" />
                </clipPath>
                
                <!-- Glass glare gradient -->
                <linearGradient id="glassGrad-${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color:#aaccff;stop-opacity:0.3" />
                  <stop offset="100%" style="stop-color:#aaccff;stop-opacity:0" />
                </linearGradient>
              </defs>
              
              <!-- Plate -->
              <rect x="${plateX}" y="${plateY}" width="${plateW}" height="${plateH}" rx="20" ry="20" 
                    fill="${plateTransparent ? 'rgba(240, 235, 225, 0.15)' : plateColor}" 
                    clip-path="url(#plateClip-${uid})"
                    ${effectiveAgedTexture === 'everywhere' ? `filter="url(#aged-${uid})"` : ''} />
              
              <!-- Rectangular Rim -->
              ${this.renderRectRim(ringStyle, uid, rimX, rimY, rimW, rimH)}
              
              <!-- Face (screen area) -->
              <rect x="${faceX}" y="${faceY}" width="${faceW}" height="${faceH}" rx="8" ry="8"
                    fill="${config.background_style === 'solid' ? config.face_color || '#f8f8f0' : `url(#meterFace-${uid})`}"
                    ${agedTexture !== 'none' && agedTextureOnFace ? `filter="url(#aged-${uid})" clip-path="url(#faceClip-${uid})"` : ''} />
              
              <!-- Glass effect overlay -->
              ${glassEffectEnabled ? `<path d="M ${faceX} ${faceY} L ${faceX + faceW} ${faceY} L ${faceX + faceW} ${faceY + faceH * 0.2} Q ${faceX + faceW / 2} ${faceY + faceH * 0.25} ${faceX} ${faceY + faceH * 0.2} Z" fill="url(#glassGrad-${uid})" clip-path="url(#faceClip-${uid})" style="pointer-events: none;" />` : ''}
              
              <!-- Face border -->
              <rect x="${faceX}" y="${faceY}" width="${faceW}" height="${faceH}" rx="8" ry="8"
                    fill="none" stroke="rgba(0,0,0,0.4)" stroke-width="1" />
              
              <!-- Segment arcs -->
              <g id="segments"></g>
              
              <!-- Tick marks and numbers -->
              <g id="ticks"></g>
              <g id="numbers"></g>
              
              <!-- Title text (VU label) -->
              ${title ? this.renderTitleText(title, titleFontSize, config.number_color, cx, cy) : ''}
              
              <!-- Unit / Multiplier text -->
              ${displayUnit ? this.renderUnitText(displayUnit, titleFontSize * 0.7, config.number_color, cx, cy, title) : ''}
              
              <!-- PEAK indicator -->
              <g id="peakGroup" transform="translate(${faceX + faceW - 25}, ${faceY + faceH - 20})">
                <circle id="peakLed" cx="0" cy="0" r="5" fill="#666" opacity="0.3" stroke="#4a4034" stroke-width="0.5"/>
                <circle cx="0" cy="0" r="3" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="0.3"/>
                <text class="peak-label" x="0" y="10">PEAK</text>
              </g>
              
              <!-- Hidden ARIA live region for accessibility -->
              <foreignObject x="0" y="0" width="1" height="1" style="overflow: hidden;">
                <div xmlns="http://www.w3.org/1999/xhtml" id="ariaLive" aria-live="polite" aria-atomic="true" style="position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;"></div>
              </foreignObject>
              
              <!-- Fixed clip container keeps needle hidden behind the ring -->
              <g clip-path="url(#faceClip-${uid})">
                <!-- Rotating needle inside the clip -->
                <g id="needle" style="transform-origin: ${cx}px ${cy}px; transition: transform ${animationDuration}s ease-out;">
                  <!-- Needle shadow -->
                  <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - needleRadius}"
                        stroke="rgba(0,0,0,0.2)" stroke-width="2.5"
                        transform="translate(1.5,1.5)"/>
                  <!-- Needle body (thin line) -->
                  <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - needleRadius}"
                        stroke="${config.needle_color || '#1a1a1a'}" stroke-width="1.5"
                        stroke-linecap="round"/>
                </g>
              </g>
              
              <!-- Needle stoppers -->
              <g id="stoppers"></g>
              
              <!-- Needle pivot is hidden behind the ring (below face) -->
              
              <!-- Corner rivets -->
              ${this.renderRivets(plateW, plateH, plateX, plateY)}
              
              <!-- Age spots and wear marks -->
              ${this.renderWearMarks(wearLevel, vbWidth, vbHeight)}
            </svg>
          </div>
        </div>
      </ha-card>
    `;
    this._attachActionListeners();
    this.drawSegments(segments, min, max);
    this.drawTicks(min, max, config, multiplier);
    this.drawStoppers();
  }

  renderRivets(w, h, x, y) {
    const offset = 15;
    const rivets = [
      { cx: x + offset, cy: y + offset },
      { cx: x + w - offset, cy: y + offset },
      { cx: x + offset, cy: y + h - offset },
      { cx: x + w - offset, cy: y + h - offset },
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

  _attachActionListeners() {
    const root = this.shadowRoot?.getElementById('actionRoot');
    if (!root) return;

    // Remove old listeners (render() can run many times)
    root.removeEventListener('click', this._boundHandleClick);
    root.removeEventListener('dblclick', this._boundHandleDblClick);
    root.removeEventListener('contextmenu', this._boundHandleContextMenu);
    root.removeEventListener('keydown', this._boundHandleKeyDown);

    // Add listeners
    root.addEventListener('click', this._boundHandleClick, { passive: true });
    root.addEventListener('dblclick', this._boundHandleDblClick, {
      passive: true,
    });
    root.addEventListener('contextmenu', this._boundHandleContextMenu);
    root.addEventListener('keydown', this._boundHandleKeyDown);
  }

  _handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._handleAction('tap');
    }
  }

  _findDirectionalPath(currentAngle, targetAngle, valueIncreasing) {
    if (currentAngle === null) return targetAngle;

    let diff = targetAngle - currentAngle;

    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;

    if (valueIncreasing !== null) {
      if (valueIncreasing && diff < 0) {
        diff += 360;
      } else if (!valueIncreasing && diff > 0) {
        diff -= 360;
      }
    }

    return currentAngle + diff;
  }

  _handleAction(kind) {
    if (!this._hass || !this.config) return;

    const entityId = this.config.entity;

    const tap = getActionConfig(this.config, 'tap_action', {
      action: 'more-info',
    });
    const hold = getActionConfig(this.config, 'hold_action', {
      action: 'more-info',
    });
    const dbl = getActionConfig(this.config, 'double_tap_action', {
      action: 'more-info',
    });

    const actionConfig =
      kind === 'hold' ? hold : kind === 'double_tap' ? dbl : tap;

    // Check if action is "shake" - custom action for this card
    if (actionConfig?.action === 'shake') {
      this._shakeMeter();
      return;
    }

    this._runAction(actionConfig, entityId);
  }

  _shakeMeter() {
    if (this._isShaking) return;
    if (!this._hass || !this.config) return;

    const entity = this._hass.states[this.config.entity];
    if (!entity) return;

    const value = parseFloat(entity.state);
    if (isNaN(value)) return;

    const min = this.config.min !== undefined ? this.config.min : 0;
    const max = this.config.max !== undefined ? this.config.max : 100;
    const range = max - min;
    const clampedValue = Math.max(min, Math.min(max, value));

    const deviationPercent = 0.1 + Math.random() * 0.4;
    const deviation = range * deviationPercent * (Math.random() > 0.5 ? 1 : -1);
    const targetValue = Math.max(min, Math.min(max, clampedValue + deviation));

    const valuePosition = Math.max(0, Math.min(1, (targetValue - min) / range));
    const startAngle = this._startAngle;
    const endAngle = this._endAngle;
    const totalAngle = endAngle - startAngle;
    let targetMeterAngle = startAngle + totalAngle * valuePosition;

    this._isShaking = true;
    // Convert to needle rotation: 0 at top, so subtract 270 to get rotation from vertical
    this._shakeTargetAngle = targetMeterAngle - 270;

    const needle = this.shadowRoot.getElementById('needle');
    if (!needle) return;

    const meterContainer = this.shadowRoot.querySelector('.meter-container');
    if (meterContainer) {
      meterContainer.classList.add('shaking');
      setTimeout(() => {
        meterContainer.classList.remove('shaking');
      }, 250);
    }

    needle.style.transition = 'transform 0.3s ease-out';
    needle.style.transform = `rotate(${this._shakeTargetAngle}deg)`;

    setTimeout(() => {
      if (needle) {
        needle.style.transition = 'transform 3s cubic-bezier(0.4, 0.0, 0.2, 1)';
        this._isShaking = false;
        this._shakeTargetAngle = null;
        this.updateMeter();
      }
    }, 300);
  }

  _runAction(actionConfig, entityId) {
    const action = actionConfig?.action;

    if (!action || action === 'none') return;

    if (action === 'more-info') {
      fireEvent(this, 'hass-more-info', { entityId });
      return;
    }

    if (action === 'navigate') {
      const path = actionConfig.navigation_path;
      if (!path) return;
      history.pushState(null, '', path);
      fireEvent(window, 'location-changed', { replace: false });
      return;
    }

    if (action === 'toggle') {
      if (!entityId) return;
      this._hass.callService('homeassistant', 'toggle', {
        entity_id: entityId,
      });
      return;
    }

    if (action === 'call-service') {
      const service = actionConfig.service;
      if (!service) return;
      const [domain, srv] = service.split('.');
      if (!domain || !srv) return;

      const data = { ...(actionConfig.service_data || {}) };

      if (actionConfig.target?.entity_id)
        data.entity_id = actionConfig.target.entity_id;

      this._hass.callService(domain, srv, data);
      return;
    }
  }

  renderTitleText(title, fontSize, color = '#3e2723', cx = 150, cy = 155) {
    const lines = title.replace(/\\n/g, '\n').split('\n').slice(0, 3);
    const lineHeight = fontSize * 1.2;
    const totalHeight = (lines.length - 1) * lineHeight;
    // Position title below the arc center area
    const startY = cy - 45 - totalHeight / 2;

    return lines
      .map((line, index) => {
        const y = startY + index * lineHeight;
        return `<text x="${cx}" y="${y}" text-anchor="middle" font-size="${fontSize}" font-weight="bold" fill="${color}" font-family="Georgia, serif" style="text-shadow: 1px 1px 2px rgba(255,255,255,0.5);">${line}</text>`;
      })
      .join('\n');
  }

  renderUnitText(
    unitText,
    fontSize,
    color = '#3e2723',
    cx = 150,
    cy = 155,
    hasTitle
  ) {
    // If there is a title, position the unit just above it.
    // The title starts at `cy - 55 - totalHeight / 2`.
    // Default 1 line title height is ~1.2 * fontSize.
    // If no title, put the unit approximately where the top of the title would have been.
    const titleLines = hasTitle ? hasTitle.split('\n').slice(0, 3).length : 0;
    const titleFontSize = fontSize / 0.7; // Re-derive title font size to calculate offset
    const titleTotalHeight =
      (titleLines - 1 > 0 ? titleLines - 1 : 0) * (titleFontSize * 1.2);

    // Position unit text above the title by a small offset, or default placement
    const startY = cy - 55 - titleTotalHeight / 2;
    const unitY = startY - titleFontSize;

    return `<text x="${cx}" y="${unitY}" text-anchor="middle" font-size="${fontSize}" font-weight="bold" fill="${color}" font-family="Georgia, serif" opacity="0.8">${unitText}</text>`;
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
      case 'blue':
        return { grad: `blueRim-${uid}`, stroke: '#1e4f8f' };
      case 'green':
        return { grad: `greenRim-${uid}`, stroke: '#1f6b3a' };
      case 'red':
        return { grad: `redRim-${uid}`, stroke: '#8f1e1e' };
      case 'black':
        return { grad: `blackRim-${uid}`, stroke: '#2b2b2b' };
      case 'copper':
        return { grad: `copperRim-${uid}`, stroke: '#c77c43' };
      case 'purple':
        return { grad: `purpleRim-${uid}`, stroke: '#6a1b9a' };
      case 'orange':
        return { grad: `orangeRim-${uid}`, stroke: '#e65100' };
      case 'yellow':
        return { grad: `yellowRim-${uid}`, stroke: '#f57f17' };
      case 'teal':
        return { grad: `tealRim-${uid}`, stroke: '#00695c' };
      case 'gold':
        return { grad: `goldRim-${uid}`, stroke: '#b8860b' };
      case 'titanium':
        return { grad: `titaniumRim-${uid}`, stroke: '#546e7a' };
      case 'carbon':
        return { grad: `carbonRim-${uid}`, stroke: '#1a1a1a' };
      default:
        return null;
    }
  }

  renderRectRim(ringStyle, uid, x, y, w, h) {
    const data = this.getRimStyleData(ringStyle, uid);
    if (!data) return '';

    // Inner bevel
    const bevelX = x + 4;
    const bevelY = y + 4;
    const bevelW = w - 8;
    const bevelH = h - 8;

    return `
      <!-- Outer Frame (The Rim) -->
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" ry="12" fill="url(#${data.grad})" stroke="${data.stroke}" stroke-width="1"
            filter="drop-shadow(2px 2px 3px rgba(0,0,0,0.4))"/>
      <!-- Inner Bevel -->
      <rect x="${bevelX}" y="${bevelY}" width="${bevelW}" height="${bevelH}" rx="8" ry="8" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="2"/>
    `;
  }

  renderWearMarks(wearLevel, vbWidth, vbHeight) {
    if (wearLevel <= 0) return '';

    const marks = [];
    const numMarks = Math.floor(wearLevel / 5);
    const seed = 42;

    // Simple seeded random for consistent marks
    let rng = seed;
    const random = () => {
      rng = (rng * 16807) % 2147483647;
      return (rng - 1) / 2147483646;
    };

    for (let i = 0; i < numMarks; i++) {
      const x = 10 + random() * (vbWidth - 20);
      const y = 10 + random() * (vbHeight - 20);
      const r = 0.5 + random() * 2;
      const opacity = 0.05 + random() * 0.15;
      const type = random();

      if (type < 0.3) {
        marks.push(
          `<circle cx="${x}" cy="${y}" r="${r}" fill="rgba(60,40,20,${opacity})"/>`
        );
      } else if (type < 0.6) {
        const x2 = x + (random() - 0.5) * 15;
        const y2 = y + (random() - 0.5) * 15;
        marks.push(
          `<line x1="${x}" y1="${y}" x2="${x2}" y2="${y2}" stroke="rgba(200,190,170,${opacity})" stroke-width="0.3"/>`
        );
      } else if (type < 0.8) {
        marks.push(
          `<circle cx="${x}" cy="${y}" r="${r * 1.5}" fill="rgba(80,110,60,${opacity * 0.5})"/>`
        );
      } else {
        marks.push(
          `<circle cx="${x}" cy="${y}" r="${r * 0.5}" fill="rgba(40,30,20,${opacity * 0.8})" stroke="rgba(200,190,170,${opacity * 0.3})" stroke-width="0.2"/>`
        );
      }
    }

    return marks.join('\n');
  }

  drawSegments(segments, min, max) {
    const segmentsGroup = this.shadowRoot.getElementById('segments');
    const cx = this._cx;
    const cy = this._cy;
    const radius = this._needleRadius - 10; // Segment arc slightly inside needle reach
    const startAngle = this._startAngle;
    const endAngle = this._endAngle;
    const totalAngle = endAngle - startAngle;

    segments.forEach((segment) => {
      const fromPercent = (segment.from - min) / (max - min);
      const toPercent = (segment.to - min) / (max - min);

      const segmentStartAngle = startAngle + totalAngle * fromPercent;
      const segmentEndAngle = startAngle + totalAngle * toPercent;

      const path = this.describeArc(
        cx,
        cy,
        radius,
        segmentStartAngle,
        segmentEndAngle
      );

      const pathElement = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'path'
      );
      pathElement.setAttribute('d', path);
      pathElement.setAttribute('fill', 'none');
      pathElement.setAttribute('stroke', segment.color);
      pathElement.setAttribute('stroke-width', '6');
      pathElement.setAttribute('opacity', '0.7');

      segmentsGroup.appendChild(pathElement);
    });
  }

  drawTicks(min, max, config, multiplier = 1) {
    const ticksGroup = this.shadowRoot.getElementById('ticks');
    const numbersGroup = this.shadowRoot.getElementById('numbers');
    const cx = this._cx;
    const cy = this._cy;
    const startAngle = this._startAngle;
    const endAngle = this._endAngle;
    const totalAngle = endAngle - startAngle;
    const numTicks = 10;

    // Radii for the VU meter layout:
    // Numbers are above (further from center), ticks below, with a connecting line
    const numberRadius = this._needleRadius - 25; // Where numbers sit
    const tickOuterRadius = this._needleRadius - 5; // Outer end of tick (near arc)
    const tickInnerRadius = this._needleRadius - 15; // Inner end of major tick
    const minorTickOuterRadius = this._needleRadius - 5;
    const minorTickInnerRadius = this._needleRadius - 10;
    const connectLineRadius = this._needleRadius - 15; // Line connecting number down to tick

    ticksGroup.innerHTML = '';
    numbersGroup.innerHTML = '';

    for (let i = 0; i <= numTicks; i++) {
      const angle = startAngle + (totalAngle * i) / numTicks;
      const angleRad = (angle * Math.PI) / 180;

      // Major tick marks (below the numbers, from tickInner to tickOuter)
      const x1 = cx + tickInnerRadius * Math.cos(angleRad);
      const y1 = cy + tickInnerRadius * Math.sin(angleRad);
      const x2 = cx + tickOuterRadius * Math.cos(angleRad);
      const y2 = cy + tickOuterRadius * Math.sin(angleRad);

      const tick = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'line'
      );
      tick.setAttribute('x1', x1);
      tick.setAttribute('y1', y1);
      tick.setAttribute('x2', x2);
      tick.setAttribute('y2', y2);
      tick.setAttribute('stroke', config.primary_tick_color || '#3e2723');
      tick.setAttribute('stroke-width', '1.5');
      ticksGroup.appendChild(tick);

      // Connecting line from number position down to tick
      const numX = cx + numberRadius * Math.cos(angleRad);
      const numY = cy + numberRadius * Math.sin(angleRad);
      const connX = cx + connectLineRadius * Math.cos(angleRad);
      const connY = cy + connectLineRadius * Math.sin(angleRad);

      const connLine = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'line'
      );
      connLine.setAttribute('x1', numX);
      connLine.setAttribute('y1', numY + 3); // just below number text
      connLine.setAttribute('x2', connX);
      connLine.setAttribute('y2', connY);
      connLine.setAttribute('stroke', config.primary_tick_color || '#3e2723');
      connLine.setAttribute('stroke-width', '0.5');
      connLine.setAttribute('opacity', '0.6');
      ticksGroup.appendChild(connLine);

      // Number labels (above the ticks)
      const value = min + ((max - min) * i) / numTicks;

      const text = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'text'
      );
      text.setAttribute('x', numX);
      text.setAttribute('y', numY);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('font-size', '9');
      text.setAttribute('font-weight', 'bold');
      text.setAttribute('fill', config.number_color || '#3e2723');
      text.setAttribute('font-family', 'Georgia, serif');

      const scaledValue = value / multiplier;
      const displayValue =
        max < 10 ? parseFloat(scaledValue.toFixed(1)) : Math.round(scaledValue);

      text.textContent = displayValue;
      numbersGroup.appendChild(text);

      // Minor ticks between major ticks
      if (i < numTicks) {
        for (let j = 1; j < 5; j++) {
          const minorAngle = angle + (totalAngle / numTicks) * (j / 5);
          const minorAngleRad = (minorAngle * Math.PI) / 180;

          const mx1 = cx + minorTickInnerRadius * Math.cos(minorAngleRad);
          const my1 = cy + minorTickInnerRadius * Math.sin(minorAngleRad);
          const mx2 = cx + minorTickOuterRadius * Math.cos(minorAngleRad);
          const my2 = cy + minorTickOuterRadius * Math.sin(minorAngleRad);

          const minorTick = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'line'
          );
          minorTick.setAttribute('x1', mx1);
          minorTick.setAttribute('y1', my1);
          minorTick.setAttribute('x2', mx2);
          minorTick.setAttribute('y2', my2);
          minorTick.setAttribute(
            'stroke',
            config.secondary_tick_color || '#5d4e37'
          );
          minorTick.setAttribute('stroke-width', '0.75');
          ticksGroup.appendChild(minorTick);
        }
      }
    }
  }

  drawStoppers() {
    const stoppersGroup = this.shadowRoot.getElementById('stoppers');
    if (!stoppersGroup) return;

    const cx = this._cx;
    const cy = this._cy;
    const radius = this._needleRadius - 2;
    const startAngle = this._startAngle;
    const endAngle = this._endAngle;

    const startAngleRad = (startAngle * Math.PI) / 180;
    const startX = cx + radius * Math.cos(startAngleRad);
    const startY = cy + radius * Math.sin(startAngleRad);

    const startStopper = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'circle'
    );
    startStopper.setAttribute('cx', startX);
    startStopper.setAttribute('cy', startY);
    startStopper.setAttribute('r', '3');
    startStopper.setAttribute('fill', '#8B0000');
    startStopper.setAttribute('stroke', '#4a4034');
    startStopper.setAttribute('stroke-width', '0.5');
    stoppersGroup.appendChild(startStopper);

    const endAngleRad = (endAngle * Math.PI) / 180;
    const endX = cx + radius * Math.cos(endAngleRad);
    const endY = cy + radius * Math.sin(endAngleRad);

    const endStopper = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'circle'
    );
    endStopper.setAttribute('cx', endX);
    endStopper.setAttribute('cy', endY);
    endStopper.setAttribute('r', '3');
    endStopper.setAttribute('fill', '#8B0000');
    endStopper.setAttribute('stroke', '#4a4034');
    endStopper.setAttribute('stroke-width', '0.5');
    stoppersGroup.appendChild(endStopper);
  }

  describeArc(x, y, radius, startAngle, endAngle) {
    const start = this.polarToCartesian(x, y, radius, endAngle);
    const end = this.polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return [
      'M',
      start.x,
      start.y,
      'A',
      radius,
      radius,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
    ].join(' ');
  }

  polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  }

  darkenColor(color, amount) {
    if (Array.isArray(color) && color.length === 3) {
      const toHex = (n) =>
        Math.max(0, Math.min(255, Math.round(n)))
          .toString(16)
          .padStart(2, '0');
      color = `#${toHex(color[0])}${toHex(color[1])}${toHex(color[2])}`;
    }

    if (typeof color !== 'string' || color.trim() === '') {
      color = '#000000';
    }

    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    const newR = Math.max(0, Math.floor(r * (1 - amount)));
    const newG = Math.max(0, Math.floor(g * (1 - amount)));
    const newB = Math.max(0, Math.floor(b * (1 - amount)));

    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  updateMeter() {
    if (!this._hass || !this.config) return;

    const entity = this._hass.states[this.config.entity];

    if (!entity) {
      this._handleEntityError('Entity not found');
      return;
    }

    if (entity.state === 'unavailable' || entity.state === 'unknown') {
      this._handleEntityError(`Entity is ${entity.state}`);
      return;
    }

    let value;
    try {
      value = parseFloat(entity.state);
      if (isNaN(value)) {
        this._handleEntityError(`Non-numeric state: "${entity.state}"`);
        return;
      }
      this._clearEntityError();
    } catch (error) {
      this._handleEntityError(`Error parsing state: ${error.message}`);
      return;
    }

    const min = this.config.min !== undefined ? this.config.min : 0;
    const max = this.config.max !== undefined ? this.config.max : 100;

    const range = max - min;
    const clampedValue = Math.max(min, Math.min(max, value));
    const valuePosition = Math.max(
      0,
      Math.min(1, (clampedValue - min) / range)
    );

    const startAngle = this._startAngle;
    const endAngle = this._endAngle;
    const totalAngle = endAngle - startAngle;

    const gaugeAngle = startAngle + totalAngle * valuePosition;

    // Convert to needle rotation: SVG angles are from right (0°=3 o'clock)
    // Needle points up by default, so rotation = angle - 270
    let needleAngle = gaugeAngle - 270;

    const needle = this.shadowRoot.getElementById('needle');
    if (needle && !this._isShaking) {
      let valueIncreasing = null;
      if (this._previousValue !== null) {
        valueIncreasing = clampedValue > this._previousValue;
      }

      needleAngle = this._findDirectionalPath(
        this._previousNeedleAngle,
        needleAngle,
        valueIncreasing
      );
      needle.style.transform = `rotate(${needleAngle}deg)`;
      this._previousNeedleAngle = needleAngle;
      this._previousValue = clampedValue;

      this._updateAriaLive(value);
    }

    // PEAK LED logic
    const segments = this.config.segments || [];
    if (segments.length > 0) {
      const sorted = [...segments].sort((a, b) => b.from - a.from);
      const peakSegment = sorted[0];
      const peakLed = this.shadowRoot.getElementById('peakLed');
      if (peakLed) {
        if (clampedValue >= peakSegment.from) {
          peakLed.setAttribute('fill', peakSegment.color);
          peakLed.setAttribute('opacity', '1');
        } else {
          peakLed.setAttribute('fill', '#666');
          peakLed.setAttribute('opacity', '0.3');
        }
      }
    }
  }

  _handleEntityError(message) {
    if (this._entityError !== message) {
      console.warn(
        `Foundry Analog Meter Card [${this.config.entity}]: ${message}`
      );
      this._entityError = message;
    }
  }

  _clearEntityError() {
    this._entityError = null;
  }

  _updateAriaLive(value) {
    const ariaLive = this.shadowRoot?.getElementById('ariaLive');
    if (ariaLive) {
      const unit = this.config.unit || '';
      ariaLive.textContent = `${this.config.title || 'Meter'}: ${value}${unit ? ' ' + unit : ''}`;
    }
  }

  getCardSize() {
    return 3;
  }

  static get supportsCardResize() {
    return true;
  }

  static getConfigElement() {
    return document.createElement('foundry-analog-meter-card-editor');
  }

  static getStubConfig() {
    return {
      entity: 'sensor.temperature',
      title: 'Analog Meter',
      title_font_size: 12,
      ring_style: 'brass',
      rivet_color: '#6a5816',
      plate_color: '#8c7626',
      plate_transparent: false,
      min: 0,
      max: 100,
      unit: '',
      animation_duration: 1.2,
      wear_level: 50,
      glass_effect_enabled: true,
      aged_texture: 'everywhere',
      aged_texture_intensity: 20,
      segments: [{ from: 80, to: 100, color: '#F44336' }],
      background_style: 'gradient',
      face_color: '#f8f8f0',
      number_color: '#3e2723',
      primary_tick_color: '#3e2723',
      secondary_tick_color: '#5d4e37',
      needle_color: '#1a1a1a',
    };
  }
}

if (!customElements.get('foundry-analog-meter-card')) {
  customElements.define('foundry-analog-meter-card', FoundryAnalogMeterCard);
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'foundry-analog-meter-card',
  name: 'Foundry Analog Meter Card',
  preview: true,
  description: 'A vintage industrial style VU meter card',
  documentationURL: 'https://github.com/dprischak/Foundry-Card',
});
