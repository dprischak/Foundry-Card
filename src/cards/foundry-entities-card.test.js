import { describe, it, expect } from 'vitest';
import './foundry-entities-card';

describe('foundry-entities-card', () => {
  it('should define the custom element', () => {
    expect(customElements.get('foundry-entities-card')).toBeDefined();
  });
});
