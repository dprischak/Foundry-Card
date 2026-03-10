/**
 * Minimal Home Assistant mock object.
 * Editors only use hass.states — nothing else is needed for logic tests.
 */
export function createMockHass(extraStates = {}) {
  return {
    states: {
      'sensor.temperature': {
        entity_id: 'sensor.temperature',
        state: '21.5',
        attributes: { unit_of_measurement: '°C', friendly_name: 'Temperature' },
      },
      'sensor.humidity': {
        entity_id: 'sensor.humidity',
        state: '55',
        attributes: { unit_of_measurement: '%', friendly_name: 'Humidity' },
      },
      'binary_sensor.motion': {
        entity_id: 'binary_sensor.motion',
        state: 'on',
        attributes: { friendly_name: 'Motion' },
      },
      ...extraStates,
    },
    callService: vi.fn(),
  };
}
