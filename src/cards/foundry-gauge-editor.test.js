import { describe, it, expect } from 'vitest';
import './foundry-gauge-editor';

describe('foundry-gauge-card-editor', () => {
  it('should define the custom element', () => {
    expect(customElements.get('foundry-gauge-card-editor')).toBeDefined();
  });
});
