import { fireEvent, getActionConfig } from './utils.js';
import { loadThemes, applyTheme } from './themes.js';

class FoundryAnalogClockCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._timer = null;
    this._handState = {
      s: { v: -1, off: 0 },
      m: { v: -1, off: 0 },
      h: { v: -1, off: 0 },
    };
  }

  setConfig(config) {
    this.config = { ...config };

    // Theme handling
    if (this.config.theme && this.config.theme !== 'none') {
      loadThemes().then((themes) => {
        if (themes[this.config.theme]) {
          this.config = applyTheme(this.config, themes[this.config.theme]);
          this.render();
        }
      });
    }

    // Default behavior like built-in cards
    if (!this.config.tap_action) {
      this.config.tap_action = { action: 'more-info' };
    }

    // Default ring style
    if (this.config.ring_style === undefined) {
      this.config.ring_style = 'brass';
    }

    this._uniqueId = Math.random().toString(36).substr(2, 9);
    this.render();

    // Start clock timer
    this._startClock();
  }

  set hass(hass) {
    this._hass = hass;
    // We don't necessarily need to re-render on every hass update like the gauge does
    // unless we were binding to an entity for time (which we aren't, yet).
    // If we wanted to support offsets from an entity, we would do it here.
  }

  connectedCallback() {
    this._startClock();
  }

  disconnectedCallback() {
    this._stopClock();
  }

  _startClock() {
    this._stopClock();
    this._updateTime(); // Initial update
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

    // Handle Time Zone
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

    const seconds = time.getSeconds();
    const minutes = time.getMinutes();
    const hours = time.getHours();

    // Track rotations to avoid "rewind" effect when passing 0 (12 o'clock)

    // Seconds
    if (this._handState.s.v !== -1 && seconds < this._handState.s.v) {
      this._handState.s.off += 360;
    }
    this._handState.s.v = seconds;
    const secondAngle = seconds * 6 + this._handState.s.off;

    // Minutes
    // Minute hand moves partially with seconds: (minutes * 6) + (seconds * 0.1)
    // Wrap detection logic: compare base minute value
    if (this._handState.m.v !== -1 && minutes < this._handState.m.v) {
      this._handState.m.off += 360;
    }
    this._handState.m.v = minutes;
    const minuteAngle = minutes * 6 + seconds * 0.1 + this._handState.m.off;

    // Hours
    // Hour hand moves partially with minutes: ((hours % 12) * 30) + (minutes * 0.5)
    // Wrap detection relies on display hour (0-11)
    const displayHour = hours % 12;
    const prevDisplayHour =
      this._handState.h.v !== -1 ? this._handState.h.v % 12 : displayHour;

    if (this._handState.h.v !== -1 && displayHour < prevDisplayHour) {
      this._handState.h.off += 360;
    }
    this._handState.h.v = hours;
    const hourAngle = displayHour * 30 + minutes * 0.5 + this._handState.h.off;

    this._updateHand('secondHand', secondAngle);
    this._updateHand('minuteHand', minuteAngle);
    this._updateHand('hourHand', hourAngle);
  }

  _updateHand(id, angle) {
    const hand = this.shadowRoot.getElementById(id);
    if (hand) {
      hand.style.transform = `rotate(${angle}deg)`;
    }
  }

  render() {
    const config = this.config;
    const title = config.title || '';
    const uid = this._uniqueId;
    const titleFontSize =
      config.title_font_size !== undefined ? config.title_font_size : 12;

    const ringStyle =
      config.ring_style !== undefined ? config.ring_style : 'brass';
    // Rim data used in renderRim separately
    const rivetColor =
      config.rivet_color !== undefined ? config.rivet_color : '#6d5d4b';
    const plateColor =
      config.plate_color !== undefined ? config.plate_color : '#f5f5f5'; // Default light plate for clock
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
        : 50;
    const agedTextureOpacity = ((100 - agedTextureIntensity) / 100) * 1.0;
    const effectiveAgedTexture =
      plateTransparent && agedTexture === 'everywhere'
        ? 'glass_only'
        : agedTexture;
    const agedTextureEnabled = effectiveAgedTexture === 'glass_only';

    const secondHandEnabled =
      config.second_hand_enabled !== undefined
        ? config.second_hand_enabled
        : false;

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
        .clock-container {
          position: relative;
          width: 100%;
          max-width: 400px;
          margin: 0 auto;
          container-type: inline-size;
        }
        .clock-svg {
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
      <ha-card role="img" aria-label="${title ? title : 'Foundry Analog Clock'}" tabindex="0">
        <div class="card" id="actionRoot">
          <div class="clock-container" role="presentation">
            <svg class="clock-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="presentation" aria-hidden="true">
              <defs>
                <!-- Gradient for clock face -->
                <radialGradient id="clockFace-${uid}" cx="50%" cy="50%">
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
                
                <!-- Clip path for gauge face -->
                <clipPath id="clockFaceClip-${uid}">
                  <circle cx="100" cy="100" r="85"/>
                </clipPath>
              </defs>
              
              <rect x="0" y="0" width="200" height="200" fill="${plateTransparent ? 'rgba(240, 235, 225, 0.15)' : plateColor}" ${effectiveAgedTexture === 'everywhere' ? `filter="url(#aged-${uid})"` : ''} />
              ${this.renderRim(ringStyle, uid)}
              
              <!-- Clock face -->
              <circle cx="100" cy="100" r="85" fill="${config.background_style === 'solid' ? config.face_color || '#f8f8f0' : `url(#clockFace-${uid})`}" ${agedTextureEnabled || effectiveAgedTexture === 'everywhere' ? `filter="url(#aged-${uid})" clip-path="url(#clockFaceClip-${uid})"` : ''}/>
                            
              <!-- Glass effect overlay -->
              ${glassEffectEnabled ? '<ellipse cx="100" cy="80" rx="60" ry="50" fill="white" opacity="0.15"/>' : ''}
              
              <!-- Ticks and Numbers -->
              <g id="ticks"></g>
              <g id="numbers"></g>
              
              <!-- Title text -->
              ${title ? this.renderTitleText(title, titleFontSize, config.number_color) : ''}
              
              <!-- Hands -->
              
              <!-- Hour Hand -->
              <g id="hourHand" style="transform-origin: 100px 100px;">
                  <rect x="97" y="50" width="6" height="55" rx="2" fill="${config.hour_hand_color || '#3e2723'}" stroke="#2c1810" stroke-width="0.5" />
                   <path d="M 100 100 L 97 55 L 100 45 L 103 55 Z" fill="${config.hour_hand_color || '#3e2723'}" />
              </g>

              <!-- Minute Hand -->
              <g id="minuteHand" style="transform-origin: 100px 100px;">
                  <rect x="98" y="30" width="4" height="75" rx="2" fill="${config.minute_hand_color || '#3e2723'}" stroke="#2c1810" stroke-width="0.5" />
                  <path d="M 100 100 L 98 35 L 100 25 L 102 35 Z" fill="${config.minute_hand_color || '#3e2723'}" />
              </g>

              <!-- Second Hand -->
              ${secondHandEnabled
        ? `
              <g id="secondHand" style="transform-origin: 100px 100px; transition: transform 0.2s cubic-bezier(0.4, 2.08, 0.55, 0.44);">
                  <!-- Shaft -->
                  <rect x="99" y="30" width="2" height="85" fill="${config.second_hand_color || '#C41E3A'}" />
                  <!-- Pointed Tip -->
                  <path d="M 99 30 L 100 20 L 101 30 Z" fill="${config.second_hand_color || '#C41E3A'}" />
              </g>
              `
        : ''
      }

              <!-- Center Cap -->
              <circle cx="100" cy="100" r="5" class="rivet"/>
              <circle cx="100" cy="100" r="3.5" class="screw-detail"/>
              <line x1="97" y1="100" x2="103" y2="100" class="screw-detail"/>
              
              <!-- Corner rivets -->
              <circle cx="20" cy="20" r="4" class="rivet"/>
              <circle cx="20" cy="20" r="2.5" class="screw-detail"/>
              <line x1="17" y1="20" x2="23" y2="20" class="screw-detail"/>
              <circle cx="180" cy="20" r="4" class="rivet"/>
              <circle cx="180" cy="20" r="2.5" class="screw-detail"/>
              <line x1="177" y1="20" x2="183" y2="20" class="screw-detail"/>
              <circle cx="20" cy="180" r="4" class="rivet"/>
              <circle cx="20" cy="180" r="2.5" class="screw-detail"/>
              <line x1="17" y1="180" x2="23" y2="180" class="screw-detail"/>
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
    this.drawClockTicks(config);
  }

  _attachActionListeners() {
    const root = this.shadowRoot?.getElementById('actionRoot');
    if (!root) return;

    // Simple direct click handler for now
    root.onclick = () => {
      const tap = getActionConfig(this.config, 'tap_action', {
        action: 'more-info',
      });
      if (tap.action !== 'none') {
        // For a clock, there isn't always a direct "entity" to show more-info for,
        // but if one is configured, we use it.
        if (this.config.entity) {
          this._handleAction('tap');
        }
      }
    };
  }

  _handleAction(kind) {
    if (!this._hass || !this.config) return;
    const entityId = this.config.entity;
    if (!entityId) return;

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

    const action = actionConfig?.action;
    if (!action || action === 'none') return;

    if (action === 'more-info') {
      fireEvent(this, 'hass-more-info', { entityId });
    }
  }

  renderTitleText(title, fontSize, color = '#3e2723') {
    const lines = title.replace(/\\n/g, '\n').split('\n').slice(0, 3);
    const lineHeight = fontSize * 1.2;
    const totalHeight = (lines.length - 1) * lineHeight;
    const startY = 140 - totalHeight / 2; // Position below center for clock

    return lines
      .map((line, index) => {
        const y = startY + index * lineHeight;
        return `<text x="100" y="${y}" text-anchor="middle" font-size="${fontSize}" font-weight="bold" fill="${color}" font-family="Georgia, serif" style="text-shadow: 1px 1px 2px rgba(255,255,255,0.5);">${line}</text>`;
      })
      .join('\n');
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
        return { grad: `copperRim-${uid}`, stroke: '#8b5a2b' };
      default:
        return null;
    }
  }

  renderRim(ringStyle, uid) {
    const data = this.getRimStyleData(ringStyle, uid);
    if (!data) return '';
    return `
      <circle cx="100" cy="100" r="95" fill="url(#${data.grad})" stroke="${data.stroke}" stroke-width="2"/>
      <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="3"/>
    `;
  }

  renderWearMarks(wearLevel) {
    if (wearLevel === 0) return '';
    // baseOpacity removed as it was unused
    const allMarks = [
      {
        type: 'circle',
        cx: 45,
        cy: 60,
        r: 2,
        fill: '#8B7355',
        baseOpacity: 0.2,
      },
      {
        type: 'circle',
        cx: 155,
        cy: 75,
        r: 1.5,
        fill: '#8B7355',
        baseOpacity: 0.15,
      },
      {
        type: 'circle',
        cx: 70,
        cy: 120,
        r: 1,
        fill: '#6d5d4b',
        baseOpacity: 0.2,
      },
      {
        type: 'ellipse',
        cx: 130,
        cy: 50,
        rx: 3,
        ry: 1.5,
        fill: '#8B7355',
        baseOpacity: 0.1,
      },
      {
        type: 'circle',
        cx: 35,
        cy: 140,
        r: 1.2,
        fill: '#8B7355',
        baseOpacity: 0.12,
      },
      {
        type: 'circle',
        cx: 165,
        cy: 130,
        r: 1.8,
        fill: '#6d5d4b',
        baseOpacity: 0.18,
      },
      {
        type: 'ellipse',
        cx: 50,
        cy: 90,
        rx: 2,
        ry: 1,
        fill: '#8B7355',
        baseOpacity: 0.08,
      },
      {
        type: 'circle',
        cx: 120,
        cy: 145,
        r: 0.8,
        fill: '#6d5d4b',
        baseOpacity: 0.15,
      },
      {
        type: 'circle',
        cx: 180,
        cy: 65,
        r: 1.3,
        fill: '#8B7355',
        baseOpacity: 0.1,
      },
      {
        type: 'ellipse',
        cx: 25,
        cy: 100,
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
      .join('\n');
  }

  drawClockTicks(config = {}) {
    const ticksGroup = this.shadowRoot.getElementById('ticks');
    const numbersGroup = this.shadowRoot.getElementById('numbers');
    if (!ticksGroup || !numbersGroup) return;

    ticksGroup.innerHTML = '';
    numbersGroup.innerHTML = '';

    const centerX = 100;
    const centerY = 100;

    // 12 hours
    for (let i = 1; i <= 12; i++) {
      // 12 o'clock = -90 deg. 1 = -60, 2 = -30, 3 = 0.

      const angleRad = ((i * 30 - 90) * Math.PI) / 180;

      // Ticks
      const x1 = centerX + 75 * Math.cos(angleRad);
      const y1 = centerY + 75 * Math.sin(angleRad);
      const x2 = centerX + 85 * Math.cos(angleRad);
      const y2 = centerY + 85 * Math.sin(angleRad);

      const tick = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'line'
      );
      tick.setAttribute('x1', x1);
      tick.setAttribute('y1', y1);
      tick.setAttribute('x2', x2);
      tick.setAttribute('y2', y2);
      tick.setAttribute('stroke', config.primary_tick_color || '#3e2723');
      tick.setAttribute('stroke-width', '2');
      ticksGroup.appendChild(tick);

      // Numbers
      // Roman numerals or standard? Standard 1-12
      const textRadius = 65;
      const textX = centerX + textRadius * Math.cos(angleRad);
      const textY = centerY + textRadius * Math.sin(angleRad);

      const text = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'text'
      );
      text.setAttribute('x', textX);
      text.setAttribute('y', textY);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('font-size', '14');
      text.setAttribute('font-weight', 'bold');
      text.setAttribute('fill', config.number_color || '#3e2723');
      text.textContent = i.toString();
      numbersGroup.appendChild(text);

      // Minutes/Seconds ticks (4 between each hour)
      for (let j = 1; j < 5; j++) {
        const minorAngle = i * 30 - 90 + j * 6;
        const minorAngleRad = (minorAngle * Math.PI) / 180;

        const mx1 = centerX + 80 * Math.cos(minorAngleRad);
        const my1 = centerY + 80 * Math.sin(minorAngleRad);
        const mx2 = centerX + 85 * Math.cos(minorAngleRad);
        const my2 = centerY + 85 * Math.sin(minorAngleRad);

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
        minorTick.setAttribute('stroke-width', '1');
        ticksGroup.appendChild(minorTick);
      }
    }
  }

  static getConfigElement() {
    return document.createElement('foundry-analog-clock-editor');
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
      wear_level: 50,
      glass_effect_enabled: true,
      aged_texture: 'everywhere',
      aged_texture_intensity: 50,
      second_hand_enabled: true,
      background_style: 'gradient',
      face_color: '#f8f8f0',
      title_font_color: '#3e2723',
      number_color: '#3e2723',
      primary_tick_color: '#3e2723',
      secondary_tick_color: '#5d4e37',
      hour_hand_color: '#3e2723',
      minute_hand_color: '#3e2723',
      second_hand_color: '#C41E3A',
    };
  }
}

if (!customElements.get('foundry-analog-clock-card')) {
  customElements.define('foundry-analog-clock-card', FoundryAnalogClockCard);
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'foundry-analog-clock-card',
  name: 'Foundry Analog Clock',
  preview: true,
  description: 'A skeaumorphic analog clock with various styles.',
});
