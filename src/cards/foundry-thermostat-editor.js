
class FoundryThermostatEditor extends HTMLElement {
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
      `;
            this.shadowRoot.appendChild(style);
            this.shadowRoot.appendChild(this._root);

            this._form = document.createElement("ha-form");
            this._form.addEventListener("value-changed", this._handleFormChanged.bind(this));
            this._root.appendChild(this._form);
        }

        if (this._form) this._form.hass = this._hass;

        const schema = [
            { name: "entity", selector: { entity: { domain: "sensor" } } },
            { name: "title", selector: { text: {} } },
            { name: "unit", selector: { text: {} } },
            {
                type: "grid",
                name: "",
                schema: [
                    { name: "min", selector: { number: { mode: "box" } } },
                    { name: "max", selector: { number: { mode: "box" } } }
                ]
            },
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

        this._form.schema = schema;
        this._form.data = this._config;
        this._form.computeLabel = (s) => s.label || s.name;
    }

    _handleFormChanged(ev) {
        const config = ev.detail.value;
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
    }
}

customElements.define("foundry-thermostat-editor", FoundryThermostatEditor);
