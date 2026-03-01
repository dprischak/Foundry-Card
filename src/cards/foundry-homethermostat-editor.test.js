import { describe, it, expect } from 'vitest';
import './foundry-homethermostat-editor';

describe('foundry-homethermostat-editor', () => {
  it('should define the custom element', () => {
    expect(customElements.get('foundry-homethermostat-editor')).toBeDefined();
  });
});
