class FoundryDigitalClockCardEditor extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    setConfig(config) {
        this._config = { ...config };
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
        .reset-btn {
          background-color: var(--secondary-text-color, #757575);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          font-size: 14px;
          margin-top: 12px;
          width: 100%;
        }
        .reset-btn:hover {
          background-color: var(--error-color, #db4437);
        }
      `;
            this.shadowRoot.appendChild(style);
            this.shadowRoot.appendChild(this._root);

            this._form1 = document.createElement("ha-form");
            this._form1.addEventListener("value-changed", this._handleFormChanged.bind(this));
            this._root.appendChild(this._form1);

            this._form2 = document.createElement("ha-form");
            this._form2.addEventListener("value-changed", this._handleFormChanged.bind(this));
            this._root.appendChild(this._form2);
        }

        if (this._form1) this._form1.hass = this._hass;
        if (this._form2) this._form2.hass = this._hass;

        const formData = this._configToForm(this._config);

        this._form1.schema = this._getSchemaTop(formData);
        this._form1.data = formData;
        this._form1.computeLabel = this._computeLabel;

        this._form2.schema = this._getSchemaBottom(formData);
        this._form2.data = formData;
        this._form2.computeLabel = this._computeLabel;
    }

    _handleFormChanged(ev) {
        const newConfig = this._formToConfig(ev.detail.value);
        if (JSON.stringify(this._config) !== JSON.stringify(newConfig)) {
            this._config = newConfig;
            this.dispatchEvent(new CustomEvent("config-changed", {
                detail: { config: this._config },
                bubbles: true,
                composed: true,
            }));
        }
    }

    _configToForm(config) {
        const data = { ...config };
        data.appearance = {
            ring_style: config.ring_style,
            font_bg_color: this._hexToRgb(config.font_bg_color ?? "#222222") ?? [34, 34, 34],
        };
        data.fonts = {
            time_font_family: config.time_font_family ?? "ds-digitalnormal, monospace",
            title_font_family: config.title_font_family ?? "Georgia, serif"
        };
        return data;
    }

    _formToConfig(formData) {
        const config = { ...this._config };
        Object.keys(formData).forEach(key => {
            if (['appearance', 'fonts'].includes(key)) return;
            config[key] = formData[key];
        });

        if (formData.appearance) {
            Object.assign(config, formData.appearance);
            config.font_bg_color = this._rgbToHex(config.font_bg_color);
        }
        if (formData.fonts) Object.assign(config, formData.fonts);

        return config;
    }

    _getSchemaTop(formData) {
        return [
            { name: "entity", selector: { entity: {} } },
            { name: "title", selector: { text: {} } },
            {
                name: "time_zone",
                label: "Time Zone",
                selector: {
                    select: {
                        mode: "dropdown",
                        options: [
                            { value: "", label: "Local Time" },
                            { value: "Etc/UTC", label: "UTC" },
                            { value: "America/New_York", label: "New York" },
                            { value: "Europe/London", label: "London" }
                        ]
                    }
                }
            }
        ];
    }

    _getSchemaBottom(formData) {
        return [
            {
                name: "appearance",
                type: "expandable",
                title: "Appearance",
                schema: [
                    {
                        name: "ring_style",
                        label: "Ring Style",
                        selector: {
                            select: {
                                mode: "dropdown",
                                options: [
                                    { value: "brass", label: "Brass" },
                                    { value: "silver", label: "Silver" },
                                    { value: "black", label: "Black" },
                                    { value: "white", label: "White" }
                                ]
                            }
                        }
                    },
                    { name: "font_bg_color", label: "Background Color", selector: { color_rgb: {} } },
                ]
            },
            {
                name: "fonts",
                type: "expandable",
                title: "Fonts",
                schema: [
                    { name: "time_font_family", label: "Time Font Family", selector: { text: {} } },
                    { name: "title_font_family", label: "Title Font Family", selector: { text: {} } }
                ]
            }
        ];
    }

    _hexToRgb(hex) {
        if (typeof hex !== "string") return null;
        const h = hex.replace("#", "").trim();
        if (h.length !== 6) return null;
        const r = parseInt(h.slice(0, 2), 16);
        const g = parseInt(h.slice(2, 4), 16);
        const b = parseInt(h.slice(4, 6), 16);
        if ([r, g, b].some(Number.isNaN)) return null;
        return [r, g, b];
    }

    _rgbToHex(input) {
        let rgb = input;
        if (rgb && typeof rgb === "object" && !Array.isArray(rgb)) {
            if (Array.isArray(rgb.color)) rgb = rgb.color;
            else if ("r" in rgb && "g" in rgb && "b" in rgb) rgb = [rgb.r, rgb.g, rgb.b];
        }
        if (!Array.isArray(rgb) || rgb.length !== 3) return null;
        const [r, g, b] = rgb.map((n) => Math.max(0, Math.min(255, Math.round(Number(n)))));
        const toHex = (n) => n.toString(16).padStart(2, "0");
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    _computeLabel(schema) {
        if (schema.label) return schema.label;
        return schema.name;
    }
}

if (!customElements.get('foundry-digital-clock-editor')) {
    customElements.define('foundry-digital-clock-editor', FoundryDigitalClockCardEditor);
}

