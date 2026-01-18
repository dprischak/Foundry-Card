
class FoundryThermostatEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  setConfig(config) {
    // Ensure segments is an array
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
        .card-config { display: flex; flex-direction: column; gap: 16px; }
        
        /* Segment Styles */
        .segments-section {
          margin: 8px 0;
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
      `;
      this.shadowRoot.appendChild(style);
      this.shadowRoot.appendChild(this._root);

      // Form 1: Entity & Range
      this._form1 = document.createElement("ha-form");
      this._form1.addEventListener("value-changed", this._handleFormChanged.bind(this));
      this._root.appendChild(this._form1);

      // Segments UI
      this._segmentsContainer = document.createElement("div");
      this._segmentsContainer.className = "segments-section";
      this._root.appendChild(this._segmentsContainer);

      // Form 2: Appearance
      this._form2 = document.createElement("ha-form");
      this._form2.addEventListener("value-changed", this._handleFormChanged.bind(this));
      this._root.appendChild(this._form2);
    }

    if (this._form1) this._form1.hass = this._hass;
    if (this._form2) this._form2.hass = this._hass;

    // Schema 1
    this._form1.schema = [
      { name: "entity", selector: { entity: { domain: "sensor" } } },
      { name: "title", selector: { text: {} } },
      { name: "unit", selector: { text: {} } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "min", selector: { number: { mode: "box" } } },
          { name: "max", selector: { number: { mode: "box" } } },
          { name: "segments_under_mercury", label: "Segments Behind Liquid", default: true, selector: { boolean: {} } },
          {
            name: "mercury_width",
            label: "Mercury Width (%)",
            default: 50,
            selector: { number: { min: 5, max: 100, mode: "slider" } }
          },
          {
            name: "animation_duration",
            label: "Animation Duration (s)",
            default: 1.5,
            selector: { number: { min: 0.1, max: 10, step: 0.1, mode: "box" } }
          }
        ]
      }
    ];
    this._form1.data = this._config;
    this._form1.computeLabel = (s) => s.label || s.name;

    // Render Segments
    this._renderSegments();

    // Schema 2
    this._form2.schema = [
      {
        name: "ring_style",
        label: "Casing Style",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "brass", label: "Brass" },
              { value: "silver", label: "Silver" },
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
      { name: "liquid_color", label: "Mercury Color", selector: { color_rgb: {} } },
      { name: "tap_action", selector: { "ui-action": {} } }
    ];
    this._form2.data = this._config;
    this._form2.computeLabel = (s) => s.label || s.name;
  }

  _renderSegments() {
    if (!this._segmentsContainer) return;
    const segments = this._config.segments || [];

    let html = `<div class="section-header">Color Ranges (Right Side)</div>`;

    if (segments.length === 0) {
      html += `<div style="font-style: italic; color: var(--secondary-text-color); margin-bottom: 12px;">No segments defined.</div>`;
    }

    segments.forEach((seg, index) => {
      const fromVal = seg.from !== undefined ? seg.from : 0;
      const toVal = seg.to !== undefined ? seg.to : 0;
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
          <button class="remove-btn" data-idx="${index}" title="Remove">❌</button>
        </div>
      `;
    });

    html += `<button id="add-btn" class="add-btn">+ Add Color Range</button>`;
    this._segmentsContainer.innerHTML = html;

    // Listeners for inputs
    this._segmentsContainer.querySelectorAll('.seg-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const idx = parseInt(e.target.dataset.idx);
        const key = e.target.dataset.key;
        let val = e.target.value;
        if (key !== 'color') val = Number(val);
        this._updateSegment(idx, key, val);
      });
    });

    // Listeners for buttons
    this._segmentsContainer.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this._removeSegment(parseInt(e.target.dataset.idx)));
    });
    const addBtn = this._segmentsContainer.querySelector('#add-btn');
    if (addBtn) addBtn.addEventListener('click', () => this._addSegment());
  }

  _updateSegment(index, key, value) {
    const segments = [...(this._config.segments || [])];
    if (segments[index]) {
      segments[index] = { ...segments[index], [key]: value };
      this._updateConfig({ segments });
    }
  }

  _addSegment() {
    const segments = [...(this._config.segments || [])];
    const last = segments[segments.length - 1];
    const from = last ? last.to : (this._config.min || 0);
    const to = from + 10;
    segments.push({ from, to, color: "#4CAF50" });
    this._updateConfig({ segments });
  }

  _removeSegment(index) {
    const segments = [...(this._config.segments || [])];
    segments.splice(index, 1);
    this._updateConfig({ segments });
  }

  _updateConfig(updates) {
    this._config = { ...this._config, ...updates };
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: this._config }, bubbles: true, composed: true }));
  }

  _handleFormChanged(ev) {
    const newConfig = { ...this._config, ...ev.detail.value };
    if (JSON.stringify(this._config) !== JSON.stringify(newConfig)) {
      this._updateConfig(newConfig);
    }
  }
}

if (!customElements.get("foundry-thermostat-editor")) {
  customElements.define("foundry-thermostat-editor", FoundryThermostatEditor);
}

