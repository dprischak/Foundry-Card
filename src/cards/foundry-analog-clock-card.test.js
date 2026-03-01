import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import './foundry-analog-clock-card';

describe('foundry-analog-clock-card', () => {
  let el;
  beforeEach(() => {
    el = document.createElement('foundry-analog-clock-card');
    // Always set a config to avoid undefined config in lifecycle
    el.setConfig({});
    document.body.appendChild(el);
  });
  afterEach(() => {
    el.remove();
  });

  it('should define the custom element', () => {
    expect(customElements.get('foundry-analog-clock-card')).toBeDefined();
  });

  it('should accept a config and render', () => {
    el.setConfig({ title: 'Test Clock' });
    expect(el.config.title).toBe('Test Clock');
    // Check for a unique SVG element that always exists
    expect(el.shadowRoot.innerHTML).toContain('clock-svg');
  });

  it('should render SVG and hands', () => {
    el.setConfig({});
    // Should contain SVG and hand elements
    expect(el.shadowRoot.innerHTML).toContain('svg');
    expect(el.shadowRoot.innerHTML).toContain('hourHand');
    expect(el.shadowRoot.innerHTML).toContain('minuteHand');
  });

  it('should update hand angles on time change', () => {
    vi.useFakeTimers();
    el.setConfig({});
    const hourHand = el.shadowRoot.getElementById('hourHand');
    // Advance timers and check that the transform is a valid rotation string
    vi.advanceTimersByTime(2000); // advance 2 seconds
    const updatedTransform = hourHand.style.transform;
    expect(updatedTransform).toMatch(/^rotate\(-?\d+(\.\d+)?deg\)$/);
    vi.useRealTimers();
  });

  it('should handle invalid time_zone gracefully', () => {
    el.setConfig({ time_zone: 'Invalid/Zone' });
    // Should not throw, should log a warning
    expect(el.config.time_zone).toBe('Invalid/Zone');
  });

  it('should apply default ring style if not set', () => {
    el.setConfig({});
    expect(el.config.ring_style).toBe('brass');
  });
});
