
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

class FoundryUptimeEditor extends HTMLElement {
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
                .thresholds-section {
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
                .threshold-row {
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

            // Form 1
            this._form1 = document.createElement("ha-form");
            this._form1.computeLabel = this._computeLabel;
            this._form1.addEventListener("value-changed", (ev) => this._handleFormChanged(ev));
            this._root.appendChild(this._form1);

            // Custom Thresholds UI wrapper
            this._thresholdsPanel = document.createElement("ha-expansion-panel");
            this._thresholdsPanel.header = "Color Thresholds";
            this._thresholdsPanel.outlined = true;
            this._thresholdsPanel.expanded = false;
            // Styling to match ha-form
            this._thresholdsPanel.style.marginTop = "8px";
            this._thresholdsPanel.style.marginBottom = "8px";

            // Content container
            this._thresholdsContainer = document.createElement("div");
            this._thresholdsContainer.className = "thresholds-section";
            // Remove border/padding from container as panel handles it (mostly)
            // Actually, keep the class but override styles in CSS if needed, or just rely on panel content.
            // Let's adjust CSS slightly later or inline styles here to remove double border.
            this._thresholdsContainer.style.border = "none";
            this._thresholdsContainer.style.padding = "16px";

            this._thresholdsPanel.appendChild(this._thresholdsContainer);
            this._root.appendChild(this._thresholdsPanel);

            // Form 2
            this._form2 = document.createElement("ha-form");
            this._form2.computeLabel = this._computeLabel;
            this._form2.addEventListener("value-changed", (ev) => this._handleFormChanged(ev));
            this._root.appendChild(this._form2);
        }

        const data = this._configToForm(this._config);

        if (this._form1) {
            this._form1.hass = this._hass;
            this._form1.data = data;
            this._form1.schema = this._getSchemaTop();
        }

        this._renderThresholds();

        if (this._form2) {
            this._form2.hass = this._hass;
            this._form2.data = data;
            this._form2.schema = this._getSchemaBottom();
        }
    }

    _renderThresholds() {
        if (!this._thresholdsContainer) return;
        const thresholds = this._config.color_thresholds || [];

        // Check if we need to full re-render (length changed)
        const currentRows = this._thresholdsContainer.querySelectorAll('.threshold-row');
        const needsFullRender = currentRows.length !== thresholds.length;

        if (needsFullRender) {
            let html = ``; // Header is now handled by expansion panel

            if (thresholds.length === 0) {
                html += `<div style="font-style: italic; color: var(--secondary-text-color); margin-bottom: 12px;">No thresholds defined.</div>`;
            }

            thresholds.forEach((th, index) => {
                const val = th.value !== undefined ? th.value : 0;
                const col = th.color || "#000000";

                html += `
                     <div class="threshold-row">
                         <div class="input-group">
                             <label>Threshold %</label>
                             <input type="number" step="0.1" class="th-input" data-idx="${index}" data-key="value" value="${val}">
                         </div>
                         <div class="input-group">
                             <label>Color</label>
                              <input type="color" class="th-input" data-idx="${index}" data-key="color" value="${col}">
                         </div>
                         <button class="remove-btn" data-idx="${index}" title="Remove">❌</button>
                     </div>
                  `;
            });

            html += `<button id="add-btn" class="add-btn">+ Add Threshold</button>`;

            this._thresholdsContainer.innerHTML = html;

            // Re-attach Listeners
            this._thresholdsContainer.querySelectorAll('.th-input').forEach(input => {
                input.addEventListener('change', (e) => {
                    const idx = parseInt(e.target.dataset.idx);
                    const key = e.target.dataset.key;
                    let val = e.target.value;
                    if (key === 'value') val = Number(val);
                    this._updateThreshold(idx, key, val);
                });
            });

            this._thresholdsContainer.querySelectorAll('.remove-btn').forEach(btn => {
                btn.addEventListener('click', (e) => this._removeThreshold(parseInt(e.target.dataset.idx)));
            });

            const addBtn = this._thresholdsContainer.querySelector('#add-btn');
            if (addBtn) addBtn.addEventListener('click', () => this._addThreshold());
        } else {
            // Just update inputs
            thresholds.forEach((th, index) => {
                const row = currentRows[index];
                if (row) {
                    const valInput = row.querySelector(`input[data-key="value"]`);
                    const colInput = row.querySelector(`input[data-key="color"]`);
                    const val = th.value !== undefined ? th.value : 0;
                    const col = th.color || "#000000";

                    if (valInput && valInput !== this.shadowRoot.activeElement && Number(valInput.value) !== val) {
                        valInput.value = val;
                    }
                    if (colInput && colInput !== this.shadowRoot.activeElement && colInput.value !== col) {
                        colInput.value = col;
                    }
                }
            });
        }
    }

    _updateThreshold(index, key, value) {
        const thresholds = [...(this._config.color_thresholds || [])];
        if (thresholds[index]) {
            thresholds[index] = { ...thresholds[index], [key]: value };
            this._updateConfig({ color_thresholds: thresholds });
        }
    }

