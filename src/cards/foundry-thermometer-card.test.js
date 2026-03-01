import { describe, it, expect } from 'vitest';
import './foundry-thermometer-card';

describe('foundry-thermometer-card', () => {
  it('should define the custom element', () => {
    expect(customElements.get('foundry-thermometer-card')).toBeDefined();
  });
});
