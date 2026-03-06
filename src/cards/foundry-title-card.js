import { loadThemes, applyTheme } from './themes.js';

class FoundryTitleCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    this.config = { ...config };

    const applyDefaultsAndRender = () => {
      // Defaults
      this.config.title =
        this.config.title !== undefined ? this.config.title : 'Title';
      this.config.title_font_size =
        this.config.title_font_size !== undefined
          ? this.config.title_font_size
          : 18;
      this.config.title_color = this.config.title_color || '#3e2723';
      this.config.plate_color = this.config.plate_color || '#f5f5f5';
      this.config.plate_transparent =
        this.config.plate_transparent !== undefined
          ? this.config.plate_transparent
          : false;
      this.config.rivet_color = this.config.rivet_color || '#6d5d4b';
      this.config.aged_texture =
        this.config.aged_texture !== undefined
          ? this.config.aged_texture
          : 'everywhere';
      this.config.aged_texture_intensity =
        this.config.aged_texture_intensity !== undefined
          ? this.config.aged_texture_intensity
          : 20;

      this._uniqueId =
        this._uniqueId || Math.random().toString(36).substr(2, 9);
      this.render();
    };

    // Theme handling
    if (this.config.theme && this.config.theme !== 'none') {
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

  set hass(_hass) {
    // No entity data needed for a title card
  }

  render() {
    const config = this.config;
    const title = config.title || '';
    const uid = this._uniqueId;
    const titleFontSize = config.title_font_size;
    const titleColor = config.title_color;
    const rivetColor = config.rivet_color;
    const plateColor = config.plate_color;
    const plateTransparent = config.plate_transparent;

    const agedTexture =
      config.aged_texture !== undefined ? config.aged_texture : 'everywhere';
    const agedTextureIntensity =
      config.aged_texture_intensity !== undefined
        ? config.aged_texture_intensity
        : 20;
    const agedTextureOpacity = ((100 - agedTextureIntensity) / 100) * 1.0;

    // When transparent, "everywhere" doesn't make sense — skip filter on plate
    const applyAgedToPlate = !plateTransparent && agedTexture === 'everywhere';

    const titleFontFamily = 'Georgia, serif';

    // Card dimensions — compact since it's title-only
    const plateWidth = 250;
    const plateHeight = 30;
    const plateX = 2;
    const plateY = 5;
    const viewBoxHeight = plateHeight + 10;
    const viewBoxWidth = 260;

    // Title vertical center of plate
    const titleY = plateY + plateHeight / 2 + titleFontSize * 0.35;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          height: 100%;
        }
        ha-card {
          container-type: inline-size;
          background: transparent;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .card {
          position: relative;
          cursor: default;
          width: 100%;
        }
        .container {
          position: relative;
          width: 100%;
          height: 100%;
          max-width: 520px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .vector-svg {
          width: 100%;
          height: 100%;
          max-height: 100%;
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
      <ha-card role="img" aria-label="${title}" tabindex="0">
        <div class="card">
          <div class="container" role="presentation">
            <svg class="vector-svg" viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}" xmlns="http://www.w3.org/2000/svg">
              <defs>
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
              </defs>

              <!-- Plate -->
              <rect x="${plateX}" y="${plateY}" width="${plateWidth}" height="${plateHeight}" rx="14" ry="14"
                    fill="${plateTransparent ? 'none' : plateColor}"
                    filter="${applyAgedToPlate ? `url(#aged-${uid}) drop-shadow(1px 1px 2px rgba(0,0,0,0.3))` : 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))'}"/>

              <!-- Rivets — top-left and top-right only -->
              ${this.renderRivets(plateWidth, plateX, plateY, plateHeight)}

              <!-- Title -->
              ${title ? `<text x="${viewBoxWidth / 2}" y="${titleY}" text-anchor="middle" font-size="${titleFontSize}" font-weight="bold" fill="${titleColor}" font-family="${titleFontFamily}" style="pointer-events: none;">${title}</text>` : ''}

            </svg>
          </div>
        </div>
      </ha-card>
    `;
  }

  renderRivets(plateWidth, plateX, plateY, plateHeight) {
    const offset = 13;
    const rivets = [
      { cx: plateX + offset, cy: plateY + plateHeight / 2 },
      { cx: plateX + plateWidth - offset, cy: plateY + plateHeight / 2 },
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

  static getConfigElement() {
    return document.createElement('foundry-title-editor');
  }
  getGridOptions() {
    return {
      columns: 12,
      rows: 1,
      min_rows: 1,
    };
  }
  static getStubConfig() {
    return {
      title: 'Title Card',
      title_font_size: 18,
      title_color: '#3e2723',
      plate_color: '#8c7626',
      rivet_color: '#6a5816',
      plate_transparent: false,
      aged_texture: 'everywhere',
      aged_texture_intensity: 20,
      theme: 'industrial',
      grid_options: {
        columns: 12,
        rows: 1,
      },
    };
  }
}

if (!customElements.get('foundry-title-card')) {
  customElements.define('foundry-title-card', FoundryTitleCard);
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'foundry-title-card',
  name: 'Foundry Title',
  preview: true,
  description: 'A decorative metallic title plate with two rivets.',
});
