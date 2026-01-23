
const fireEvent = (node, type, detail, options) => {
    options = options || {};
    detail = detail === null || detail === undefined ? {} : detail;
    const event = new Event(type, {
        bubbles: options.bubbles === undefined ? true : options.bubbles,
        cancelable: Boolean(options.cancelable),
        composed: options.composed === undefined ? true : options.composed,
    });
    event.detail = detail;
    node.dispatchEvent(event);
    return event;
};

class FoundryButtonEditor extends HTMLElement {
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
        this.render();
    }

    render() {
        if (!this._hass || !this._config) return;

        if (!this._root) {
            this._root = document.createElement("div");
            this._root.className = "card-config";
            const style = document.createElement("style");
            style.textContent = `
                .card-config { display: flex; flex-direction: column; gap: 16px; }
            `;
            this.shadowRoot.appendChild(style);
            this.shadowRoot.appendChild(this._root);
        }

        // Create form if it doesn't exist
        if (!this._form) {
            this._form = document.createElement("ha-form");
            this._form.computeLabel = this._computeLabel;
            this._form.addEventListener("value-changed", (ev) => this._handleFormChanged(ev));
            this._root.appendChild(this._form);
        }

        // Update form data and schema
        this._form.hass = this._hass;
        this._form.data = this._configToForm(this._config);
        this._form.schema = this._getSchema();
    }

    _handleFormChanged(ev) {
        const newConfig = this._formToConfig(ev.detail.value);
        if (JSON.stringify(this._config) !== JSON.stringify(newConfig)) {
            this._config = newConfig;
            fireEvent(this, "config-changed", { config: this._config });
        }
    }

    _configToForm(config) {
        const data = { ...config };

        // Defaults for styles to match schema
        data.ring_style = config.ring_style ?? "brass";
        data.plate_color = this._hexToRgb(config.plate_color ?? "#f5f5f5") ?? [245, 245, 245];
        data.font_bg_color = this._hexToRgb(config.font_bg_color ?? "#ffffff") ?? [255, 255, 255];
        data.font_color = this._hexToRgb(config.font_color ?? "#000000") ?? [0, 0, 0];
        data.plate_transparent = config.plate_transparent ?? false;
        data.wear_level = config.wear_level ?? 50;
        data.glass_effect_enabled = config.glass_effect_enabled ?? true;
        data.aged_texture = config.aged_texture ?? "everywhere";
        data.aged_texture_intensity = config.aged_texture_intensity ?? 50;

        return data;
    }

    _formToConfig(formData) {
        const config = { ...this._config, ...formData };

        // Convert Colors back to Hex
        if (config.plate_color) config.plate_color = this._rgbToHex(config.plate_color);
        if (config.font_bg_color) config.font_bg_color = this._rgbToHex(config.font_bg_color);
        if (config.font_color) config.font_color = this._rgbToHex(config.font_color);

        return config;
    }

    _getSchema() {
        return [
            {
                name: "entity",
                label: "Entity (Optional)",
                selector: { entity: {} }
            },
            {
                type: "grid",
                name: "",
                schema: [
                    { name: "icon", label: "Icon", selector: { icon: {} } },
                    {
                        name: "tap_action",
                        label: "Tap Action",
                        selector: {
                            ui_action: {
                                actions: [
                                    "more-info",
                                    "toggle",
                                    "navigate",
                                    "url",
                                    "call-service",
                                    "perform-action",
                                    "assist",
                                    "none"
                                ]
                            }
                        }
                    }
                ]
            },
            {
                name: "",
                type: "expandable",
                title: "Content Templates (Jinja2 Supported)",
                schema: [
                    { name: "primary_info", label: "Primary Info", selector: { template: {} } },
                    { name: "secondary_info", label: "Secondary Info", selector: { template: {} } },
                    { name: "secondary_info_2", label: "Secondary Info 2", selector: { template: {} } },
                    { name: "icon_color", label: "Icon Color", selector: { template: {} } }
                ]
            },
            {
                name: "",
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
                                    { value: "chrome", label: "Chrome" },
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
                    {
                        type: "grid",
                        name: "",
                        schema: [
                            { name: "font_bg_color", label: "Screen Background", selector: { color_rgb: {} } },
                            { name: "font_color", label: "Digital Font Color", selector: { color_rgb: {} } },
                            { name: "plate_color", label: "Plate Color", selector: { color_rgb: {} } },
                        ]
                    },
                    { name: "plate_transparent", label: "Transparent Plate", selector: { boolean: {} } },
                    { name: "glass_effect_enabled", label: "Glass Effect", selector: { boolean: {} } },
                    { name: "wear_level", label: "Wear Level (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
                    {
                        name: "aged_texture",
                        label: "Aged Texture Style",
                        selector: {
                            select: {
                                mode: "dropdown",
                                options: [
                                    { value: "none", label: "None" },
                                    { value: "glass_only", label: "Glass Only" },
                                    { value: "everywhere", label: "Everywhere" }
                                ]
                            }
                        }
                    },
                    { name: "aged_texture_intensity", label: "Texture Intensity (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
                    { name: "card_width", label: "Card Max Width (px)", selector: { number: { min: 100, max: 500, mode: "box" } } }
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

customElements.define("foundry-button-editor", FoundryButtonEditor);
