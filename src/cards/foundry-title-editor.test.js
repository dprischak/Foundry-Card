import { describe, it, expect } from 'vitest';
import './foundry-title-editor';

describe('foundry-title-editor', () => {
  it('should define the custom element', () => {
    expect(customElements.get('foundry-title-editor')).toBeDefined();
  });
});
