
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
    this._historicalDataLoaded = false;
    this._isLoadingHistory = false;
    
    // Pen animation tracking
    this._penPositions = {}; // Store current pen positions for smooth transitions
    this._penAnimations = {}; // Store active animations
    
    this._boundHandleClick = () => this._handleAction("tap");
    this._boundHandleDblClick = () => this._handleAction("double_tap");
    this._boundHandleContextMenu = (e) => {
      e.preventDefault();
      this._handleAction("hold");
    };
    this._boundHandleKeyDown = (e) => this._handleKeyDown(e);
  }

  connectedCallback() {
    // Load historical data and start periodic data collection
    if (this._hass && this.config) {
      this._loadHistoricalData().then(() => {
        this._startDataCollection();
      });
    }
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

  async _loadHistoricalData() {
    if (!this._hass || !this.config || this._isLoadingHistory) return;
    
    this._isLoadingHistory = true;
    this._historicalDataLoaded = false;
    
    const entities = this._getEntityList();
    const hoursBack = this.config.hours_to_show !== undefined ? this.config.hours_to_show : 1;
    
    // Calculate start time
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - (hoursBack * 60 * 60 * 1000));
    
    console.log(`Loading ${hoursBack} hours of history for`, entities);
    
    try {
      // Fetch history for all entities in one call
      const entityIds = entities.filter(e => e);
      
      if (entityIds.length === 0) {
        this._isLoadingHistory = false;
        return;
      }
      
      const history = await this._hass.callWS({
        type: 'history/history_during_period',
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        entity_ids: entityIds,
        minimal_response: true,
        significant_changes_only: false
      });
      
      console.log('History loaded:', history);
      
      if (history && Array.isArray(history)) {
        entityIds.forEach((entityId, index) => {
          if (history[index] && Array.isArray(history[index])) {
            const dataPoints = history[index]
              .map(item => ({
                timestamp: new Date(item.last_changed).getTime(),
                value: parseFloat(item.state)
              }))
              .filter(point => !isNaN(point.value));
            
            console.log(`Entity ${entityId}: ${dataPoints.length} data points`);
            
            // Sample data points to fit _maxDataPoints
            if (dataPoints.length > this._maxDataPoints) {
              const step = Math.ceil(dataPoints.length / this._maxDataPoints);
              this._historicalData[entityId] = dataPoints.filter((_, i) => i % step === 0).slice(-this._maxDataPoints);
            } else {
              this._historicalData[entityId] = dataPoints;
            }
          }
        });
      }
      
      this._historicalDataLoaded = true;
      this._drawChart();
    } catch (error) {
      console.error('Error loading historical data:', error);
    } finally {
      this._isLoadingHistory = false;
    }
  }

  _collectDataPoint() {
    if (!this._hass || !this.config) return;
    
    const entities = this._getEntityList();
    const timestamp = Date.now();
    const hoursBack = this.config.hours_to_show !== undefined ? this.config.hours_to_show : 1;
    const cutoffTime = timestamp - (hoursBack * 60 * 60 * 1000);
    
    entities.forEach(entityId => {
      if (!entityId) return;
      
      const entity = this._hass.states[entityId];
      if (!entity) return;
      
      const value = parseFloat(entity.state);
      if (isNaN(value)) return;
      
      if (!this._historicalData[entityId]) {
        this._historicalData[entityId] = [];
      }
      
      // Add new data point
      this._historicalData[entityId].push({ timestamp, value });
      
      // Remove old data points that are outside the time range
      this._historicalData[entityId] = this._historicalData[entityId].filter(
        point => point.timestamp >= cutoffTime
      );
      
      // Also enforce max data points limit
      if (this._historicalData[entityId].length > this._maxDataPoints * 2) {
        // Sample down to _maxDataPoints
        const step = Math.floor(this._historicalData[entityId].length / this._maxDataPoints);
        this._historicalData[entityId] = this._historicalData[entityId].filter((_, index) => index % step === 0);
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
    this._historicalDataLoaded = false;
    
    this.render();
    if (this._hass) {
      requestAnimationFrame(() => {
        this._loadHistoricalData().then(() => {
          if (!this._updateInterval) {
            this._startDataCollection();
          }
        });
      });
    }
  }

  _validateConfig() {
    const config = this.config;

    // Validate hours to show
    if (config.hours_to_show !== undefined) {
      const hours = parseFloat(config.hours_to_show);
      if (isNaN(hours) || hours <= 0) {
        console.warn('Foundry Chart Card: hours_to_show must be positive. Using 1 hour.');
        this.config.hours_to_show = 1;
      } else {
        this.config.hours_to_show = Math.min(hours, 24); // Cap at 24 hours
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

    // Validate pen thickness
    if (config.pen_thickness !== undefined) {
      const thickness = parseFloat(config.pen_thickness);
      if (isNaN(thickness) || thickness <= 0) {
        console.warn('Foundry Chart Card: pen_thickness must be positive. Using 1.5.');
        this.config.pen_thickness = 1.5;
      } else {
        this.config.pen_thickness = Math.min(Math.max(thickness, 0.5), 5); // Cap between 0.5 and 5
      }
    }

    // Validate transition time
    if (config.transition_time !== undefined) {
      const transitionTime = parseFloat(config.transition_time);
      if (isNaN(transitionTime) || transitionTime < 0) {
        console.warn('Foundry Chart Card: transition_time must be non-negative. Using 0.5.');
        this.config.transition_time = 0.5;
      } else {
        this.config.transition_time = Math.min(transitionTime, 5); // Cap at 5 seconds
      }
    }
  }

  set hass(hass) {
    const firstRun = !this._hass;
    this._hass = hass;
    if (!this.config) return;
    if (!this.shadowRoot) return;
    
    // Load historical data on first run
    if (firstRun && !this._historicalDataLoaded && !this._isLoadingHistory) {
      this._loadHistoricalData().then(() => {
        if (!this._updateInterval) {
          this._startDataCollection();
        }
      });
    } else {
      // Update chart with new values
      this._drawChart();
    }
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
          stroke-linecap: round;
          stroke-linejoin: round;
        }
        .pen-pivot {
          transform-origin: center;
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

  _animatePen(entityId, penArmId, penTipId, startY, endY, duration) {
    // Cancel any existing animation for this entity
    if (this._penAnimations[entityId]) {
      cancelAnimationFrame(this._penAnimations[entityId]);
    }
    
    const startTime = performance.now();
    const durationMs = duration * 1000;
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      
      // Ease-out function for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentY = startY + (endY - startY) * easeOut;
      
      // Update pen elements
      const penArm = this.shadowRoot?.getElementById(penArmId);
      const penTip = this.shadowRoot?.getElementById(penTipId);
      
      if (penArm) {
        penArm.setAttribute('y1', currentY);
      }
      if (penTip) {
        penTip.setAttribute('cy', currentY);
      }
      
      // Continue animation or finish
      if (progress < 1) {
        this._penAnimations[entityId] = requestAnimationFrame(animate);
      } else {
        this._penPositions[entityId] = endY;
        delete this._penAnimations[entityId];
      }
    };
    
    this._penAnimations[entityId] = requestAnimationFrame(animate);
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
      const penThickness = this.config.pen_thickness !== undefined ? this.config.pen_thickness : 1.5;
      
      // Calculate min/max for this entity
      const values = data.map(d => d.value);
      const minValue = Math.min(...values);
      const maxValue = Math.max(...values);
      const valueRange = maxValue - minValue || 1;
      
      // Calculate time range for horizontal positioning
      const timestamps = data.map(d => d.timestamp);
      const oldestTime = Math.min(...timestamps);
      const newestTime = Math.max(...timestamps);
      const timeRange = newestTime - oldestTime || 1;
      
      // Create path for the chart line - newest data on the right
      const pathData = data.map((point, i) => {
        // Position based on time, with newest point at the right edge
        const timeOffset = newestTime - point.timestamp;
        const x = margin.left + width - (timeOffset / timeRange * width);
        
        // Map value to track height (inverted because SVG y increases downward)
        const normalizedValue = (point.value - minValue) / valueRange;
        const y = trackY + trackHeight - (normalizedValue * trackHeight * 0.8) - (trackHeight * 0.1);
        
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      }).join(' ');
      
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathData);
      path.setAttribute('class', 'chart-line');
      path.setAttribute('stroke', color);
      path.setAttribute('stroke-width', penThickness);
      chartArea.appendChild(path);
      
      // Draw pen pivot on the right side - pen follows the newest data point
      const lastValue = data[data.length - 1].value;
      const normalizedValue = (lastValue - minValue) / valueRange;
      const targetPenY = trackY + trackHeight - (normalizedValue * trackHeight * 0.8) - (trackHeight * 0.1);
      const penX = margin.left + width + 10;
      
      // Get transition time from config (default 0.5 seconds)
      const transitionTime = this.config.transition_time !== undefined ? this.config.transition_time : 0.5;
      
      // Initialize pen position if not exists
      if (!this._penPositions[entityId]) {
        this._penPositions[entityId] = targetPenY;
      }
      
      // Create pen elements with IDs for animation
      const penArmId = `pen-arm-${entityId}`;
      const penTipId = `pen-tip-${entityId}`;
      
      // Pen arm connects from the newest data point (right edge) to pivot point
      const penArm = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      penArm.setAttribute('id', penArmId);
      penArm.setAttribute('class', 'pen-arm');
      penArm.setAttribute('x1', margin.left + width);
      penArm.setAttribute('y1', this._penPositions[entityId]);
      penArm.setAttribute('x2', penX + 40);
      penArm.setAttribute('y2', trackCenter);
      penArm.setAttribute('stroke', color);
      penArm.setAttribute('stroke-width', penThickness);
      pensArea.appendChild(penArm);
      
      // Pen tip (circle at the chart end) - scale radius based on thickness
      const penTip = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      penTip.setAttribute('id', penTipId);
      penTip.setAttribute('class', 'pen-tip');
      penTip.setAttribute('cx', margin.left + width);
      penTip.setAttribute('cy', this._penPositions[entityId]);
      penTip.setAttribute('r', Math.max(2, penThickness * 1.5));
      penTip.setAttribute('fill', color);
      penTip.setAttribute('stroke', '#3e2723');
      penTip.setAttribute('stroke-width', '0.5');
      pensArea.appendChild(penTip);
      
      // Animate pen to new position if it changed
      if (Math.abs(this._penPositions[entityId] - targetPenY) > 0.1 && transitionTime > 0) {
        this._animatePen(entityId, penArmId, penTipId, this._penPositions[entityId], targetPenY, transitionTime);
      } else {
        this._penPositions[entityId] = targetPenY;
      }
      
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
      hours_to_show: 1,
      pen_thickness: 1.5
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
