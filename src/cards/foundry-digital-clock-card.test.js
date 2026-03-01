import { describe, it, expect } from 'vitest';
import './foundry-digital-clock-card';

describe('foundry-digital-clock-card', () => {
  it('should define the custom element', () => {
    expect(customElements.get('foundry-digital-clock-card')).toBeDefined();
  });
});
