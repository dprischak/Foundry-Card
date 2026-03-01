import { describe, it, expect } from 'vitest';
import './foundry-digital-clock-editor';

describe('foundry-digital-clock-editor', () => {
  it('should define the custom element', () => {
    expect(customElements.get('foundry-digital-clock-editor')).toBeDefined();
  });
});
