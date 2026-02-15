import { fireEvent } from './utils.js';
import { ensureLedFont } from './fonts.js';
import { loadThemes, applyTheme } from './themes.js';

class FoundryChartCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    this.config = {
      ...config,
      chart: { ...(config.chart || {}) },
    };

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

    this.config.hours_to_show = this.config.hours_to_show || 24;
    this.config.update_interval = this.config.update_interval || 60;
    this.config.bucket_count = this.config.bucket_count || 50;
    this.config.show_footer =
      this.config.show_footer !== undefined ? this.config.show_footer : true;

    this.config.ring_style = this.config.ring_style || 'brass';
    this.config.title = this.config.title || 'Foundry Chart';
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

    this.config.line_color = this.config.line_color || '#d32f2f';
    this.config.line_width = this.config.line_width || 2;
    this.config.fill_under_line =
      this.config.fill_under_line !== undefined
        ? this.config.fill_under_line
        : false;
    this.config.grid_minor_color = this.config.grid_minor_color || '#cfead6';
    this.config.grid_major_color = this.config.grid_major_color || '#8fc79d';
    this.config.grid_opacity =
      this.config.grid_opacity !== undefined ? this.config.grid_opacity : 0.6;
    this.config.value_precision =
      this.config.value_precision !== undefined
        ? this.config.value_precision
        : 2;

    this._uniqueId = Math.random().toString(36).substr(2, 9);
    ensureLedFont();

    if (this._interval) clearInterval(this._interval);
    this._interval = setInterval(
      () => this._fetchHistory(),
      this.config.update_interval * 1000
    );
  }

  static getStubConfig() {
    return {
      entity: 'sensor.temperature',
      title: 'Foundry Chart',
      title_color: '#3e2723',
      hours_to_show: 24,
      bucket_count: 50,
      update_interval: 60,
      ring_style: 'brass',
      rivet_color: '#6a5816',
      plate_color: '#8c7626',
      plate_transparent: false,
      font_bg_color: '#ffffff',
      font_color: '#000000',
      wear_level: 50,
      glass_effect_enabled: true,
      line_color: '#d32f2f',
      line_width: 2,
      fill_under_line: false,
      grid_minor_color: '#cfead6',
      grid_major_color: '#8fc79d',
      grid_opacity: 0.6,
      value_precision: 2,
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
      const history = await this._hass.callApi(
        'GET',
        `history/period/${isoStart}?filter_entity_id=${entityId}&minimal_response&end_time=${new Date().toISOString()}`
      );
      if (history && history.length > 0) {
        this._history = history[0];
      } else {
        this._history = [];
      }
      this._renderHistory();
    } catch (e) {
      console.error('Foundry Chart: Fetch error', e);
    }
  }

  _renderHistory() {
    this.render();
    this._updateValues();
  }

  _updateValues() {
    if (!this.shadowRoot) return;
    if (!this._history) return;

    const now = new Date();
    const hours = this.config.hours_to_show;
    const startTime = new Date(now.getTime() - hours * 3600 * 1000);
    const startTs = startTime.getTime();
    const endTs = now.getTime();
    const totalDuration = endTs - startTs;

    const chartWidth = 200;
    const bucketCount = Math.max(10, this.config.bucket_count || 50);
    const bucketDur = totalDuration / bucketCount;

    const segments = [];
    let currentValue = null;
    let lastChangeTs = startTs;

    if (this._history.length > 0) {
      const sortedHistory = [...this._history].sort(
        (a, b) => new Date(a.last_changed) - new Date(b.last_changed)
      );

      for (const entry of sortedHistory) {
        const t = new Date(entry.last_changed).getTime();
        const parsed = parseFloat(entry.state);
        const value = Number.isFinite(parsed) ? parsed : null;

        if (t <= startTs) {
          currentValue = value;
          lastChangeTs = startTs;
          continue;
        }

        if (t > lastChangeTs) {
          segments.push({ start: lastChangeTs, end: t, value: currentValue });
        }
        currentValue = value;
        lastChangeTs = t;
      }
    } else {
      const currentState = this._hass.states[this.config.entity]?.state;
      const parsed = parseFloat(currentState);
      currentValue = Number.isFinite(parsed) ? parsed : null;
    }

    if (lastChangeTs < endTs) {
      segments.push({ start: lastChangeTs, end: endTs, value: currentValue });
    }

    const buckets = [];
    for (let i = 0; i < bucketCount; i++) {
      const bStart = startTs + i * bucketDur;
      const bEnd = bStart + bucketDur;
      let weightedSum = 0;
      let weightedDur = 0;

      for (const seg of segments) {
        if (seg.value === null || seg.value === undefined) continue;
        const overlapStart = Math.max(seg.start, bStart);
        const overlapEnd = Math.min(seg.end, bEnd);
        if (overlapEnd > overlapStart) {
          const dur = overlapEnd - overlapStart;
          weightedSum += seg.value * dur;
          weightedDur += dur;
        }
      }

      const value = weightedDur > 0 ? weightedSum / weightedDur : null;
      buckets.push({ id: i, value });
    }

    const values = buckets
      .map((b) => b.value)
      .filter((v) => v !== null && v !== undefined);

    let minValue = this.config.min_value;
    let maxValue = this.config.max_value;

    if (minValue === undefined || minValue === null) {
      minValue = values.length ? Math.min(...values) : 0;
    }
    if (maxValue === undefined || maxValue === null) {
      maxValue = values.length ? Math.max(...values) : 1;
    }

    if (minValue === maxValue) {
      minValue -= 1;
      maxValue += 1;
    }

    const valueEl = this.shadowRoot.getElementById('chart-value');
    if (valueEl) {
      const currentState = this._hass.states[this.config.entity];
      const unit = currentState?.attributes?.unit_of_measurement || '';
      const parsed = parseFloat(currentState?.state);
      const value = Number.isFinite(parsed) ? parsed : null;
      const text =
        value === null
          ? '--'
          : `${value.toFixed(this.config.value_precision)}${unit}`;
      valueEl.textContent = text;
      valueEl.setAttribute('fill', this.config.font_color);
    }

    const labelEl = this.shadowRoot.getElementById('chart-label');
    if (labelEl) {
      const friendly =
        this._hass.states[this.config.entity]?.attributes?.friendly_name ||
        this.config.entity;
      labelEl.textContent = friendly;
      labelEl.setAttribute('fill', this.config.font_color);
    }

    const emptyEl = this.shadowRoot.getElementById('chart-empty');
    const lineEl = this.shadowRoot.getElementById('chart-line');
    const areaEl = this.shadowRoot.getElementById('chart-area');

    if (values.length === 0) {
      if (emptyEl) emptyEl.setAttribute('visibility', 'visible');
      if (lineEl) lineEl.setAttribute('d', '');
      if (areaEl) areaEl.setAttribute('d', '');
    } else {
      if (emptyEl) emptyEl.setAttribute('visibility', 'hidden');
      const chartHeight = 60;
      const step = chartWidth / (bucketCount - 1);

      const points = buckets.map((bucket, index) => {
        const x = index * step;
        if (bucket.value === null || bucket.value === undefined) {
          return { x, y: null };
        }
        const pct = (bucket.value - minValue) / (maxValue - minValue);
        const y = chartHeight - pct * chartHeight;
        return { x, y };
      });

      const pathParts = [];
      let started = false;
      points.forEach((p) => {
        if (p.y === null) {
          started = false;
          return;
        }
        if (!started) {
          pathParts.push(`M ${p.x} ${p.y}`);
          started = true;
        } else {
          pathParts.push(`L ${p.x} ${p.y}`);
        }
      });

      const linePath = pathParts.join(' ');
      if (lineEl) lineEl.setAttribute('d', linePath);

      if (areaEl) {
        if (this.config.fill_under_line) {
          const first = points.find((p) => p.y !== null);
          const last = [...points].reverse().find((p) => p.y !== null);
          if (first && last) {
            const areaPath = `${linePath} L ${last.x} ${chartHeight} L ${first.x} ${chartHeight} Z`;
            areaEl.setAttribute('d', areaPath);
          } else {
            areaEl.setAttribute('d', '');
          }
        } else {
          areaEl.setAttribute('d', '');
        }
      }
    }

    if (this.config.show_footer) {
      const startEl = this.shadowRoot.getElementById('footer-start');
      const endEl = this.shadowRoot.getElementById('footer-end');
      if (startEl && endEl) {
        startEl.textContent = this._timeAgo(startTime);
        endEl.textContent = 'Now';
      }
    }
  }

  _timeAgo(date) {
    const diff = (new Date() - date) / 1000;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  render() {
    if (this._rendered) return;
    this._rendered = true;

    const config = this.config;
    const title = config.title;
    const uid = this._uniqueId;

    const fontBgColor = config.font_bg_color;
    const rimStyle = config.ring_style;
    const rivetColor = config.rivet_color;
    const plateColor = config.plate_color;
    const plateTransparent = config.plate_transparent;

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

    const plateWidth = 280;
    const plateHeight = 190;
    const rimWidth = 240;
    const rimHeight = 110;
    const rimX = (plateWidth - rimWidth) / 2;
    const rimY = 35;

    const chartWidth = 200;
    const chartHeight = 60;
    const chartX = rimX + (rimWidth - chartWidth) / 2;
    const chartY = rimY + 32;

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
                 <filter id="inner-shadow-${uid}">
                    <feFlood flood-color="black"/>
                    <feComposite operator="out" in2="SourceGraphic"/>
                    <feGaussianBlur stdDeviation="2"/>
                    <feComposite operator="atop" in2="SourceGraphic"/>
                 </filter>
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
                 <pattern id="gridMinor-${uid}" width="10" height="10" patternUnits="userSpaceOnUse">
                   <path d="M10 0 L0 0 0 10" fill="none" stroke="${config.grid_minor_color}" stroke-width="0.5" opacity="${config.grid_opacity}" />
                 </pattern>
                 <pattern id="gridMajor-${uid}" width="50" height="50" patternUnits="userSpaceOnUse">
                   <path d="M50 0 L0 0 0 50" fill="none" stroke="${config.grid_major_color}" stroke-width="0.8" opacity="${config.grid_opacity}" />
                 </pattern>
              </defs>

              <rect x="5" y="5" width="${plateWidth - 10}" height="${plateHeight - 10}" rx="20" ry="20" 
                    fill="${plateTransparent ? 'none' : plateColor}" 
                    stroke="${plateTransparent ? 'none' : '#888'}" stroke-width="0.5" 
                    filter="${effectiveAgedTexture === 'everywhere' && !plateTransparent ? `url(#aged-${uid}) drop-shadow(1px 1px 2px rgba(0,0,0,0.3))` : 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))'}" />

              ${this.renderRivets(plateWidth - 10, plateHeight - 10, 5, 5)}

              ${this.renderSquareRim(rimStyle, uid, fontBgColor, config.glass_effect_enabled, rimX, rimY, rimWidth, rimHeight)}

              <text x="${plateWidth / 2}" y="28" text-anchor="middle" font-size="${config.title_font_size}" font-weight="bold" fill="${config.title_color}" style="font-family: Georgia, serif; text-shadow: 1px 1px 2px rgba(255,255,255,0.2);">${title}</text>

              <text id="chart-label" x="${rimX + 24}" y="${rimY + 26}" font-size="13" font-weight="bold" fill="${config.font_color}" class="label-font" text-anchor="start">--</text>
              <text id="chart-value" x="${rimX + rimWidth - 24}" y="${rimY + 26}" font-size="13" font-family="ds-digitaldot" text-anchor="end" fill="${config.font_color}" style="letter-spacing:1px;">--</text>

              <g transform="translate(${chartX}, ${chartY})">
                  <rect x="0" y="0" width="${chartWidth}" height="${chartHeight}" rx="8" ry="8" fill="${fontBgColor}" />
                  <rect x="0" y="0" width="${chartWidth}" height="${chartHeight}" rx="8" ry="8" fill="url(#gridMinor-${uid})" />
                  <rect x="0" y="0" width="${chartWidth}" height="${chartHeight}" rx="8" ry="8" fill="url(#gridMajor-${uid})" />

                  <clipPath id="chartClip-${uid}">
                      <rect x="0" y="0" width="${chartWidth}" height="${chartHeight}" rx="8" ry="8" />
                  </clipPath>

                  <g clip-path="url(#chartClip-${uid})">
                      <path id="chart-area" d="" fill="${config.line_color}" opacity="0.2"></path>
                      <path id="chart-line" d="" fill="none" stroke="${config.line_color}" stroke-width="${config.line_width}" stroke-linecap="round" stroke-linejoin="round"></path>
                  </g>

                  <rect x="0" y="0" width="${chartWidth}" height="${chartHeight}" rx="8" ry="8" fill="url(#tubeGlare-${uid})" style="pointer-events: none;"/>
                  <rect x="0" y="0" width="${chartWidth}" height="${chartHeight}" rx="8" ry="8" fill="none" stroke="rgba(0,0,0,0.35)" stroke-width="1" />
                  <text id="chart-empty" x="${chartWidth / 2}" y="${chartHeight / 2 + 4}" text-anchor="middle" font-size="12" fill="${config.font_color}" class="label-font" visibility="hidden">No data</text>
              </g>

              ${
                config.show_footer
                  ? `
                    <text id="footer-start" x="${rimX + 24}" y="${rimY + rimHeight - 16}" text-anchor="start" font-size="12" fill="${config.font_color}" class="label-font">...</text>
                    <text id="footer-end" x="${rimX + rimWidth - 24}" y="${rimY + rimHeight - 16}" text-anchor="end" font-size="12" fill="${config.font_color}" class="label-font">Now</text>
              `
                  : ''
              }

              ${this.renderWearMarks(config.wear_level, plateHeight)}
            </svg>
          </div>
        </div>
      </ha-card>
    `;

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
    const baseOpacity = (wearLevel / 100) * 0.25;
    return `
        <circle cx="50" cy="45" r="2" fill="#8B7355" opacity="${Math.min(0.2 * (wearLevel / 50), 0.25)}"/>
        <circle cx="210" cy="${viewBoxHeight - 40}" r="1.5" fill="#8B7355" opacity="${Math.min(0.15 * (wearLevel / 50), 0.25)}"/>
        <path d="M 30 ${viewBoxHeight - 20} Q 40 ${viewBoxHeight - 25} 50 ${viewBoxHeight - 20}" stroke="#8B7355" stroke-width="0.5" fill="none" opacity="${baseOpacity}"/>
    `;
  }

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
        <rect x="${x + 12}" y="${y + 12}" width="${w - 24}" height="${h - 24}" rx="10" ry="10" fill="url(#screenGrad-${uid})" stroke="none" opacity="0.3" pointer-events="none"/>

       ${glassEffectEnabled ? `<path d="M ${x + 12} ${y + 12} L ${x + w - 12} ${y + 12} L ${x + w - 12} ${y + 12 + (h - 24) * 0.2} Q ${x + w / 2} ${y + 12 + (h - 24) * 0.25} ${x + 12} ${y + 12 + (h - 24) * 0.2} Z" fill="url(#glassGrad-${uid})" clip-path="inset(1px round 9px)" style="pointer-events: none;" />` : ''}
       <rect x="${x + 12}" y="${y + 12}" width="${w - 24}" height="${h - 24}" rx="10" ry="10" fill="none" stroke="rgba(0,0,0,0.5)" stroke-width="1" style="box-shadow: inset 0 0 10px #000;"/>
       <rect x="${x + 8}" y="${y + 8}" width="${w - 16}" height="${h - 16}" rx="15" ry="15" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="2"/>
     `;
  }

  renderGradients(uid) {
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
    return document.createElement('foundry-chart-editor');
  }
}

if (!customElements.get('foundry-chart-card')) {
  customElements.define('foundry-chart-card', FoundryChartCard);
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'foundry-chart-card',
  name: 'Foundry Chart',
  preview: true,
  description: 'A steampunk-styled chart with polygraph paper.',
});