    _addThreshold() {
        const thresholds = [...(this._config.color_thresholds || [])];
        thresholds.push({ value: 90, color: "#4CAF50" });
        this._updateConfig({ color_thresholds: thresholds.sort((a, b) => a.value - b.value) });
    }

    _removeThreshold(index) {
        const thresholds = [...(this._config.color_thresholds || [])];
        thresholds.splice(index, 1);
        this._updateConfig({ color_thresholds: thresholds });
    }

    _updateConfig(updates) {
        this._config = { ...this._config, ...updates };
        fireEvent(this, "config-changed", { config: this._config });
    }

    _handleFormChanged(ev) {
        const newConfig = this._formToConfig(ev.detail.value);
        if (JSON.stringify(this._config) !== JSON.stringify(newConfig)) {
            this._updateConfig(newConfig);
        }
    }

    _computeLabel(schema) {
        if (schema.label) return schema.label;
        return schema.name;
    }

    _configToForm(config) {
        const data = { ...config };
        // Visuals - convert to Array for HA Form? NO, we want HEX for custom UI, but Array for Form? 
        // Wait, the BOTTOM form uses color_rgb selector which needs Array.
        // My simple helper manages this.
        if (config.font_bg_color) data.font_bg_color = this._hexToRgb(config.font_bg_color);
        if (config.font_color) data.font_color = this._hexToRgb(config.font_color);
        if (config.plate_color) data.plate_color = this._hexToRgb(config.plate_color);
        if (config.rivet_color) data.rivet_color = this._hexToRgb(config.rivet_color);
        if (config.alias) {
            data.alias_ok = config.alias.ok;
            data.alias_ko = config.alias.ko;
        }
        return data;
    }

    _formToConfig(formData) {
        const config = { ...this._config, ...formData };
        const ensureHex = (val) => Array.isArray(val) ? this._rgbToHex(val) : val;

        if (formData.font_bg_color) config.font_bg_color = ensureHex(formData.font_bg_color);
        if (formData.font_color) config.font_color = ensureHex(formData.font_color);
        if (formData.plate_color) config.plate_color = ensureHex(formData.plate_color);
        if (formData.rivet_color) config.rivet_color = ensureHex(formData.rivet_color);

        if (formData.alias_ok !== undefined || formData.alias_ko !== undefined) {
            config.alias = { ...config.alias };
            if (formData.alias_ok !== undefined) config.alias.ok = formData.alias_ok;
            if (formData.alias_ko !== undefined) config.alias.ko = formData.alias_ko;
            delete config.alias_ok;
            delete config.alias_ko;
        }

        return config;
    }

    _hexToRgb(hex) {
        if (!hex || typeof hex !== 'string') return undefined;
        if (!hex.startsWith("#")) return undefined;
        let c = hex.substring(1);
        if (c.length === 3) c = c.split("").map(s => s + s).join("");
        if (c.length !== 6) return undefined;
        const num = parseInt(c, 16);
        return [num >> 16, (num >> 8) & 255, num & 255];
    }

    _rgbToHex(rgb) {
        if (!Array.isArray(rgb)) return rgb;
        return "#" + rgb.map(x => x.toString(16).padStart(2, "0")).join("");
    }

    _getSchemaTop() {
        return [
            { name: "entity", selector: { entity: {} } },
            {
                name: "",
                type: "expandable",
                title: "Uptime Settings",
                schema: [
                    { name: "hours_to_show", label: "Hours to Show", selector: { number: { min: 1, max: 168 } } },
                    { name: "update_interval", label: "Update Interval (s)", selector: { number: { min: 10, max: 3600 } } },
                    { name: "ok", label: "OK State (CSV or single)", selector: { text: {} } },
                    { name: "ko", label: "KO State (CSV or single)", selector: { text: {} } },
                    { name: "alias_ok", label: "Alias for OK", selector: { text: {} } },
                    { name: "alias_ko", label: "Alias for KO", selector: { text: {} } }
                ]
            }
        ];
    }

    _getSchemaBottom() {
        return [
            {
                name: "",
                type: "expandable",
                title: "Appearance",
                schema: [
                    { name: "title", label: "Title", selector: { text: {} } },
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
                            { name: "font_color", label: "Font Color", selector: { color_rgb: {} } },
                            { name: "plate_color", label: "Plate Color", selector: { color_rgb: {} } },
                            { name: "rivet_color", label: "Rivet Color", selector: { color_rgb: {} } },
                        ]
                    },
                    { name: "plate_transparent", label: "Transparent Plate", selector: { boolean: {} } },
                    { name: "glass_effect_enabled", label: "Glass Effect", selector: { boolean: {} } },
                    { name: "wear_level", label: "Wear Level (%)", selector: { number: { min: 0, max: 100, mode: "slider" } } },
                ]
            }
        ];
    }
}

if (!customElements.get('foundry-uptime-editor')) {
    customElements.define('foundry-uptime-editor', FoundryUptimeEditor);
}
