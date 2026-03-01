import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import './foundry-analog-clock-editor';

describe('foundry-analog-clock-editor', () => {
  let el;
  beforeEach(() => {
    el = document.createElement('foundry-analog-clock-editor');
    // Provide a fake hass object to allow rendering
    el.hass = {};
    document.body.appendChild(el);
  });
  afterEach(() => {
    el.remove();
  });

  it('should define the custom element', () => {
    expect(customElements.get('foundry-analog-clock-editor')).toBeDefined();
  });

  it('should render forms and reset button after setConfig', () => {
    el.setConfig({ entity: 'sensor.time' });
    // Should render two ha-form elements and a reset button
    expect(el.shadowRoot.querySelectorAll('ha-form').length).toBe(2);
    expect(el.shadowRoot.querySelector('.reset-btn')).toBeTruthy();
  });

  it('should emit config-changed event on config update', () => {
    const handler = vi.fn();
    el.addEventListener('config-changed', handler);
    el.setConfig({ entity: 'sensor.time' });
    // Simulate a config update
    el._updateConfig({ title: 'Test Title' });
    expect(handler).toHaveBeenCalled();
    expect(handler.mock.calls[0][0].detail.config.title).toBe('Test Title');
  });

  it('should reset to defaults when reset button is clicked and confirmed', () => {
    el.setConfig({ entity: 'sensor.time', title: 'Custom Title' });
    // Mock confirm to always return true
    window.confirm = vi.fn(() => true);
    const btn = el.shadowRoot.querySelector('.reset-btn');
    btn.click();
    expect(el._config.title).toBe('Local Time');
  });
});
