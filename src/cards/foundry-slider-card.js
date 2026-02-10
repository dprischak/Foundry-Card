import { fireEvent, getActionConfig } from './utils.js';
import { ensureLedFont } from './fonts.js';

class FoundrySliderCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._uniqueId = Math.random().toString(36).substr(2, 9);
  }

  setConfig(config) {
    this.config = { ...config };

    // Basic Slider Settings
    this.config.min = this.config.min !== undefined ? this.config.min : 0;
    this.config.max = this.config.max !== undefined ? this.config.max : 100;
    this.config.step = this.config.step !== undefined ? this.config.step : 1;
    this.config.value =
      this.config.value !== undefined ? this.config.value : this.config.min;

    // Brass Theme Defaults (from digital clock)
    this.config.ring_style = this.config.ring_style || 'brass';
    this.config.plate_color = this.config.plate_color || '#8c7626';
    this.config.face_color =
      this.config.face_color ??
      this.config.background_color ??
      this.config.plate_color ??
      this.config.slider_background_color ??
      '#8c7626';
    this.config.plate_transparent =
      this.config.plate_transparent !== undefined
        ? this.config.plate_transparent
        : false;
    this.config.rivet_color = this.config.rivet_color || '#6a5816';
    this.config.knob_color = this.config.knob_color || '#c9a961';
    this.config.font_color = this.config.font_color || '#000000';
    this.config.font_bg_color = this.config.font_bg_color || '#ffffff';

    // Slider-specific colors
    this.config.slider_color = this.config.slider_color || '#444444';
    this.config.tick_color = this.config.tick_color || 'rgba(0,0,0,0.22)';

    // Display Settings
    this.config.show_value =
      this.config.show_value !== undefined ? this.config.show_value : true;
    this.config.title_color = this.config.title_color || '#3e2723';
    this.config.title_font_size =
      this.config.title_font_size !== undefined
        ? this.config.title_font_size
        : 14;
    this.config.value_font_size =
      this.config.value_font_size !== undefined
        ? this.config.value_font_size
        : 36;

    // Knob Settings
    this.config.knob_shape = this.config.knob_shape || 'square'; // 'circular', 'square', 'rectangular'
    this.config.knob_size =
      this.config.knob_size !== undefined ? this.config.knob_size : 100;

    // Visual Effects (from digital clock)
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

    const width = 155;
    const height = 350;

    this._viewBoxHeight = height;

    const plateWidth = 145;
    const plateHeight = 340;
    const plateX = 5;
    const plateY = 5;

    const rimWidth = 115;
    const rimHeight = 310;
    const rimX = 20;
    const rimY = 20;

    const bevelX = rimX + 8;
    const bevelY = rimY + 8;
    const bevelW = rimWidth - 16;
    const bevelH = rimHeight - 16;

    const screenX = bevelX + 4;
    const screenY = bevelY + 4;
    const screenW = bevelW - 8;
    const screenH = bevelH - 8;
    const screenCenterX = screenX + screenW / 2;

    const TRACK_WIDTH_MULTIPLIER = 0.32; // Track width = knob_size * this multiplier

    // Calculate knob dimensions based on shape (0-100 maps to 4-32px)
    const KNOB_SIZE_MAX = 32;
    const KNOB_SIZE_MIN = KNOB_SIZE_MAX / 8;
    const knobSizePercent = Math.max(0, Math.min(100, Number(cfg.knob_size)));
    const knobSize =
      KNOB_SIZE_MIN + (KNOB_SIZE_MAX - KNOB_SIZE_MIN) * (knobSizePercent / 100);
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

    const knobRx =
      knobBorderRadius === '50%'
        ? knobWidth / 2
        : Number.parseFloat(knobBorderRadius);
    const knobRy =
      knobBorderRadius === '50%'
        ? knobHeight / 2
        : Number.parseFloat(knobBorderRadius);

    this._knobWidth = knobWidth;
    this._knobHeight = knobHeight;
    this._knobRx = knobRx;
    this._knobRy = knobRy;

    // LED Display positioning - within the screen area
    const displayChars = this._getLedCharCount(cfg);
    const ledCharWidth = cfg.value_font_size * 0.45;
    const ledPaddingX = Math.max(6, Math.round(cfg.value_font_size * 0.2));
    const ledWidthBase = Math.round(
      displayChars * ledCharWidth + ledPaddingX * 2
    );
    const ledWidth = Math.min(screenW - 12, Math.max(50, ledWidthBase));
    const ledHeight = 46;
    const ledX = screenCenterX - ledWidth / 2;
    const ledY = screenY + screenH - ledHeight - 10;

    // Track dimensions - centered horizontally inside screen
    const trackWidth = knobSize * TRACK_WIDTH_MULTIPLIER; // Dynamic based on knob size
    const trackX = screenCenterX - trackWidth / 2;
    const trackTopY = screenY + 40;
    const trackBottomY = cfg.show_value ? ledY - 10 : screenY + screenH - 16;
    const trackHeight = trackBottomY - trackTopY;
    const sliderInputTop = trackTopY;
    const sliderInputBottom = trackBottomY;
    const sliderInputHeight = sliderInputBottom - sliderInputTop;
    const sliderInputLength = sliderInputHeight;

    // Store geometry for knob position updates
    this._trackTopY = trackTopY;
    this._trackBottomY = trackBottomY;
    this._trackHeight = trackHeight;
    this._trackCenterX = trackX + trackWidth / 2;

    // Tick mark positioning
    const tickMajorLength = 12;
    const tickMinorLength = 6;
    const tickStartX = Math.min(
      trackX + trackWidth + 6,
      screenX + screenW - tickMajorLength - 2
    );

    // Visual effects
    const wearLevel = cfg.wear_level;
    const glassEffectEnabled = false;
    const agedTexture = cfg.aged_texture;
    const agedTextureIntensity = cfg.aged_texture_intensity;
    const agedTextureOpacity = ((100 - agedTextureIntensity) / 100) * 1.0;
    const effectiveAgedTexture =
      cfg.plate_transparent && agedTexture === 'everywhere'
        ? 'glass_only'
        : agedTexture;
    const backgroundColor = cfg.face_color ?? cfg.plate_color;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }
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
        .title {
          font-family: 'Georgia', serif;
          font-size: ${cfg.title_font_size}px;
          font-weight: bold;
          opacity: 0.9;
          text-anchor: middle;
          pointer-events: none;
          letter-spacing: 1px;
        }

        /* HTML input range overlay */
        .slider-input-container {
          position: absolute;
          top: ${((sliderInputTop / height) * 100).toFixed(2)}%;
          left: ${(((trackX + trackWidth / 2) / width) * 100).toFixed(2)}%;
          width: 100%;
          height: ${((sliderInputHeight / height) * 100).toFixed(2)}%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: visible;
          pointer-events: all;
        }

        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          width: ${sliderInputLength}px;
          height: ${trackWidth}px;
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
          height: ${trackWidth}px;
          border: none;
        }
        input[type="range"]::-moz-range-track {
          background: transparent;
          height: ${trackWidth}px;
          border: none;
        }

        /* Thumb/Knob styling */
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 1px;
          height: 1px;
          margin-top: 0;
          border-radius: 0;
          background: transparent;
          border: none;
          box-shadow: none;
          cursor: grab;
        }

        input[type="range"]::-moz-range-thumb {
          width: 1px;
          height: 1px;
          border-radius: 0;
          background: transparent;
          border: none;
          box-shadow: none;
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
          <svg class="slider-svg" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <!-- Radial gradient for LED display background -->
              <radialGradient id="ledBg-${uid}" cx="50%" cy="50%">
                <stop offset="0%" style="stop-color:${cfg.font_bg_color};stop-opacity:1" />
                <stop offset="100%" style="stop-color:${this.adjustColor(cfg.font_bg_color, -20)};stop-opacity:1" />
              </radialGradient>

              ${this.renderGradients(uid)}

              <!-- Track Gradient -->
              <linearGradient id="trackGradient-${uid}" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:${this.adjustColor(cfg.slider_color, 25)};stop-opacity:1" />
                <stop offset="50%" style="stop-color:${cfg.slider_color};stop-opacity:1" />
                <stop offset="100%" style="stop-color:${this.adjustColor(cfg.slider_color, -8)};stop-opacity:1" />
              </linearGradient>

              <!-- Knob Gradient -->
              <linearGradient id="knobGrad-${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:${this.adjustColor(cfg.knob_color, 40)};stop-opacity:1" />
                <stop offset="50%" style="stop-color:${cfg.knob_color};stop-opacity:1" />
                <stop offset="100%" style="stop-color:${this.adjustColor(cfg.knob_color, -15)};stop-opacity:1" />
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
            <rect x="${plateX}" y="${plateY}" width="${plateWidth}" height="${plateHeight}" rx="15" ry="15" 
                  fill="${cfg.plate_transparent ? 'none' : cfg.plate_color}"
                  stroke="${cfg.plate_transparent ? 'none' : '#888'}" 
                  stroke-width="0.5"
                  filter="${effectiveAgedTexture === 'everywhere' && !cfg.plate_transparent ? `url(#aged-${uid}) drop-shadow(1px 1px 2px rgba(0,0,0,0.3))` : 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))'}" />

            ${this.renderRivets(plateWidth, plateHeight, plateX, plateY)}

            ${this.renderSquareRim(
              cfg.ring_style,
              uid,
              backgroundColor,
              glassEffectEnabled,
              rimX,
              rimY,
              rimWidth,
              rimHeight
            )}

            ${
              effectiveAgedTexture === 'everywhere' && !cfg.plate_transparent
                ? `
              <rect x="${plateX}" y="${plateY}" width="${plateWidth}" height="${plateHeight}"
                    rx="15" ry="15" fill="rgba(255,255,255,0.35)" filter="url(#aged-${uid})"
                    style="pointer-events:none;" />
            `
                : ''
            }

            ${
              effectiveAgedTexture === 'glass_only'
                ? `
              <rect x="${screenX}" y="${screenY}" width="${screenW}" height="${screenH}"
                    rx="10" ry="10" fill="rgba(255,255,255,0.35)" filter="url(#aged-${uid})"
                    style="pointer-events:none;" />
            `
                : ''
            }

            <!-- Title -->
            ${title ? `<text x="${screenCenterX}" y="${screenY + 22}" class="title" style="fill: ${cfg.title_color}">${title}</text>` : ''}

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
            ${this.renderTickMarks(
              cfg,
              trackTopY,
              trackBottomY,
              tickStartX,
              tickMajorLength,
              tickMinorLength
            )}

            <!-- Slider Knob -->
            <rect id="sliderKnob"
                  x="${(trackX + trackWidth / 2 - knobWidth / 2).toFixed(2)}"
                  y="${(trackBottomY - knobHeight / 2).toFixed(2)}"
                  width="${knobWidth}"
                  height="${knobHeight}"
                  rx="${knobRx}"
                  ry="${knobRy}"
                  fill="url(#knobGrad-${uid})"
              style="filter: drop-shadow(0 1px 3px rgba(0,0,0,0.45)); pointer-events: none;" />

            <!-- LED Display Box -->
            ${cfg.show_value ? this.renderLEDDisplay(uid, cfg, ledX, ledY, ledWidth, ledHeight, glassEffectEnabled) : ''}

            <!-- Wear Marks -->
            ${this.renderWearMarks(wearLevel, width, height)}
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
      <linearGradient id="glassGrad-${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#aaccff;stop-opacity:0.3" />
        <stop offset="100%" style="stop-color:#aaccff;stop-opacity:0" />
      </linearGradient>
    `;
  }

  renderSquareRim(ringStyle, uid, bgColor, glassEffectEnabled, x, y, w, h) {
    const data = this.getRimStyleData(ringStyle, uid);
    if (!data) return '';

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
        <line x1="${r.cx - 3}" y1="${r.cy}" x2="${r.cx + 3}" y2="${r.cy}" 
              class="screw-detail" 
              transform="rotate(45, ${r.cx}, ${r.cy})"/>
      </g>
    `
      )
      .join('');
  }

  renderTickMarks(
    cfg,
    trackTopY,
    trackBottomY,
    tickStartX,
    majorLength,
    minorLength
  ) {
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
      const y = trackBottomY - trackHeight * percent; // Inverted: bottom is min

      ticks += `<line x1="${tickStartX}" y1="${y}" x2="${tickStartX + majorLength}" y2="${y}" 
                      stroke="${tickColor}" stroke-width="2" />`;
    }

    // Minor ticks at each step (if step is reasonable)
    const numSteps = range / step;
    if (numSteps > 0 && numSteps <= 100) {
      for (let i = 0; i <= numSteps; i++) {
        const value = min + i * step;
        const percent = (value - min) / range;
        const y = trackBottomY - trackHeight * percent;

        // Skip if this coincides with a major tick
        const isMajor = i % Math.ceil(numSteps / 10) === 0;
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
      ${
        glassEffectEnabled
          ? `
        <path d="M ${x + 4} ${y + 4} 
                 L ${x + width - 4} ${y + 4} 
                 L ${x + width - 4} ${y + height * 0.4} 
                 Q ${x + width / 2} ${y + height * 0.5} ${x + 4} ${y + height * 0.4} Z" 
              fill="white" 
              opacity="0.08" />
      `
          : ''
      }
      
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

  renderWearMarks(wearLevel, viewBoxWidth, viewBoxHeight) {
    if (wearLevel === 0) return '';

    const baseWidth = 150;
    const baseHeight = 260;
    const scaleX = viewBoxWidth / baseWidth;
    const scaleY = viewBoxHeight / baseHeight;

    // 12 wear marks positioned for vertical slider (avoiding track area x=60-90)
    const allMarks = [
      {
        type: 'circle',
        cx: 30,
        cy: 55,
        r: 1.8,
        fill: '#8B7355',
        baseOpacity: 0.18,
      },
      {
        type: 'ellipse',
        cx: 120,
        cy: 45,
        rx: 2.5,
        ry: 1.2,
        fill: '#6d5d4b',
        baseOpacity: 0.12,
      },
      {
        type: 'circle',
        cx: 45,
        cy: 95,
        r: 1.2,
        fill: '#8B7355',
        baseOpacity: 0.15,
      },
      {
        type: 'circle',
        cx: 128,
        cy: 88,
        r: 1.5,
        fill: '#6d5d4b',
        baseOpacity: 0.2,
      },
      {
        type: 'ellipse',
        cx: 22,
        cy: 140,
        rx: 2,
        ry: 1,
        fill: '#8B7355',
        baseOpacity: 0.1,
      },
      {
        type: 'circle',
        cx: 135,
        cy: 155,
        r: 1,
        fill: '#6d5d4b',
        baseOpacity: 0.15,
      },
      {
        type: 'circle',
        cx: 38,
        cy: 185,
        r: 1.3,
        fill: '#8B7355',
        baseOpacity: 0.12,
      },
      {
        type: 'ellipse',
        cx: 118,
        cy: 195,
        rx: 3,
        ry: 1.5,
        fill: '#8B7355',
        baseOpacity: 0.08,
      },
      {
        type: 'circle',
        cx: 25,
        cy: 225,
        r: 2,
        fill: '#6d5d4b',
        baseOpacity: 0.2,
      },
      {
        type: 'circle',
        cx: 125,
        cy: 238,
        r: 1.8,
        fill: '#8B7355',
        baseOpacity: 0.18,
      },
      {
        type: 'ellipse',
        cx: 60,
        cy: 70,
        rx: 1.5,
        ry: 0.8,
        fill: '#6d5d4b',
        baseOpacity: 0.09,
      },
      {
        type: 'circle',
        cx: 100,
        cy: 215,
        r: 0.8,
        fill: '#8B7355',
        baseOpacity: 0.1,
      },
    ];

    const markCount = Math.ceil((wearLevel / 100) * allMarks.length);
    const marksToShow = allMarks.slice(0, markCount);

    return marksToShow
      .map((mark) => {
        const opacity = Math.min(mark.baseOpacity * (wearLevel / 50), 0.25);
        const cx = (mark.cx * scaleX).toFixed(2);
        const cy = (mark.cy * scaleY).toFixed(2);
        const r = mark.r ? (mark.r * ((scaleX + scaleY) / 2)).toFixed(2) : null;
        const rx = mark.rx ? (mark.rx * scaleX).toFixed(2) : null;
        const ry = mark.ry ? (mark.ry * scaleY).toFixed(2) : null;
        return `<${mark.type} cx="${cx}" cy="${cy}" ${r ? `r="${r}"` : `rx="${rx}" ry="${ry}"`} fill="${mark.fill}" opacity="${opacity}"/>`;
      })
      .join('');
  }

  _attachListeners() {
    const slider = this.shadowRoot.getElementById('slider');
    if (!slider) return;

    slider.oninput = (e) => this._onSliderInput(e);
    slider.onchange = (e) => this._onSliderChange(e);

    const root = this.shadowRoot.getElementById('actionRoot');
    const sliderContainer = this.shadowRoot.querySelector(
      '.slider-input-container'
    );
    const pointerTarget = sliderContainer || root;

    if (pointerTarget) {
      pointerTarget.onpointerdown = (e) => {
        if (e.button !== 0) return;
        this._draggingSlider = true;
        this._suppressTap = true;
        pointerTarget.setPointerCapture(e.pointerId);
        this._setSliderValueFromClientY(e.clientY, false);
        e.preventDefault();
      };

      pointerTarget.onpointermove = (e) => {
        if (!this._draggingSlider) return;
        this._setSliderValueFromClientY(e.clientY, false);
        e.preventDefault();
      };

      pointerTarget.onpointerup = (e) => {
        if (!this._draggingSlider) return;
        this._draggingSlider = false;
        pointerTarget.releasePointerCapture(e.pointerId);
        this._setSliderValueFromClientY(e.clientY, true);
        e.preventDefault();
      };

      pointerTarget.onpointercancel = (e) => {
        if (!this._draggingSlider) return;
        this._draggingSlider = false;
        pointerTarget.releasePointerCapture(e.pointerId);
      };
    }

    if (root) {
      root.onclick = (e) => {
        if (this._suppressTap) {
          this._suppressTap = false;
          return;
        }
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

  _setSliderValueFromClientY(clientY, commit) {
    const slider = this.shadowRoot.getElementById('slider');
    const svg = this.shadowRoot.querySelector('.slider-svg');
    if (!slider || !svg || this._trackHeight === undefined) return;

    const rect = svg.getBoundingClientRect();
    if (!rect.height) return;

    const scaleY = rect.height / (this._viewBoxHeight || rect.height);
    const yInSvg = (clientY - rect.top) / scaleY;

    const cfg = this.config || {};
    const min = Number(cfg.min) || 0;
    const max = Number(cfg.max) || 0;
    const range = max - min || 1;
    const tRaw = (this._trackBottomY - yInSvg) / this._trackHeight;
    const t = Math.min(1, Math.max(0, tRaw));
    const rawValue = min + t * range;

    const step = Number(cfg.step) || 1;
    const decimals = (() => {
      const s = String(step);
      return s.includes('.') ? s.split('.')[1].length : 0;
    })();
    const stepped = step
      ? Math.round((rawValue - min) / step) * step + min
      : rawValue;
    const value = Number(stepped.toFixed(decimals));

    slider.value = value;
    if (commit) {
      this.config.value = Number(value);
      this._updateValueDisplay(value);
      fireEvent(this, 'foundry-slider-change', { value: Number(value) });
    } else {
      this._updateValueDisplay(value);
      fireEvent(this, 'foundry-slider-input', { value: Number(value) });
    }
  }

  _updateValueDisplay(v) {
    const formatted = this._formatValue(v);
    const el = this.shadowRoot.getElementById('valueDisplay');
    if (el) el.textContent = formatted;

    const knob = this.shadowRoot.getElementById('sliderKnob');
    if (knob && this._trackHeight !== undefined) {
      const cfg = this.config || {};
      const min = Number(cfg.min) || 0;
      const max = Number(cfg.max) || 0;
      const range = max - min || 1;
      const value = Number(v);
      const clamped = Math.min(max, Math.max(min, value));
      const t = (clamped - min) / range;
      const centerY = this._trackBottomY - t * this._trackHeight;
      knob.setAttribute('y', (centerY - this._knobHeight / 2).toFixed(2));
      knob.setAttribute(
        'x',
        (this._trackCenterX - this._knobWidth / 2).toFixed(2)
      );
    }
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
    const allowSign = Number(cfg.min) < 0 || Number(cfg.max) < 0;
    const sign = allowSign ? (num < 0 ? '-' : '+') : '';
    const abs = Math.abs(num);

    const maxAbs = Math.max(Math.abs(min), Math.abs(max), 0);
    const intDigits = Math.max(String(Math.floor(maxAbs)).length, 1);

    const fixed =
      decimalPlaces > 0 ? abs.toFixed(decimalPlaces) : String(Math.floor(abs));
    const parts = String(fixed).split('.');
    const intPart = parts[0].padStart(intDigits, '0');
    const fracPart = parts[1] ? '.' + parts[1] : '';
    return `${sign}${intPart}${fracPart}`;
  }

  _handleAction(_kind) {
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
      ring_style: 'brass',
      face_color: '#8c7626',
      plate_color: '#8c7626',
      plate_transparent: false,
      rivet_color: '#6a5816',
      slider_color: '#444444',
      knob_color: '#c9a961',
      knob_shape: 'square',
      knob_size: 100,
      tick_color: 'rgba(0,0,0,0.22)',
      font_bg_color: '#ffffff',
      font_color: '#000000',
      title_color: '#000000',
      title_font_size: 14,
      value_font_size: 36,
      show_value: true,
      wear_level: 50,
      glass_effect_enabled: true,
      aged_texture: 'everywhere',
      aged_texture_intensity: 50,
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
  description:
    'A vertical retro-style slider with LED display and 70s aesthetic.',
});
