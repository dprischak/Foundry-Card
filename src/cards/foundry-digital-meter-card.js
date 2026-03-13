import { debounce, fireEvent, getActionConfig } from './utils.js';
import { loadThemes, applyTheme } from './themes.js';

class FoundryDigitalMeterCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._resizeObserver = null;

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

    this._baseConfig = { ...this.config };

    // Theme handling
    if (
      this.config.theme &&
      this.config.theme === 'entity' &&
      this.config.themeentity
    ) {
      applyDefaultsAndRender();
    } else if (this.config.theme && this.config.theme !== 'none') {
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
        'Foundry Digital Meter Card: min value must be less than max value. Using defaults.'
      );
      this.config.min = 0;
      this.config.max = 100;
    }

    // Validate animation duration (must be positive)
    if (config.animation_duration !== undefined) {
      const duration = parseFloat(config.animation_duration);
      if (isNaN(duration) || duration <= 0) {
        console.warn(
          'Foundry Digital Meter Card: animation_duration must be positive. Using 0.15s.'
        );
        this.config.animation_duration = 0.15;
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

    // Handle dynamic entity-based themes
    if (
      this.config.theme === 'entity' &&
      this.config.themeentity &&
      hass.states[this.config.themeentity]
    ) {
      const liveThemeName = hass.states[this.config.themeentity].state;
      if (liveThemeName && liveThemeName !== this._currentLiveTheme) {
        this._currentLiveTheme = liveThemeName;
        loadThemes().then((themes) => {
          if (themes[liveThemeName]) {
            this.config = applyTheme(
              { ...this._baseConfig },
              themes[liveThemeName]
            );
            this.render();
          } else {
            console.warn(
              `[Foundry Cards] Theme '${liveThemeName}' from entity ${this.config.themeentity} not found.`
            );
          }
          requestAnimationFrame(() => this.updateMeter());
        });
        return;
      }
    }

    this.updateMeter();
  }

  render() {
    const config = this.config;
    const cardTitle = config.card_title || '';
    const topTitle = config.title || 'L';
    const bottomTitle = config.bottom_title || 'R';
    const hasBottomEntity = !!config.bottom_entity;
    const uid = this._uniqueId;
    const animationDuration =
      config.animation_duration !== undefined
        ? config.animation_duration
        : 0.15;
    const unit = config.unit !== undefined ? config.unit : 'dB';

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
    const effectiveAgedTexture =
      plateTransparent && agedTexture === 'everywhere'
        ? 'glass_only'
        : agedTexture;
    const agedTextureEnabled = effectiveAgedTexture === 'glass_only';
    const agedTextureOnFace =
      agedTextureEnabled || effectiveAgedTexture === 'everywhere';

    const titleFontSize = config.title_font_size || 11;
    const titleColor = config.title_color || config.number_color || '#9e9e9e';
    const titleFontFamily = 'Georgia, serif';

    // -----------------------------------------------------------------------
    // Geometry — content-driven sizing (matches digital clock/analog meter feel)
    // -----------------------------------------------------------------------
    const vbWidth = 300;
    const numRows = hasBottomEntity ? 2 : 1;

    // Bar and scale dimensions (fixed, not dependent on viewbox)
    const BAR_H = 10; // LED bar height
    const SCALE_H = numRows > 1 ? 18 : 14; // scale ruler zone height
    const FACE_PAD_V = 5; // vertical padding inside face (each side)

    // Face content height = bars + scale + padding
    const faceContentH =
      numRows > 1
        ? BAR_H + SCALE_H + BAR_H + FACE_PAD_V * 2
        : BAR_H + SCALE_H + FACE_PAD_V * 2;
    // e.g. dual: 10+18+10+10=48  single: 10+14+10=34

    // Rim height derived from face
    const rimInset = 8; // px between rim edge and face edge
    const rimH = faceContentH + rimInset * 2; // 48+16=64 (dual)

    // Symmetric rim margins — same top and bottom (like analog meter)
    const rimMarginSide = 35; // left/right rim margin from plate
    const rimMarginVert = 30; // top AND bottom rim margin from plate edge

    // Plate dimensions
    const plateX = 5;
    const plateY = 5;
    const plateW = vbWidth - plateX * 2;
    const plateH = rimMarginVert + rimH + rimMarginVert;
    const vbHeight = plateY + plateH + plateY;

    // Rim
    const rimX = rimMarginSide;
    const rimY = plateY + rimMarginVert; // symmetric — title does NOT push rim
    const rimW = vbWidth - rimMarginSide * 2;

    // Face
    const faceX = rimX + rimInset;
    const faceY = rimY + rimInset;
    const faceW = rimW - rimInset * 2;
    const faceH = faceContentH;

    // Title — sits in the existing top margin between plate top and rim
    // (same approach as digital clock: does NOT expand viewBox)
    const titleY = plateY + 20; // ~12px from plate top, ~10px above rim

    // Store for bar/scale drawing
    this._faceX = faceX;
    this._faceY = faceY;
    this._faceW = faceW;
    this._faceH = faceH;
    this._barH = BAR_H;
    this._scaleH = SCALE_H;
    this._facePadV = FACE_PAD_V;
    this._numRows = numRows;
    this._hasBottomEntity = hasBottomEntity;
    this._animationDuration = animationDuration;
    this._unit = unit;
    this._topTitle = topTitle;
    this._bottomTitle = bottomTitle;
    this._vbWidth = vbWidth;
    this._vbHeight = vbHeight;

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
      </style>
      <ha-card role="img" aria-label="Foundry digital meter showing ${config.entity}" tabindex="0">
        <div class="card" id="actionRoot">
          <div class="meter-container" role="presentation">
            <svg class="meter-svg" viewBox="0 0 ${vbWidth} ${vbHeight}" xmlns="http://www.w3.org/2000/svg" role="presentation" aria-hidden="true">
              <defs>
                <!-- Gradient for meter face: matches analog meter EXACTLY (cream/paper look) -->
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
                  <rect x="${faceX}" y="${faceY}" width="${faceW}" height="${faceH}" rx="4" ry="4"/>
                </clipPath>
                <clipPath id="plateClip-${uid}">
                  <rect x="${plateX}" y="${plateY}" width="${plateW}" height="${plateH}" rx="20" ry="20" />
                </clipPath>

                <!-- Glass glare gradient -->
                <linearGradient id="glassGrad-${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color:#aaccff;stop-opacity:0.12" />
                  <stop offset="100%" style="stop-color:#aaccff;stop-opacity:0" />
                </linearGradient>

                <!-- LED scan line effect -->
                <pattern id="scanlines-${uid}" x="0" y="0" width="2" height="3" patternUnits="userSpaceOnUse">
                  <rect x="0" y="0" width="2" height="1" fill="rgba(0,0,0,0.18)"/>
                </pattern>
              </defs>

              <!-- Plate -->
              <rect x="${plateX}" y="${plateY}" width="${plateW}" height="${plateH}" rx="20" ry="20"
                    fill="${plateTransparent ? 'rgba(240, 235, 225, 0.15)' : plateColor}"
                    clip-path="url(#plateClip-${uid})"
                    ${effectiveAgedTexture === 'everywhere' ? `filter="url(#aged-${uid})"` : ''} />

              <!-- Rectangular Rim -->
              ${this.renderRectRim(ringStyle, uid, rimX, rimY, rimW, rimH)}

              <!-- Face (dark screen area) -->
              <rect x="${faceX}" y="${faceY}" width="${faceW}" height="${faceH}" rx="4" ry="4"
                    fill="${config.background_style === 'solid' ? config.face_color || '#f8f8f0' : `url(#meterFace-${uid})`}"
                    ${agedTexture !== 'none' && agedTextureOnFace ? `filter="url(#aged-${uid})" clip-path="url(#faceClip-${uid})"` : ''} />

              <!-- Scanline overlay -->
              <rect x="${faceX}" y="${faceY}" width="${faceW}" height="${faceH}" rx="4" ry="4"
                    fill="url(#scanlines-${uid})" opacity="0.5" clip-path="url(#faceClip-${uid})" style="pointer-events:none;" />

              <!-- Glass effect overlay -->
              ${glassEffectEnabled ? `<path d="M ${faceX} ${faceY} L ${faceX + faceW} ${faceY} L ${faceX + faceW} ${faceY + faceH * 0.25} Q ${faceX + faceW / 2} ${faceY + faceH * 0.3} ${faceX} ${faceY + faceH * 0.25} Z" fill="url(#glassGrad-${uid})" clip-path="url(#faceClip-${uid})" style="pointer-events: none;" />` : ''}

              <!-- Face border -->
              <rect x="${faceX}" y="${faceY}" width="${faceW}" height="${faceH}" rx="4" ry="4"
                    fill="none" stroke="rgba(0,0,0,0.6)" stroke-width="1" />

              <!-- Card title — in the fixed top margin, ring position unchanged (same as digital clock) -->
              ${cardTitle ? `<text x="${vbWidth / 2}" y="${titleY}" text-anchor="middle" font-size="${titleFontSize}" font-weight="bold" fill="${titleColor}" font-family="${titleFontFamily}" style="pointer-events: none;">${cardTitle}</text>` : ''}

              <!-- Bar row groups — populated by updateMeter() -->
              <g id="topBarGroup"></g>
              <g id="scaleGroup"></g>
              ${hasBottomEntity ? '<g id="bottomBarGroup"></g>' : ''}

              <!-- Hidden ARIA live region for accessibility -->
              <foreignObject x="0" y="0" width="1" height="1" style="overflow: hidden;">
                <div xmlns="http://www.w3.org/1999/xhtml" id="ariaLive" aria-live="polite" aria-atomic="true" style="position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;"></div>
              </foreignObject>

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
  }

  // -------------------------------------------------------------------------
  // Bar drawing
  // -------------------------------------------------------------------------

  /**
   * Draw a horizontal LED bar row for a given entity fraction (0–1).
   * @param {string} groupId  - Shadow DOM element id ('topBarGroup' | 'bottomBarGroup')
   * @param {number} fraction - fill fraction, 0–1
   * @param {string} rowLabel - label text (e.g. 'L')
   * @param {number} rowIndex - 0 for top row, 1 for bottom row
   */
  _drawBar(groupId, fraction, rowLabel, rowIndex) {
    const group = this.shadowRoot.getElementById(groupId);
    if (!group) return;

    const config = this.config;
    const segments = config.segments || [
      { from: 0, to: 80, color: '#4caf50' },
      { from: 80, to: 95, color: '#ffeb3b' },
      { from: 95, to: 100, color: '#f44336' },
    ];
    const min = config.min !== undefined ? config.min : 0;
    const max = config.max !== undefined ? config.max : 100;
    const numRows = this._numRows;
    const labelColor = config.number_color || '#9e9e9e';

    const fX = this._faceX;
    const fY = this._faceY;
    const fW = this._faceW;
    const barH = this._barH; // fixed bar height (stored from render)
    const scaleH = this._scaleH; // fixed scale zone height
    const padV = this._facePadV; // face vertical padding

    // Horizontal zones
    const labelW = 22; // reserved for row label on left
    const unitW = 22; // reserved for unit label on right
    const barAreaX = fX + labelW + 2;
    const barAreaW = fW - labelW - unitW - 4;

    // Vertical position of bar center in face coords
    // ROW 0: fY + padV + barH/2
    // SCALE: between rows
    // ROW 1: fY + padV + barH + scaleH + barH/2
    let rowCenterY;
    if (rowIndex === 0) {
      rowCenterY = fY + padV + barH / 2;
    } else {
      rowCenterY = fY + padV + barH + scaleH + barH / 2;
    }
    const barY = rowCenterY - barH / 2;

    // LED cell layout
    const NUM_CELLS = 40;
    const cellGap = 1.5;
    const cellW = (barAreaW - cellGap * (NUM_CELLS - 1)) / NUM_CELLS;

    // Determine unlit color from face_color (slightly tinted)
    const faceColorBase = config.face_color || '#111111';
    const unlitColor = this._adjustColor(faceColorBase, -15);

    // Build cells
    let cells = '';
    for (let i = 0; i < NUM_CELLS; i++) {
      const cellFraction = i / NUM_CELLS;
      const cellX = barAreaX + i * (cellW + cellGap);
      const cellValue = min + cellFraction * (max - min);
      let cellColor = unlitColor;

      for (const seg of segments) {
        if (cellValue >= seg.from && cellValue < seg.to) {
          cellColor = seg.color;
          break;
        }
        if (
          cellValue >= seg.from &&
          cellValue <= seg.to &&
          segments.indexOf(seg) === segments.length - 1
        ) {
          cellColor = seg.color;
        }
      }

      const isLit = cellFraction <= fraction;
      const litOpacity = isLit ? '1' : '0.15';
      const rx = Math.max(1, cellW * 0.25);

      cells += `<rect x="${cellX.toFixed(2)}" y="${barY.toFixed(2)}" width="${cellW.toFixed(2)}" height="${barH.toFixed(2)}" rx="${rx}" ry="${rx}" fill="${cellColor}" opacity="${litOpacity}"/>`;
    }

    // Label (left)
    const labelX = fX + labelW / 2;
    const label = `<text x="${labelX}" y="${rowCenterY}" text-anchor="middle" dominant-baseline="middle" font-size="7" font-weight="bold" fill="${labelColor}" font-family="'Courier New', monospace">${rowLabel}</text>`;

    // Unit label (right)
    const unitX = fX + fW - unitW / 2;
    const unitLabel = `<text x="${unitX}" y="${rowCenterY}" text-anchor="middle" dominant-baseline="middle" font-size="6" fill="${labelColor}" font-family="'Courier New', monospace" opacity="0.7">${this._unit}</text>`;

    group.innerHTML = label + cells + unitLabel;

    // Draw scale after last row is rendered
    if (rowIndex === numRows - 1) {
      const scaleCenterY = fY + padV + barH + scaleH / 2;
      this._drawScale(barAreaX, barAreaW, scaleCenterY, scaleH, min, max);
    }
  }

  /**
   * Draw the scale ruler (dual hash marks + center numbers) between bar rows.
   */
  _drawScale(barAreaX, barAreaW, scaleCenterY, scaleH, min, max) {
    const scaleGroup = this.shadowRoot.getElementById('scaleGroup');
    if (!scaleGroup) return;

    const config = this.config;
    const primaryColor = config.primary_tick_color || '#616161';
    const secondaryColor = config.secondary_tick_color || '#424242';
    const numberColor = config.number_color || '#9e9e9e';

    // The scale zone consists of two horizontal lines (top and bottom)
    // Ticks extend INWARD from these lines (top ticks point down, bottom ticks point up)
    // Numbers sit exactly in the vertical center.
    const scaleTopY = scaleCenterY - scaleH / 2;
    const scaleBotY = scaleCenterY + scaleH / 2;

    const majorTickLen = scaleH * 0.25; // Length of tick pointing inward
    const minorTickLen = scaleH * 0.12;

    const range = max - min;
    // Choose a nice major tick interval (target ~5-8 major ticks)
    const niceIntervals = [1, 2, 5, 10, 20, 25, 50, 100, 200, 500, 1000];
    const majorInterval =
      niceIntervals.find((n) => range / n <= 12 && range / n >= 4) || range / 6;
    const minorDivisions = 5;
    const minorStep = majorInterval / minorDivisions;

    // Draw the two parallel horizontal bounds
    let svg = '';
    svg += `<line x1="${barAreaX}" y1="${scaleTopY.toFixed(2)}" x2="${(barAreaX + barAreaW).toFixed(2)}" y2="${scaleTopY.toFixed(2)}" stroke="${primaryColor}" stroke-width="1.0" opacity="0.8"/>`;
    svg += `<line x1="${barAreaX}" y1="${scaleBotY.toFixed(2)}" x2="${(barAreaX + barAreaW).toFixed(2)}" y2="${scaleBotY.toFixed(2)}" stroke="${primaryColor}" stroke-width="1.0" opacity="0.8"/>`;

    const totalMinorTicks = Math.round(range / minorStep) + 1;
    for (let i = 0; i <= totalMinorTicks; i++) {
      const val = min + i * minorStep;
      if (val > max + minorStep * 0.01) break;
      const frac = (Math.min(val, max) - min) / range;
      const x = barAreaX + frac * barAreaW;
      const isMajor =
        Math.abs(Math.round(val / majorInterval) * majorInterval - val) <
        minorStep * 0.1;

      if (isMajor) {
        // Draw major ticks pointing INWARD from both top and bottom lines
        svg += `<line x1="${x.toFixed(2)}" y1="${scaleTopY.toFixed(2)}" x2="${x.toFixed(2)}" y2="${(scaleTopY + majorTickLen).toFixed(2)}" stroke="${primaryColor}" stroke-width="1.0" opacity="0.9"/>`;
        svg += `<line x1="${x.toFixed(2)}" y1="${scaleBotY.toFixed(2)}" x2="${x.toFixed(2)}" y2="${(scaleBotY - majorTickLen).toFixed(2)}" stroke="${primaryColor}" stroke-width="1.0" opacity="0.9"/>`;

        // Number — integer or 1dp if fractional, perfectly centered
        const numLabel = Number.isInteger(Math.round(val * 10) / 10)
          ? String(Math.round(val))
          : val.toFixed(1);
        svg += `<text x="${x.toFixed(2)}" y="${(scaleCenterY + 0.5).toFixed(2)}" text-anchor="middle" dominant-baseline="middle" font-size="5.5" fill="${numberColor}" font-family="'Courier New', monospace" opacity="0.95">${numLabel}</text>`;
      } else {
        // Draw minor ticks pointing INWARD
        svg += `<line x1="${x.toFixed(2)}" y1="${scaleTopY.toFixed(2)}" x2="${x.toFixed(2)}" y2="${(scaleTopY + minorTickLen).toFixed(2)}" stroke="${secondaryColor}" stroke-width="0.7" opacity="0.6"/>`;
        svg += `<line x1="${x.toFixed(2)}" y1="${scaleBotY.toFixed(2)}" x2="${x.toFixed(2)}" y2="${(scaleBotY - minorTickLen).toFixed(2)}" stroke="${secondaryColor}" stroke-width="0.7" opacity="0.6"/>`;
      }
    }

    scaleGroup.innerHTML = svg;
  }

  // -------------------------------------------------------------------------
  // Meter update
  // -------------------------------------------------------------------------

  updateMeter() {
    if (!this._hass || !this.config) return;
    const config = this.config;
    const min = config.min !== undefined ? config.min : 0;
    const max = config.max !== undefined ? config.max : 100;

    // --- Top entity ---
    this._updateRow('topBarGroup', config.entity, min, max, this._topTitle, 0);

    // --- Bottom entity (optional) ---
    if (this._hasBottomEntity && config.bottom_entity) {
      this._updateRow(
        'bottomBarGroup',
        config.bottom_entity,
        min,
        max,
        this._bottomTitle,
        1
      );
    }
  }

  _updateRow(groupId, entityId, min, max, label, rowIndex) {
    const entity = this._hass.states[entityId];

    if (!entity) {
      console.warn(
        `Foundry Digital Meter Card: entity '${entityId}' not found.`
      );
      return;
    }
    if (entity.state === 'unavailable' || entity.state === 'unknown') {
      this._drawBar(groupId, 0, label, rowIndex);
      return;
    }

    const value = parseFloat(entity.state);
    if (isNaN(value)) {
      console.warn(
        `Foundry Digital Meter Card: non-numeric state for '${entityId}': "${entity.state}"`
      );
      return;
    }

    const clamped = Math.max(min, Math.min(max, value));
    const fraction = (clamped - min) / (max - min);

    this._drawBar(groupId, fraction, label, rowIndex);
    this._updateAriaLive(entityId, value);
  }

  _updateAriaLive(entityId, value) {
    const ariaLive = this.shadowRoot?.getElementById('ariaLive');
    if (ariaLive) {
      const unit = this.config.unit || '';
      ariaLive.textContent = `${entityId}: ${value}${unit ? ' ' + unit : ''}`;
    }
  }

  // -------------------------------------------------------------------------
  // Rivets / rim / wear marks (identical to analog meter)
  // -------------------------------------------------------------------------

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

  /** Darken/lighten a hex color by an integer percentage (like adjustColor in digital clock). */
  _adjustColor(color, percent) {
    if (!color || !color.startsWith('#')) return color;
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, Math.min(255, (num >> 16) + amt));
    const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
    const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
    return (
      '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)
    );
  }

  renderRectRim(ringStyle, uid, x, y, w, h) {
    const data = this.getRimStyleData(ringStyle, uid);
    if (!data) return '';

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

  // -------------------------------------------------------------------------
  // Action handling (identical to analog meter)
  // -------------------------------------------------------------------------

  _attachActionListeners() {
    const root = this.shadowRoot?.getElementById('actionRoot');
    if (!root) return;

    root.removeEventListener('click', this._boundHandleClick);
    root.removeEventListener('dblclick', this._boundHandleDblClick);
    root.removeEventListener('contextmenu', this._boundHandleContextMenu);
    root.removeEventListener('keydown', this._boundHandleKeyDown);

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

    this._runAction(actionConfig, entityId);
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

  // -------------------------------------------------------------------------
  // HA integration
  // -------------------------------------------------------------------------

  getCardSize() {
    return this.config?.bottom_entity ? 3 : 2;
  }

  static get supportsCardResize() {
    return true;
  }

  static getConfigElement() {
    return document.createElement('foundry-digital-meter-card-editor');
  }

  static getStubConfig() {
    // Matches the 'industrial' theme defaults
    return {
      entity: 'sensor.audio_level_left',
      bottom_entity: 'sensor.audio_level_right',
      card_title: 'Digital Meter',
      title_font_size: 14,
      title: 'L',
      bottom_title: 'R',
      min: 0,
      max: 100,
      unit: 'dB',
      theme: 'industrial',
      ring_style: 'brass',
      rivet_color: '#6a5816',
      plate_color: '#8c7626',
      plate_transparent: false,
      animation_duration: 0.15,
      wear_level: 50,
      glass_effect_enabled: true,
      aged_texture: 'everywhere',
      aged_texture_intensity: 20,
      segments: [
        { from: 0, to: 50, color: '#4caf50' },
        { from: 50, to: 60, color: '#8bc34a' },
        { from: 60, to: 80, color: '#ffeb3b' },
        { from: 80, to: 100, color: '#f44336' },
      ],
      background_style: 'gradient',
      face_color: '#929090',
      number_color: '#3e2723',
      primary_tick_color: '#3e2723',
      secondary_tick_color: '#5d4e37',
    };
  }
}

if (!customElements.get('foundry-digital-meter-card')) {
  customElements.define('foundry-digital-meter-card', FoundryDigitalMeterCard);
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'foundry-digital-meter-card',
  name: 'Foundry Digital Meter',
  preview: true,
  description: 'A horizontal LED-bar level meter with dual entity support.',
  documentationURL: 'https://github.com/dprischak/Foundry-Card',
});
