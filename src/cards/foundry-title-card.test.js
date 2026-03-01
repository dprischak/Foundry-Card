import { describe, it, expect } from 'vitest';
import './foundry-title-card';

describe('foundry-title-card', () => {
  it('should define the custom element', () => {
    expect(customElements.get('foundry-title-card')).toBeDefined();
  });
});
