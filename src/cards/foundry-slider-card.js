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

        .rim { display: flex; flex-direction: column; height: 100%; box-sizing: border-box; position: relative; }

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

        .slider-wrap { display:flex; align-items:center; justify-content:center; width:100%; height: 100%; box-sizing:border-box; flex: 1 1 auto; position: relative; }
        /* Vertical slider column: narrow overall area but the input will fill vertically */
        .slider-vertical { height: 100%; width: 64px; box-sizing:border-box; flex: 1 1 auto; min-height: 180px; display:flex; align-items:center; justify-content:center; padding: 6px 0; }
        .slider-horizontal { width: 100%; max-width: 100%; height: 48px; box-sizing:border-box; flex: 1 1 auto; }

        .value-display { flex: 0 0 auto; }
        .rivet { flex: 0 0 auto; }
        .value-rivet-wrap { display: flex; align-items: center; gap: 8px; flex: 0 0 auto; }

        input[type="range"] {
          -webkit-appearance: none;
          background: transparent;
        }

        /* Track */
        input[type="range"].vertical { writing-mode: bt-lr; width: 100%; height: 100%; transform: rotate(-90deg); }
        input[type="range"].horizontal { width: 100%; height: 36px; }

        /* Stylized inset track to match reference: rounded, slightly recessed with an inner dark channel */
        input[type="range"]::-webkit-slider-runnable-track {
          height: 18px;
          border-radius: 999px;
          background: linear-gradient(180deg, ${this.adjustColor(cfg.slider_color, 25)} 0%, ${cfg.slider_color} 50%, ${this.adjustColor(cfg.slider_color, -8)} 100%);
          box-shadow: inset 0 2px 6px rgba(0,0,0,0.45), inset 0 -6px 10px rgba(255,255,255,0.03);
          border: 3px solid rgba(255,255,255,0.06);
        }
        input[type="range"]::-moz-range-track {
          height: 18px;
          border-radius: 999px;
          background: linear-gradient(180deg, ${this.adjustColor(cfg.slider_color, 25)} 0%, ${cfg.slider_color} 50%, ${this.adjustColor(cfg.slider_color, -8)} 100%);
          box-shadow: inset 0 2px 6px rgba(0,0,0,0.45), inset 0 -6px 10px rgba(255,255,255,0.03);
          border: 3px solid rgba(255,255,255,0.06);
        }

        /* Thumb: square-ish rounded metallic knob */
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 48px; height: 48px; border-radius: 10px;
          background: linear-gradient(180deg, ${this.adjustColor(cfg.knob_color, 40)} 0%, ${cfg.knob_color} 50%, ${this.adjustColor(cfg.knob_color, -15)} 100%);
          border: 3px solid ${this.adjustColor(cfg.knob_color, -30)};
          box-shadow: 0 6px 16px rgba(0,0,0,0.45), inset 0 6px 10px rgba(255,255,255,0.12), inset 0 -6px 8px rgba(0,0,0,0.25);
          margin-top: 0; /* handled by track height */
        }
        input[type="range"]::-moz-range-thumb {
          width: 48px; height: 48px; border-radius: 10px;
          background: linear-gradient(180deg, ${this.adjustColor(cfg.knob_color, 40)} 0%, ${cfg.knob_color} 50%, ${this.adjustColor(cfg.knob_color, -15)} 100%);
          border: 3px solid ${this.adjustColor(cfg.knob_color, -30)};
          box-shadow: 0 6px 16px rgba(0,0,0,0.45), inset 0 6px 10px rgba(255,255,255,0.12), inset 0 -6px 8px rgba(0,0,0,0.25);
        }

        .value-display {
          font-family: 'ds-digitalnormal', monospace; font-size: 28px; color: ${cfg.font_color}; background: ${cfg.font_bg_color}; padding: 6px 10px; border-radius:6px; box-shadow: inset 0 -2px 0 rgba(0,0,0,0.08);
        }
        .value-display.absolute { position: absolute; z-index: 20; }
        .value-display.above { top: 6px; left: 50%; transform: translateX(-50%); }
        .value-display.below { bottom: 6px; left: 50%; transform: translateX(-50%); }
        .value-display.left { left: 6px; top: 50%; transform: translateY(-50%); }
        .value-display.right { right: 6px; top: 50%; transform: translateY(-50%); }

        /* Tick marks area */
        .ticks { position: absolute; pointer-events: none; z-index: 5; }
        .ticks.vertical { right: -36px; top: 12px; bottom: 12px; width: 32px; background-image: repeating-linear-gradient(to bottom, rgba(0,0,0,0.22) 0 1px, transparent 1px 22px); background-repeat: repeat-y; background-position: left center; background-size: 100% 22px; }
        .ticks.horizontal { left: 12px; right: 12px; bottom: -36px; height: 32px; background-image: repeating-linear-gradient(to right, rgba(0,0,0,0.22) 0 1px, transparent 1px 22px); background-repeat: repeat-x; background-position: center top; background-size: 22px 100%; }

        .rivet { width:8px; height:8px; background: ${cfg.rivet_color}; border-radius:50%; box-shadow: 0 1px 0 rgba(0,0,0,0.35); }
        .corner-rivet { position: absolute; width: 10px; height: 10px; background: ${cfg.rivet_color}; border-radius: 50%; box-shadow: 0 2px 3px rgba(0,0,0,0.5); pointer-events: none; z-index: 10; }
        .corner-rivet.top-left { top: -5px; left: -5px; }
        .corner-rivet.top-right { top: -5px; right: -5px; }
        .corner-rivet.bottom-left { bottom: -5px; left: -5px; }
        .corner-rivet.bottom-right { bottom: -5px; right: -5px; }
      </style>
      <ha-card tabindex="0">
        <div class="card" id="actionRoot">
          <div class="rim" style="background: ${this.getRimStyleCss(cfg.ring_style)}; padding:6px; border-radius:12px;">
            <div class="corner-rivet top-left"></div>
            <div class="corner-rivet top-right"></div>
            <div class="corner-rivet bottom-left"></div>
            <div class="corner-rivet bottom-right"></div>
            ${cfg.show_value ? `<div class="value-display absolute ${cfg.value_position}" id="valueDisplay">--</div>` : ''}
            <div class="plate">
              <div class="container ${isVertical ? 'vertical' : 'horizontal'}">
              <div class="slider-wrap">
                <div class="slider ${isVertical ? 'slider-vertical' : 'slider-horizontal'}">
                  <input id="slider" type="range" class="${isVertical ? 'vertical' : 'horizontal'}" min="${cfg.min}" max="${cfg.max}" step="${cfg.step}" value="${cfg.value}" />
                </div>
                <div class="ticks ${isVertical ? 'vertical' : 'horizontal'}"></div>
              </div>
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
