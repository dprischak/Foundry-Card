class FoundryAnalogClockCardEditor extends HTMLElement {
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

            // --- PART 1: Top Settings (Entity, Title, TimeZone) ---
            this._form1 = document.createElement("ha-form");
            this._form1.addEventListener("value-changed", this._handleFormChanged.bind(this));
            this._root.appendChild(this._form1);

            // --- PART 2: Appearance & Actions ---
            this._form2 = document.createElement("ha-form");
            this._form2.addEventListener("value-changed", this._handleFormChanged.bind(this));
            this._root.appendChild(this._form2);

            // Reset to defaults button
            const resetBtn = document.createElement("button");
            resetBtn.className = "reset-btn";
            resetBtn.textContent = "⚠️ Reset to Default Configuration";
            resetBtn.title = "Reset all settings to defaults";
            resetBtn.addEventListener("click", () => this._resetToDefaults());
            this._root.appendChild(resetBtn);
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

    _resetToDefaults() {
        if (!confirm('Reset all settings to defaults? This will keep your entity but reset all other configuration.')) {
            return;
        }

        const entity = this._config.entity;
        this._updateConfig({
            entity: entity,
            title: '',
            time_zone: '',
            second_hand_enabled: false,
            title_font_size: 12,
            ring_style: 'brass',
            rivet_color: '#6d5d4b',
            plate_color: '#f5f5f5',
            plate_transparent: false,
            wear_level: 50,
            glass_effect_enabled: true,
            aged_texture: 'glass_only',
            aged_texture_intensity: 50,
            tap_action: { action: 'more-info' },
            hold_action: { action: 'more-info' },
            double_tap_action: { action: 'more-info' }
        });
    }

    _updateConfig(updates) {
        this._config = { ...this._config, ...updates };
        this.dispatchEvent(new CustomEvent("config-changed", {
            detail: { config: this._config },
            bubbles: true,
            composed: true,
        }));
    }

    _handleFormChanged(ev) {
        const newConfig = this._formToConfig(ev.detail.value);
        if (JSON.stringify(this._config) !== JSON.stringify(newConfig)) {
            this._updateConfig(newConfig);
        }
    }

    _configToForm(config) {
        const data = { ...config };

        data.appearance = {
            ring_style: config.ring_style,
            rivet_color: this._hexToRgb(config.rivet_color ?? "#6d5d4b") ?? [109, 93, 75],
            plate_color: this._hexToRgb(config.plate_color ?? "#f5f5f5") ?? [245, 245, 245],
            plate_transparent: config.plate_transparent,
            wear_level: config.wear_level,
            glass_effect_enabled: config.glass_effect_enabled,
            aged_texture: config.aged_texture,
            aged_texture_intensity: config.aged_texture_intensity,
            second_hand_enabled: config.second_hand_enabled
        };

        data.layout = {
            title_font_size: config.title_font_size
        };

        data.actions = {};
        ['tap', 'hold', 'double_tap'].forEach(type => {
            const conf = config[`${type}_action`] || {};
            data.actions[`${type}_action_action`] = conf.action || "more-info";
            data.actions[`${type}_action_navigation_path`] = conf.navigation_path || "";
            data.actions[`${type}_action_service`] = conf.service || "";
            data.actions[`${type}_action_target_entity`] = conf.target?.entity_id || "";
        });

        return data;
    }

    _formToConfig(formData) {
        const config = { ...this._config };
        const defaults = {
            rivet_color: this._config?.rivet_color ?? "#6d5d4b",
            plate_color: this._config?.plate_color ?? "#f5f5f5",
        };

        Object.keys(formData).forEach(key => {
            if (['appearance', 'layout', 'actions'].includes(key)) return;
            config[key] = formData[key];
        });

        if (formData.appearance) Object.assign(config, formData.appearance);
        if (formData.layout) Object.assign(config, formData.layout);

        const rc = this._rgbToHex(config.rivet_color);
        if (rc) config.rivet_color = rc; else config.rivet_color = defaults.rivet_color;

        const pc = this._rgbToHex(config.plate_color);
        if (pc) config.plate_color = pc; else config.plate_color = defaults.plate_color;

        if (formData.actions) {
            ['tap', 'hold', 'double_tap'].forEach(type => {
                const group = formData.actions;
                const actionType = group[`${type}_action_action`];
                const newAction = { action: actionType };

                if (actionType === 'navigate') {
                    newAction.navigation_path = group[`${type}_action_navigation_path`];
                } else if (actionType === 'call-service') {
                    newAction.service = group[`${type}_action_service`];
                    const targetEnt = group[`${type}_action_target_entity`];
                    if (targetEnt) newAction.target = { entity_id: targetEnt };
                }
                config[`${type}_action`] = newAction;
            });
        }

        return config;
    }

    _computeLabel(schema) {
        if (schema.label) return schema.label;
        if (schema.name === "entity") return "Entity (Optional)";
        return schema.name
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    _getSchemaTop(formData) {
        return [
            {
                name: "entity",
                selector: { entity: {} }
            },
            {
                type: "grid",
                name: "",
                schema: [
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
                                    { value: "America/New_York", label: "New York (Eastern)" },
                                    { value: "America/Chicago", label: "Chicago (Central)" },
                                    { value: "America/Denver", label: "Denver (Mountain)" },
                                    { value: "America/Los_Angeles", label: "Los Angeles (Pacific)" },
                                    { value: "America/Phoenix", label: "Phoenix (MST)" },
                                    { value: "America/Anchorage", label: "Anchorage (Alaska)" },
                                    { value: "Pacific/Honolulu", label: "Honolulu (Hawaii)" },
                                    { value: "Europe/London", label: "London (GMT/BST)" },
                                    { value: "Europe/Paris", label: "Paris (CET/CEST)" },
                                    { value: "Europe/Berlin", label: "Berlin (CET/CEST)" },
                                    { value: "Europe/Moscow", label: "Moscow (MSK)" },
                                    { value: "Asia/Tokyo", label: "Tokyo (JST)" },
                                    { value: "Asia/Shanghai", label: "Shanghai (CST)" },
                                    { value: "Asia/Hong_Kong", label: "Hong Kong (HKT)" },
                                    { value: "Asia/Singapore", label: "Singapore (SGT)" },
                                    { value: "Australia/Sydney", label: "Sydney (AEST/AEDT)" },
                                    { value: "Pacific/Auckland", label: "Auckland (NZST/NZDT)" }
                                ]
                            }
                        }
                    },
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
        if ([r, g, b].some((n) => Number.isNaN(n))) return null;
        const toHex = (n) => n.toString(16).padStart(2, "0");
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    _getSchemaBottom(formData) {
        const actionData = formData.actions || {};

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
                                    { value: "none", label: "None" },
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
                            { name: "rivet_color", label: "Rivet Color", selector: { color_rgb: {} } },
                            { name: "plate_color", label: "Plate Color", selector: { color_rgb: {} } },
                        ]
                    },
                    { name: "plate_transparent", label: "Transparent Plate", selector: { boolean: {} } },
                    { name: "second_hand_enabled", label: "Show Second Hand", selector: { boolean: {} } },
                    { name: "wear_level", label: "Wear Level", selector: { number: { min: 0, max: 100, mode: "slider" } } },
                    { name: "glass_effect_enabled", label: "Glass Effect", selector: { boolean: {} } },
                    {
                        name: "aged_texture",
                        label: "Aged Texture",
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
                    { name: "aged_texture_intensity", label: "Texture Intensity", selector: { number: { min: 0, max: 100, mode: "slider" } } },
                ]
            },
            {
                name: "layout",
                type: "expandable",
                title: "Layout & Text",
                schema: [
                    { name: "title_font_size", label: "Title Font Size", selector: { number: { mode: "box" } } },
                ]
            },
            {
                name: "actions",
                type: "expandable",
                title: "Actions",
                schema: [
                    ...this._getActionSchema('tap', 'Tap', actionData),
                    ...this._getActionSchema('hold', 'Hold', actionData),
                    ...this._getActionSchema('double_tap', 'Double Tap', actionData),
                ]
            }
        ];
    }

    _getActionSchema(type, label, actionData) {
        const actionKey = `${type}_action_action`;
        const currentAction = actionData ? actionData[actionKey] : "more-info";

        const schema = [
            {
                name: actionKey,
                label: `${label} Action`,
                selector: {
                    select: {
                        mode: "dropdown",
                        options: [
                            { value: "more-info", label: "More Info" },
                            { value: "toggle", label: "Toggle" },
                            { value: "navigate", label: "Navigate" },
                            { value: "call-service", label: "Call Service" },
                            { value: "none", label: "None" }
                        ]
                    }
                }
            }
        ];

        if (currentAction === 'navigate') {
            schema.push({ name: `${type}_action_navigation_path`, label: "Navigation Path", selector: { text: {} } });
        }

        if (currentAction === 'call-service') {
            schema.push({ name: `${type}_action_service`, label: "Service", selector: { text: {} } });
            schema.push({ name: `${type}_action_target_entity`, label: "Target Entity", selector: { entity: {} } });
        }

        return schema;
    }
}

customElements.define('foundry-analog-clock-editor', FoundryAnalogClockCardEditor);
