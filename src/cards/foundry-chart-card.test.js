import { beforeAll, describe, expect, it } from 'vitest';

let FoundryChartCardClass;

beforeAll(async () => {
  await import('./foundry-chart-card.js');
  FoundryChartCardClass = customElements.get('foundry-chart-card');
});

describe('foundry-chart-card helpers', () => {
  it('normalizes and sorts valid segments only', () => {
    const card = new FoundryChartCardClass();

    const result = card._normalizeSegments([
      { from: '10', to: 20, color: '#111111' },
      { from: 0, to: 5, color: '#222222' },
      { from: 5, to: 5, color: '#333333' },
      { from: 30, to: 20, color: '#444444' },
      { from: 40, to: 50, color: null },
    ]);

    expect(result).toEqual([
      { from: 0, to: 5, color: '#222222' },
      { from: 10, to: 20, color: '#111111' },
    ]);
  });

  it('converts and blends hex colors', () => {
    const card = new FoundryChartCardClass();

    expect(card._hexToRgb('#abc')).toEqual({ r: 170, g: 187, b: 204 });
    expect(card._rgbToHex({ r: 255, g: 16, b: 0 })).toBe('#ff1000');
    expect(card._blendHexColors('#ff0000', '#00ff00', 0.5)).toBe('#808000');
  });

  it('returns blended segment color near boundaries', () => {
    const card = new FoundryChartCardClass();
    const segments = card._normalizeSegments([
      { from: 0, to: 50, color: '#ff0000' },
      { from: 50, to: 100, color: '#00ff00' },
    ]);

    const atBoundary = card._getSegmentColorForValue(
      50,
      segments,
      10,
      '#0000ff'
    );

    expect(atBoundary).toBe('#808000');
  });

  it('falls back to default color when no segment matches', () => {
    const card = new FoundryChartCardClass();
    const segments = card._normalizeSegments([
      { from: 0, to: 10, color: '#123456' },
    ]);

    const result = card._getSegmentColorForValue(22, segments, 0, '#ffffff');

    expect(result).toBe('#ffffff');
  });
});
