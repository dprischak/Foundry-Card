// src/cards/utils.js
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
function fireEvent(node, type, detail = {}, options = {}) {
  const event = new Event(type, {
    bubbles: options.bubbles ?? true,
    cancelable: options.cancelable ?? false,
    composed: options.composed ?? true
  });
  event.detail = detail;
  node.dispatchEvent(event);
  return event;
}
function getActionConfig(config, key, fallback) {
  if (config && config[key]) return config[key];
  return fallback;
}

// src/cards/foundry-gauge-card.js
var FoundryGaugeCard = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._resizeObserver = null;
    this._highNeedleValue = null;
    this._highNeedleTimeout = null;
    this._isShaking = false;
    this._shakeTargetAngle = null;
    this._previousNeedleAngle = null;
    this._previousHighNeedleAngle = null;
    this._previousValue = null;
    this._previousHighValue = null;
    this._entityError = null;
    this._boundHandleClick = () => this._handleAction("tap");
    this._boundHandleDblClick = () => this._handleAction("double_tap");
    this._boundHandleContextMenu = (e) => {
      e.preventDefault();
      this._handleAction("hold");
    };
    this._boundHandleKeyDown = (e) => this._handleKeyDown(e);
    this._debouncedReflow = debounce(() => this._reflowFlipDisplay(), 100);
  }
  connectedCallback() {
    if (!this._resizeObserver) {
      this._resizeObserver = new ResizeObserver(this._debouncedReflow);
    }
    const container = this.shadowRoot?.querySelector(".gauge-container");
    if (container) this._resizeObserver.observe(container);
  }
  disconnectedCallback() {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }
  }
  _reflowFlipDisplay() {
    const flipDisplay = this.shadowRoot?.getElementById("flipDisplay");
    if (!flipDisplay || !this.config) return;
    const raw = flipDisplay.dataset.numericValue;
    if (raw === void 0 || raw === null || raw === "") return;
    const value = parseFloat(raw);
    if (Number.isNaN(value)) return;
    const digitsRow = flipDisplay.querySelector(".digits-row");
    if (!digitsRow) return;
    const digitElements = Array.from(digitsRow.children).filter(
      (el) => el.classList.contains("flip-digit") && !el.classList.contains("decimal") && !el.classList.contains("minus-sign") && !el.classList.contains("unit")
    );
    digitElements.forEach((digitEl) => {
      const inner = digitEl.querySelector(".flip-digit-inner");
      const position = digitEl.dataset.position;
      if (inner && position !== void 0) {
        const targetDigit = parseInt(position);
        const digitItem = inner.querySelector(".digit-item");
        if (!digitItem) return;
        const computedStyle = window.getComputedStyle(digitItem);
        const digitHeight = parseFloat(computedStyle.height) || 28;
        const offset = Math.round(-targetDigit * digitHeight);
        inner.style.transition = "none";
        inner.style.transform = `translateY(${offset}px)`;
        requestAnimationFrame(() => {
          inner.style.transition = "";
        });
      }
    });
  }
  setConfig(config) {
    if (!config.entity) {
      throw new Error("You need to define an entity");
    }
    this.config = { ...config };
    this._validateConfig();
    if (!this.config.tap_action) {
      this.config.tap_action = { action: "more-info" };
    }
    if (this.config.ring_style === void 0) {
      this.config.ring_style = "brass";
    }
    this._uniqueId = Math.random().toString(36).substr(2, 9);
    this.render();
    if (this._hass) {
      requestAnimationFrame(() => this.updateGauge());
    }
  }
  _validateConfig() {
    const config = this.config;
    const min = config.min !== void 0 ? config.min : 0;
    const max = config.max !== void 0 ? config.max : 100;
    if (min >= max) {
      console.warn("Foundry Gauge Card: min value must be less than max value. Using defaults.");
      this.config.min = 0;
      this.config.max = 100;
    }
    if (config.decimals !== void 0) {
      const decimals = parseInt(config.decimals);
      if (isNaN(decimals) || decimals < 0) {
        console.warn("Foundry Gauge Card: decimals must be a non-negative integer. Using 0.");
        this.config.decimals = 0;
      } else {
        this.config.decimals = Math.min(decimals, 10);
      }
    }
    if (config.start_angle !== void 0) {
      const angle = parseFloat(config.start_angle);
      if (isNaN(angle)) {
        this.config.start_angle = 200;
      } else {
        this.config.start_angle = (angle % 360 + 360) % 360;
      }
    }
    if (config.end_angle !== void 0) {
      const angle = parseFloat(config.end_angle);
      if (isNaN(angle)) {
        this.config.end_angle = 160;
      } else {
        this.config.end_angle = (angle % 360 + 360) % 360;
      }
    }
    if (config.animation_duration !== void 0) {
      const duration = parseFloat(config.animation_duration);
      if (isNaN(duration) || duration <= 0) {
        console.warn("Foundry Gauge Card: animation_duration must be positive. Using 1.2s.");
        this.config.animation_duration = 1.2;
      } else {
        this.config.animation_duration = Math.min(duration, 10);
      }
    }
    if (config.wear_level !== void 0) {
      const wear = parseFloat(config.wear_level);
      if (isNaN(wear)) {
        this.config.wear_level = 50;
      } else {
        this.config.wear_level = Math.max(0, Math.min(100, wear));
      }
    }
    if (config.aged_texture_intensity !== void 0) {
      const intensity = parseFloat(config.aged_texture_intensity);
      if (isNaN(intensity)) {
        this.config.aged_texture_intensity = 50;
      } else {
        this.config.aged_texture_intensity = Math.max(0, Math.min(100, intensity));
      }
    }
    if (config.high_needle_duration !== void 0) {
      const duration = parseFloat(config.high_needle_duration);
      if (isNaN(duration) || duration <= 0) {
        this.config.high_needle_duration = 60;
      } else {
        this.config.high_needle_duration = Math.max(1, duration);
      }
    }
    if (config.high_needle_length !== void 0) {
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
    const title = config.title || "";
    const min = config.min !== void 0 ? config.min : 0;
    const max = config.max !== void 0 ? config.max : 100;
    const unit = config.unit || "";
    const uid = this._uniqueId;
    const animationDuration = config.animation_duration !== void 0 ? config.animation_duration : 1.2;
    const titleFontSize = config.title_font_size !== void 0 ? config.title_font_size : 12;
    const odometerFontSize = config.odometer_font_size !== void 0 ? config.odometer_font_size : 60;
    const odoFont = `${odometerFontSize * 0.16}px`;
    const odoDigitW = `${odometerFontSize * 0.15}px`;
    const odoDigitH = `${odometerFontSize * 0.22}px`;
    const odoGap = `${odometerFontSize * 0.03}px`;
    const odometerVerticalPosition = config.odometer_vertical_position !== void 0 ? config.odometer_vertical_position : 120;
    const ringStyle = config.ring_style !== void 0 ? config.ring_style : "brass";
    const rimData = this.getRimStyleData(ringStyle, uid);
    const rivetColor = config.rivet_color !== void 0 ? config.rivet_color : "#6d5d4b";
    const highNeedleEnabled = config.high_needle_enabled !== void 0 ? config.high_needle_enabled : false;
    const highNeedleColor = config.high_needle_color !== void 0 ? config.high_needle_color : "#FF9800";
    const highNeedleLength = config.high_needle_length !== void 0 ? config.high_needle_length : 100;
    const plateColor = config.plate_color !== void 0 ? config.plate_color : "transparent";
    const plateTransparent = config.plate_transparent !== void 0 ? config.plate_transparent : false;
    const wearLevel = config.wear_level !== void 0 ? config.wear_level : 50;
    const glassEffectEnabled = config.glass_effect_enabled !== void 0 ? config.glass_effect_enabled : true;
    const agedTexture = config.aged_texture !== void 0 ? config.aged_texture : "glass_only";
    const agedTextureIntensity = config.aged_texture_intensity !== void 0 ? config.aged_texture_intensity : 50;
    const agedTextureOpacity = (100 - agedTextureIntensity) / 100 * 1;
    const effectiveAgedTexture = plateTransparent && agedTexture === "everywhere" ? "glass_only" : agedTexture;
    const agedTextureEnabled = effectiveAgedTexture === "glass_only";
    const startAngleDeg = config.start_angle !== void 0 ? config.start_angle : 200;
    const endAngleDeg = config.end_angle !== void 0 ? config.end_angle : 160;
    this._startAngle = startAngleDeg - 90;
    this._endAngle = endAngleDeg - 90;
    this._animationDuration = animationDuration;
    const segments = config.segments || [
      { from: 0, to: 33, color: "#4CAF50" },
      { from: 33, to: 66, color: "#FFC107" },
      { from: 66, to: 100, color: "#F44336" }
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
      <ha-card role="img" aria-label="${title ? title.replace(/\\\\n/g, " ") : "Foundry gauge"} showing ${config.entity}" tabindex="0">
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
              <rect x="0" y="0" width="200" height="200" fill="${plateTransparent ? "rgba(240, 235, 225, 0.15)" : plateColor}" ${effectiveAgedTexture === "everywhere" ? `filter="url(#aged-${uid})"` : ""} />
              ${this.renderRim(ringStyle, uid)}
              
              <!-- Gauge face -->
              <circle cx="100" cy="100" r="85" fill="url(#gaugeFace-${uid})" ${agedTextureEnabled || effectiveAgedTexture === "everywhere" ? `filter="url(#aged-${uid})" clip-path="url(#gaugeFaceClip-${uid})"` : ""}/>
                            

              <!-- Glass effect overlay -->
              ${glassEffectEnabled ? '<ellipse cx="100" cy="80" rx="60" ry="50" fill="white" opacity="0.15"/>' : ""}
              
              <!-- Segment arcs -->
              <g id="segments"></g>
              
              <!-- Tick marks -->
              <g id="ticks"></g>
              
              <!-- Numbers -->
              <g id="numbers"></g>
              
              <!-- Title text -->
              ${title ? this.renderTitleText(title, titleFontSize) : ""}
              
              <!-- Center hub background -->
			  <circle cx="100" cy="100" r="12"
				fill="${rimData ? `url(#${rimData.grad})` : "#c9a961"}"
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
              ${highNeedleEnabled ? this.renderHighNeedle(highNeedleColor, highNeedleLength, animationDuration) : ""}
              
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
      const container = this.shadowRoot?.querySelector(".gauge-container");
      if (container) this._resizeObserver.observe(container);
    }
    requestAnimationFrame(() => this._reflowFlipDisplay());
  }
  _attachActionListeners() {
    const root = this.shadowRoot?.getElementById("actionRoot");
    if (!root) return;
    root.removeEventListener("click", this._boundHandleClick);
    root.removeEventListener("dblclick", this._boundHandleDblClick);
    root.removeEventListener("contextmenu", this._boundHandleContextMenu);
    root.removeEventListener("keydown", this._boundHandleKeyDown);
    root.addEventListener("click", this._boundHandleClick, { passive: true });
    root.addEventListener("dblclick", this._boundHandleDblClick, { passive: true });
    root.addEventListener("contextmenu", this._boundHandleContextMenu);
    root.addEventListener("keydown", this._boundHandleKeyDown);
  }
  _handleKeyDown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this._handleAction("tap");
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
    const tap = getActionConfig(this.config, "tap_action", { action: "more-info" });
    const hold = getActionConfig(this.config, "hold_action", { action: "more-info" });
    const dbl = getActionConfig(this.config, "double_tap_action", { action: "more-info" });
    const actionConfig = kind === "hold" ? hold : kind === "double_tap" ? dbl : tap;
    if (actionConfig?.action === "shake") {
      this._shakeGauge();
      return;
    }
    this._runAction(actionConfig, entityId);
  }
  _shakeGauge() {
    if (this._isShaking) return;
    if (!this._hass || !this.config) return;
    const entity = this._hass.states[this.config.entity];
    if (!entity) return;
    const value = parseFloat(entity.state);
    if (isNaN(value)) return;
    const min = this.config.min !== void 0 ? this.config.min : 0;
    const max = this.config.max !== void 0 ? this.config.max : 100;
    const range = max - min;
    const clampedValue = Math.max(min, Math.min(max, value));
    const deviationPercent = 0.1 + Math.random() * 0.4;
    const deviation = range * deviationPercent * (Math.random() > 0.5 ? 1 : -1);
    const targetValue = Math.max(min, Math.min(max, clampedValue + deviation));
    const valuePosition = Math.max(0, Math.min(1, (targetValue - min) / range));
    const startAngle = this._startAngle;
    const endAngle = this._endAngle;
    const totalAngle = endAngle >= startAngle ? endAngle - startAngle : 360 - startAngle + endAngle;
    let targetGaugeAngle = startAngle + totalAngle * valuePosition;
    while (targetGaugeAngle > 180) targetGaugeAngle -= 360;
    while (targetGaugeAngle < -180) targetGaugeAngle += 360;
    this._isShaking = true;
    this._shakeTargetAngle = targetGaugeAngle + 90;
    const needle = this.shadowRoot.getElementById("needle");
    if (!needle) return;
    const gaugeContainer = this.shadowRoot.querySelector(".gauge-container");
    if (gaugeContainer) {
      gaugeContainer.classList.add("shaking");
      setTimeout(() => {
        gaugeContainer.classList.remove("shaking");
      }, 250);
    }
    needle.style.transition = "transform 0.3s ease-out";
    needle.style.transform = `rotate(${this._shakeTargetAngle}deg)`;
    setTimeout(() => {
      if (needle) {
        needle.style.transition = "transform 3s cubic-bezier(0.4, 0.0, 0.2, 1)";
        this._isShaking = false;
        this._shakeTargetAngle = null;
        this.updateGauge();
      }
    }, 300);
  }
  _runAction(actionConfig, entityId) {
    const action = actionConfig?.action;
    if (!action || action === "none") return;
    if (action === "more-info") {
      fireEvent(this, "hass-more-info", { entityId });
      return;
    }
    if (action === "navigate") {
      const path = actionConfig.navigation_path;
      if (!path) return;
      history.pushState(null, "", path);
      fireEvent(window, "location-changed", { replace: false });
      return;
    }
    if (action === "toggle") {
      if (!entityId) return;
      this._hass.callService("homeassistant", "toggle", { entity_id: entityId });
      return;
    }
    if (action === "call-service") {
      const service = actionConfig.service;
      if (!service) return;
      const [domain, srv] = service.split(".");
      if (!domain || !srv) return;
      const data = { ...actionConfig.service_data || {} };
      if (actionConfig.target?.entity_id) data.entity_id = actionConfig.target.entity_id;
      this._hass.callService(domain, srv, data);
      return;
    }
  }
  renderTitleText(title, fontSize) {
    const lines = title.replace(/\\n/g, "\n").split("\n").slice(0, 3);
    const lineHeight = fontSize * 1.2;
    const totalHeight = (lines.length - 1) * lineHeight;
    const startY = 75 - totalHeight / 2;
    return lines.map((line, index) => {
      const y = startY + index * lineHeight;
      return `<text x="100" y="${y}" text-anchor="middle" font-size="${fontSize}" font-weight="bold" fill="#3e2723" font-family="Georgia, serif" style="text-shadow: 1px 1px 2px rgba(255,255,255,0.5);">${line}</text>`;
    }).join("\n");
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
        return null;
    }
  }
  renderRim(ringStyle, uid) {
    const data = this.getRimStyleData(ringStyle, uid);
    if (!data) return "";
    return `
		<circle cx="100" cy="100" r="95" fill="url(#${data.grad})" stroke="${data.stroke}" stroke-width="2"/>
		<circle cx="100" cy="100" r="88" fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="3"/>
	  `;
  }
  renderHighNeedle(color, lengthPercent, animationDuration) {
    const baseLength = 75;
    const actualLength = baseLength * (lengthPercent / 100);
    const tipY = 100 - actualLength;
    const nearTipY = tipY + 5;
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
    if (wearLevel === 0) return "";
    const baseOpacity = wearLevel / 100 * 0.25;
    const allMarks = [
      { type: "circle", cx: 45, cy: 60, r: 2, fill: "#8B7355", baseOpacity: 0.2 },
      { type: "circle", cx: 155, cy: 75, r: 1.5, fill: "#8B7355", baseOpacity: 0.15 },
      { type: "circle", cx: 70, cy: 120, r: 1, fill: "#6d5d4b", baseOpacity: 0.2 },
      { type: "ellipse", cx: 130, cy: 50, rx: 3, ry: 1.5, fill: "#8B7355", baseOpacity: 0.1 },
      { type: "circle", cx: 35, cy: 140, r: 1.2, fill: "#8B7355", baseOpacity: 0.12 },
      { type: "circle", cx: 165, cy: 130, r: 1.8, fill: "#6d5d4b", baseOpacity: 0.18 },
      { type: "ellipse", cx: 50, cy: 90, rx: 2, ry: 1, fill: "#8B7355", baseOpacity: 0.08 },
      { type: "circle", cx: 120, cy: 145, r: 0.8, fill: "#6d5d4b", baseOpacity: 0.15 },
      { type: "circle", cx: 180, cy: 65, r: 1.3, fill: "#8B7355", baseOpacity: 0.1 },
      { type: "ellipse", cx: 25, cy: 100, rx: 2.5, ry: 1.2, fill: "#6d5d4b", baseOpacity: 0.09 }
    ];
    const markCount = Math.ceil(wearLevel / 100 * allMarks.length);
    const marksToShow = allMarks.slice(0, markCount);
    return marksToShow.map((mark) => {
      const opacity = Math.min(mark.baseOpacity * (wearLevel / 50), 0.25);
      if (mark.type === "circle") {
        return `<circle cx="${mark.cx}" cy="${mark.cy}" r="${mark.r}" fill="${mark.fill}" opacity="${opacity}"/>`;
      } else if (mark.type === "ellipse") {
        return `<ellipse cx="${mark.cx}" cy="${mark.cy}" rx="${mark.rx}" ry="${mark.ry}" fill="${mark.fill}" opacity="${opacity}"/>`;
      }
      return "";
    }).join("\n              ");
  }
  drawSegments(segments, min, max) {
    const segmentsGroup = this.shadowRoot.getElementById("segments");
    const centerX = 100;
    const centerY = 100;
    const radius = 70;
    const startAngle = this._startAngle;
    const endAngle = this._endAngle;
    const totalAngle = endAngle >= startAngle ? endAngle - startAngle : 360 - startAngle + endAngle;
    segments.forEach((segment) => {
      const fromPercent = (segment.from - min) / (max - min) * 100;
      const toPercent = (segment.to - min) / (max - min) * 100;
      const segmentStartAngle = startAngle + totalAngle * fromPercent / 100;
      const segmentEndAngle = startAngle + totalAngle * toPercent / 100;
      const path = this.describeArc(centerX, centerY, radius, segmentStartAngle, segmentEndAngle);
      const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
      pathElement.setAttribute("d", path);
      pathElement.setAttribute("fill", "none");
      pathElement.setAttribute("stroke", segment.color);
      pathElement.setAttribute("stroke-width", "8");
      pathElement.setAttribute("opacity", "0.7");
      segmentsGroup.appendChild(pathElement);
    });
  }
  drawTicks(min, max) {
    const ticksGroup = this.shadowRoot.getElementById("ticks");
    const numbersGroup = this.shadowRoot.getElementById("numbers");
    const centerX = 100;
    const centerY = 100;
    const startAngle = this._startAngle;
    const endAngle = this._endAngle;
    const totalAngle = endAngle >= startAngle ? endAngle - startAngle : 360 - startAngle + endAngle;
    const numTicks = 10;
    ticksGroup.innerHTML = "";
    numbersGroup.innerHTML = "";
    for (let i = 0; i <= numTicks; i++) {
      let angle = startAngle + totalAngle * i / numTicks;
      while (angle > 180) angle -= 360;
      while (angle < -180) angle += 360;
      const angleRad = angle * Math.PI / 180;
      const innerRadius = 77;
      const outerRadius = 85;
      const x1 = centerX + innerRadius * Math.cos(angleRad);
      const y1 = centerY + innerRadius * Math.sin(angleRad);
      const x2 = centerX + outerRadius * Math.cos(angleRad);
      const y2 = centerY + outerRadius * Math.sin(angleRad);
      const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
      tick.setAttribute("x1", x1);
      tick.setAttribute("y1", y1);
      tick.setAttribute("x2", x2);
      tick.setAttribute("y2", y2);
      tick.setAttribute("stroke", "#3e2723");
      tick.setAttribute("stroke-width", "2");
      ticksGroup.appendChild(tick);
      const value = min + (max - min) * i / numTicks;
      const textRadius = 65;
      const textX = centerX + textRadius * Math.cos(angleRad);
      const textY = centerY + textRadius * Math.sin(angleRad);
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", textX);
      text.setAttribute("y", textY);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dominant-baseline", "middle");
      text.setAttribute("font-size", "9");
      text.setAttribute("font-weight", "bold");
      text.setAttribute("fill", "#3e2723");
      text.setAttribute("font-family", "Georgia, serif");
      const displayValue = max - min <= 10 ? value.toFixed(1) : Math.round(value);
      text.textContent = displayValue;
      numbersGroup.appendChild(text);
      if (i < numTicks) {
        for (let j = 1; j < 5; j++) {
          const minorAngle = angle + totalAngle / numTicks * (j / 5);
          const minorAngleRad = minorAngle * Math.PI / 180;
          const mx1 = centerX + 80 * Math.cos(minorAngleRad);
          const my1 = centerY + 80 * Math.sin(minorAngleRad);
          const mx2 = centerX + 85 * Math.cos(minorAngleRad);
          const my2 = centerY + 85 * Math.sin(minorAngleRad);
          const minorTick = document.createElementNS("http://www.w3.org/2000/svg", "line");
          minorTick.setAttribute("x1", mx1);
          minorTick.setAttribute("y1", my1);
          minorTick.setAttribute("x2", mx2);
          minorTick.setAttribute("y2", my2);
          minorTick.setAttribute("stroke", "#5d4e37");
          minorTick.setAttribute("stroke-width", "1");
          ticksGroup.appendChild(minorTick);
        }
      }
    }
  }
  drawStoppers() {
    const stoppersGroup = this.shadowRoot.getElementById("stoppers");
    if (!stoppersGroup) return;
    const centerX = 100;
    const centerY = 100;
    const startAngle = this._startAngle;
    const endAngle = this._endAngle;
    const startAngleRad = startAngle * Math.PI / 180;
    const startX = centerX + 75 * Math.cos(startAngleRad);
    const startY = centerY + 75 * Math.sin(startAngleRad);
    const startStopper = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    startStopper.setAttribute("cx", startX);
    startStopper.setAttribute("cy", startY);
    startStopper.setAttribute("r", "3");
    startStopper.setAttribute("fill", "#8B0000");
    startStopper.setAttribute("stroke", "#4a4034");
    startStopper.setAttribute("stroke-width", "0.5");
    stoppersGroup.appendChild(startStopper);
    const endAngleRad = endAngle * Math.PI / 180;
    const endX = centerX + 75 * Math.cos(endAngleRad);
    const endY = centerY + 75 * Math.sin(endAngleRad);
    const endStopper = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    endStopper.setAttribute("cx", endX);
    endStopper.setAttribute("cy", endY);
    endStopper.setAttribute("r", "3");
    endStopper.setAttribute("fill", "#8B0000");
    endStopper.setAttribute("stroke", "#4a4034");
    endStopper.setAttribute("stroke-width", "0.5");
    stoppersGroup.appendChild(endStopper);
  }
  describeArc(x, y, radius, startAngle, endAngle) {
    const start = this.polarToCartesian(x, y, radius, endAngle);
    const end = this.polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M",
      start.x,
      start.y,
      "A",
      radius,
      radius,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y
    ].join(" ");
  }
  polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = angleInDegrees * Math.PI / 180;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  }
  darkenColor(color, amount) {
    if (Array.isArray(color) && color.length === 3) {
      const toHex = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
      color = `#${toHex(color[0])}${toHex(color[1])}${toHex(color[2])}`;
    }
    if (typeof color !== "string" || color.trim() === "") {
      color = "#000000";
    }
    const hex = color.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const newR = Math.max(0, Math.floor(r * (1 - amount)));
    const newG = Math.max(0, Math.floor(g * (1 - amount)));
    const newB = Math.max(0, Math.floor(b * (1 - amount)));
    return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
  }
  updateGauge() {
    if (!this._hass || !this.config) return;
    const entity = this._hass.states[this.config.entity];
    if (!entity) {
      this._handleEntityError("Entity not found");
      return;
    }
    if (entity.state === "unavailable" || entity.state === "unknown") {
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
    const min = this.config.min !== void 0 ? this.config.min : 0;
    const max = this.config.max !== void 0 ? this.config.max : 100;
    const highNeedleEnabled = this.config.high_needle_enabled !== void 0 ? this.config.high_needle_enabled : false;
    const highNeedleDuration = this.config.high_needle_duration !== void 0 ? this.config.high_needle_duration : 60;
    this.updateFlipDisplay(value);
    const range = max - min;
    const clampedValue = Math.max(min, Math.min(max, value));
    const valuePosition = Math.max(0, Math.min(1, (clampedValue - min) / range));
    const startAngle = this._startAngle;
    const endAngle = this._endAngle;
    const totalAngle = endAngle >= startAngle ? endAngle - startAngle : 360 - startAngle + endAngle;
    let gaugeAngle = startAngle + totalAngle * valuePosition;
    while (gaugeAngle > 180) gaugeAngle -= 360;
    while (gaugeAngle < -180) gaugeAngle += 360;
    if (endAngle >= startAngle) {
      gaugeAngle = Math.max(startAngle, Math.min(endAngle, gaugeAngle));
    } else {
      let normStart = startAngle;
      let normEnd = endAngle;
      while (normStart > 180) normStart -= 360;
      while (normStart < -180) normStart += 360;
      while (normEnd > 180) normEnd -= 360;
      while (normEnd < -180) normEnd += 360;
      const inDeadZone = normEnd < normStart ? gaugeAngle > normEnd && gaugeAngle < normStart : gaugeAngle > normEnd || gaugeAngle < normStart;
      if (inDeadZone) {
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
    let needleAngle = gaugeAngle + 90;
    const needle = this.shadowRoot.getElementById("needle");
    if (needle && !this._isShaking) {
      let valueIncreasing = null;
      if (this._previousValue !== null) {
        valueIncreasing = clampedValue > this._previousValue;
      }
      needleAngle = this._findDirectionalPath(this._previousNeedleAngle, needleAngle, valueIncreasing);
      needle.style.transform = `rotate(${needleAngle}deg)`;
      this._previousNeedleAngle = needleAngle;
      this._previousValue = clampedValue;
      this._updateAriaLive(value);
    }
    if (highNeedleEnabled) {
      const highNeedle = this.shadowRoot.getElementById("highNeedle");
      if (highNeedle) {
        if (this._highNeedleValue === null) {
          this._highNeedleValue = clampedValue;
        }
        if (clampedValue >= this._highNeedleValue) {
          this._highNeedleValue = clampedValue;
          if (this._highNeedleTimeout) {
            clearTimeout(this._highNeedleTimeout);
            this._highNeedleTimeout = null;
          }
        } else {
          if (!this._highNeedleTimeout) {
            this._highNeedleTimeout = setTimeout(() => {
              this._highNeedleValue = clampedValue;
              this._highNeedleTimeout = null;
              this.updateGauge();
            }, highNeedleDuration * 1e3);
          }
        }
        const highValuePosition = Math.max(0, Math.min(1, (this._highNeedleValue - min) / range));
        let highGaugeAngle = startAngle + totalAngle * highValuePosition;
        while (highGaugeAngle > 180) highGaugeAngle -= 360;
        while (highGaugeAngle < -180) highGaugeAngle += 360;
        if (endAngle >= startAngle) {
          highGaugeAngle = Math.max(startAngle, Math.min(endAngle, highGaugeAngle));
        } else {
          let normStart = startAngle;
          let normEnd = endAngle;
          while (normStart > 180) normStart -= 360;
          while (normStart < -180) normStart += 360;
          while (normEnd > 180) normEnd -= 360;
          while (normEnd < -180) normEnd += 360;
          const inDeadZone = normEnd < normStart ? highGaugeAngle > normEnd && highGaugeAngle < normStart : highGaugeAngle > normEnd || highGaugeAngle < normStart;
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
        let highValueIncreasing = null;
        if (this._previousHighNeedleAngle !== null) {
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
    if (this._entityError !== message) {
      console.warn(`Foundry Gauge Card [${this.config.entity}]: ${message}`);
      this._entityError = message;
      const flipDisplay = this.shadowRoot?.getElementById("flipDisplay");
      if (flipDisplay) {
        this._showErrorDisplay();
      }
    }
  }
  _clearEntityError() {
    this._entityError = null;
  }
  _showErrorDisplay() {
    const flipDisplay = this.shadowRoot?.getElementById("flipDisplay");
    if (!flipDisplay) return;
    const digitsRow = flipDisplay.querySelector(".digits-row");
    if (digitsRow) {
      digitsRow.innerHTML = '<div class="flip-digit"><div class="digit-item">-</div></div><div class="flip-digit"><div class="digit-item">-</div></div><div class="flip-digit"><div class="digit-item">-</div></div>';
    }
  }
  _updateAriaLive(value) {
    const ariaLive = this.shadowRoot?.getElementById("ariaLive");
    if (ariaLive) {
      const decimals = this.config.decimals !== void 0 ? this.config.decimals : 0;
      const unit = this.config.unit || "";
      const title = this.config.title || "Gauge";
      ariaLive.textContent = `${title}: ${value.toFixed(decimals)} ${unit}`;
    }
  }
  _formatValueWithPadding(value, decimals) {
    const min = this.config.min !== void 0 ? this.config.min : 0;
    const max = this.config.max !== void 0 ? this.config.max : 100;
    const maxAbsValue = Math.max(Math.abs(Math.floor(min)), Math.abs(Math.floor(max)));
    const maxIntegerDigits = maxAbsValue.toString().length;
    const isNegative = value < 0;
    const absoluteValue = Math.abs(value);
    const integerPart = Math.floor(absoluteValue);
    const decimalPart = (absoluteValue - integerPart).toFixed(decimals).substring(2);
    const paddedInteger = integerPart.toString().padStart(maxIntegerDigits, "0");
    let result = isNegative ? "-" : "";
    result += paddedInteger;
    if (decimals > 0) {
      result += "." + decimalPart;
    }
    return result;
  }
  updateFlipDisplay(value) {
    const flipDisplay = this.shadowRoot.getElementById("flipDisplay");
    if (!flipDisplay) return;
    const decimals = this.config.decimals !== void 0 ? this.config.decimals : 0;
    const unit = this.config.unit || "";
    let displayText = isNaN(value) ? "--" : this._formatValueWithPadding(value, decimals);
    const oldText = flipDisplay.dataset.value || "";
    if (displayText === oldText) return;
    const isFirstUpdate = !flipDisplay.dataset.numericValue;
    const prevValue = flipDisplay.dataset.numericValue ? parseFloat(flipDisplay.dataset.numericValue) : value;
    flipDisplay.dataset.numericValue = value;
    flipDisplay.dataset.value = displayText;
    if (isFirstUpdate) {
      this.renderRotaryDisplay(flipDisplay, this._formatValueWithPadding(value, decimals), unit, null);
    } else {
      this.animateOdometer(flipDisplay, prevValue, value, decimals, unit);
    }
  }
  animateOdometer(flipDisplay, fromValue, toValue, decimals, unit) {
    if (this._odometerAnimation) {
      clearInterval(this._odometerAnimation);
    }
    const diff = Math.abs(toValue - fromValue);
    const steps = Math.min(Math.ceil(diff), 20);
    if (steps <= 1 || diff === 0) {
      this.renderRotaryDisplay(flipDisplay, this._formatValueWithPadding(toValue, decimals), unit, null);
      return;
    }
    const increment = (toValue - fromValue) / steps;
    const duration = this._animationDuration || 1.2;
    const stepDuration = duration * 1e3 / steps;
    let currentStep = 0;
    let currentValue = fromValue;
    this._odometerAnimation = setInterval(() => {
      currentStep++;
      currentValue += increment;
      if (currentStep >= steps) {
        clearInterval(this._odometerAnimation);
        this._odometerAnimation = null;
        currentValue = toValue;
      }
      this.renderRotaryDisplay(flipDisplay, this._formatValueWithPadding(currentValue, decimals), unit, fromValue);
    }, stepDuration);
  }
  renderRotaryDisplay(flipDisplay, displayText, unit, previousValue) {
    const isNegative = displayText.startsWith("-");
    const absDisplayText = isNegative ? displayText.substring(1) : displayText;
    const chars = absDisplayText.split("");
    const allowNegative = this.config && this.config.min < 0;
    let digitsRow = flipDisplay.querySelector(".digits-row");
    if (!digitsRow) {
      flipDisplay.innerHTML = "";
      digitsRow = document.createElement("div");
      digitsRow.className = "digits-row";
      flipDisplay.appendChild(digitsRow);
    }
    const digitCount = chars.filter((c) => c !== ".").length;
    const expectedLength = (allowNegative ? 1 : 0) + digitCount;
    let existingDigits = Array.from(digitsRow.children);
    if (existingDigits.length !== expectedLength) {
      digitsRow.innerHTML = "";
      existingDigits = [];
    }
    let digitIndex = 0;
    let afterDecimal = false;
    if (allowNegative) {
      let signEl = existingDigits[digitIndex];
      if (!signEl || !signEl.classList.contains("minus-sign")) {
        signEl = document.createElement("div");
        signEl.className = "flip-digit minus-sign";
        const inner2 = document.createElement("div");
        inner2.className = "flip-digit-inner";
        const signs = ["-", "+"];
        signs.forEach((s) => {
          const item = document.createElement("div");
          item.className = "digit-item";
          item.textContent = s;
          inner2.appendChild(item);
        });
        signEl.appendChild(inner2);
        digitsRow.appendChild(signEl);
      }
      const inner = signEl.querySelector(".flip-digit-inner");
      if (inner) {
        const targetPosition = isNegative ? 0 : 1;
        const isInitialSetup = !signEl.dataset.position;
        if (isInitialSetup) {
          signEl.dataset.position = targetPosition.toString();
          inner.style.transition = "none";
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              inner.offsetHeight;
              const digitItem = inner.querySelector(".digit-item");
              if (!digitItem) return;
              const computedStyle = window.getComputedStyle(digitItem);
              const digitHeight = parseFloat(computedStyle.height) || 28;
              const offset = Math.round(-targetPosition * digitHeight);
              inner.style.transform = `translateY(${offset}px)`;
              requestAnimationFrame(() => {
                inner.style.transition = "";
              });
            });
          });
        } else {
          signEl.dataset.position = targetPosition.toString();
          const digitItem = inner.querySelector(".digit-item");
          if (!digitItem) return;
          const computedStyle = window.getComputedStyle(digitItem);
          const digitHeight = parseFloat(computedStyle.height) || 28;
          const offset = Math.round(-targetPosition * digitHeight);
          inner.style.transform = `translateY(${offset}px)`;
        }
      }
      digitIndex++;
    }
    chars.forEach((char, charIndex) => {
      if (char === ".") {
        afterDecimal = true;
      } else {
        let digitEl = existingDigits[digitIndex];
        if (!digitEl || digitEl.classList.contains("decimal") || digitEl.classList.contains("minus-sign")) {
          digitEl = document.createElement("div");
          digitEl.className = afterDecimal ? "flip-digit fractional" : "flip-digit";
          const inner2 = document.createElement("div");
          inner2.className = "flip-digit-inner";
          const baseDigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
          baseDigits.forEach((d) => {
            const item = document.createElement("div");
            item.className = "digit-item";
            item.textContent = d;
            inner2.appendChild(item);
          });
          digitEl.appendChild(inner2);
          digitsRow.appendChild(digitEl);
        }
        const inner = digitEl.querySelector(".flip-digit-inner");
        if (inner) {
          const targetDigit = parseInt(char);
          const isInitialSetup = !digitEl.dataset.position;
          if (isInitialSetup) {
            digitEl.dataset.position = targetDigit.toString();
            inner.style.transition = "none";
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                inner.offsetHeight;
                const digitItem = inner.querySelector(".digit-item");
                if (!digitItem) return;
                const computedStyle = window.getComputedStyle(digitItem);
                const digitHeight = parseFloat(computedStyle.height) || 28;
                const offset = Math.round(-targetDigit * digitHeight);
                inner.style.transform = `translateY(${offset}px)`;
                requestAnimationFrame(() => {
                  inner.style.transition = "";
                });
              });
            });
          } else {
            digitEl.dataset.position = targetDigit.toString();
            const digitItem = inner.querySelector(".digit-item");
            const computedStyle = window.getComputedStyle(digitItem);
            const digitHeight = parseFloat(computedStyle.height) || 28;
            const offset = Math.round(-targetDigit * digitHeight);
            inner.style.transform = `translateY(${offset}px)`;
            const handleTransitionEnd = () => {
              const finalDigitHeight = digitItem ? digitItem.getBoundingClientRect().height : 28;
              const finalOffset = Math.round(-newPosition * finalDigitHeight);
              inner.style.transform = `translateY(${finalOffset}px)`;
              inner.removeEventListener("transitionend", handleTransitionEnd);
            };
            inner.removeEventListener("transitionend", handleTransitionEnd);
            inner.addEventListener("transitionend", handleTransitionEnd, { once: true });
          }
        }
        digitIndex++;
      }
    });
    const existingUnit = flipDisplay.querySelector(".flip-digit.unit");
    if (unit) {
      if (!existingUnit) {
        const unitSpan = document.createElement("div");
        unitSpan.className = "flip-digit unit";
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
    return document.createElement("foundry-gauge-card-editor");
  }
  static getStubConfig() {
    return {
      entity: "sensor.temperature",
      title: "Gauge",
      title_font_size: 12,
      odometer_font_size: 60,
      odometer_vertical_position: 120,
      ring_style: "brass",
      rivet_color: "#6a5816",
      plate_color: "#8c7626",
      plate_transparent: false,
      min: 0,
      max: 100,
      unit: "",
      decimals: 0,
      start_angle: 200,
      end_angle: 160,
      animation_duration: 1.2,
      high_needle_enabled: false,
      high_needle_color: "#FF9800",
      high_needle_duration: 60,
      high_needle_length: 75,
      wear_level: 50,
      glass_effect_enabled: true,
      aged_texture: "everywhere",
      aged_texture_intensity: 50,
      segments: [
        { from: 0, to: 33, color: "#4CAF50" },
        { from: 33, to: 66, color: "#FFC107" },
        { from: 66, to: 100, color: "#F44336" }
      ]
    };
  }
};
customElements.define("foundry-gauge-card", FoundryGaugeCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "foundry-gauge-card",
  name: "Foundry Gauge Card",
  description: "A vintage style gauge card",
  preview: "https://raw.githubusercontent.com/dprischak/Foundry-Card/main/preview.png",
  documentationURL: "https://github.com/dprischak/Foundry-Card"
});

