
import { debounce, fireEvent, getActionConfig } from "./utils.js";

class FoundryGaugeCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._resizeObserver = null;

    // High needle tracking
    this._highNeedleValue = null;
    this._highNeedleTimeout = null;

    // Shake animation tracking
    this._isShaking = false;
    this._shakeTargetAngle = null;

    // Needle angle tracking
    this._previousNeedleAngle = null;
    this._previousHighNeedleAngle = null;
    this._previousValue = null;
    this._previousHighValue = null;

    // Error state tracking
    this._entityError = null;

    this._boundHandleClick = () => this._handleAction("tap");
    this._boundHandleDblClick = () => this._handleAction("double_tap");
    this._boundHandleContextMenu = (e) => {
      e.preventDefault();
      this._handleAction("hold");
    };
    this._boundHandleKeyDown = (e) => this._handleKeyDown(e);

    // Debounced resize handler for better performance
    this._debouncedReflow = debounce(() => this._reflowFlipDisplay(), 100);
  }

  connectedCallback() {
    // Reflow the odometer when container-query sizes change (e.g., devtools open/close)
    if (!this._resizeObserver) {
      this._resizeObserver = new ResizeObserver(this._debouncedReflow);
    }

    // Observe the gauge container once it exists
    const container = this.shadowRoot?.querySelector('.gauge-container');
    if (container) this._resizeObserver.observe(container);
  }

  disconnectedCallback() {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }
  }

  _reflowFlipDisplay() {
    const flipDisplay = this.shadowRoot?.getElementById('flipDisplay');
    if (!flipDisplay || !this.config) return;

    const raw = flipDisplay.dataset.numericValue;
    if (raw === undefined || raw === null || raw === '') return;

    const value = parseFloat(raw);
    if (Number.isNaN(value)) return;

    // Recalculate all digit positions with current actual heights
    const digitsRow = flipDisplay.querySelector('.digits-row');
    if (!digitsRow) return;

    const digitElements = Array.from(digitsRow.children).filter(el =>
      el.classList.contains('flip-digit') &&
      !el.classList.contains('decimal') &&
      !el.classList.contains('minus-sign') &&
      !el.classList.contains('unit')
    );

    digitElements.forEach(digitEl => {
      const inner = digitEl.querySelector('.flip-digit-inner');
      const position = digitEl.dataset.position;

      if (inner && position !== undefined) {
        const targetDigit = parseInt(position);

        // Recalculate with current actual height using getComputedStyle
        const digitItem = inner.querySelector('.digit-item');
        if (!digitItem) return;

        const computedStyle = window.getComputedStyle(digitItem);
        const digitHeight = parseFloat(computedStyle.height) || 28;
        const offset = Math.round(-targetDigit * digitHeight);

        // Apply without transition
        inner.style.transition = 'none';
        inner.style.transform = `translateY(${offset}px)`;

        // Re-enable transition on next frame
        requestAnimationFrame(() => {
          inner.style.transition = '';
        });
      }
    });
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('You need to define an entity');
    }

    // IMPORTANT: HA may pass a frozen config object. Clone it before adding defaults.
    this.config = { ...config };

    // Validate and sanitize configuration
    this._validateConfig();

    // Default behavior like built-in cards
    if (!this.config.tap_action) {
      this.config.tap_action = { action: "more-info" };
    }

    // Default ring style to brass if not specified
    if (this.config.ring_style === undefined) {
      this.config.ring_style = 'brass';
    }

    this._uniqueId = Math.random().toString(36).substr(2, 9);
    this.render();
    if (this._hass) {
      requestAnimationFrame(() => this.updateGauge());
    }
  }

  _validateConfig() {
    const config = this.config;

    // Validate min/max
    const min = config.min !== undefined ? config.min : 0;
    const max = config.max !== undefined ? config.max : 100;
    if (min >= max) {
      console.warn('Foundry Gauge Card: min value must be less than max value. Using defaults.');
      this.config.min = 0;
      this.config.max = 100;
    }

    // Validate decimals (must be non-negative integer)
    if (config.decimals !== undefined) {
      const decimals = parseInt(config.decimals);
      if (isNaN(decimals) || decimals < 0) {
        console.warn('Foundry Gauge Card: decimals must be a non-negative integer. Using 0.');
        this.config.decimals = 0;
      } else {
        this.config.decimals = Math.min(decimals, 10); // Cap at 10 decimals
      }
    }

    // Validate angle ranges (0-360)
    if (config.start_angle !== undefined) {
      const angle = parseFloat(config.start_angle);
      if (isNaN(angle)) {
        this.config.start_angle = 200;
      } else {
        this.config.start_angle = ((angle % 360) + 360) % 360; // Normalize to 0-360
      }
    }
    if (config.end_angle !== undefined) {
      const angle = parseFloat(config.end_angle);
      if (isNaN(angle)) {
        this.config.end_angle = 160;
      } else {
        this.config.end_angle = ((angle % 360) + 360) % 360; // Normalize to 0-360
      }
    }

    // Validate animation duration (must be positive)
    if (config.animation_duration !== undefined) {
      const duration = parseFloat(config.animation_duration);
      if (isNaN(duration) || duration <= 0) {
        console.warn('Foundry Gauge Card: animation_duration must be positive. Using 1.2s.');
        this.config.animation_duration = 1.2;
      } else {
        this.config.animation_duration = Math.min(duration, 10); // Cap at 10 seconds
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
        this.config.aged_texture_intensity = 50;
      } else {
        this.config.aged_texture_intensity = Math.max(0, Math.min(100, intensity));
      }
    }

    // Validate high needle settings
    if (config.high_needle_duration !== undefined) {
      const duration = parseFloat(config.high_needle_duration);
      if (isNaN(duration) || duration <= 0) {
        this.config.high_needle_duration = 60;
      } else {
        this.config.high_needle_duration = Math.max(1, duration); // At least 1 second
      }
    }
    if (config.high_needle_length !== undefined) {
      const length = parseFloat(config.high_needle_length);
      if (isNaN(length)) {
        this.config.high_needle_length = 100;
      } else {
        this.config.high_needle_length = Math.max(25, Math.min(150, length));
      }
    }
  }

  set hass(hass) {
    this._hass = hass;
    if (!this.config) return;
    if (!this.shadowRoot) return;
    this.updateGauge();
  }

  render() {
    const config = this.config;
    const title = config.title || '';
    const min = config.min !== undefined ? config.min : 0;
    const max = config.max !== undefined ? config.max : 100;
    const unit = config.unit || '';
    const uid = this._uniqueId;
    const animationDuration = config.animation_duration !== undefined ? config.animation_duration : 1.2;
    const titleFontSize = config.title_font_size !== undefined ? config.title_font_size : 12;
    const odometerFontSize = config.odometer_font_size !== undefined ? config.odometer_font_size : 60;

    // Fixed pixel sizes relative to the 200x200 SVG coordinate system
    // This ensures consistent scaling with the rest of the SVG
    const odoFont = `${odometerFontSize * 0.16}px`;
    const odoDigitW = `${odometerFontSize * 0.15}px`;
    const odoDigitH = `${odometerFontSize * 0.22}px`;
    const odoGap = `${odometerFontSize * 0.03}px`;


    const odometerVerticalPosition = config.odometer_vertical_position !== undefined ? config.odometer_vertical_position : 120;
    const ringStyle = config.ring_style !== undefined ? config.ring_style : 'brass';
    const rimData = this.getRimStyleData(ringStyle, uid);
    const rivetColor = config.rivet_color !== undefined ? config.rivet_color : '#6d5d4b';
    const highNeedleEnabled = config.high_needle_enabled !== undefined ? config.high_needle_enabled : false;
    const highNeedleColor = config.high_needle_color !== undefined ? config.high_needle_color : '#FF9800';
    const highNeedleLength = config.high_needle_length !== undefined ? config.high_needle_length : 100;
    const plateColor = config.plate_color !== undefined ? config.plate_color : 'transparent';
    const plateTransparent = config.plate_transparent !== undefined ? config.plate_transparent : false;
    const wearLevel = config.wear_level !== undefined ? config.wear_level : 50;
    const glassEffectEnabled = config.glass_effect_enabled !== undefined ? config.glass_effect_enabled : true;
    const agedTexture = config.aged_texture !== undefined ? config.aged_texture : 'glass_only';
    const agedTextureIntensity = config.aged_texture_intensity !== undefined ? config.aged_texture_intensity : 50;
    const agedTextureOpacity = ((100 - agedTextureIntensity) / 100) * 1.0;
    // If plate is transparent and aged_texture is everywhere, treat as glass_only
    const effectiveAgedTexture = (plateTransparent && agedTexture === 'everywhere') ? 'glass_only' : agedTexture;
    const agedTextureEnabled = effectiveAgedTexture === 'glass_only';

    // Angle configuration (0 = top, clockwise)
    // Convert from 0=top to SVG coordinate system where 0=right
    const startAngleDeg = config.start_angle !== undefined ? config.start_angle : 200;
    const endAngleDeg = config.end_angle !== undefined ? config.end_angle : 160;
    // Convert to SVG coordinates (subtract 90 because SVG 0° is right, we want 0° to be top)
    this._startAngle = startAngleDeg - 90;
    this._endAngle = endAngleDeg - 90;
    this._animationDuration = animationDuration;

    // Default segments if not specified
    const segments = config.segments || [
      { from: 0, to: 33, color: '#4CAF50' },
      { from: 33, to: 66, color: '#FFC107' },
      { from: 66, to: 100, color: '#F44336' }
    ];

    this.shadowRoot.innerHTML = `
      <style>
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
        .title {
          text-align: center;
          font-size: 18px;
          font-weight: bold;
          color: #3e2723;
          margin-bottom: 10px;
          font-family: 'Georgia', serif;
          text-shadow: 1px 1px 2px rgba(255,255,255,0.5);
        }
        .gauge-container {
          position: relative;
          width: 100%;
          max-width: 400px;
          margin: 0 auto;
          container-type: inline-size;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-3px) rotate(-0.5deg); }
          20%, 40%, 60%, 80% { transform: translateX(3px) rotate(0.5deg); }
        }
        .gauge-container.shaking {
          animation: shake 0.25s ease-in-out;
        }
        .gauge-svg {
          width: 100%;
          height: auto;
          filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.3));
        }
        .value-display {
          display: flex;
          flex-direction: column;
          gap: ${odoGap};
          justify-content: flex-start;
          align-items: center;
          pointer-events: none;
          width: 200px;
          height: 200px;
          padding-top: ${odometerVerticalPosition}px;
        }
        .digits-row {
          display: flex;
          gap: ${odoGap};
          justify-content: center;
          align-items: center;
        }
        .flip-digit {
          background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 50%, #0a0a0a 100%);
          color: #f0f0f0;
          font-family: 'Courier New', monospace;
          font-size: ${odoFont};
          font-weight: bold;
          width: ${odoDigitW};
          height: ${odoDigitH};
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: ${odoGap};
          box-shadow: 
            inset 0 1px 2px rgba(255,255,255,0.2),
            inset 0 -1px 2px rgba(0,0,0,0.5),
            0 2px 4px rgba(0,0,0,0.4);
          border: 1px solid #3a3a3a;
          position: relative;
          overflow: hidden;
        }
        .flip-digit::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0,0,0,0.6), transparent);
          box-shadow: 0 0 2px rgba(0,0,0,0.8);
        }
       .flip-digit.decimal {
          width: ${odoDigitW};
          background: white;
          color: black;
          box-shadow: 0 2px 4px rgba(0,0,0,0.4);
          border: 1px solid #3a3a3a;
        }
        .flip-digit.fractional {
          background: white;
          color: black;
          box-shadow: 0 2px 4px rgba(0,0,0,0.4);
          border: 1px solid #3a3a3a;
        }
        .flip-digit.fractional::before {
          display: none;
        }
        .flip-digit.fractional .digit-item {
          color: black;
        }
        .flip-digit.minus-sign {
          width: ${odoDigitW};
          /* Keep same background and styling as regular digits */
        }
        .flip-digit.minus-sign::before {
          /* Keep the center line like regular digits */
        }
        .flip-digit.unit {
          background: transparent;
          color: #2c1810;
          font-family: 'Georgia', serif;
          font-size: ${odoFont};
          width: auto;
          height: auto;
          box-shadow: none;
          border: none;
          text-shadow: 1px 1px 2px rgba(255,255,255,0.5);
        }
        .flip-digit.unit::before {
          display: none;
        }
        .flip-digit-inner {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: transform ${animationDuration}s ease-out;
          will-change: transform;
        }
        .digit-item {
          width: 100%;
          height:  ${odoDigitH};
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          line-height: 1;
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
      <ha-card role="img" aria-label="${title ? title.replace(/\\\\n/g, ' ') : 'Foundry gauge'} showing ${config.entity}" tabindex="0">
        <div class="card" id="actionRoot">
          <div class="gauge-container" role="presentation">
            <svg class="gauge-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="presentation" aria-hidden="true">
              <defs>
                <!-- Gradient for gauge face -->
                <radialGradient id="gaugeFace-${uid}" cx="50%" cy="50%">
                  <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
                  <stop offset="85%" style="stop-color:#f8f8f0;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#d4d4c8;stop-opacity:1" />
                </radialGradient>
                
                <!-- Gradient for brass rim -->
                <linearGradient id="brassRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#c9a961;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#ddc68f;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#b8944d;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#d4b877;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#a68038;stop-opacity:1" />
                </linearGradient>
                
                <!-- Gradient for silver rim -->
                <linearGradient id="silverRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#e8e8e8;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#ffffff;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#c0c0c0;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#e0e0e0;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#b0b0b0;stop-opacity:1" />
                </linearGradient>
				
				<!-- White rim -->
				<linearGradient id="whiteRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
				  <stop offset="0%"   style="stop-color:#f6f6f6;stop-opacity:1" />
				  <stop offset="25%"  style="stop-color:#ffffff;stop-opacity:1" />
				  <stop offset="50%"  style="stop-color:#dcdcdc;stop-opacity:1" />
				  <stop offset="75%"  style="stop-color:#f0f0f0;stop-opacity:1" />
				  <stop offset="100%" style="stop-color:#cfcfcf;stop-opacity:1" />
				</linearGradient>

				<!-- Blue rim -->
				<linearGradient id="blueRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
				  <stop offset="0%"   style="stop-color:#2a6fdb;stop-opacity:1" />
				  <stop offset="25%"  style="stop-color:#5ea2ff;stop-opacity:1" />
				  <stop offset="50%"  style="stop-color:#1f4f9e;stop-opacity:1" />
				  <stop offset="75%"  style="stop-color:#4f8fe6;stop-opacity:1" />
				  <stop offset="100%" style="stop-color:#163b76;stop-opacity:1" />
				</linearGradient>

				<!-- Green rim -->
				<linearGradient id="greenRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
				  <stop offset="0%"   style="stop-color:#2fbf71;stop-opacity:1" />
				  <stop offset="25%"  style="stop-color:#6fe0a6;stop-opacity:1" />
				  <stop offset="50%"  style="stop-color:#1f7a49;stop-opacity:1" />
				  <stop offset="75%"  style="stop-color:#53cf8e;stop-opacity:1" />
				  <stop offset="100%" style="stop-color:#165a36;stop-opacity:1" />
				</linearGradient>

				<!-- Red rim -->
				<linearGradient id="redRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
				  <stop offset="0%"   style="stop-color:#e53935;stop-opacity:1" />
				  <stop offset="25%"  style="stop-color:#ff6f6c;stop-opacity:1" />
				  <stop offset="50%"  style="stop-color:#9e1f1c;stop-opacity:1" />
				  <stop offset="75%"  style="stop-color:#e85a57;stop-opacity:1" />
				  <stop offset="100%" style="stop-color:#6f1513;stop-opacity:1" />
				</linearGradient>

				<!-- Typical gauge options -->

				<!-- Black / gunmetal -->
				<linearGradient id="blackRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
				  <stop offset="0%"   style="stop-color:#3a3a3a;stop-opacity:1" />
				  <stop offset="25%"  style="stop-color:#555555;stop-opacity:1" />
				  <stop offset="50%"  style="stop-color:#1f1f1f;stop-opacity:1" />
				  <stop offset="75%"  style="stop-color:#444444;stop-opacity:1" />
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
                <filter id="aged-${uid}" x="-50%" y="-50%" width="200%" height="200%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise"/>
                  <feColorMatrix in="noise" type="saturate" values="0" result="desaturatedNoise"/>
                  <feComponentTransfer result="grainTexture">
                    <feFuncR type="linear" slope="${1 - agedTextureOpacity}" intercept="${agedTextureOpacity}"/>
                    <feFuncG type="linear" slope="${1 - agedTextureOpacity}" intercept="${agedTextureOpacity}"/>
                    <feFuncB type="linear" slope="${1 - agedTextureOpacity}" intercept="${agedTextureOpacity}"/>
                  </feComponentTransfer>
                  <feBlend in="SourceGraphic" in2="grainTexture" mode="multiply"/>
                </filter>
                
                <!-- Clip path for gauge face to contain aged texture -->
                <clipPath id="gaugeFaceClip-${uid}">
                  <circle cx="100" cy="100" r="85"/>
                </clipPath>
              </defs>
              <rect x="0" y="0" width="200" height="200" fill="${plateTransparent ? 'rgba(240, 235, 225, 0.15)' : plateColor}" ${effectiveAgedTexture === 'everywhere' ? `filter="url(#aged-${uid})"` : ''} />
              ${this.renderRim(ringStyle, uid)}
              
              <!-- Gauge face -->
              <circle cx="100" cy="100" r="85" fill="url(#gaugeFace-${uid})" ${(agedTextureEnabled || effectiveAgedTexture === 'everywhere') ? `filter="url(#aged-${uid})" clip-path="url(#gaugeFaceClip-${uid})"` : ''}/>
                            

              <!-- Glass effect overlay -->
              ${glassEffectEnabled ? '<ellipse cx="100" cy="80" rx="60" ry="50" fill="white" opacity="0.15"/>' : ''}
              
              <!-- Segment arcs -->
              <g id="segments"></g>
              
              <!-- Tick marks -->
              <g id="ticks"></g>
              
              <!-- Numbers -->
              <g id="numbers"></g>
              
              <!-- Title text -->
              ${title ? this.renderTitleText(title, titleFontSize) : ''}
              
              <!-- Center hub background -->
			  <circle cx="100" cy="100" r="12"
				fill="${rimData ? `url(#${rimData.grad})` : '#c9a961'}"
				stroke="#6d5d4b" stroke-width="1"/>
              <circle cx="100" cy="100" r="8" fill="#4a4034" opacity="0.6"/>
              
              <!-- Odometer embedded in SVG (rendered before needle) -->
              <foreignObject x="0" y="0" width="200" height="200">
                <div xmlns="http://www.w3.org/1999/xhtml" class="value-display" id="flipDisplay"></div>
              </foreignObject>
              
              <!-- Hidden ARIA live region for accessibility -->
              <foreignObject x="0" y="0" width="1" height="1" style="overflow: hidden;">
                <div xmlns="http://www.w3.org/1999/xhtml" id="ariaLive" aria-live="polite" aria-atomic="true" style="position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;"></div>
              </foreignObject>
              
              <!-- High needle (rendered before main needle if enabled) -->
              ${highNeedleEnabled ? this.renderHighNeedle(highNeedleColor, highNeedleLength, animationDuration) : ''}
              
              <!-- Needle (rendered after odometer so it's on top) -->
              <g id="needle" style="transform-origin: 100px 100px; transition: transform ${animationDuration}s ease-out;">
                <!-- Needle shadow -->
                <path d="M 100 100 L 95 95 L 97 30 L 100 25 L 103 30 L 105 95 Z" 
                      fill="rgba(0,0,0,0.3)" 
                      transform="translate(2,2)"/>
                <!-- Needle body -->
                <path d="M 100 100 L 95 95 L 97 30 L 100 25 L 103 30 L 105 95 Z" 
                      fill="#C41E3A" 
                      stroke="#8B0000" 
                      stroke-width="0.5"/>
                <!-- Needle highlight -->
                <path d="M 100 100 L 98 95 L 99 30 L 100 25 L 99.5 30 Z" 
                      fill="rgba(255,255,255,0.3)"/>
              </g>
              
              <!-- Needle stoppers -->
              <g id="stoppers"></g>
              
              <!-- Center rivet (on top of needle) -->
              <circle cx="100" cy="100" r="5" class="rivet"/>
              <circle cx="100" cy="100" r="3.5" class="screw-detail"/>
              <line x1="97" y1="100" x2="103" y2="100" class="screw-detail"/>
              
              <!-- Corner rivets -->
              <!-- Top left -->
              <circle cx="20" cy="20" r="4" class="rivet"/>
              <circle cx="20" cy="20" r="2.5" class="screw-detail"/>
              <line x1="17" y1="20" x2="23" y2="20" class="screw-detail"/>
              
              <!-- Top right -->
              <circle cx="180" cy="20" r="4" class="rivet"/>
              <circle cx="180" cy="20" r="2.5" class="screw-detail"/>
              <line x1="177" y1="20" x2="183" y2="20" class="screw-detail"/>
              
              <!-- Bottom left -->
              <circle cx="20" cy="180" r="4" class="rivet"/>
              <circle cx="20" cy="180" r="2.5" class="screw-detail"/>
              <line x1="17" y1="180" x2="23" y2="180" class="screw-detail"/>
              
              <!-- Bottom right -->
              <circle cx="180" cy="180" r="4" class="rivet"/>
              <circle cx="180" cy="180" r="2.5" class="screw-detail"/>
              <line x1="177" y1="180" x2="183" y2="180" class="screw-detail"/>
              
              <!-- Age spots and wear marks -->
              ${this.renderWearMarks(wearLevel)}
            </svg>
          </div>
        </div>
      </ha-card>
    `;
    this._attachActionListeners();
    this.drawSegments(segments, min, max);
    this.drawTicks(min, max);
    this.drawStoppers();
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      const container = this.shadowRoot?.querySelector('.gauge-container');
      if (container) this._resizeObserver.observe(container);
    }

    // One extra reflow on next frame so container-query sizes settle
    requestAnimationFrame(() => this._reflowFlipDisplay());
  }
  _attachActionListeners() {
    const root = this.shadowRoot?.getElementById("actionRoot");
    if (!root) return;

    // Remove old listeners (render() can run many times)
    root.removeEventListener("click", this._boundHandleClick);
    root.removeEventListener("dblclick", this._boundHandleDblClick);
    root.removeEventListener("contextmenu", this._boundHandleContextMenu);
    root.removeEventListener("keydown", this._boundHandleKeyDown);

    // Add listeners
    root.addEventListener("click", this._boundHandleClick, { passive: true });
    root.addEventListener("dblclick", this._boundHandleDblClick, { passive: true });
    root.addEventListener("contextmenu", this._boundHandleContextMenu);
    root.addEventListener("keydown", this._boundHandleKeyDown);
  }

  _handleKeyDown(e) {
    // Enter or Space activates tap action
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._handleAction("tap");
    }
    // 'h' or long press simulation not practical, so just use Enter/Space
  }

  _findDirectionalPath(currentAngle, targetAngle, valueIncreasing) {
    // If no previous angle, return target as-is
    if (currentAngle === null) return targetAngle;

    // Calculate the difference
    let diff = targetAngle - currentAngle;

    // Normalize difference to -180 to 180 range
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;

    // If value is increasing, ensure we rotate clockwise (positive direction)
    // If value is decreasing, ensure we rotate counter-clockwise (negative direction)
    if (valueIncreasing !== null) {
      if (valueIncreasing && diff < 0) {
        // Value increasing but would rotate counter-clockwise, add 360 to go clockwise
        diff += 360;
      } else if (!valueIncreasing && diff > 0) {
        // Value decreasing but would rotate clockwise, subtract 360 to go counter-clockwise
        diff -= 360;
      }
    }

    // Return the adjusted target angle
    return currentAngle + diff;
  }

  _handleAction(kind) {
    if (!this._hass || !this.config) return;

    const entityId = this.config.entity;

    const tap = getActionConfig(this.config, "tap_action", { action: "more-info" });
    const hold = getActionConfig(this.config, "hold_action", { action: "more-info" });
    const dbl = getActionConfig(this.config, "double_tap_action", { action: "more-info" });

    const actionConfig =
      kind === "hold" ? hold :
        kind === "double_tap" ? dbl :
          tap;

    // Check if action is "shake" - custom action for this card
    if (actionConfig?.action === "shake") {
      this._shakeGauge();
      return;
    }

    this._runAction(actionConfig, entityId);
  }

  _shakeGauge() {
    if (this._isShaking) return; // Already shaking
    if (!this._hass || !this.config) return;

    const entity = this._hass.states[this.config.entity];
    if (!entity) return;

    const value = parseFloat(entity.state);
    if (isNaN(value)) return;

    const min = this.config.min !== undefined ? this.config.min : 0;
    const max = this.config.max !== undefined ? this.config.max : 100;
    const range = max - min;
    const clampedValue = Math.max(min, Math.min(max, value));

    // Calculate random deviation between 10% and 50% of the range
    const deviationPercent = 0.10 + Math.random() * 0.40; // 10% to 50%
    const deviation = range * deviationPercent * (Math.random() > 0.5 ? 1 : -1);
    const targetValue = Math.max(min, Math.min(max, clampedValue + deviation));

    // Calculate the target angle
    const valuePosition = Math.max(0, Math.min(1, (targetValue - min) / range));
    const startAngle = this._startAngle;
    const endAngle = this._endAngle;
    const totalAngle = endAngle >= startAngle ? endAngle - startAngle : (360 - startAngle) + endAngle;
    let targetGaugeAngle = startAngle + (totalAngle * valuePosition);

    // Normalize angle
    while (targetGaugeAngle > 180) targetGaugeAngle -= 360;
    while (targetGaugeAngle < -180) targetGaugeAngle += 360;

    // Store shake state
    this._isShaking = true;
    this._shakeTargetAngle = targetGaugeAngle + 90; // Add 90° compensation

    const needle = this.shadowRoot.getElementById('needle');
    if (!needle) return;

    // Shake the whole gauge container
    const gaugeContainer = this.shadowRoot.querySelector('.gauge-container');
    if (gaugeContainer) {
      gaugeContainer.classList.add('shaking');
      setTimeout(() => {
        gaugeContainer.classList.remove('shaking');
      }, 250);
    }

    // Apply quick shake movement (0.3s to target position)
    needle.style.transition = 'transform 0.3s ease-out';
    needle.style.transform = `rotate(${this._shakeTargetAngle}deg)`;

    // After shake, settle back to actual value over 3 seconds
    setTimeout(() => {
      if (needle) {
        needle.style.transition = 'transform 3s cubic-bezier(0.4, 0.0, 0.2, 1)';
        this._isShaking = false;
        this._shakeTargetAngle = null;
        // Trigger normal update to return to actual value
        this.updateGauge();
      }
    }, 300);
  }

  _runAction(actionConfig, entityId) {
    const action = actionConfig?.action;

    if (!action || action === "none") return;

    // 1) more-info
    if (action === "more-info") {
      fireEvent(this, "hass-more-info", { entityId });
      return;
    }

    // 2) navigate
    if (action === "navigate") {
      const path = actionConfig.navigation_path;
      if (!path) return;
      history.pushState(null, "", path);
      fireEvent(window, "location-changed", { replace: false });
      return;
    }

    // 3) toggle (HA shorthand used by some cards)
    if (action === "toggle") {
      if (!entityId) return;
      this._hass.callService("homeassistant", "toggle", { entity_id: entityId });
      return;
    }

    // 4) call-service
    if (action === "call-service") {
      const service = actionConfig.service; // "domain.service"
      if (!service) return;
      const [domain, srv] = service.split(".");
      if (!domain || !srv) return;

      const data = { ...(actionConfig.service_data || {}) };

      // Support target.entity_id if present (HA UI sometimes sets target)
      if (actionConfig.target?.entity_id) data.entity_id = actionConfig.target.entity_id;

      this._hass.callService(domain, srv, data);
      return;
    }

    // Unknown action type -> do nothing (safe)
  }

  renderTitleText(title, fontSize) {
    // Split title by newlines - handle both literal \n typed in input and actual newlines
    const lines = title.replace(/\\n/g, '\n').split('\n').slice(0, 3); // Max 3 lines
    const lineHeight = fontSize * 1.2; // 20% spacing between lines
    const totalHeight = (lines.length - 1) * lineHeight;
    const startY = 75 - (totalHeight / 2); // Center vertically around y=75

    return lines.map((line, index) => {
      const y = startY + (index * lineHeight);
      return `<text x="100" y="${y}" text-anchor="middle" font-size="${fontSize}" font-weight="bold" fill="#3e2723" font-family="Georgia, serif" style="text-shadow: 1px 1px 2px rgba(255,255,255,0.5);">${line}</text>`;
    }).join('\n');
  }
  getRimStyleData(ringStyle, uid) {
    switch (ringStyle) {
      case "brass":
        return { grad: `brassRim-${uid}`, stroke: "#8B7355" };
      case "silver":
      case "chrome":
        return { grad: `silverRim-${uid}`, stroke: "#999999" };

      case "white":
        return { grad: `whiteRim-${uid}`, stroke: "#cfcfcf" };
      case "blue":
        return { grad: `blueRim-${uid}`, stroke: "#1e4f8f" };
      case "green":
        return { grad: `greenRim-${uid}`, stroke: "#1f6b3a" };
      case "red":
        return { grad: `redRim-${uid}`, stroke: "#8f1e1e" };
      case "black":
        return { grad: `blackRim-${uid}`, stroke: "#2b2b2b" };
      case "copper":
        return { grad: `copperRim-${uid}`, stroke: "#8b5a2b" };

      default:
        return null; // "none" or unknown
    }
  }
  renderRim(ringStyle, uid) {
    const data = this.getRimStyleData(ringStyle, uid);
    if (!data) return ""; // none

    return `
		<circle cx="100" cy="100" r="95" fill="url(#${data.grad})" stroke="${data.stroke}" stroke-width="2"/>
		<circle cx="100" cy="100" r="88" fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="3"/>
	  `;
  }

  renderHighNeedle(color, lengthPercent, animationDuration) {
    // Calculate needle length based on percentage (100% = 75 units, from center at 100 to tip at 25)
    const baseLength = 75;
    const actualLength = baseLength * (lengthPercent / 100);
    const tipY = 100 - actualLength; // Center is at 100, needle points up
    const nearTipY = tipY + 5; // 5 units from tip for the taper

    return `
              <g id="highNeedle" style="transform-origin: 100px 100px; transition: transform ${animationDuration}s ease-out;">
                <!-- High needle shadow -->
                <path d="M 100 100 L 95 95 L 97 ${nearTipY} L 100 ${tipY} L 103 ${nearTipY} L 105 95 Z" 
                      fill="rgba(0,0,0,0.3)" 
                      transform="translate(2,2)"/>
                <!-- High needle body -->
                <path d="M 100 100 L 95 95 L 97 ${nearTipY} L 100 ${tipY} L 103 ${nearTipY} L 105 95 Z" 
                      fill="${color}" 
                      stroke="${this.darkenColor(color, 0.3)}" 
                      stroke-width="0.5"
                      opacity="1.0"/>
                <!-- High needle highlight -->
                <path d="M 100 100 L 98 95 L 99 ${nearTipY} L 100 ${tipY} L 99.5 ${nearTipY} Z" 
                      fill="rgba(255,255,255,0.3)"/>
              </g>
    `;
  }

  renderWearMarks(wearLevel) {
    // Scale from 0-100: 0 = no marks, 100 = maximum marks
    if (wearLevel === 0) return '';

    // Base opacity scales with wear level (0 to 0.25 max)
    const baseOpacity = (wearLevel / 100) * 0.25;

    // Define all possible wear marks with their properties
    const allMarks = [
      { type: 'circle', cx: 45, cy: 60, r: 2, fill: '#8B7355', baseOpacity: 0.2 },
      { type: 'circle', cx: 155, cy: 75, r: 1.5, fill: '#8B7355', baseOpacity: 0.15 },
      { type: 'circle', cx: 70, cy: 120, r: 1, fill: '#6d5d4b', baseOpacity: 0.2 },
      { type: 'ellipse', cx: 130, cy: 50, rx: 3, ry: 1.5, fill: '#8B7355', baseOpacity: 0.1 },
      { type: 'circle', cx: 35, cy: 140, r: 1.2, fill: '#8B7355', baseOpacity: 0.12 },
      { type: 'circle', cx: 165, cy: 130, r: 1.8, fill: '#6d5d4b', baseOpacity: 0.18 },
      { type: 'ellipse', cx: 50, cy: 90, rx: 2, ry: 1, fill: '#8B7355', baseOpacity: 0.08 },
      { type: 'circle', cx: 120, cy: 145, r: 0.8, fill: '#6d5d4b', baseOpacity: 0.15 },
      { type: 'circle', cx: 180, cy: 65, r: 1.3, fill: '#8B7355', baseOpacity: 0.1 },
      { type: 'ellipse', cx: 25, cy: 100, rx: 2.5, ry: 1.2, fill: '#6d5d4b', baseOpacity: 0.09 }
    ];

    // Calculate how many marks to show based on wear level
    const markCount = Math.ceil((wearLevel / 100) * allMarks.length);
    const marksToShow = allMarks.slice(0, markCount);

    // Generate SVG for visible marks
    return marksToShow.map(mark => {
      const opacity = Math.min(mark.baseOpacity * (wearLevel / 50), 0.25);
      if (mark.type === 'circle') {
        return `<circle cx="${mark.cx}" cy="${mark.cy}" r="${mark.r}" fill="${mark.fill}" opacity="${opacity}"/>`;
      } else if (mark.type === 'ellipse') {
        return `<ellipse cx="${mark.cx}" cy="${mark.cy}" rx="${mark.rx}" ry="${mark.ry}" fill="${mark.fill}" opacity="${opacity}"/>`;
      }
      return '';
    }).join('\n              ');
  }

  drawSegments(segments, min, max) {
    const segmentsGroup = this.shadowRoot.getElementById('segments');
    const centerX = 100;
    const centerY = 100;
    const radius = 70;
    const startAngle = this._startAngle;
    const endAngle = this._endAngle;
    // Handle wrapping around 360 degrees
    const totalAngle = endAngle >= startAngle ? endAngle - startAngle : (360 - startAngle) + endAngle;

    segments.forEach(segment => {
      const fromPercent = ((segment.from - min) / (max - min)) * 100;
      const toPercent = ((segment.to - min) / (max - min)) * 100;

      const segmentStartAngle = startAngle + (totalAngle * fromPercent / 100);
      const segmentEndAngle = startAngle + (totalAngle * toPercent / 100);

      const path = this.describeArc(centerX, centerY, radius, segmentStartAngle, segmentEndAngle);

      const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pathElement.setAttribute('d', path);
      pathElement.setAttribute('fill', 'none');
      pathElement.setAttribute('stroke', segment.color);
      pathElement.setAttribute('stroke-width', '8');
      pathElement.setAttribute('opacity', '0.7');

      segmentsGroup.appendChild(pathElement);
    });
  }

  drawTicks(min, max) {
    const ticksGroup = this.shadowRoot.getElementById('ticks');
    const numbersGroup = this.shadowRoot.getElementById('numbers');
    const centerX = 100;
    const centerY = 100;
    const startAngle = this._startAngle;
    const endAngle = this._endAngle;
    // Handle wrapping around 360 degrees
    const totalAngle = endAngle >= startAngle ? endAngle - startAngle : (360 - startAngle) + endAngle;
    const numTicks = 10;

    // Clear any existing ticks and numbers
    ticksGroup.innerHTML = '';
    numbersGroup.innerHTML = '';

    for (let i = 0; i <= numTicks; i++) {
      let angle = startAngle + (totalAngle * i / numTicks);
      // Normalize angle to -180 to 180 range for proper rendering
      while (angle > 180) angle -= 360;
      while (angle < -180) angle += 360;
      const angleRad = (angle * Math.PI) / 180;

      // Major tick
      const innerRadius = 77;
      const outerRadius = 85;

      const x1 = centerX + innerRadius * Math.cos(angleRad);
      const y1 = centerY + innerRadius * Math.sin(angleRad);
      const x2 = centerX + outerRadius * Math.cos(angleRad);
      const y2 = centerY + outerRadius * Math.sin(angleRad);

      const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      tick.setAttribute('x1', x1);
      tick.setAttribute('y1', y1);
      tick.setAttribute('x2', x2);
      tick.setAttribute('y2', y2);
      tick.setAttribute('stroke', '#3e2723');
      tick.setAttribute('stroke-width', '2');
      ticksGroup.appendChild(tick);

      // Numbers
      const value = min + ((max - min) * i / numTicks);
      const textRadius = 65;
      const textX = centerX + textRadius * Math.cos(angleRad);
      const textY = centerY + textRadius * Math.sin(angleRad);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', textX);
      text.setAttribute('y', textY);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('font-size', '9');
      text.setAttribute('font-weight', 'bold');
      text.setAttribute('fill', '#3e2723');
      text.setAttribute('font-family', 'Georgia, serif');
      const displayValue = (max - min) <= 10 ? value.toFixed(1) : Math.round(value);
      text.textContent = displayValue;
      numbersGroup.appendChild(text);

      // Minor ticks
      if (i < numTicks) {
        for (let j = 1; j < 5; j++) {
          const minorAngle = angle + (totalAngle / numTicks) * (j / 5);
          const minorAngleRad = (minorAngle * Math.PI) / 180;

          const mx1 = centerX + 80 * Math.cos(minorAngleRad);
          const my1 = centerY + 80 * Math.sin(minorAngleRad);
          const mx2 = centerX + 85 * Math.cos(minorAngleRad);
          const my2 = centerY + 85 * Math.sin(minorAngleRad);

          const minorTick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          minorTick.setAttribute('x1', mx1);
          minorTick.setAttribute('y1', my1);
          minorTick.setAttribute('x2', mx2);
          minorTick.setAttribute('y2', my2);
          minorTick.setAttribute('stroke', '#5d4e37');
          minorTick.setAttribute('stroke-width', '1');
          ticksGroup.appendChild(minorTick);
        }
      }
    }
  }

  drawStoppers() {
    const stoppersGroup = this.shadowRoot.getElementById('stoppers');
    if (!stoppersGroup) return;

    const centerX = 100;
    const centerY = 100;
    const startAngle = this._startAngle;
    const endAngle = this._endAngle;

    // Draw stopper at start angle (min value)
    const startAngleRad = (startAngle * Math.PI) / 180;
    const startX = centerX + 75 * Math.cos(startAngleRad);
    const startY = centerY + 75 * Math.sin(startAngleRad);

    const startStopper = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    startStopper.setAttribute('cx', startX);
    startStopper.setAttribute('cy', startY);
    startStopper.setAttribute('r', '3');
    startStopper.setAttribute('fill', '#8B0000');
    startStopper.setAttribute('stroke', '#4a4034');
    startStopper.setAttribute('stroke-width', '0.5');
    stoppersGroup.appendChild(startStopper);

    // Draw stopper at end angle (max value)
    const endAngleRad = (endAngle * Math.PI) / 180;
    const endX = centerX + 75 * Math.cos(endAngleRad);
    const endY = centerY + 75 * Math.sin(endAngleRad);

    const endStopper = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
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
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      "M", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  }

  polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }

  darkenColor(color, amount) {
    // Normalize to hex string
    if (Array.isArray(color) && color.length === 3) {
      const toHex = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
      color = `#${toHex(color[0])}${toHex(color[1])}${toHex(color[2])}`;
    }

    if (typeof color !== "string" || color.trim() === "") {
      color = "#000000";
    }

    // Convert hex to RGB, darken, and convert back
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    const newR = Math.max(0, Math.floor(r * (1 - amount)));
    const newG = Math.max(0, Math.floor(g * (1 - amount)));
    const newB = Math.max(0, Math.floor(b * (1 - amount)));

    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  updateGauge() {
    if (!this._hass || !this.config) return;

    const entity = this._hass.states[this.config.entity];

    // Handle missing or unavailable entity
    if (!entity) {
      this._handleEntityError('Entity not found');
      return;
    }

    // Handle unavailable/unknown states
    if (entity.state === 'unavailable' || entity.state === 'unknown') {
      this._handleEntityError(`Entity is ${entity.state}`);
      return;
    }

    // Try to parse the value with proper error handling
    let value;
    try {
      value = parseFloat(entity.state);
      if (isNaN(value)) {
        this._handleEntityError(`Non-numeric state: "${entity.state}"`);
        return;
      }
      // Clear any previous errors
      this._clearEntityError();
    } catch (error) {
      this._handleEntityError(`Error parsing state: ${error.message}`);
      return;
    }

    const min = this.config.min !== undefined ? this.config.min : 0;
    const max = this.config.max !== undefined ? this.config.max : 100;
    const highNeedleEnabled = this.config.high_needle_enabled !== undefined ? this.config.high_needle_enabled : false;
    const highNeedleDuration = this.config.high_needle_duration !== undefined ? this.config.high_needle_duration : 60;

    // Update flip display
    this.updateFlipDisplay(value);

    // Calculate the position of the value within the min-max range
    const range = max - min;
    const clampedValue = Math.max(min, Math.min(max, value));
    const valuePosition = Math.max(0, Math.min(1, (clampedValue - min) / range));

    // Use configured start and end angles
    const startAngle = this._startAngle;
    const endAngle = this._endAngle;
    // Handle wrapping around 360 degrees
    const totalAngle = endAngle >= startAngle ? endAngle - startAngle : (360 - startAngle) + endAngle;

    // Calculate gauge angle - always interpolate along the valid arc
    // to prevent needle from crossing the dead zone
    let gaugeAngle = startAngle + (totalAngle * valuePosition);

    // Normalize the calculated angle to -180 to 180 range first
    while (gaugeAngle > 180) gaugeAngle -= 360;
    while (gaugeAngle < -180) gaugeAngle += 360;

    // Now clamp to start/end angles, preventing crossing the dead zone
    if (endAngle >= startAngle) {
      // Normal range (no wrap) - simple clamping
      gaugeAngle = Math.max(startAngle, Math.min(endAngle, gaugeAngle));
    } else {
      // Wrapping range (crosses 0°)
      // Normalize start and end angles for comparison
      let normStart = startAngle;
      let normEnd = endAngle;
      while (normStart > 180) normStart -= 360;
      while (normStart < -180) normStart += 360;
      while (normEnd > 180) normEnd -= 360;
      while (normEnd < -180) normEnd += 360;

      // Check if needle is in the dead zone (between end and start)
      // Dead zone is from endAngle (moving clockwise) to startAngle
      const inDeadZone = normEnd < normStart ?
        (gaugeAngle > normEnd && gaugeAngle < normStart) :
        (gaugeAngle > normEnd || gaugeAngle < normStart);

      if (inDeadZone) {
        // Clamp to nearest boundary without crossing dead zone
        const distToStart = Math.min(
          Math.abs(gaugeAngle - normStart),
          Math.abs(gaugeAngle - normStart + 360),
          Math.abs(gaugeAngle - normStart - 360)
        );
        const distToEnd = Math.min(
          Math.abs(gaugeAngle - normEnd),
          Math.abs(gaugeAngle - normEnd + 360),
          Math.abs(gaugeAngle - normEnd - 360)
        );
        gaugeAngle = distToStart < distToEnd ? normStart : normEnd;
      }
    }

    // The needle SVG is drawn pointing UP (-90° in standard SVG coords)
    // So we need to add 90° to compensate
    let needleAngle = gaugeAngle + 90;

    const needle = this.shadowRoot.getElementById('needle');
    if (needle && !this._isShaking) {
      // Determine if value is increasing or decreasing
      let valueIncreasing = null;
      if (this._previousValue !== null) {
        valueIncreasing = clampedValue > this._previousValue;
      }

      // Use directional path to ensure correct rotation direction
      needleAngle = this._findDirectionalPath(this._previousNeedleAngle, needleAngle, valueIncreasing);
      needle.style.transform = `rotate(${needleAngle}deg)`;
      this._previousNeedleAngle = needleAngle;
      this._previousValue = clampedValue;

      // Update ARIA live region for accessibility
      this._updateAriaLive(value);
    }

    // Handle high needle logic
    if (highNeedleEnabled) {
      const highNeedle = this.shadowRoot.getElementById('highNeedle');
      if (highNeedle) {
        // Initialize high needle value if not set
        if (this._highNeedleValue === null) {
          this._highNeedleValue = clampedValue;
        }

        // If current value is higher than stored high value, update it
        if (clampedValue >= this._highNeedleValue) {
          this._highNeedleValue = clampedValue;

          // Clear any existing timeout
          if (this._highNeedleTimeout) {
            clearTimeout(this._highNeedleTimeout);
            this._highNeedleTimeout = null;
          }
        } else {
          // Value has decreased - start timeout if not already running
          if (!this._highNeedleTimeout) {
            this._highNeedleTimeout = setTimeout(() => {
              // After timeout, set high needle to current value
              this._highNeedleValue = clampedValue;
              this._highNeedleTimeout = null;
              // Trigger update to move the high needle
              this.updateGauge();
            }, highNeedleDuration * 1000);
          }
        }

        // Calculate high needle position
        const highValuePosition = Math.max(0, Math.min(1, (this._highNeedleValue - min) / range));
        let highGaugeAngle = startAngle + (totalAngle * highValuePosition);

        // Normalize high needle angle
        while (highGaugeAngle > 180) highGaugeAngle -= 360;
        while (highGaugeAngle < -180) highGaugeAngle += 360;

        // Apply same clamping logic as main needle
        if (endAngle >= startAngle) {
          highGaugeAngle = Math.max(startAngle, Math.min(endAngle, highGaugeAngle));
        } else {
          let normStart = startAngle;
          let normEnd = endAngle;
          while (normStart > 180) normStart -= 360;
          while (normStart < -180) normStart += 360;
          while (normEnd > 180) normEnd -= 360;
          while (normEnd < -180) normEnd += 360;

          const inDeadZone = normEnd < normStart ?
            (highGaugeAngle > normEnd && highGaugeAngle < normStart) :
            (highGaugeAngle > normEnd || highGaugeAngle < normStart);

          if (inDeadZone) {
            const distToStart = Math.min(
              Math.abs(highGaugeAngle - normStart),
              Math.abs(highGaugeAngle - normStart + 360),
              Math.abs(highGaugeAngle - normStart - 360)
            );
            const distToEnd = Math.min(
              Math.abs(highGaugeAngle - normEnd),
              Math.abs(highGaugeAngle - normEnd + 360),
              Math.abs(highGaugeAngle - normEnd - 360)
            );
            highGaugeAngle = distToStart < distToEnd ? normStart : normEnd;
          }
        }

        let highNeedleAngle = highGaugeAngle + 90;
        // Determine if high value is increasing or decreasing
        let highValueIncreasing = null;
        if (this._previousHighNeedleAngle !== null) {
          // For high needle, compare the current high value with the tracked high value
          highValueIncreasing = this._highNeedleValue >= (this._previousHighValue || this._highNeedleValue);
        }
        highNeedleAngle = this._findDirectionalPath(this._previousHighNeedleAngle, highNeedleAngle, highValueIncreasing);
        highNeedle.style.transform = `rotate(${highNeedleAngle}deg)`;
        this._previousHighNeedleAngle = highNeedleAngle;
        this._previousHighValue = this._highNeedleValue;
      }
    }
  }

  _handleEntityError(message) {
    // Only log if error has changed
    if (this._entityError !== message) {
      console.warn(`Steam Gauge Card [${this.config.entity}]: ${message}`);
      this._entityError = message;

      // Update display to show error state
      const flipDisplay = this.shadowRoot?.getElementById('flipDisplay');
      if (flipDisplay) {
        // Show "---" or "ERR" in the display
        this._showErrorDisplay();
      }
    }
  }

  _clearEntityError() {
    this._entityError = null;
  }

  _showErrorDisplay() {
    const flipDisplay = this.shadowRoot?.getElementById('flipDisplay');
    if (!flipDisplay) return;

    const digitsRow = flipDisplay.querySelector('.digits-row');
    if (digitsRow) {
      digitsRow.innerHTML = '<div class="flip-digit"><div class="digit-item">-</div></div><div class="flip-digit"><div class="digit-item">-</div></div><div class="flip-digit"><div class="digit-item">-</div></div>';
    }
  }

  _updateAriaLive(value) {
    const ariaLive = this.shadowRoot?.getElementById('ariaLive');
    if (ariaLive) {
      const decimals = this.config.decimals !== undefined ? this.config.decimals : 0;
      const unit = this.config.unit || '';
      const title = this.config.title || 'Gauge';
      ariaLive.textContent = `${title}: ${value.toFixed(decimals)} ${unit}`;
    }
  }

  _formatValueWithPadding(value, decimals) {
    // Get min and max to determine padding requirements
    const min = this.config.min !== undefined ? this.config.min : 0;
    const max = this.config.max !== undefined ? this.config.max : 100;

    // Calculate the maximum number of integer digits needed
    const maxAbsValue = Math.max(Math.abs(Math.floor(min)), Math.abs(Math.floor(max)));
    const maxIntegerDigits = maxAbsValue.toString().length;

    // Split value into integer and decimal parts
    const isNegative = value < 0;
    const absoluteValue = Math.abs(value);
    const integerPart = Math.floor(absoluteValue);
    const decimalPart = (absoluteValue - integerPart).toFixed(decimals).substring(2); // Remove "0."

    // Pad the integer part with leading zeros
    const paddedInteger = integerPart.toString().padStart(maxIntegerDigits, '0');

    // Build the final string
    let result = isNegative ? '-' : '';
    result += paddedInteger;
    if (decimals > 0) {
      result += '.' + decimalPart;
    }

    return result;
  }

  updateFlipDisplay(value) {
    const flipDisplay = this.shadowRoot.getElementById('flipDisplay');
    if (!flipDisplay) return;

    const decimals = this.config.decimals !== undefined ? this.config.decimals : 0;
    const unit = this.config.unit || '';

    let displayText = isNaN(value) ? '--' : this._formatValueWithPadding(value, decimals);
    const oldText = flipDisplay.dataset.value || '';

    if (displayText === oldText) return; // No change

    // Check if this is the first update (no previous value stored)
    const isFirstUpdate = !flipDisplay.dataset.numericValue;

    // Store previous numeric value for animation
    const prevValue = flipDisplay.dataset.numericValue ? parseFloat(flipDisplay.dataset.numericValue) : value;
    flipDisplay.dataset.numericValue = value;
    flipDisplay.dataset.value = displayText;

    // On first update, render directly without animation to avoid glitches
    if (isFirstUpdate) {
      this.renderRotaryDisplay(flipDisplay, this._formatValueWithPadding(value, decimals), unit, null);
    } else {
      // Animate through intermediate values like a real odometer
      this.animateOdometer(flipDisplay, prevValue, value, decimals, unit);
    }
  }

  animateOdometer(flipDisplay, fromValue, toValue, decimals, unit) {
    // Cancel any existing animation
    if (this._odometerAnimation) {
      clearInterval(this._odometerAnimation);
    }

    const diff = Math.abs(toValue - fromValue);
    const steps = Math.min(Math.ceil(diff), 20); // Max 20 steps for smooth animation

    if (steps <= 1 || diff === 0) {
      // Small change or no change, just render directly
      this.renderRotaryDisplay(flipDisplay, this._formatValueWithPadding(toValue, decimals), unit, null);
      return;
    }

    const increment = (toValue - fromValue) / steps;
    const duration = this._animationDuration || 1.2;
    const stepDuration = (duration * 1000) / steps;

    let currentStep = 0;
    let currentValue = fromValue;

    this._odometerAnimation = setInterval(() => {
      currentStep++;
      currentValue += increment;

      if (currentStep >= steps) {
        clearInterval(this._odometerAnimation);
        this._odometerAnimation = null;
        currentValue = toValue; // Ensure we end at exact value
      }

      this.renderRotaryDisplay(flipDisplay, this._formatValueWithPadding(currentValue, decimals), unit, fromValue);
    }, stepDuration);
  }

  renderRotaryDisplay(flipDisplay, displayText, unit, previousValue) {
    // Determine if negative and get absolute value
    const isNegative = displayText.startsWith('-');
    const absDisplayText = isNegative ? displayText.substring(1) : displayText;
    const chars = absDisplayText.split('');

    // Check if minimum value allows negative numbers
    const allowNegative = this.config && this.config.min < 0;

    // Get or create digits row wrapper
    let digitsRow = flipDisplay.querySelector('.digits-row');
    if (!digitsRow) {
      flipDisplay.innerHTML = '';
      digitsRow = document.createElement('div');
      digitsRow.className = 'digits-row';
      flipDisplay.appendChild(digitsRow);
    }

    // Calculate expected structure: minus sign (if min < 0) + digits (excluding decimal point)
    const digitCount = chars.filter(c => c !== '.').length;
    const expectedLength = (allowNegative ? 1 : 0) + digitCount;
    let existingDigits = Array.from(digitsRow.children);

    // Clear if structure changed
    if (existingDigits.length !== expectedLength) {
      digitsRow.innerHTML = '';
      existingDigits = []; // Reset to empty array
    }

    let digitIndex = 0;
    let afterDecimal = false;

    // First position: Create/update sign with flip animation if minimum value is below 0
    if (allowNegative) {
      let signEl = existingDigits[digitIndex];
      if (!signEl || !signEl.classList.contains('minus-sign')) {
        // Create new sign element with flip structure
        signEl = document.createElement('div');
        signEl.className = 'flip-digit minus-sign';
        const inner = document.createElement('div');
        inner.className = 'flip-digit-inner';

        // Create two items: minus and plus
        const signs = ['-', '+'];
        signs.forEach(s => {
          const item = document.createElement('div');
          item.className = 'digit-item';
          item.textContent = s;
          inner.appendChild(item);
        });

        signEl.appendChild(inner);
        digitsRow.appendChild(signEl);
      }

      // Update sign position with animation
      const inner = signEl.querySelector('.flip-digit-inner');
      if (inner) {
        const targetPosition = isNegative ? 0 : 1; // 0 = '-', 1 = '+'

        // Check if this is initial setup
        const isInitialSetup = !signEl.dataset.position;

        if (isInitialSetup) {
          // On initial setup, position without animation
          signEl.dataset.position = targetPosition.toString();

          inner.style.transition = 'none';
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              inner.offsetHeight;
              const digitItem = inner.querySelector('.digit-item');
              if (!digitItem) return;

              const computedStyle = window.getComputedStyle(digitItem);
              const digitHeight = parseFloat(computedStyle.height) || 28;
              const offset = Math.round(-targetPosition * digitHeight);
              inner.style.transform = `translateY(${offset}px)`;

              requestAnimationFrame(() => {
                inner.style.transition = '';
              });
            });
          });
        } else {
          // Animated update
          signEl.dataset.position = targetPosition.toString();

          const digitItem = inner.querySelector('.digit-item');
          if (!digitItem) return;

          const computedStyle = window.getComputedStyle(digitItem);
          const digitHeight = parseFloat(computedStyle.height) || 28;
          const offset = Math.round(-targetPosition * digitHeight);
          inner.style.transform = `translateY(${offset}px)`;
        }
      }

      digitIndex++;
    }

    // Process remaining characters (digits and decimal points)
    chars.forEach((char, charIndex) => {
      if (char === '.') {
        afterDecimal = true;
        // Skip creating decimal point element but keep tracking position
      } else {
        let digitEl = existingDigits[digitIndex];
        if (!digitEl || digitEl.classList.contains('decimal') || digitEl.classList.contains('minus-sign')) {
          // Create new rotary digit with single set of digits 0-9
          digitEl = document.createElement('div');
          digitEl.className = afterDecimal ? 'flip-digit fractional' : 'flip-digit';
          const inner = document.createElement('div');
          inner.className = 'flip-digit-inner';

          // Create single set of digits 0-9
          const baseDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
          baseDigits.forEach(d => {
            const item = document.createElement('div');
            item.className = 'digit-item';
            item.textContent = d;
            inner.appendChild(item);
          });

          digitEl.appendChild(inner);
          digitsRow.appendChild(digitEl);
        }

        // Update rotation position with forward-only animation
        const inner = digitEl.querySelector('.flip-digit-inner');
        if (inner) {
          const targetDigit = parseInt(char);

          // Check if this is initial setup (no position set yet)
          const isInitialSetup = !digitEl.dataset.position;

          if (isInitialSetup) {
            // On initial setup, position without animation
            digitEl.dataset.position = targetDigit.toString();

            // Disable transition for initial positioning
            inner.style.transition = 'none';

            // Use double requestAnimationFrame to ensure container-query CSS has fully applied
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                // Force a reflow to ensure elements are rendered
                inner.offsetHeight;

                // Now measure the actual height
                const digitItem = inner.querySelector('.digit-item');
                if (!digitItem) return;

                // Force a style recalculation to get the ACTUAL height after CSS settles
                const computedStyle = window.getComputedStyle(digitItem);
                const digitHeight = parseFloat(computedStyle.height) || 28;

                const offset = Math.round(-targetDigit * digitHeight);
                inner.style.transform = `translateY(${offset}px)`;

                // Re-enable transition after another frame
                requestAnimationFrame(() => {
                  inner.style.transition = '';
                });
              });
            });
          } else {
            // Animated update
            digitEl.dataset.position = targetDigit.toString();

            // Calculate digit height dynamically based on container size
            const digitItem = inner.querySelector('.digit-item');
            const computedStyle = window.getComputedStyle(digitItem);
            const digitHeight = parseFloat(computedStyle.height) || 28;
            const offset = Math.round(-targetDigit * digitHeight);
            inner.style.transform = `translateY(${offset}px)`;

            // Add transitionend listener to ensure perfect alignment
            const handleTransitionEnd = () => {
              // Recalculate and snap to exact position after animation completes
              const finalDigitHeight = digitItem ? digitItem.getBoundingClientRect().height : 28;
              const finalOffset = Math.round(-newPosition * finalDigitHeight);
              inner.style.transform = `translateY(${finalOffset}px)`;
              inner.removeEventListener('transitionend', handleTransitionEnd);
            };
            inner.removeEventListener('transitionend', handleTransitionEnd); // Remove any old listeners
            inner.addEventListener('transitionend', handleTransitionEnd, { once: true });
          }
        }

        digitIndex++;
      }
    });

    // Add unit if present
    const existingUnit = flipDisplay.querySelector('.flip-digit.unit');
    if (unit) {
      if (!existingUnit) {
        const unitSpan = document.createElement('div');
        unitSpan.className = 'flip-digit unit';
        unitSpan.textContent = unit;
        flipDisplay.appendChild(unitSpan);
      } else {
        existingUnit.textContent = unit;
      }
    } else if (existingUnit) {
      existingUnit.remove();
    }
  }

  getCardSize() {
    return 4;
  }

  static get supportsCardResize() {
    return true;
  }

  static getConfigElement() {
    return document.createElement('foundry-gauge-card-editor');
  }

  static getStubConfig() {
    return {
      entity: 'sensor.temperature',
      title: 'Gauge',
      title_font_size: 12,
      odometer_font_size: 60,
      odometer_vertical_position: 120,
      ring_style: 'brass',
      rivet_color: '#6a5816',
      plate_color: '#8c7626',
      plate_transparent: false,
      min: 0,
      max: 100,
      unit: '',
      decimals: 0,
      start_angle: 200,
      end_angle: 160,
      animation_duration: 1.2,
      high_needle_enabled: false,
      high_needle_color: '#FF9800',
      high_needle_duration: 60,
      high_needle_length: 75,
      wear_level: 50,
      glass_effect_enabled: true,
      aged_texture: 'everywhere',
      aged_texture_intensity: 50,
      segments: [
        { from: 0, to: 33, color: '#4CAF50' },
        { from: 33, to: 66, color: '#FFC107' },
        { from: 66, to: 100, color: '#F44336' }
      ]
    };
  }
}


customElements.define('foundry-gauge-card', FoundryGaugeCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'foundry-gauge-card',
  name: 'Foundry Gauge Card',
  description: 'A vintage style gauge card',
  preview: "https://raw.githubusercontent.com/dprischak/Foundry-Card/main/preview.png",
  documentationURL: 'https://github.com/dprischak/Foundry-Card'
});

