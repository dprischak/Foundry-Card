import { beforeAll, describe, expect, it, vi } from 'vitest';

let FoundryUptimeCardClass;

beforeAll(async () => {
  await import('./foundry-uptime-card.js');
  FoundryUptimeCardClass = customElements.get('foundry-uptime-card');
});

describe('foundry-uptime-card helpers', () => {
  it('resolves threshold colors in ascending order', () => {
    const card = new FoundryUptimeCardClass();
    card.config = {
      segments: undefined,
      font_color: '#101010',
      color_thresholds: [
        { value: 100, color: 'green' },
        { value: 50, color: 'purple' },
        { value: 70, color: 'red' },
      ],
    };

    expect(card._getColorForScore(40)).toBe('#9C27B0');
    expect(card._getColorForScore(60)).toBe('#F44336');
    expect(card._getColorForScore(95)).toBe('#4CAF50');
  });

  it('uses font color when segments are configured', () => {
    const card = new FoundryUptimeCardClass();
    card.config = {
      segments: [{ from: 0, to: 50, color: 'red' }],
      font_color: '#00ff00',
      color_thresholds: [],
    };

    expect(card._getColorForScore(25)).toBe('#00ff00');
  });

  it('checks ok and ko states for string and array configs', () => {
    const card = new FoundryUptimeCardClass();

    card.config = { ok: 'on', ko: 'off' };
    expect(card._isOk('on')).toBe(true);
    expect(card._isKo('off')).toBe(true);

    card.config = { ok: ['on', 'connected'], ko: ['off', 'disconnected'] };
    expect(card._isOk('connected')).toBe(true);
    expect(card._isKo('disconnected')).toBe(true);
  });

  it('formats relative time in minutes, hours, and days', () => {
    const card = new FoundryUptimeCardClass();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-10T12:00:00Z'));

    expect(card._timeAgo(new Date('2026-01-10T11:40:00Z'))).toBe('20m ago');
    expect(card._timeAgo(new Date('2026-01-10T09:00:00Z'))).toBe('3h ago');
    expect(card._timeAgo(new Date('2026-01-08T12:00:00Z'))).toBe('2d ago');

    vi.useRealTimers();
  });
});
