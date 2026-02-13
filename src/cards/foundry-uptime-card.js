import { fireEvent } from './utils.js';
import { ensureLedFont } from './fonts.js';
import { loadThemes, applyTheme } from './themes.js';

class FoundryUptimeCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    // Deep copy key nested objects to avoid "read only" errors on frozen HA config
    this.config = {
      ...config,
      alias: { ...(config.alias || {}) },
      color: { ...(config.color || {}) },
      duration: config.duration ? { ...config.duration } : undefined,
    };

    // Theme handling
    if (this.config.theme && this.config.theme !== 'none') {
      loadThemes().then((themes) => {
        if (themes[this.config.theme]) {
          this.config = applyTheme(this.config, themes[this.config.theme]);
          this._rendered = false;
          this._renderHistory();
        }
      });
    }

    if (!this.config.entity) {
      throw new Error('Entity is required');
    }

    // Defaults
    this.config.hours_to_show = this.config.hours_to_show || 24;
    this.config.update_interval = this.config.update_interval || 60;
    this.config.show_footer =
      this.config.show_footer !== undefined ? this.config.show_footer : true;

    this.config.ok = this.config.ok || [
      'on',
      'connected',
      'home',
      'open',
      'true',
      'running',
      'active',
    ];
    this.config.ko = this.config.ko || [
      'off',
      'disconnected',
      'not_home',
      'closed',
      'false',
      'stopped',
      'inactive',
    ];

    // Normalize aliases
    this.config.alias.ok = this.config.alias.ok || 'Up';
    this.config.alias.ko = this.config.alias.ko || 'Down';

    // Duration normalization
    if (this.config.duration) {
      const q = this.config.duration.quantity || 1;
      const u = this.config.duration.unit || 'day';
      if (u === 'minute') this.config.hours_to_show = q / 60;
      else if (u === 'hour') this.config.hours_to_show = q;
      else if (u === 'day') this.config.hours_to_show = q * 24;
      else if (u === 'week') this.config.hours_to_show = q * 24 * 7;
    }

    // Visual Defaults
    this.config.ring_style = this.config.ring_style || 'brass';
    this.config.title = this.config.title || 'Uptime Monitor';
    this.config.title_font_size = this.config.title_font_size || 14;
    this.config.title_color = this.config.title_color || '#3e2723';
    this.config.plate_color = this.config.plate_color || '#f5f5f5';
    this.config.rivet_color = this.config.rivet_color || '#6d5d4b';
    this.config.font_bg_color = this.config.font_bg_color || '#ffffff';
    this.config.font_color = this.config.font_color || '#000000';
    this.config.wear_level =
      this.config.wear_level !== undefined ? this.config.wear_level : 50;
    this.config.glass_effect_enabled =
      this.config.glass_effect_enabled !== undefined
        ? this.config.glass_effect_enabled
        : true;

    // State Colors: REMOVED user config for simple ok/ko colors, relying on thresholds + red default
    this.config.color.none = this.config.color.none || 'transparent';

    // Support for segments (Foundry Thermostat style ranges) overriding color_thresholds
    // segments: [{ from: 0, to: 50, color: 'red' }, ...]
    this.config.segments = this.config.segments || undefined;

    // Default color_thresholds if no segments
    this.config.color_thresholds = this.config.color_thresholds || [
      { value: 98, color: '#4CAF50' },
      { value: 90, color: '#FF9800' },
      { value: 0, color: '#F44336' },
    ];

    this._uniqueId = Math.random().toString(36).substr(2, 9);
    ensureLedFont();

    // Start interval
    if (this._interval) clearInterval(this._interval);
    this._interval = setInterval(
      () => this._fetchHistory(),
      this.config.update_interval * 1000
    ); // 60s default
  }

  static getStubConfig() {
    return {
      entity: 'binary_sensor.updater',
      title: 'Uptime Monitor',
      title_color: '#3e2723',
      hours_to_show: 24,
      ok: 'on',
      ko: 'off',
      ring_style: 'brass',
      rivet_color: '#6a5816',
      plate_color: '#8c7626',
      plate_transparent: false,
      font_bg_color: '#ffffff',
      font_color: '#000000',
      wear_level: 50,
      glass_effect_enabled: true,
      color_thresholds: [
        { value: 50, color: '#9C27B0' }, // purple
        { value: 70, color: '#F44336' }, // red
        { value: 99.9, color: '#FF9800' }, // orange
        { value: 100, color: '#4CAF50' }, // green
      ],
    };
  }

  set hass(hass) {
    this._hass = hass;
    if (
      !this._lastFetch ||
      new Date() - this._lastFetch > this.config.update_interval * 1000
    ) {
      this._fetchHistory();
    } else {
      // If we have history but hass updated (maybe state changed right now), we should re-render current state at least
      // But comprehensive re-render happens in _updateValues
      this._updateValues();
    }
  }

  disconnectedCallback() {
    if (this._interval) clearInterval(this._interval);
  }

  async _fetchHistory() {
    if (!this._hass) return;
    this._lastFetch = new Date();

    const entityId = this.config.entity;
    const hours = this.config.hours_to_show;
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - hours);
    const isoStart = startTime.toISOString();

    try {
      // Fetch history
      const history = await this._hass.callApi(
        'GET',
        `history/period/${isoStart}?filter_entity_id=${entityId}&minimal_response&end_time=${new Date().toISOString()}`
      );
      if (history && history.length > 0) {
        this._history = history[0]; // first entity
      } else {
        this._history = [];
      }
      this._renderHistory();
    } catch (e) {
      console.error('Foundry Uptime: Fetch error', e);
    }
  }

  _renderHistory() {
    this.render();
    this._updateValues();
  }

  _updateValues() {
    if (!this.shadowRoot) return;

    // Safety check for history
    if (!this._history) return;

    const now = new Date();
    const hours = this.config.hours_to_show;
    const startTime = new Date(now.getTime() - hours * 3600 * 1000);
    const startTs = startTime.getTime();
    const endTs = now.getTime();
    const totalDuration = endTs - startTs;

    // BUCKETING LOGIC
    // Divide the timeline into fixed buckets (slices)
    const tubeWidth = 200;
    const bucketCount = 50; // 50 slices * 4px = 200px
    const bucketDur = totalDuration / bucketCount;

    const buckets = [];
    let totalUpTime = 0;
    let totalTrackedTime = 0;

    // Helper to get state at a specific time from history
    // Optimize: History is sorted. We can iterate efficiently.
    // Convert history to a timeline of segments first for easier querying
    const segments = [];
    let currentState = 'unknown';
    let lastChangeTs = startTs;

    if (this._history.length > 0) {
      const sortedHistory = [...this._history].sort(
        (a, b) => new Date(a.last_changed) - new Date(b.last_changed)
      );

      // Initial state
      if (new Date(sortedHistory[0].last_changed).getTime() > startTs) {
        currentState = sortedHistory[0].state;
      } else {
        currentState = sortedHistory[0].state;
      }

      for (const entry of sortedHistory) {
        const t = new Date(entry.last_changed).getTime();
        if (t <= startTs) {
          currentState = entry.state;
          lastChangeTs = startTs;
          continue;
        }
        if (t > lastChangeTs) {
          segments.push({ start: lastChangeTs, end: t, state: currentState });
        }
        currentState = entry.state;
        lastChangeTs = t;
      }
    } else {
      if (this._hass.states[this.config.entity]) {
        currentState = this._hass.states[this.config.entity].state;
      }
    }
    if (lastChangeTs < endTs) {
      segments.push({ start: lastChangeTs, end: endTs, state: currentState });
    }

    // Now fill buckets
    for (let i = 0; i < bucketCount; i++) {
      const bStart = startTs + i * bucketDur;
      const bEnd = bStart + bucketDur;
      let bUp = 0;

      // Find overlapping segments
      for (const seg of segments) {
        const overlapStart = Math.max(seg.start, bStart);
        const overlapEnd = Math.min(seg.end, bEnd);
        if (overlapEnd > overlapStart) {
          const dur = overlapEnd - overlapStart;
          if (this._isOk(seg.state)) {
            bUp += dur;
          }
        }
      }

      const bPct = (bUp / bucketDur) * 100;
      buckets.push({ id: i, pct: bPct, color: this._getColorForScore(bPct) });

      totalUpTime += bUp;
      totalTrackedTime += bucketDur;
    }

    // Global Uptime %
    const uptimePct =
      totalTrackedTime > 0 ? (totalUpTime / totalTrackedTime) * 100 : 0;
    // finalScoreColor removed

    // DOM Updates

    // 1. Text Score
    const scoreEl = this.shadowRoot.getElementById('uptime-score');
    if (scoreEl) {
      scoreEl.textContent = `${uptimePct.toFixed(2)}%`;
      scoreEl.setAttribute('fill', this.config.font_color);
    }

    // 2. Status Text
    const statusEl = this.shadowRoot.getElementById('status-text');
    if (statusEl) {
      const entityState =
        this._hass.states[this.config.entity]?.state || 'unknown';
      const isOk = this._isOk(entityState);
      const isKo = this._isKo(entityState);
      let statusText = entityState;
      if (isOk && this.config.alias.ok) statusText = this.config.alias.ok;
      else if (isKo && this.config.alias.ko) statusText = this.config.alias.ko;
      statusEl.textContent = statusText;
      statusEl.setAttribute('fill', this.config.font_color);
    }

    // 3. Render Buckets (Bars) - COALESCED
    const bandsContainer = this.shadowRoot.getElementById('bands-container');
    if (bandsContainer) {
      bandsContainer.innerHTML = '';
      const barWidth = tubeWidth / bucketCount; // 4px

      // Need rimData for the dividers
      const uid = this._uniqueId;
      const rimStyle = this.config.ring_style;
      const rimData = this.getRimStyleData(rimStyle, uid);

      // Render separators only on color change
      const coalesced = [];
      if (buckets.length > 0) {
        let current = { ...buckets[0], count: 1 };
        for (let i = 1; i < buckets.length; i++) {
          const b = buckets[i];
          if (b.color === current.color) {
            current.count++;
          } else {
            coalesced.push(current);
            current = { ...b, count: 1 };
          }
        }
        coalesced.push(current);
      }

      let currentX = 0;
      const dividerWidth = 2; // Increased to 3px to accommodate stroke
      const dividers = [];

      coalesced.forEach((group, idx) => {
        const isLast = idx === coalesced.length - 1;
        const totalWidth = group.count * barWidth;

        // Draw Coloring Rect (Full Width)
        const rect = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'rect'
        );
        rect.setAttribute('x', currentX);
        rect.setAttribute('y', 0);
        rect.setAttribute('width', totalWidth);
        rect.setAttribute('height', 24);
        rect.setAttribute('fill', group.color);
        bandsContainer.appendChild(rect);

        currentX += totalWidth;

        // Collect Divider if not last
        if (!isLast) {
          const div = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'rect'
          );
          // Center: x = currentX - (dividerWidth / 2)
          div.setAttribute('x', currentX - dividerWidth / 2);
          div.setAttribute('y', 0);
          div.setAttribute('width', dividerWidth);
          div.setAttribute('height', 24);
          // Use RIM gradient
          div.setAttribute('fill', `url(#${rimData.grad})`);
          div.setAttribute('stroke', 'black');
          div.setAttribute('stroke-width', '0.2');
          div.setAttribute('opacity', '1');

          dividers.push(div);
        }
      });

      // Append Dividers Last (Top Z-Index)
      dividers.forEach((div) => bandsContainer.appendChild(div));
    }

    // 4. Footer Dates
    if (this.config.show_footer) {
      const startEl = this.shadowRoot.getElementById('footer-start');
      const endEl = this.shadowRoot.getElementById('footer-end');
      if (startEl && endEl) {
        startEl.textContent = this._timeAgo(startTime);
        endEl.textContent = 'Now';
      }
    }
  }

  _getColorForScore(pct) {
    if (this.config.segments) return this.config.font_color; // todo support segments?

    if (this.config.color_thresholds) {
      // Sort Ascending by value
      const thresholds = [...(this.config.color_thresholds || [])].sort(
        (a, b) => a.value - b.value
      );
      // Find first threshold that is >= pct
      // Wait, user said: "if less then or equal to 50 percent ... use purple"
      // So we look for the first threshold where pct <= th.value

      const match = thresholds.find((th) => pct <= th.value);
      if (match) return this._resolveColor(match.color);
    }

    // Fallback default
    return pct >= 50 ? '#4CAF50' : '#F44336';
  }

  _isOk(state) {
    if (Array.isArray(this.config.ok)) return this.config.ok.includes(state);
    return this.config.ok === state;
  }

  _isKo(state) {
    if (Array.isArray(this.config.ko)) return this.config.ko.includes(state);
    return this.config.ko === state;
  }

  _resolveColor(name) {
    // simple mapper
    const colors = {
      green: '#4CAF50',
      red: '#F44336',
      orange: '#FF9800',
      yellow: '#FFEB3B',
      purple: '#9C27B0',
      blue: '#2196F3',
      grey: '#9E9E9E',
    };
    return colors[name] || name; // return hex if not found
  }

  _timeAgo(date) {
    const diff = (new Date() - date) / 1000;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  render() {
    if (this._rendered) return; // Render skeleton once, updates happen via DOM манипуляция
    this._rendered = true;

    const config = this.config;
    const title = config.title;
    const uid = this._uniqueId;

    // Colors
    const fontBgColor = config.font_bg_color;
    const rimStyle = config.ring_style;
    const rimData = this.getRimStyleData(rimStyle, uid);
    const rivetColor = config.rivet_color;
    const plateColor = config.plate_color;
    const plateTransparent = config.plate_transparent;

    // Appearance
    const agedTexture =
      config.aged_texture !== undefined ? config.aged_texture : 'everywhere';
    const agedTextureIntensity =
      config.aged_texture_intensity !== undefined
        ? config.aged_texture_intensity
        : 50;
    const agedTextureOpacity = ((100 - agedTextureIntensity) / 100) * 1.0;
    const effectiveAgedTexture =
      plateTransparent && agedTexture === 'everywhere'
        ? 'glass_only'
        : agedTexture;

    // Layout - RESIZED
    const plateWidth = 280;
    const plateHeight = 170; // Increased to 170 to avoid rivet collision
    const rimWidth = 240;
    const rimHeight = 100; // Decreased back to 100 to reduce white space

    // Match Entities Card Vertical Rhythm (Top Offset)
    const rimX = (plateWidth - rimWidth) / 2; // 20
    const rimY = 35; // Kept at 35

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        ha-card { background: transparent; container-type: inline-size; }
        .card { position: relative; }
        .container { width: 100%; max-width: 520px; margin: 0 auto; }
        .vector-svg { width: 100%; height: auto; filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.3)); }
        .rivet { fill: ${rivetColor}; filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.4)); }
        .screw-detail { stroke: #4a4034; stroke-width: 0.5; fill: none; }
        .digital-font { font-family: 'ds-digitaldot', monospace; }
        .label-font { font-family: 'ds-digitaldot', monospace; letter-spacing: 1px; } 
      </style>
      <ha-card>
        <div class="card">
          <div class="container">
            <svg class="vector-svg" viewBox="0 0 ${plateWidth} ${plateHeight}" xmlns="http://www.w3.org/2000/svg">
              <defs>
                 ${this.renderGradients(uid)}
                 <!-- Reuse noise filter from entities if possible, inline here for safety -->
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
                 <!-- Tube Shadow -->
                 <filter id="inner-shadow-${uid}">
                    <feFlood flood-color="black"/>
                    <feComposite operator="out" in2="SourceGraphic"/>
                    <feGaussianBlur stdDeviation="2"/>
                    <feComposite operator="atop" in2="SourceGraphic"/>
                 </filter>
                 <!-- Glass Glare Vertical -->
                 <linearGradient id="tubeGlare-${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:rgba(255,255,255,0.4)" />
                    <stop offset="40%" style="stop-color:rgba(255,255,255,0.1)" />
                    <stop offset="50%" style="stop-color:rgba(255,255,255,0)" />
                    <stop offset="100%" style="stop-color:rgba(255,255,255,0.2)" />
                 </linearGradient>
                 <linearGradient id="screenGrad-${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#000;stop-opacity:0" />
                    <stop offset="100%" style="stop-color:#000;stop-opacity:0.2" />
                 </linearGradient>
              </defs>

              <!-- Plate -->
              <rect x="5" y="5" width="${plateWidth - 10}" height="${plateHeight - 10}" rx="20" ry="20" 
                    fill="${plateTransparent ? 'none' : plateColor}" 
                    stroke="${plateTransparent ? 'none' : '#888'}" stroke-width="0.5" 
                    filter="${effectiveAgedTexture === 'everywhere' && !plateTransparent ? `url(#aged-${uid}) drop-shadow(1px 1px 2px rgba(0,0,0,0.3))` : 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))'}" />

              ${this.renderRivets(plateWidth - 10, plateHeight - 10, 5, 5)}

              <!-- Main Frame (Rim) -->
              ${this.renderSquareRim(rimStyle, uid, fontBgColor, config.glass_effect_enabled, rimX, rimY, rimWidth, rimHeight)}

              <!-- Title -->
              <text x="${plateWidth / 2}" y="28" text-anchor="middle" font-size="${config.title_font_size}" font-weight="bold" fill="${config.title_color}" style="font-family: Georgia, serif; text-shadow: 1px 1px 2px rgba(255,255,255,0.2);">${title}</text>

              <!-- Main Content: The Tube -->
              <!-- Center Vertically in Rim: rimY + (rimHeight - 24)/2 -->
              <g transform="translate(${rimX + (rimWidth - 200) / 2}, ${rimY + (rimHeight - 24) / 2})">
                  
                  <!-- INNER RING (Bezel) -->
                  <!-- 4px thickness. -4 offset. -->
                  <rect x="-4" y="-4" width="208" height="32" rx="16" ry="16" 
                        fill="url(#${rimData.grad})" 
                        stroke="${rimData.stroke}" stroke-width="1"
                        filter="drop-shadow(1px 1px 2px rgba(0,0,0,0.5))" />

                  <!-- Tube Background (The "lines" color) -->
                  <!-- Using rimData.stroke to match the ring color as requested -->
                  <rect x="0" y="0" width="200" height="24" rx="12" ry="12" fill="${rimData.stroke}" stroke="none" style="box-shadow: inset 0 0 5px black;"/>
                  
                  <!-- Bands Container -->
                  <clipPath id="tubeClip-${uid}">
                      <rect x="0" y="0" width="200" height="24" rx="12" ry="12" />
                  </clipPath>
                  
                  <g id="bands-container" clip-path="url(#tubeClip-${uid})">
                      <!-- Bands will be injected here -->
                  </g>
                  
                  <!-- Tube Glass Overlay -->
                  <rect x="0" y="0" width="200" height="24" rx="12" ry="12" fill="url(#tubeGlare-${uid})" style="pointer-events: none;"/>
                  
                  <!-- Tube Frame/Highlight (Existing) -->
                  <rect x="0" y="0" width="200" height="24" rx="12" ry="12" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1" />

                   <!-- Inner Black Line (Inside the bezel, around the screen) -->
                   <rect x="0" y="0" width="200" height="24" rx="12" ry="12" fill="none" stroke="#000000" stroke-width="1" opacity="0.6" />
              </g>

              <!-- Status Text (Top Left of Rim area) -->
              <text id="status-text" x="${rimX + 24}" y="${rimY + 28}" font-size="14" font-weight="bold" fill="${config.font_color}" class="label-font" text-anchor="start">--</text>

              <!-- Uptime % Score (Top Right of Ring area) -->
              <text id="uptime-score" x="${rimX + rimWidth - 24}" y="${rimY + 28}" font-size="14" font-family="ds-digitaldot" text-anchor="end" fill="${config.font_color}" style="letter-spacing:1px;">--%</text>

              <!-- Footer (Bottom of Ring area) -->
              ${config.show_footer
        ? `
                    <!-- Start Time (Bottom Left).-->
                    <text id="footer-start" x="${rimX + 24}" y="${rimY + rimHeight - 20}" text-anchor="start" font-size="12" fill="${config.font_color}" class="label-font">...</text>
                    
                    <!-- End Time (Bottom Right) -->
                    <text id="footer-end" x="${rimX + rimWidth - 24}" y="${rimY + rimHeight - 20}" text-anchor="end" font-size="12" fill="${config.font_color}" class="label-font">Now</text>
              `
        : ''
      }

              <!-- Wear Marks -->
              ${this.renderWearMarks(config.wear_level, plateHeight)}

            </svg>
          </div>
        </div>
      </ha-card>
    `;

    // Attach click listener for more-info
    const cardEl = this.shadowRoot.querySelector('.card');
    if (cardEl) {
      cardEl.style.cursor = 'pointer';
      cardEl.onclick = () => {
        if (this.config.entity) {
          fireEvent(this, 'hass-more-info', { entityId: this.config.entity });
        }
      };
    }
  }

  // Helpers copied/adapted to avoid complexity of shared utils refactor for now
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

  renderWearMarks(wearLevel, viewBoxHeight) {
    if (wearLevel === 0) return '';
    // Simple random-ish marks based on wear level, hardcoded partially
    // Using simple circles as scratches/pits
    const baseOpacity = (wearLevel / 100) * 0.25;
    return `
        <circle cx="50" cy="45" r="2" fill="#8B7355" opacity="${Math.min(0.2 * (wearLevel / 50), 0.25)}"/>
        <circle cx="210" cy="${viewBoxHeight - 40}" r="1.5" fill="#8B7355" opacity="${Math.min(0.15 * (wearLevel / 50), 0.25)}"/>
        <path d="M 30 ${viewBoxHeight - 20} Q 40 ${viewBoxHeight - 25} 50 ${viewBoxHeight - 20}" stroke="#8B7355" stroke-width="0.5" fill="none" opacity="${baseOpacity}"/>
    `;
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

  // Helper to get rim data, shared between render and renderSquareRim
  getRimStyleData(s, uid) {
    const switchS = {
      brass: { grad: `brassRim-${uid}`, stroke: '#8B7355' },
      silver: { grad: `silverRim-${uid}`, stroke: '#999999' },
      chrome: { grad: `silverRim-${uid}`, stroke: '#999999' },
      white: { grad: `whiteRim-${uid}`, stroke: '#cfcfcf' },
      black: { grad: `blackRim-${uid}`, stroke: '#2b2b2b' },
      copper: { grad: `copperRim-${uid}`, stroke: '#8B4513' },
      blue: { grad: `blueRim-${uid}`, stroke: '#104E8B' },
      green: { grad: `greenRim-${uid}`, stroke: '#006400' },
      red: { grad: `redRim-${uid}`, stroke: '#8B0000' },
    };
    return switchS[s] || switchS['brass'];
  }

  renderSquareRim(ringStyle, uid, bgColor, glassEffectEnabled, x, y, w, h) {
    const data = this.getRimStyleData(ringStyle, uid);

    return `
       <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="20" ry="20" fill="url(#${data.grad})" stroke="${data.stroke}" stroke-width="1" filter="drop-shadow(2px 2px 3px rgba(0,0,0,0.4))"/>
       <rect x="${x + 12}" y="${y + 12}" width="${w - 24}" height="${h - 24}" rx="10" ry="10" fill="${bgColor}" stroke="none" />
       <!-- Inner Shadow on Screen -->
        <rect x="${x + 12}" y="${y + 12}" width="${w - 24}" height="${h - 24}" rx="10" ry="10" fill="url(#screenGrad-${uid})" stroke="none" opacity="0.3" pointer-events="none"/>

       ${glassEffectEnabled ? `<path d="M ${x + 12} ${y + 12} L ${x + w - 12} ${y + 12} L ${x + w - 12} ${y + 12 + (h - 24) * 0.2} Q ${x + w / 2} ${y + 12 + (h - 24) * 0.25} ${x + 12} ${y + 12 + (h - 24) * 0.2} Z" fill="url(#glassGrad-${uid})" clip-path="inset(1px round 9px)" style="pointer-events: none;" />` : ''}
       <rect x="${x + 12}" y="${y + 12}" width="${w - 24}" height="${h - 24}" rx="10" ry="10" fill="none" stroke="rgba(0,0,0,0.5)" stroke-width="1" style="box-shadow: inset 0 0 10px #000;"/>
       <rect x="${x + 8}" y="${y + 8}" width="${w - 16}" height="${h - 16}" rx="15" ry="15" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="2"/>
     `;
  }

  renderGradients(uid) {
    // Simplified set
    const stops = (c1, c2, c3, c4, c5) => `
        <stop offset="0%" style="stop-color:${c1};stop-opacity:1" />
        <stop offset="25%" style="stop-color:${c2};stop-opacity:1" />
        <stop offset="50%" style="stop-color:${c3};stop-opacity:1" />
        <stop offset="75%" style="stop-color:${c4};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${c5};stop-opacity:1" />
     `;
    return `
        <linearGradient id="brassRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">${stops('#c9a961', '#ddc68f', '#b8944d', '#d4b877', '#a68038')}</linearGradient>
        <linearGradient id="silverRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">${stops('#e8e8e8', '#ffffff', '#c0c0c0', '#e0e0e0', '#b0b0b0')}</linearGradient>
        <linearGradient id="whiteRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#f6f6f6"/><stop offset="100%" style="stop-color:#cfcfcf"/></linearGradient>
        <linearGradient id="blackRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#3a3a3a"/><stop offset="100%" style="stop-color:#141414"/></linearGradient>
        <linearGradient id="copperRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">${stops('#c77c43', '#e1a06a', '#9a5c2a', '#d7925a', '#7b461f')}</linearGradient>
        <linearGradient id="blueRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">${stops('#2a6fdb', '#5ea2ff', '#1f4f9e', '#4f8fe6', '#163b76')}</linearGradient>
        <linearGradient id="greenRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">${stops('#2fbf71', '#6fe0a6', '#1f7a49', '#53cf8e', '#165a36')}</linearGradient>
        <linearGradient id="redRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">${stops('#e53935', '#ff6f6c', '#9e1f1c', '#e85a57', '#6f1513')}</linearGradient>
        <linearGradient id="glassGrad-${uid}" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#aaccff;stop-opacity:0.3" /><stop offset="100%" style="stop-color:#aaccff;stop-opacity:0" /></linearGradient>
     `;
  }

  static getConfigElement() {
    return document.createElement('foundry-uptime-editor');
  }
}

if (!customElements.get('foundry-uptime-card')) {
  customElements.define('foundry-uptime-card', FoundryUptimeCard);
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'foundry-uptime-card',
  name: 'Foundry Uptime',
  preview: true,
  description: 'A steampunk-styled uptime monitor.',
});