// src/cards/foundry-gauge-editor.js
var FoundryGaugeCardEditor = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  setConfig(config) {
    this._config = {
      ...config,
      segments: Array.isArray(config.segments) ? config.segments : []
    };
    this.render();
  }
  set hass(hass) {
    this._hass = hass;
    if (this._form1) this._form1.hass = hass;
    if (this._form2) this._form2.hass = hass;
  }
  render() {
    if (!this._hass || !this._config) return;
    if (!this._root) {
      this._root = document.createElement("div");
      const style = document.createElement("style");
      style.textContent = `
        /* Layout adjustments */
        .card-config { display: flex; flex-direction: column; gap: 16px; }
        
        /* Segment Section Styling */
        .segments-section {
          margin-top: 8px;
          margin-bottom: 8px;
          padding: 16px;
          background: var(--card-background-color, #fff);
          border: 1px solid var(--divider-color, #e0e0e0);
          border-radius: 4px;
        }
        .section-header {
          font-weight: 500;
          margin-bottom: 12px;
          color: var(--primary-text-color);
          font-size: 16px;
        }
        .segment-row {
          display: flex;
          gap: 8px;
          align-items: flex-end;
          margin-bottom: 12px;
          background: var(--secondary-background-color, #f9f9f9);
          padding: 10px;
          border-radius: 4px;
        }
        .input-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .input-group label {
          font-size: 11px;
          color: var(--secondary-text-color);
          text-transform: uppercase;
          font-weight: 600;
        }
        .input-group input {
          width: 100%;
          padding: 8px;
          box-sizing: border-box;
          border: 1px solid var(--divider-color, #ccc);
          border-radius: 4px;
          background: var(--card-background-color, #fff);
          color: var(--primary-text-color);
        }
        .input-group input[type="color"] {
          height: 36px;
          padding: 2px;
          cursor: pointer;
        }
        .remove-btn {
          background: none;
          border: none;
          color: var(--error-color, #db4437);
          cursor: pointer;
          padding: 8px;
          height: 36px;
          display: flex;
          align-items: center;
        }
        .remove-btn:hover {
          background: rgba(219, 68, 55, 0.1);
          border-radius: 50%;
        }
        .add-btn {
          background-color: var(--primary-color, #03a9f4);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          font-size: 14px;
          margin-top: 4px;
        }
        .add-btn:hover {
          background-color: var(--primary-color-dark, #0288d1);
        }
        .reset-btn {
          background-color: var(--secondary-text-color, #757575);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          font-size: 14px;
          margin-top: 12px;
          width: 100%;
        }
        .reset-btn:hover {
          background-color: var(--error-color, #db4437);
        }
        .validation-warning {
          background: var(--warning-color, #ff9800);
          color: white;
          padding: 8px 12px;
          border-radius: 4px;
          margin: 8px 0;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .validation-error {
          background: var(--error-color, #db4437);
          color: white;
          padding: 8px 12px;
          border-radius: 4px;
          margin: 8px 0;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
      `;
      this.shadowRoot.appendChild(style);
      this.shadowRoot.appendChild(this._root);
      this._form1 = document.createElement("ha-form");
      this._form1.addEventListener("value-changed", this._handleFormChanged.bind(this));
      this._root.appendChild(this._form1);
      this._segmentsContainer = document.createElement("div");
      this._segmentsContainer.className = "segments-section";
      this._root.appendChild(this._segmentsContainer);
      this._form2 = document.createElement("ha-form");
      this._form2.addEventListener("value-changed", this._handleFormChanged.bind(this));
      this._root.appendChild(this._form2);
      this._validationContainer = document.createElement("div");
      this._root.appendChild(this._validationContainer);
      const resetBtn = document.createElement("button");
      resetBtn.className = "reset-btn";
      resetBtn.textContent = "\u26A0\uFE0F Reset to Default Configuration";
      resetBtn.title = "Reset all settings to defaults (keeps entity)";
      resetBtn.addEventListener("click", () => this._resetToDefaults());
      this._root.appendChild(resetBtn);
    }
    if (this._form1) this._form1.hass = this._hass;
    if (this._form2) this._form2.hass = this._hass;
    const formData = this._configToForm(this._config);
    this._form1.schema = this._getSchemaTop(formData);
    this._form1.data = formData;
    this._form1.computeLabel = this._computeLabel;
    this._form2.schema = this._getSchemaBottom(formData);
    this._form2.data = formData;
    this._form2.computeLabel = this._computeLabel;
    this._renderSegments();
    this._displayValidationMessages();
  }
  _displayValidationMessages() {
    if (!this._validationContainer) return;
    const messages = [];
    const config = this._config;
    const min = config.min !== void 0 ? config.min : 0;
    const max = config.max !== void 0 ? config.max : 100;
    if (min >= max) {
      messages.push({ type: "error", text: "\u26A0\uFE0F Minimum value must be less than maximum value" });
    }
    const segments = config.segments || [];
    if (segments.length > 0) {
      segments.forEach((seg, idx) => {
        if (seg.from >= seg.to) {
          messages.push({ type: "warning", text: `\u26A0\uFE0F Segment ${idx + 1}: "From" should be less than "To"` });
        }
        if (seg.from < min || seg.to > max) {
          messages.push({ type: "warning", text: `\u26A0\uFE0F Segment ${idx + 1}: Range should be within min/max values` });
        }
      });
    }
    if (config.decimals !== void 0 && (config.decimals < 0 || config.decimals > 10)) {
      messages.push({ type: "warning", text: "\u26A0\uFE0F Decimals should be between 0 and 10" });
    }
    if (messages.length > 0) {
      this._validationContainer.innerHTML = messages.map(
        (msg) => `<div class="validation-${msg.type}">${msg.text}</div>`
      ).join("");
    } else {
      this._validationContainer.innerHTML = "";
    }
  }
  _resetToDefaults() {
    if (!confirm("Reset all settings to defaults? This will keep your entity but reset all other configuration.")) {
      return;
    }
    const entity = this._config.entity;
    this._updateConfig({
      entity,
      title: "",
      min: 0,
      max: 100,
      unit: "",
      decimals: 0,
      segments: [
        { from: 0, to: 33, color: "#4CAF50" },
        { from: 33, to: 66, color: "#FFC107" },
        { from: 66, to: 100, color: "#F44336" }
      ],
      start_angle: 200,
      end_angle: 160,
      animation_duration: 1.2,
      title_font_size: 12,
      odometer_font_size: 60,
      odometer_vertical_position: 120,
      ring_style: "brass",
      rivet_color: "#6d5d4b",
      plate_color: "#8c7626",
      plate_transparent: false,
      wear_level: 50,
      glass_effect_enabled: true,
      aged_texture: "glass_only",
      aged_texture_intensity: 50,
      high_needle_enabled: false,
      high_needle_color: "#FF9800",
      high_needle_duration: 60,
      high_needle_length: 100,
      tap_action: { action: "more-info" },
      hold_action: { action: "more-info" },
      double_tap_action: { action: "more-info" }
    });
  }
  // --- Segments Renderer (innerHTML) ---
  _renderSegments() {
    if (!this._segmentsContainer) return;
    const segments = this._config.segments || [];
    let html = `<div class="section-header">Color Ranges</div>`;
    if (segments.length === 0) {
      html += `<div style="font-style: italic; color: var(--secondary-text-color); margin-bottom: 12px;">No segments defined.</div>`;
    }
    segments.forEach((seg, index) => {
      const fromVal = seg.from !== void 0 ? seg.from : 0;
      const toVal = seg.to !== void 0 ? seg.to : 0;
      const colVal = seg.color || "#000000";
      html += `
        <div class="segment-row">
          <div class="input-group">
            <label>From</label>
            <input type="number" class="seg-input" data-idx="${index}" data-key="from" value="${fromVal}">
          </div>
          <div class="input-group">
            <label>To</label>
            <input type="number" class="seg-input" data-idx="${index}" data-key="to" value="${toVal}">
          </div>
          <div class="input-group">
            <label>Color</label>
            <input type="color" class="seg-input" data-idx="${index}" data-key="color" value="${colVal}">
          </div>
          <button class="remove-btn" data-idx="${index}" title="Remove">
            <svg style="width:24px;height:24px" viewBox="0 0 24 24">
              <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </button>
        </div>
      `;
    });
    html += `<button id="add-btn" class="add-btn">+ Add Color Range</button>`;
    this._segmentsContainer.innerHTML = html;
    this._segmentsContainer.querySelectorAll(".seg-input").forEach((input) => {
      input.addEventListener("change", (e) => {
        const idx = parseInt(e.target.dataset.idx);
        const key = e.target.dataset.key;
        let val = e.target.value;
        if (key !== "color") val = Number(val);
        this._updateSegment(idx, key, val);
      });
    });
    this._segmentsContainer.querySelectorAll(".remove-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const target = e.target.closest(".remove-btn");
        if (target) {
          this._removeSegment(parseInt(target.dataset.idx));
        }
      });
    });
    const addBtn = this._segmentsContainer.querySelector("#add-btn");
    if (addBtn) {
      addBtn.addEventListener("click", () => this._addSegment());
    }
  }
  // --- Data Logic for Segments ---
  _updateSegment(index, key, value) {
    const segments = [...this._config.segments || []];
    if (segments[index]) {
      segments[index] = { ...segments[index], [key]: value };
      this._updateConfig({ segments });
    }
  }
  _addSegment() {
    const segments = [...this._config.segments || []];
    const last = segments[segments.length - 1];
    const from = last ? last.to : 0;
    const to = from + 10;
    segments.push({ from, to, color: "#4CAF50" });
    this._updateConfig({ segments });
  }
  _removeSegment(index) {
    const segments = [...this._config.segments || []];
    segments.splice(index, 1);
    this._updateConfig({ segments });
  }
  _updateConfig(updates) {
    this._config = { ...this._config, ...updates };
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: this._config },
      bubbles: true,
      composed: true
    }));
  }
  // --- HA Form Logic ---
  _handleFormChanged(ev) {
    const newConfig = this._formToConfig(ev.detail.value);
    if (JSON.stringify(this._config) !== JSON.stringify(newConfig)) {
      this._updateConfig(newConfig);
    }
  }
  _configToForm(config) {
    const data = { ...config };
    data.appearance = {
      ring_style: config.ring_style,
      rivet_color: this._hexToRgb(config.rivet_color ?? "#6a5816") ?? [106, 88, 22],
      plate_color: this._hexToRgb(config.plate_color ?? "#8c7626") ?? [140, 118, 38],
      plate_transparent: config.plate_transparent,
      wear_level: config.wear_level,
      glass_effect_enabled: config.glass_effect_enabled,
      aged_texture: config.aged_texture,
      aged_texture_intensity: config.aged_texture_intensity
    };
    data.layout = {
      title_font_size: config.title_font_size,
      odometer_font_size: config.odometer_font_size,
      odometer_vertical_position: config.odometer_vertical_position,
      start_angle: config.start_angle,
      end_angle: config.end_angle,
      animation_duration: config.animation_duration
    };
    data.high_needle = {
      high_needle_enabled: config.high_needle_enabled,
      high_needle_color: this._hexToRgb(config.high_needle_color ?? "#FF9800") ?? [255, 152, 0],
      high_needle_duration: config.high_needle_duration,
      high_needle_length: config.high_needle_length
    };
    data.actions = {};
    ["tap", "hold", "double_tap"].forEach((type) => {
      const conf = config[`${type}_action`] || {};
      data.actions[`${type}_action_action`] = conf.action || "more-info";
      data.actions[`${type}_action_navigation_path`] = conf.navigation_path || "";
      data.actions[`${type}_action_service`] = conf.service || "";
      data.actions[`${type}_action_target_entity`] = conf.target?.entity_id || "";
    });
    return data;
  }
  _formToConfig(formData) {
    const config = { ...this._config };
    const defaults = {
      rivet_color: this._config?.rivet_color ?? "#6d5d4b",
      plate_color: this._config?.plate_color ?? "#8c7626",
      high_needle_color: this._config?.high_needle_color ?? "#FF9800"
    };
    Object.keys(formData).forEach((key) => {
      if (["appearance", "layout", "high_needle", "actions"].includes(key)) return;
      config[key] = formData[key];
    });
    if (formData.appearance) Object.assign(config, formData.appearance);
    if (formData.layout) Object.assign(config, formData.layout);
    if (formData.high_needle) Object.assign(config, formData.high_needle);
    const rc = this._rgbToHex(config.rivet_color);
    if (rc) config.rivet_color = rc;
    else config.rivet_color = defaults.rivet_color;
    const pc = this._rgbToHex(config.plate_color);
    if (pc) config.plate_color = pc;
    else config.plate_color = defaults.plate_color;
    const hn = this._rgbToHex(config.high_needle_color);
    if (hn) config.high_needle_color = hn;
    else config.high_needle_color = defaults.high_needle_color;
    if (formData.actions) {
      ["tap", "hold", "double_tap"].forEach((type) => {
        const group = formData.actions;
        const actionType = group[`${type}_action_action`];
        const newAction = { action: actionType };
        if (actionType === "navigate") {
          newAction.navigation_path = group[`${type}_action_navigation_path`];
        } else if (actionType === "call-service") {
          newAction.service = group[`${type}_action_service`];
          const targetEnt = group[`${type}_action_target_entity`];
          if (targetEnt) newAction.target = { entity_id: targetEnt };
        }
        config[`${type}_action`] = newAction;
      });
    }
    return config;
  }
  _computeLabel(schema) {
    if (schema.label) return schema.label;
    if (schema.name === "entity") return "Entity";
    return schema.name.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  }
  // --- Schemas ---
  // Schema 1: Top section (Entity, Title, Min/Max)
  _getSchemaTop(formData) {
    return [
      {
        name: "entity",
        selector: { entity: { domain: "sensor" } }
      },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "title", selector: { text: {} } },
          { name: "unit", selector: { text: {} } }
        ]
      },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "min", selector: { number: { mode: "box" } } },
          { name: "max", selector: { number: { mode: "box" } } },
          { name: "decimals", selector: { number: { min: 0, max: 5, mode: "box" } } }
        ]
      }
    ];
  }
  _hexToRgb(hex) {
    if (typeof hex !== "string") return null;
    const h = hex.replace("#", "").trim();
    if (h.length !== 6) return null;
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    if ([r, g, b].some(Number.isNaN)) return null;
    return [r, g, b];
  }
  _rgbToHex(input) {
    let rgb = input;
    if (rgb && typeof rgb === "object" && !Array.isArray(rgb)) {
      if (Array.isArray(rgb.color)) rgb = rgb.color;
      else if ("r" in rgb && "g" in rgb && "b" in rgb) rgb = [rgb.r, rgb.g, rgb.b];
    }
    if (!Array.isArray(rgb) || rgb.length !== 3) return null;
    const [r, g, b] = rgb.map((n) => Math.max(0, Math.min(255, Math.round(Number(n)))));
    if ([r, g, b].some((n) => Number.isNaN(n))) return null;
    const toHex = (n) => n.toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
  // Schema 2: Bottom section (Appearance, Layout, Actions)
  _getSchemaBottom(formData) {
    const actionData = formData.actions || {};
    return [
      // Appearance
      {
        name: "appearance",
        type: "expandable",
        title: "Appearance",
        schema: [
          {
            name: "ring_style",
            label: "Ring Style",
            selector: {
              select: {
                mode: "dropdown",
                options: [
                  { value: "none", label: "None" },
                  { value: "brass", label: "Brass" },
                  { value: "silver", label: "Silver" },
                  { value: "chrome", label: "Chrome" },
                  { value: "copper", label: "Copper" },
                  { value: "black", label: "Black" },
                  { value: "white", label: "White" },
                  { value: "blue", label: "Blue" },
                  { value: "green", label: "Green" },
                  { value: "red", label: "Red" }
                ]
              }
            }
          },
          {
            type: "grid",
            name: "",
            schema: [
              { name: "rivet_color", label: "Rivet Color", selector: { color_rgb: {} } },
              { name: "plate_color", label: "Plate Color", selector: { color_rgb: {} } }
            ]
          },
          { name: "plate_transparent", label: "Transparent Plate", selector: { boolean: {} } },
          { name: "wear_level", label: "Wear Level", selector: { number: { min: 0, max: 100, mode: "slider" } } },
          { name: "glass_effect_enabled", label: "Glass Effect", selector: { boolean: {} } },
          {
            name: "aged_texture",
            label: "Aged Texture",
            selector: {
              select: {
                mode: "dropdown",
                options: [
                  { value: "none", label: "None" },
                  { value: "glass_only", label: "Glass Only" },
                  { value: "everywhere", label: "Everywhere" }
                ]
              }
            }
          },
          { name: "aged_texture_intensity", label: "Texture Intensity", selector: { number: { min: 0, max: 100, mode: "slider" } } }
        ]
      },
      // Layout
      {
        name: "layout",
        type: "expandable",
        title: "Layout & Text",
        schema: [
          {
            type: "grid",
            name: "",
            schema: [
              { name: "title_font_size", label: "Title Font Size", selector: { number: { mode: "box" } } },
              { name: "odometer_font_size", label: "Odometer Size", selector: { number: { mode: "box" } } }
            ]
          },
          { name: "odometer_vertical_position", label: "Odometer Position Y", selector: { number: { mode: "box" } } },
          { name: "start_angle", label: "Start Angle", selector: { number: { min: 0, max: 360, mode: "slider" } } },
          { name: "end_angle", label: "End Angle", selector: { number: { min: 0, max: 360, mode: "slider" } } },
          { name: "animation_duration", label: "Animation Duration (s)", selector: { number: { mode: "box", step: 0.1, min: 0.1 } } }
        ]
      },
      // High Needle
      {
        name: "high_needle",
        type: "expandable",
        title: "High Value Needle",
        schema: [
          { name: "high_needle_enabled", label: "Enable High Needle", selector: { boolean: {} } },
          { name: "high_needle_color", label: "Needle Color", selector: { color_rgb: {} } },
          {
            type: "grid",
            name: "",
            schema: [
              { name: "high_needle_duration", label: "Hold Duration (s)", selector: { number: { mode: "box" } } },
              { name: "high_needle_length", label: "Length (%)", selector: { number: { mode: "box" } } }
            ]
          }
        ]
      },
      // Actions
      {
        name: "actions",
        type: "expandable",
        title: "Actions",
        schema: [
          ...this._getActionSchema("tap", "Tap", actionData),
          ...this._getActionSchema("hold", "Hold", actionData),
          ...this._getActionSchema("double_tap", "Double Tap", actionData)
        ]
      }
    ];
  }
  _getActionSchema(type, label, actionData) {
    const actionKey = `${type}_action_action`;
    const currentAction = actionData ? actionData[actionKey] : "more-info";
    const schema = [
      {
        name: actionKey,
        label: `${label} Action`,
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "more-info", label: "More Info" },
              { value: "toggle", label: "Toggle" },
              { value: "navigate", label: "Navigate" },
              { value: "call-service", label: "Call Service" },
              { value: "shake", label: "Shake (Custom)" },
              { value: "none", label: "None" }
            ]
          }
        }
      }
    ];
    if (currentAction === "navigate") {
      schema.push({ name: `${type}_action_navigation_path`, label: "Navigation Path", selector: { text: {} } });
    }
    if (currentAction === "call-service") {
      schema.push({ name: `${type}_action_service`, label: "Service", selector: { text: {} } });
      schema.push({ name: `${type}_action_target_entity`, label: "Target Entity", selector: { entity: {} } });
    }
    return schema;
  }
};
customElements.define("foundry-gauge-card-editor", FoundryGaugeCardEditor);

// src/foundry-cards.js
var FOUNDRY_CARDS_VERSION = "0.8.0";
console.info(
  `%cFoundry Cards%c v${FOUNDRY_CARDS_VERSION}`,
  "color: #03a9f4; font-weight: bold;",
  "color: inherit;"
);
