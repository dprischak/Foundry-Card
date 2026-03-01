import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// Polyfill ResizeObserver for jsdom test environment
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (typeof window !== 'undefined' && !window.ResizeObserver) {
  window.ResizeObserver = ResizeObserver;
}
import './foundry-gauge-card';

describe('foundry-gauge-card', () => {
  let el;
  beforeEach(() => {
    el = document.createElement('foundry-gauge-card');
    document.body.appendChild(el);
  });
  afterEach(() => {
    el.remove();
  });

  it('should define the custom element', () => {
    expect(customElements.get('foundry-gauge-card')).toBeDefined();
  });

  it('should throw if setConfig is called without entity', () => {
    expect(() => el.setConfig({})).toThrow();
  });

  it('should accept a valid config and render', () => {
    el.setConfig({ entity: 'sensor.test' });
    expect(el.config.entity).toBe('sensor.test');
    expect(el.shadowRoot.innerHTML).toContain('gauge-container');
  });

  it('should apply default min/max if invalid', () => {
    el.setConfig({ entity: 'sensor.test', min: 100, max: 50 });
    expect(el.config.min).toBe(0);
    expect(el.config.max).toBe(100);
  });

  it('should sanitize decimals to 0 if invalid', () => {
    el.setConfig({ entity: 'sensor.test', decimals: -5 });
    expect(el.config.decimals).toBe(0);
  });

  it('should cap decimals at 10', () => {
    el.setConfig({ entity: 'sensor.test', decimals: 20 });
    expect(el.config.decimals).toBe(10);
  });

  it('should normalize start_angle and end_angle', () => {
    el.setConfig({ entity: 'sensor.test', start_angle: 370, end_angle: -10 });
    expect(el.config.start_angle).toBe(10);
    expect(el.config.end_angle).toBe(350);
  });

  it('should cap animation_duration at 10', () => {
    el.setConfig({ entity: 'sensor.test', animation_duration: 20 });
    expect(el.config.animation_duration).toBe(10);
  });

  it('should clamp wear_level and aged_texture_intensity to 0-100', () => {
    el.setConfig({ entity: 'sensor.test', wear_level: 200, aged_texture_intensity: -10 });
    expect(el.config.wear_level).toBe(100);
    expect(el.config.aged_texture_intensity).toBe(0);
  });

  it('should set high_needle_duration and high_needle_length with bounds', () => {
    el.setConfig({ entity: 'sensor.test', high_needle_duration: -5, high_needle_length: 10 });
    expect(el.config.high_needle_duration).toBe(60);
    expect(el.config.high_needle_length).toBe(25);
  });
});
