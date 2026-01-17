
import { debounce, fireEvent, getActionConfig } from "./utils.js";

class FoundryChartCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._resizeObserver = null;
    
    // Chart data tracking
    this._historicalData = {}; // Store data for each entity
    this._maxDataPoints = 60; // Number of data points to display
    this._updateInterval = null;
    this._chartAnimationFrame = null;
    
    this._boundHandleClick = () => this._handleAction("tap");
    this._boundHandleDblClick = () => this._handleAction("double_tap");
    this._boundHandleContextMenu = (e) => {
      e.preventDefault();
      this._handleAction("hold");
    };
    this._boundHandleKeyDown = (e) => this._handleKeyDown(e);
  }

  connectedCallback() {
    // Start periodic data collection
    this._startDataCollection();
  }

  disconnectedCallback() {
    this._stopDataCollection();
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }
  }

  _startDataCollection() {
    // Collect data every 2 seconds
    if (this._updateInterval) return;
    
    this._updateInterval = setInterval(() => {
      this._collectDataPoint();
    }, 2000);
    
    // Collect initial data point
    this._collectDataPoint();
  }

  _stopDataCollection() {
    if (this._updateInterval) {
      clearInterval(this._updateInterval);
      this._updateInterval = null;
    }
  }

  _collectDataPoint() {
    if (!this._hass || !this.config) return;
    
    const entities = this._getEntityList();
    const timestamp = Date.now();
    
    entities.forEach(entityId => {
      if (!entityId) return;
      
      const entity = this._hass.states[entityId];
      if (!entity) return;
      
      const value = parseFloat(entity.state);
      if (isNaN(value)) return;
      
      if (!this._historicalData[entityId]) {
        this._historicalData[entityId] = [];
      }
      
      this._historicalData[entityId].push({ timestamp, value });
      
      // Keep only the last _maxDataPoints
      if (this._historicalData[entityId].length > this._maxDataPoints) {
        this._historicalData[entityId].shift();
      }
    });
    
    // Trigger chart redraw
    this._drawChart();
  }

  _getEntityList() {
    const entities = [];
    for (let i = 1; i <= 4; i++) {
      const entityKey = `entity${i === 1 ? '' : i}`;
      if (this.config[entityKey]) {
        entities.push(this.config[entityKey]);
      }
    }
    return entities;
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('You need to define at least one entity');
    }

    this.config = { ...config };
    this._validateConfig();

    if (!this.config.tap_action) {
      this.config.tap_action = { action: "more-info" };
    }

    if (this.config.ring_style === undefined) {
      this.config.ring_style = 'brass';
    }

    this._uniqueId = Math.random().toString(36).substr(2, 9);
    
    // Reset historical data when config changes
    this._historicalData = {};
    
    this.render();
    if (this._hass) {
      requestAnimationFrame(() => {
        this._collectDataPoint();
        this._drawChart();
      });
    }
  }

  _validateConfig() {
    const config = this.config;

    // Validate time range (in minutes)
    if (config.time_range !== undefined) {
      const range = parseFloat(config.time_range);
      if (isNaN(range) || range <= 0) {
        console.warn('Foundry Chart Card: time_range must be positive. Using 2 minutes.');
        this.config.time_range = 2;
      } else {
        this.config.time_range = Math.min(range, 60); // Cap at 60 minutes
      }
    }

    // Validate chart height
    if (config.chart_height !== undefined) {
      const height = parseInt(config.chart_height);
      if (isNaN(height) || height < 100) {
        console.warn('Foundry Chart Card: chart_height must be at least 100. Using 300.');
        this.config.chart_height = 300;
      } else {
        this.config.chart_height = Math.min(height, 800); // Cap at 800px
      }
    }
  }

  set hass(hass) {
    this._hass = hass;
    if (!this.config) return;
    if (!this.shadowRoot) return;
    
    // Update chart with new values
    this._drawChart();
  }

  render() {
    const config = this.config;
    const title = config.title || 'Chart Recorder';
    const uid = this._uniqueId;
    const chartHeight = config.chart_height !== undefined ? config.chart_height : 300;
    const ringStyle = config.ring_style !== undefined ? config.ring_style : 'brass';
    const rimData = this.getRimStyleData(ringStyle, uid);
    const rivetColor = config.rivet_color !== undefined ? config.rivet_color : '#6d5d4b';
    const plateColor = config.plate_color !== undefined ? config.plate_color : '#f0ebe1';
    const plateTransparent = config.plate_transparent !== undefined ? config.plate_transparent : false;
    const wearLevel = config.wear_level !== undefined ? config.wear_level : 50;
    const agedTexture = config.aged_texture !== undefined ? config.aged_texture : 'everywhere';
    const agedTextureIntensity = config.aged_texture_intensity !== undefined ? config.aged_texture_intensity : 50;
    const agedTextureOpacity = ((100 - agedTextureIntensity) / 100) * 1.0;

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
        .chart-container {
          position: relative;
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
          height: ${chartHeight}px;
          container-type: inline-size;
        }
        .chart-svg {
          width: 100%;
          height: 100%;
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
        .paper-background {
          fill: #f9f6f0;
          stroke: none;
        }
        .grid-line {
          stroke: #d4c8b8;
          stroke-width: 0.5;
          opacity: 0.6;
        }
        .chart-line {
          fill: none;
          stroke-width: 1.5;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
        .pen-pivot {
          transform-origin: center;
          transition: transform 0.3s ease-out;
        }
        .entity-label {
          font-family: 'Georgia', serif;
          font-size: 10px;
          font-weight: bold;
          fill: #3e2723;
          text-shadow: 1px 1px 2px rgba(255,255,255,0.5);
        }
      </style>
      <ha-card role="application" aria-label="${title}" tabindex="0">
        <div class="card" id="actionRoot">
          ${title ? `<div class="title">${title}</div>` : ''}
          <div class="chart-container" role="presentation">
            <svg class="chart-svg" id="chartSvg" viewBox="0 0 800 ${chartHeight}" xmlns="http://www.w3.org/2000/svg" role="presentation" aria-hidden="true">
              <defs>
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
                
                <!-- Black rim -->
                <linearGradient id="blackRim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#3a3a3a;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#555555;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#1f1f1f;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#444444;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#141414;stop-opacity:1" />
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
                
                <!-- Paper texture pattern -->
                <pattern id="paperTexture-${uid}" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                  <rect width="100" height="100" fill="#f9f6f0"/>
                  <circle cx="10" cy="10" r="0.3" fill="#d4c8b8" opacity="0.3"/>
                  <circle cx="45" cy="30" r="0.2" fill="#d4c8b8" opacity="0.2"/>
                  <circle cx="80" cy="60" r="0.3" fill="#d4c8b8" opacity="0.3"/>
                  <circle cx="25" cy="75" r="0.2" fill="#d4c8b8" opacity="0.2"/>
                  <circle cx="60" cy="90" r="0.3" fill="#d4c8b8" opacity="0.3"/>
                </pattern>
              </defs>
              
              <!-- Main plate background -->
              <rect x="0" y="0" width="800" height="${chartHeight}" 
                    fill="${plateTransparent ? 'rgba(240, 235, 225, 0.15)' : plateColor}" 
                    ${agedTexture === 'everywhere' ? `filter="url(#aged-${uid})"` : ''}/>
              
              ${this.renderRim(ringStyle, uid, chartHeight)}
              
              <!-- Chart area group -->
              <g id="chartArea">
                <!-- Paper background will be drawn here -->
              </g>
              
              <!-- Pens and labels group -->
              <g id="pensArea">
                <!-- Pens will be drawn here -->
              </g>
              
              <!-- Corner rivets -->
              <circle cx="20" cy="20" r="4" class="rivet"/>
              <circle cx="20" cy="20" r="2.5" class="screw-detail"/>
              <line x1="17" y1="20" x2="23" y2="20" class="screw-detail"/>
              
              <circle cx="780" cy="20" r="4" class="rivet"/>
              <circle cx="780" cy="20" r="2.5" class="screw-detail"/>
              <line x1="777" y1="20" x2="783" y2="20" class="screw-detail"/>
              
              <circle cx="20" cy="${chartHeight - 20}" r="4" class="rivet"/>
              <circle cx="20" cy="${chartHeight - 20}" r="2.5" class="screw-detail"/>
              <line x1="17" y1="${chartHeight - 20}" x2="23" y2="${chartHeight - 20}" class="screw-detail"/>
              
              <circle cx="780" cy="${chartHeight - 20}" r="4" class="rivet"/>
              <circle cx="780" cy="${chartHeight - 20}" r="2.5" class="screw-detail"/>
              <line x1="777" y1="${chartHeight - 20}" x2="783" y2="${chartHeight - 20}" class="screw-detail"/>
              
              <!-- Age spots and wear marks -->
              ${this.renderWearMarks(wearLevel, chartHeight)}
            </svg>
          </div>
        </div>
      </ha-card>
    `;
    
    this._attachActionListeners();
    this._drawChart();
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
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._handleAction("tap");
    }
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

    this._runAction(actionConfig, entityId);
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

      const data = { ...(actionConfig.service_data || {}) };
      if (actionConfig.target?.entity_id) data.entity_id = actionConfig.target.entity_id;

      this._hass.callService(domain, srv, data);
      return;
    }
  }

  getRimStyleData(ringStyle, uid) {
    switch (ringStyle) {
      case "brass":
        return { grad: `brassRim-${uid}`, stroke: "#8B7355" };
      case "silver":
      case "chrome":
        return { grad: `silverRim-${uid}`, stroke: "#999999" };
      case "black":
        return { grad: `blackRim-${uid}`, stroke: "#2b2b2b" };
      default:
        return null;
    }
  }

  renderRim(ringStyle, uid, height) {
    const data = this.getRimStyleData(ringStyle, uid);
    if (!data) return "";

    return `
      <rect x="0" y="0" width="800" height="${height}" fill="url(#${data.grad})" stroke="${data.stroke}" stroke-width="2" rx="5" ry="5"/>
      <rect x="8" y="8" width="784" height="${height - 16}" fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="2" rx="3" ry="3"/>
    `;
  }

  renderWearMarks(wearLevel, height) {
    if (wearLevel === 0) return '';

    const baseOpacity = (wearLevel / 100) * 0.25;
    const allMarks = [
      { cx: 100, cy: 60, r: 2, fill: '#8B7355', baseOpacity: 0.2 },
      { cx: 650, cy: 75, r: 1.5, fill: '#8B7355', baseOpacity: 0.15 },
      { cx: 200, cy: height * 0.4, r: 1, fill: '#6d5d4b', baseOpacity: 0.2 },
      { cx: 500, cy: height * 0.3, r: 1.8, fill: '#6d5d4b', baseOpacity: 0.18 },
      { cx: 350, cy: height * 0.7, r: 1.3, fill: '#8B7355', baseOpacity: 0.1 },
      { cx: 700, cy: height * 0.5, r: 0.8, fill: '#6d5d4b', baseOpacity: 0.15 }
    ];

    const markCount = Math.ceil((wearLevel / 100) * allMarks.length);
    const marksToShow = allMarks.slice(0, markCount);

    return marksToShow.map(mark => {
      const opacity = Math.min(mark.baseOpacity * (wearLevel / 50), 0.25);
      return `<circle cx="${mark.cx}" cy="${mark.cy}" r="${mark.r}" fill="${mark.fill}" opacity="${opacity}"/>`;
    }).join('\n              ');
  }

  _drawChart() {
    if (!this.shadowRoot) return;
    
    const chartArea = this.shadowRoot.getElementById('chartArea');
    const pensArea = this.shadowRoot.getElementById('pensArea');
    if (!chartArea || !pensArea) return;

    const entities = this._getEntityList();
    if (entities.length === 0) return;

    const chartHeight = this.config.chart_height !== undefined ? this.config.chart_height : 300;
    const margin = { top: 40, right: 120, bottom: 20, left: 40 };
    const width = 800 - margin.left - margin.right;
    const height = chartHeight - margin.top - margin.bottom;
    
    // Calculate track height for each entity
    const trackHeight = height / entities.length;
    
    // Default colors for up to 4 entities
    const defaultColors = ['#C41E3A', '#1E3AC4', '#1EC43A', '#C4A61E'];
    
    // Clear previous chart
    chartArea.innerHTML = '';
    pensArea.innerHTML = '';
    
    // Draw paper background with grid
    const paper = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    paper.setAttribute('x', margin.left);
    paper.setAttribute('y', margin.top);
    paper.setAttribute('width', width);
    paper.setAttribute('height', height);
    paper.setAttribute('class', 'paper-background');
    chartArea.appendChild(paper);
    
    // Draw horizontal grid lines for each track
    for (let i = 0; i <= entities.length; i++) {
      const y = margin.top + (i * trackHeight);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', margin.left);
      line.setAttribute('y1', y);
      line.setAttribute('x2', margin.left + width);
      line.setAttribute('y2', y);
      line.setAttribute('class', 'grid-line');
      line.setAttribute('stroke-width', i === 0 || i === entities.length ? '1' : '0.5');
      chartArea.appendChild(line);
    }
    
    // Draw vertical grid lines
    const numVerticalLines = 10;
    for (let i = 0; i <= numVerticalLines; i++) {
      const x = margin.left + (i * width / numVerticalLines);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x);
      line.setAttribute('y1', margin.top);
      line.setAttribute('x2', x);
      line.setAttribute('y2', margin.top + height);
      line.setAttribute('class', 'grid-line');
      chartArea.appendChild(line);
    }
    
    // Draw charts for each entity
    entities.forEach((entityId, index) => {
      if (!entityId || !this._historicalData[entityId]) return;
      
      const data = this._historicalData[entityId];
      if (data.length < 2) return;
      
      const color = this.config[`color${index === 0 ? '' : index + 1}`] || defaultColors[index];
      const trackY = margin.top + (index * trackHeight);
      const trackCenter = trackY + (trackHeight / 2);
      
      // Calculate min/max for this entity
      const values = data.map(d => d.value);
      const minValue = Math.min(...values);
      const maxValue = Math.max(...values);
      const valueRange = maxValue - minValue || 1;
      
      // Create path for the chart line
      const pathData = data.map((point, i) => {
        const x = margin.left + ((i / (this._maxDataPoints - 1)) * width);
        // Map value to track height (inverted because SVG y increases downward)
        const normalizedValue = (point.value - minValue) / valueRange;
        const y = trackY + trackHeight - (normalizedValue * trackHeight * 0.8) - (trackHeight * 0.1);
        
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      }).join(' ');
      
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathData);
      path.setAttribute('class', 'chart-line');
      path.setAttribute('stroke', color);
      chartArea.appendChild(path);
      
      // Draw pen pivot on the right side
      const lastValue = data[data.length - 1].value;
      const normalizedValue = (lastValue - minValue) / valueRange;
      const penY = trackY + trackHeight - (normalizedValue * trackHeight * 0.8) - (trackHeight * 0.1);
      const penX = margin.left + width + 10;
      
      // Pen arm (horizontal line from chart to pivot point)
      const penArm = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      penArm.setAttribute('x1', margin.left + width);
      penArm.setAttribute('y1', penY);
      penArm.setAttribute('x2', penX + 40);
      penArm.setAttribute('y2', trackCenter);
      penArm.setAttribute('stroke', color);
      penArm.setAttribute('stroke-width', '1.5');
      pensArea.appendChild(penArm);
      
      // Pen tip (circle at the chart end)
      const penTip = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      penTip.setAttribute('cx', margin.left + width);
      penTip.setAttribute('cy', penY);
      penTip.setAttribute('r', '3');
      penTip.setAttribute('fill', color);
      penTip.setAttribute('stroke', '#3e2723');
      penTip.setAttribute('stroke-width', '0.5');
      pensArea.appendChild(penTip);
      
      // Pivot point (larger circle on the right)
      const pivot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      pivot.setAttribute('cx', penX + 40);
      pivot.setAttribute('cy', trackCenter);
      pivot.setAttribute('r', '5');
      pivot.setAttribute('fill', '#6d5d4b');
      pivot.setAttribute('stroke', '#3e2723');
      pivot.setAttribute('stroke-width', '1');
      pensArea.appendChild(pivot);
      
      // Entity label
      if (this._hass) {
        const entity = this._hass.states[entityId];
        if (entity) {
          const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          label.setAttribute('x', penX + 50);
          label.setAttribute('y', trackCenter);
          label.setAttribute('class', 'entity-label');
          label.setAttribute('dominant-baseline', 'middle');
          label.setAttribute('fill', color);
          
          const name = entity.attributes.friendly_name || entityId.split('.')[1];
          const unit = entity.attributes.unit_of_measurement || '';
          label.textContent = `${name}: ${lastValue.toFixed(1)}${unit}`;
          
          pensArea.appendChild(label);
        }
      }
    });
  }

  static getConfigElement() {
    return document.createElement("foundry-chart-card-editor");
  }

  static getStubConfig() {
    return {
      type: "custom:foundry-chart-card",
      entity: "",
      title: "Chart Recorder",
      chart_height: 300,
      time_range: 2
    };
  }
}

customElements.define('foundry-chart-card', FoundryChartCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "foundry-chart-card",
  name: "Foundry Chart Card",
  description: "A vintage polygraph-style chart recorder for up to 4 entities",
  preview: true
});
