import { beforeAll, describe, expect, it, vi } from 'vitest';

let FoundrySliderCardClass;

beforeAll(async () => {
  await import('./foundry-slider-card.js');
  FoundrySliderCardClass = customElements.get('foundry-slider-card');
});

describe('foundry-slider-card helpers', () => {
  it('formats signed decimal values with fixed width', () => {
    const card = new FoundrySliderCardClass();
    card.config = { min: -10, max: 20, step: 0.5 };

    expect(card._formatValue(3)).toBe('+03.0');
    expect(card._formatValue(-3.4)).toBe('-03.4');
  });

  it('formats integer values without sign when range is non-negative', () => {
    const card = new FoundrySliderCardClass();
    card.config = { min: 0, max: 100, step: 1 };

    expect(card._formatValue(7.9)).toBe('007');
  });

  it('routes entity updates to the expected Home Assistant services', () => {
    const card = new FoundrySliderCardClass();
    card._hass = { callService: vi.fn() };

    card.config = { entity: 'input_number.volume' };
    card._updateEntity(42);

    card.config = { entity: 'number.target_temp' };
    card._updateEntity(18);

    card.config = { entity: 'light.office' };
    card._updateEntity(50);

    card.config = { entity: 'fan.office' };
    card._updateEntity(65);

    card.config = { entity: 'cover.garage' };
    card._updateEntity(80);

    expect(card._hass.callService).toHaveBeenNthCalledWith(
      1,
      'input_number',
      'set_value',
      {
        entity_id: 'input_number.volume',
        value: 42,
      }
    );
    expect(card._hass.callService).toHaveBeenNthCalledWith(
      2,
      'number',
      'set_value',
      {
        entity_id: 'number.target_temp',
        value: 18,
      }
    );
    expect(card._hass.callService).toHaveBeenNthCalledWith(
      3,
      'light',
      'turn_on',
      {
        entity_id: 'light.office',
        brightness: 128,
      }
    );
    expect(card._hass.callService).toHaveBeenNthCalledWith(
      4,
      'fan',
      'set_percentage',
      {
        entity_id: 'fan.office',
        percentage: 65,
      }
    );
    expect(card._hass.callService).toHaveBeenNthCalledWith(
      5,
      'cover',
      'set_cover_position',
      {
        entity_id: 'cover.garage',
        position: 80,
      }
    );
  });
});
