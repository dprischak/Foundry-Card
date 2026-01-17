//************************************************************************************************************
// Chart Card Editor
//************************************************************************************************************
class FoundryChartCardEditor extends HTMLElement {
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
        if (this._form) this._form.hass = hass;
    }

    render() {
        if (!this._hass || !this._config) return;

        if (!this._root) {
            this._root = document.createElement("div");

            const style = document.createElement("style");
            style.textContent = `
        .card-config { display: flex; flex-direction: column; gap: 16px; }
        
        .section {
          margin-top: 8px;
          margin-bottom: 8px;
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
        .input-row {
          display: flex;
          gap: 8px;
          align-items: flex-end;
          margin-bottom: 12px;
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
        .input-group input, .input-group select {
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
        .input-group input[type="checkbox"] {
          width: auto;
          margin-top: 8px;
        }
      `;

            this._root.appendChild(style);
            this.shadowRoot.appendChild(this._root);
        }

        // Build form schema
        const schema = [
            {
                name: "entity",
                label: "Entity 1 (Required)",
                selector: { entity: {} }
            },
            {
                name: "entity2",
                label: "Entity 2 (Optional)",
                selector: { entity: {} }
            },
            {
                name: "entity3",
                label: "Entity 3 (Optional)",
                selector: { entity: {} }
            },
            {
                name: "entity4",
                label: "Entity 4 (Optional)",
                selector: { entity: {} }
            },
            {
                name: "title",
                label: "Title",
                selector: { text: {} }
            },
            {
                name: "chart_height",
                label: "Chart Height (px)",
                selector: { number: { min: 100, max: 800, mode: "box" } }
            },
            {
                name: "hours_to_show",
                label: "Hours to Show",
                selector: { number: { min: 0.25, max: 24, step: 0.25, mode: "box" } }
            },
            {
                name: "pen_thickness",
                label: "Pen Thickness",
                selector: { number: { min: 0.5, max: 5, step: 0.1, mode: "box" } }
            },
            {
                name: "transition_time",
                label: "Pen Transition Time (seconds)",
                selector: { number: { min: 0, max: 5, step: 0.1, mode: "box" } }
            },
            {
                name: "color",
                label: "Entity 1 Color",
                selector: { text: {} }
            },
            {
                name: "color2",
                label: "Entity 2 Color",
                selector: { text: {} }
            },
            {
                name: "color3",
                label: "Entity 3 Color",
                selector: { text: {} }
            },
            {
                name: "color4",
                label: "Entity 4 Color",
                selector: { text: {} }
            },
            {
                name: "ring_style",
                label: "Ring Style",
                selector: {
                    select: {
                        options: [
                            { value: "brass", label: "Brass" },
                            { value: "silver", label: "Silver" },
                            { value: "black", label: "Black" },
                            { value: "none", label: "None" }
                        ]
                    }
                }
            },
            {
                name: "rivet_color",
                label: "Rivet Color",
                selector: { text: {} }
            },
            {
                name: "plate_color",
                label: "Plate Color",
                selector: { text: {} }
            },
            {
                name: "plate_transparent",
                label: "Transparent Plate",
                selector: { boolean: {} }
            },
            {
                name: "wear_level",
                label: "Wear Level (0-100)",
                selector: { number: { min: 0, max: 100, mode: "slider" } }
            },
            {
                name: "aged_texture",
                label: "Aged Texture",
                selector: {
                    select: {
                        options: [
                            { value: "none", label: "None" },
                            { value: "glass_only", label: "Glass Only" },
                            { value: "everywhere", label: "Everywhere" }
                        ]
                    }
                }
            },
            {
                name: "aged_texture_intensity",
                label: "Texture Intensity (0-100)",
                selector: { number: { min: 0, max: 100, mode: "slider" } }
            }
        ];

        // Create or update form element
        if (!this._form) {
            this._form = document.createElement("ha-form");
            this._form.hass = this._hass;
            this._form.addEventListener("value-changed", (ev) => {
                this._config = { ...this._config, ...ev.detail.value };
                this.dispatchEvent(
                    new CustomEvent("config-changed", {
                        detail: { config: this._config },
                        bubbles: true,
                        composed: true
                    })
                );
            });

            const container = document.createElement("div");
            container.className = "card-config";
            container.appendChild(this._form);
            this._root.appendChild(container);
        }

        this._form.schema = schema;
        this._form.data = this._config;
    }
}

customElements.define("foundry-chart-card-editor", FoundryChartCardEditor);
