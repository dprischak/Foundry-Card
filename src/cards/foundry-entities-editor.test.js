import { describe, it, expect } from 'vitest';
import './foundry-entities-editor';

describe('foundry-entities-editor', () => {
  it('should define the custom element', () => {
    expect(customElements.get('foundry-entities-editor')).toBeDefined();
  });
});
