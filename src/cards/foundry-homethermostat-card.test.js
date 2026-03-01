import { describe, it, expect } from 'vitest';
import './foundry-homethermostat-card';

describe('foundry-homethermostat-card', () => {
  it('should define the custom element', () => {
    expect(customElements.get('foundry-homethermostat-card')).toBeDefined();
  });
});
