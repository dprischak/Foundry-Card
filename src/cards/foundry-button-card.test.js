import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import './foundry-button-card';

describe('foundry-button-card', () => {
  let el;
  beforeEach(() => {
    el = document.createElement('foundry-button-card');
    document.body.appendChild(el);
  });
  afterEach(() => {
    el.remove();
  });

  it('should define the custom element', () => {
    expect(customElements.get('foundry-button-card')).toBeDefined();
  });

  it('should accept a config and render', () => {
    el.setConfig({ entity: 'light.sun_porch', primary_info: 'Porch' });
    expect(el.config.entity).toBe('light.sun_porch');
    expect(el.shadowRoot.innerHTML).toContain('ha-card');
  });

  it('should apply default ring style if not set', () => {
    el.setConfig({ entity: 'light.sun_porch' });
    expect(el.config.ring_style).toBe('brass');
  });

  it('should handle click action', async () => {
    // Set config before hass to avoid undefined config in rendering
    // Mock global handleAction to call _handleAction
    const origHandleAction = window.handleAction;
    window.handleAction = (_node, _hass, _config, _actionConfig) => {
      el._handleAction('tap');
    };
    el.setConfig({ entity: 'light.sun_porch', tap_action: { action: 'more-info' } });
    el.hass = {};
    // Mock _handleAction
    el._handleAction = vi.fn();
    // Wait for ha-card to appear (poll up to 100ms)
    let card = null;
    for (let i = 0; i < 10; i++) {
      card = el.shadowRoot.querySelector('ha-card');
      if (card) break;
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    expect(card).toBeTruthy();
    card.click();
    expect(el._handleAction).toHaveBeenCalledWith('tap');
    // Restore original handleAction
    window.handleAction = origHandleAction;
  });
});
