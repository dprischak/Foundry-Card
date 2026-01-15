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
    const event = new Event(type, {
        bubbles: options.bubbles ?? true,
        cancelable: options.cancelable ?? false,
        composed: options.composed ?? true,
    });
    event.detail = detail;
    node.dispatchEvent(event);
    return event;
}

export function getActionConfig(config, key, fallback) {
    // HA standard keys: tap_action / hold_action / double_tap_action
    if (config && config[key]) return config[key];
    return fallback;
}