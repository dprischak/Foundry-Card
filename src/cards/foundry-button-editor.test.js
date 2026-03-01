import { describe, it, expect } from 'vitest';
import './foundry-button-editor';

describe('foundry-button-editor', () => {
  it('should define the custom element', () => {
    expect(customElements.get('foundry-button-editor')).toBeDefined();
  });
});
