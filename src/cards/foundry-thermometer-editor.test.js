import { describe, it, expect } from 'vitest';
import './foundry-thermometer-editor';

describe('foundry-thermometer-editor', () => {
  it('should define the custom element', () => {
    expect(customElements.get('foundry-thermometer-editor')).toBeDefined();
  });
});
