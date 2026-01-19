import { fireEvent, getActionConfig } from "./utils.js";
import { ensureLedFont } from "./fonts.js";

class FoundrySliderCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._uniqueId = Math.random().toString(36).substr(2, 9);
  }

  setConfig(config) {
    this.config = { ...config };
    // Defaults
    this.config.min = this.config.min !== undefined ? this.config.min : 0;
    this.config.max = this.config.max !== undefined ? this.config.max : 100;
    this.config.step = this.config.step !== undefined ? this.config.step : 1;
    this.config.value = this.config.value !== undefined ? this.config.value : this.config.min;
    this.config.orientation = this.config.orientation || "horizontal"; // or 'vertical'
    this.config.value_position = this.config.value_position || "above"; // above, below, left, right
    this.config.ring_style = this.config.ring_style || "brass";
    this.config.plate_color = this.config.plate_color || "#f5f5f5";
    this.config.plate_transparent = this.config.plate_transparent !== undefined ? this.config.plate_transparent : false;
    this.config.rivet_color = this.config.rivet_color || "#6d5d4b";
    this.config.slider_color = this.config.slider_color || "#444444";
    this.config.knob_color = this.config.knob_color || "#c9a961";
    this.config.font_color = this.config.font_color || "#000000";
    this.config.font_bg_color = this.config.font_bg_color || "#ffffff";
    this.config.show_value = this.config.show_value !== undefined ? this.config.show_value : true;

    ensureLedFont();
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
  }

  render() {
    const cfg = this.config;
    const uid = this._uniqueId;
    const orientation = cfg.orientation === "horizontal" ? "horizontal" : "vertical";
    const isVertical = orientation === "vertical";

    this.shadowRoot.innerHTML = `
      <style>
        :host { display:block; padding:0; box-sizing: border-box; }
        ha-card { overflow: visible; display: block; box-sizing: border-box; }
        .card { cursor: pointer; padding: 8px; box-sizing: border-box; width:100%; height:100%; }
        .container { display: flex; align-items: center; justify-content: center; gap: 8px; }
        .vertical { flex-direction: row; }
        .horizontal { flex-direction: column; }

        .plate {
          background: ${cfg.plate_transparent ? 'transparent' : cfg.plate_color};
          padding: 8px;
          border-radius: 10px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.25);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          width: 100%;
          height: 100%;
        }

        .slider-wrap { display:flex; align-items:center; justify-content:center; width:100%; box-sizing:border-box; flex: 1 1 auto; }
        .slider-vertical { height: 100%; max-height: 320px; width: 48px; box-sizing:border-box; flex: 0 0 auto; }
        .slider-horizontal { width: 100%; max-width: 100%; height: 48px; box-sizing:border-box; flex: 1 1 auto; }

        .value-display { flex: 0 0 auto; }
        .rivet { flex: 0 0 auto; }

        input[type="range"] {
          -webkit-appearance: none;
          background: transparent;
        }

        /* Track */
        input[type="range"].vertical { writing-mode: bt-lr; width: 100%; height: 36px; transform: rotate(-90deg); }
        input[type="range"].horizontal { width: 100%; height: 36px; }

        input[type="range"]::-webkit-slider-runnable-track {
          height: 12px;
          background: linear-gradient(90deg, ${this.adjustColor(cfg.slider_color, 30)}, ${cfg.slider_color});
          border-radius: 8px;
        }
        input[type="range"]::-moz-range-track {
          height: 12px;
          background: linear-gradient(90deg, ${this.adjustColor(cfg.slider_color, 30)}, ${cfg.slider_color});
          border-radius: 8px;
        }

        /* Thumb */
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 32px; height: 32px; border-radius: 50%;
          background: ${cfg.knob_color}; border: 2px solid ${this.adjustColor(cfg.knob_color, -20)}; box-shadow: 0 2px 2px rgba(0,0,0,0.4);
          margin-top: -10px;
        }
        input[type="range"]::-moz-range-thumb {
          width: 32px; height: 32px; border-radius: 50%;
          background: ${cfg.knob_color}; border: 2px solid ${this.adjustColor(cfg.knob_color, -20)}; box-shadow: 0 2px 2px rgba(0,0,0,0.4);
        }

        .value-display {
          font-family: 'ds-digitalnormal', monospace; font-size: 28px; color: ${cfg.font_color}; background: ${cfg.font_bg_color}; padding: 6px 10px; border-radius:6px; box-shadow: inset 0 -2px 0 rgba(0,0,0,0.08);
        }

        .rivet { width:8px; height:8px; background: ${cfg.rivet_color}; border-radius:50%; box-shadow: 0 1px 0 rgba(0,0,0,0.35); }
      </style>
      <ha-card tabindex="0">
        <div class="card" id="actionRoot">
          <div class="plate">
            <div class="container ${isVertical ? 'vertical' : 'horizontal'}">
              ${cfg.value_position === 'left' && cfg.show_value ? `<div class="value-display" id="valueDisplay">--</div>` : ''}
              <div class="slider-wrap">
                <div class="rivet" style="margin-right:8px"></div>
                <div class="slider ${isVertical ? 'slider-vertical' : 'slider-horizontal'}">
                  <input id="slider" type="range" class="${isVertical ? 'vertical' : 'horizontal'}" min="${cfg.min}" max="${cfg.max}" step="${cfg.step}" value="${cfg.value}" />
                </div>
                <div class="rivet" style="margin-left:8px"></div>
              </div>
              ${cfg.value_position === 'right' && cfg.show_value ? `<div class="value-display" id="valueDisplay">--</div>` : ''}
            </div>
            ${cfg.value_position === 'above' && cfg.show_value ? `<div style="display:flex;justify-content:center;margin-top:6px"><div class="value-display" id="valueDisplayA">--</div></div>` : ''}
            ${cfg.value_position === 'below' && cfg.show_value ? `<div style="display:flex;justify-content:center;margin-top:6px"><div class="value-display" id="valueDisplayB">--</div></div>` : ''}
          </div>
        </div>
      </ha-card>
    `;

    this._attachListeners();
    // Ensure displayed values are formatted (zero-padded with negative placeholder)
    this._updateValueDisplays(this.config.value);
  }

  _attachListeners() {
    const slider = this.shadowRoot.getElementById('slider');
    if (!slider) return;
    slider.oninput = (e) => this._onSliderInput(e);
    slider.onchange = (e) => this._onSliderChange(e);

    const root = this.shadowRoot.getElementById('actionRoot');
    if (root) root.onclick = () => this._handleAction('tap');
  }

  _onSliderInput(e) {
    const v = e.target.value;
    this._updateValueDisplays(v);
    // Live event
    fireEvent(this, 'foundry-slider-input', { value: Number(v) });
  }

  _onSliderChange(e) {
    const v = e.target.value;
    this.config.value = Number(v);
    this._updateValueDisplays(v);
    fireEvent(this, 'foundry-slider-change', { value: Number(v) });
  }

  _updateValueDisplays(v) {
    const formatted = this._formatValue(v);
    const ids = ['valueDisplay','valueDisplayA','valueDisplayB'];
    ids.forEach(id => {
      const el = this.shadowRoot.getElementById(id);
      if (el) el.textContent = formatted;
    });
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
    const allowSign = (Number(cfg.min) < 0) || (Number(cfg.max) < 0);
    const sign = allowSign ? (num < 0 ? '-' : ' ') : '';
    const abs = Math.abs(num);

    const maxAbs = Math.max(Math.abs(min), Math.abs(max), 0);
    const intDigits = Math.max(String(Math.floor(maxAbs)).length, 1);

    const fixed = decimalPlaces > 0 ? abs.toFixed(decimalPlaces) : String(Math.floor(abs));
    const parts = String(fixed).split('.');
    const intPart = parts[0].padStart(intDigits, '0');
    const fracPart = parts[1] ? '.' + parts[1] : '';
    return `${sign}${intPart}${fracPart}`;
  }

  _handleAction(kind) {
    if (!this.config) return;
    const act = getActionConfig(this.config, 'tap_action', { action: 'none' });
    if (!act || act.action === 'none') return;
    if (act.action === 'more-info' && this.config.entity) {
      fireEvent(this, 'hass-more-info', { entityId: this.config.entity });
    }
  }

  // Helper color routines (copied lightweight versions)
  adjustColor(color, percent) {
    if (!color) return color;
    if (color.startsWith('#')) {
      let num = parseInt(color.replace('#',''),16), amt = Math.round(2.55 * percent);
      let R = (num >> 16) + amt;
      let G = (num >> 8 & 0x00FF) + amt;
      let B = (num & 0x0000FF) + amt;
      R = Math.max(0, Math.min(255, R));
      G = Math.max(0, Math.min(255, G));
      B = Math.max(0, Math.min(255, B));
      return '#'+(R.toString(16).padStart(2,'0'))+(G.toString(16).padStart(2,'0'))+(B.toString(16).padStart(2,'0'));
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
      orientation: 'horizontal',
      value_position: 'above',
      ring_style: 'brass',
      slider_color: '#444444',
      knob_color: '#c9a961',
      font_bg_color: '#ffffff',
      font_color: '#000000',
      plate_color: '#f5f5f5',
      rivet_color: '#6d5d4b',
      show_value: true
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
  description: 'An industrial-style slider with configurable orientation and value display.'
});
