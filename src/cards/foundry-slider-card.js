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
        :host { display:block; padding:0; box-sizing: border-box; height: 100%; }
        ha-card { overflow: visible; display: block; box-sizing: border-box; height: 100%; }
        .card { cursor: pointer; padding: 8px; box-sizing: border-box; width:100%; height:100%; display: flex; flex-direction: column; }
        .container { display: flex; align-items: center; justify-content: center; gap: 8px; height: 100%; }
        .vertical { flex-direction: row; }
        .horizontal { flex-direction: column; }

        .rim { display: flex; flex-direction: column; height: 100%; box-sizing: border-box; }

        .plate {
          background: ${cfg.plate_transparent ? 'transparent' : cfg.plate_color};
          padding: 8px;
          border-radius: 10px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          width: 100%;
          height: 100%;
          flex: 1;
        }

        .slider-wrap { display:flex; align-items:center; justify-content:center; width:100%; height: 100%; box-sizing:border-box; flex: 1 1 auto; }
        .slider-vertical { height: 100%; width: 48px; box-sizing:border-box; flex: 1 1 auto; }
        .slider-horizontal { width: 100%; max-width: 100%; height: 48px; box-sizing:border-box; flex: 1 1 auto; }

        .value-display { flex: 0 0 auto; }
        .rivet { flex: 0 0 auto; }
        .value-rivet-wrap { display: flex; align-items: center; gap: 8px; flex: 0 0 auto; }

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
          <div class="rim" style="background: ${this.getRimStyleCss(cfg.ring_style)}; padding:6px; border-radius:12px;">
            <div class="plate">
              <div class="container ${isVertical ? 'vertical' : 'horizontal'}">
              ${cfg.value_position === 'left' && cfg.show_value ? `<div class="value-display" id="valueDisplay">--</div>` : ''}
              <div class="slider-wrap">
                <div class="rivet" style="margin-right:8px"></div>
                <div class="slider ${isVertical ? 'slider-vertical' : 'slider-horizontal'}">
                  <input id="slider" type="range" class="${isVertical ? 'vertical' : 'horizontal'}" min="${cfg.min}" max="${cfg.max}" step="${cfg.step}" value="${cfg.value}" />
                </div>
              </div>
              ${cfg.value_position === 'right' && cfg.show_value ? `
              <div class="value-rivet-wrap">
                <div class="value-display" id="valueDisplay">--</div>
                <div class="rivet"></div>
              </div>` : ''}
            </div>
            ${cfg.value_position === 'above' && cfg.show_value ? `<div style="display:flex;justify-content:center;margin-top:6px"><div class="value-display" id="valueDisplayA">--</div></div>` : ''}
            ${cfg.value_position === 'below' && cfg.show_value ? `<div style="display:flex;justify-content:center;margin-top:6px"><div class="value-display" id="valueDisplayB">--</div></div>` : ''}
              </div>
            </div>
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

  getRimStyleCss(ringStyle) {
    switch (ringStyle) {
      case 'brass':
        return 'linear-gradient(135deg,#c9a961 0%,#ddc68f 25%,#b8944d 50%,#d4b877 75%,#a68038 100%)';
      case 'silver':
      case 'chrome':
        return 'linear-gradient(135deg,#e8e8e8 0%,#ffffff 25%,#c0c0c0 50%,#e0e0e0 75%,#b0b0b0 100%)';
      case 'white':
        return 'linear-gradient(135deg,#f6f6f6 0%,#ffffff 100%)';
      case 'black':
        return 'linear-gradient(135deg,#3a3a3a 0%,#141414 100%)';
      case 'copper':
        return 'linear-gradient(135deg,#c77c43 0%,#e1a06a 25%,#9a5c2a 50%,#d7925a 75%,#7b461f 100%)';
      case 'blue':
        return 'linear-gradient(135deg,#2a6fdb 0%,#5ea2ff 25%,#1f4f9e 50%,#4f8fe6 75%,#163b76 100%)';
      case 'green':
        return 'linear-gradient(135deg,#2fbf71 0%,#6fe0a6 25%,#1f7a49 50%,#53cf8e 75%,#165a36 100%)';
      case 'red':
        return 'linear-gradient(135deg,#e53935 0%,#ff6f6c 25%,#9e1f1c 50%,#e85a57 75%,#6f1513 100%)';
      default:
        return 'linear-gradient(135deg,#c9a961 0%,#ddc68f 25%,#b8944d 50%,#d4b877 75%,#a68038 100%)';
    }
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
