export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function fireEvent(node, type, detail = {}, options = {}) {
    detail = detail === null || detail === undefined ? {} : detail; // Ensure detail is an object
    const event = new CustomEvent(type, {
        bubbles: options.bubbles ?? true,
        cancelable: options.cancelable ?? false,
        composed: options.composed ?? true,
        detail,
    });
    node.dispatchEvent(event);
    return event;
}

export function getActionConfig(config, key, fallback) {
    // HA standard keys: tap_action / hold_action / double_tap_action
    if (config && config[key]) return config[key];
    return fallback;
}

export function handleAction(node, hass, config, actionConfig) {
    if (!actionConfig || !hass) return;

    const action = actionConfig.action;

    if (!action || action === "none") return;

    // 1) more-info
    if (action === "more-info") {
        const entityId = config.entity || actionConfig.entity;
        if (entityId) {
            fireEvent(node, "hass-more-info", { entityId });
        }
        return;
    }

    // 2) navigate
    if (action === "navigate") {
        const path = actionConfig.navigation_path;
        if (!path) return;
        navigate(node, path);
        return;
    }

    // 3) toggle
    if (action === "toggle") {
        const entityId = config.entity || actionConfig.entity;
        if (!entityId) return;
        hass.callService("homeassistant", "toggle", { entity_id: entityId });
        return;
    }

    // 4) call-service
    if (action === "call-service" || action === "perform-action") {
        const service = actionConfig.service || actionConfig.perform_action;
        if (!service) return;
        const [domain, srv] = service.split(".");
        const data = { ...actionConfig.service_data, ...actionConfig.data };
        if (actionConfig.target && actionConfig.target.entity_id) {
            data.entity_id = actionConfig.target.entity_id;
        }
        hass.callService(domain, srv, data);
        return;
    }

    // 5) assist
    if (action === "assist") {
        if (hass.auth && hass.auth.external && hass.auth.external.fireMessage) {
            hass.auth.external.fireMessage({ type: "assist/show" });
        } else {
            fireEvent(node, "hass-toggle-assistant");
        }
        return;
    }

    // 5) url
    if (action === "url") {
        if (actionConfig.url_path) {
            window.open(actionConfig.url_path);
        }
    }
}

export function navigate(node, path, replace = false) {
    if (history.pushState) {
        history.pushState(null, "", path);
        fireEvent(window, "location-changed", {
            replace
        });
    } else {
        location.href = path;
    }
}