import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '../src/cards/foundry-gauge-card.js';

describe('FoundryGaugeCard - High Needle Persistence', () => {
  let element;
  let mockHass;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Create element
    element = document.createElement('foundry-gauge-card');
    document.body.appendChild(element);

    // Mock hass object
    mockHass = {
      states: {
        'sensor.test': {
          state: '50',
          attributes: {
            unit_of_measurement: '%',
          },
        },
      },
    };
  });

  afterEach(() => {
    element.remove();
    localStorage.clear();
  });

  it('should persist high needle value to localStorage', async () => {
    const config = {
      entity: 'sensor.test',
      min: 0,
      max: 100,
      high_needle_enabled: true,
      high_needle_duration: 86400, // 24 hours
    };

    element.setConfig(config);
    element.hass = mockHass;

    // Wait for initial render
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Get the storage key
    const storageKey = `foundry-gauge-high-needle-sensor.test`;

    // Initially, no data should be stored
    expect(localStorage.getItem(storageKey)).toBeNull();

    // Simulate a high value
    mockHass.states['sensor.test'].state = '80';
    element.hass = { ...mockHass };
    await new Promise((resolve) => setTimeout(resolve, 100));

    // High value should be tracked but not stored yet (no reset scheduled)
    expect(element._highNeedleValue).toBe(80);
    expect(localStorage.getItem(storageKey)).toBeNull();

    // Value drops below high
    mockHass.states['sensor.test'].state = '40';
    element.hass = { ...mockHass };
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Now state should be persisted
    const stored = localStorage.getItem(storageKey);
    expect(stored).not.toBeNull();

    const parsedData = JSON.parse(stored);
    expect(parsedData.value).toBe(80);
    expect(parsedData.duration).toBe(86400);
    expect(parsedData.resetTime).toBeGreaterThan(Date.now());
    expect(parsedData.resetTime).toBeLessThanOrEqual(
      Date.now() + 86400 * 1000 + 100
    );
  });

  it('should restore high needle state from localStorage on reload', async () => {
    const config = {
      entity: 'sensor.test',
      min: 0,
      max: 100,
      high_needle_enabled: true,
      high_needle_duration: 3600, // 1 hour
    };

    // Simulate existing localStorage state
    const storageKey = `foundry-gauge-high-needle-sensor.test`;
    const futureResetTime = Date.now() + 3600 * 1000; // 1 hour from now
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        value: 75,
        resetTime: futureResetTime,
        duration: 3600,
      })
    );

    // Create new element (simulating page reload)
    element.setConfig(config);
    element.hass = mockHass;
    await new Promise((resolve) => setTimeout(resolve, 100));

    // High needle value should be restored
    expect(element._highNeedleValue).toBe(75);
    expect(element._highNeedleResetTime).toBe(futureResetTime);
  });

  it('should clear expired high needle state on load', async () => {
    const config = {
      entity: 'sensor.test',
      min: 0,
      max: 100,
      high_needle_enabled: true,
      high_needle_duration: 3600,
    };

    // Simulate expired localStorage state
    const storageKey = `foundry-gauge-high-needle-sensor.test`;
    const pastResetTime = Date.now() - 1000; // 1 second ago
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        value: 75,
        resetTime: pastResetTime,
        duration: 3600,
      })
    );

    // Current value is lower
    mockHass.states['sensor.test'].state = '30';

    element.setConfig(config);
    element.hass = mockHass;
    await new Promise((resolve) => setTimeout(resolve, 100));

    // High needle should reset to current value
    expect(element._highNeedleValue).toBe(30);
    expect(element._highNeedleResetTime).toBeNull();

    // Storage should be cleared
    expect(localStorage.getItem(storageKey)).toBeNull();
  });

  it('should clear state when value exceeds high value', async () => {
    const config = {
      entity: 'sensor.test',
      min: 0,
      max: 100,
      high_needle_enabled: true,
      high_needle_duration: 3600,
    };

    const storageKey = `foundry-gauge-high-needle-sensor.test`;

    element.setConfig(config);
    element.hass = mockHass;
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Set high value
    mockHass.states['sensor.test'].state = '70';
    element.hass = { ...mockHass };
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Drop below
    mockHass.states['sensor.test'].state = '50';
    element.hass = { ...mockHass };
    await new Promise((resolve) => setTimeout(resolve, 100));

    // State should be persisted
    expect(localStorage.getItem(storageKey)).not.toBeNull();

    // Value exceeds previous high
    mockHass.states['sensor.test'].state = '85';
    element.hass = { ...mockHass };
    await new Promise((resolve) => setTimeout(resolve, 100));

    // State should be cleared
    expect(localStorage.getItem(storageKey)).toBeNull();
    expect(element._highNeedleValue).toBe(85);
    expect(element._highNeedleResetTime).toBeNull();
  });

  it('should invalidate state when duration changes', async () => {
    const storageKey = `foundry-gauge-high-needle-sensor.test`;

    // Store state with 1 hour duration
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        value: 75,
        resetTime: Date.now() + 3600 * 1000,
        duration: 3600,
      })
    );

    // Configure with different duration
    const config = {
      entity: 'sensor.test',
      min: 0,
      max: 100,
      high_needle_enabled: true,
      high_needle_duration: 7200, // 2 hours - different from stored
    };

    element.setConfig(config);
    element.hass = mockHass;
    await new Promise((resolve) => setTimeout(resolve, 100));

    // State should be invalidated
    expect(localStorage.getItem(storageKey)).toBeNull();
    expect(element._highNeedleValue).toBe(50); // Current value
  });
});
