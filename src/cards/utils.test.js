import { describe, expect, it, vi } from 'vitest';
import { fireEvent, handleAction, navigate } from './utils.js';

describe('utils', () => {
  it('fireEvent dispatches and returns a CustomEvent', () => {
    const node = document.createElement('div');
    const listener = vi.fn();
    node.addEventListener('demo-event', listener);

    const event = fireEvent(node, 'demo-event', { ok: true });

    expect(event).toBeInstanceOf(CustomEvent);
    expect(event.detail).toEqual({ ok: true });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('navigate pushes history and emits location-changed', () => {
    const pushStateSpy = vi.spyOn(history, 'pushState');
    const listener = vi.fn();
    window.addEventListener('location-changed', listener);

    navigate(window, '/test-path', true);

    expect(pushStateSpy).toHaveBeenCalledWith(null, '', '/test-path');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].detail).toEqual({ replace: true });

    window.removeEventListener('location-changed', listener);
  });

  it('handleAction toggle calls homeassistant toggle service', () => {
    const node = document.createElement('div');
    const hass = { callService: vi.fn() };

    handleAction(node, hass, { entity: 'light.office' }, { action: 'toggle' });

    expect(hass.callService).toHaveBeenCalledWith('homeassistant', 'toggle', {
      entity_id: 'light.office',
    });
  });

  it('handleAction call-service merges data and target entity', () => {
    const node = document.createElement('div');
    const hass = { callService: vi.fn() };

    handleAction(
      node,
      hass,
      {},
      {
        action: 'call-service',
        service: 'light.turn_on',
        service_data: { brightness: 100, entity_id: 'light.old' },
        data: { brightness: 120, transition: 2 },
        target: { entity_id: 'light.new' },
      }
    );

    expect(hass.callService).toHaveBeenCalledWith('light', 'turn_on', {
      brightness: 120,
      transition: 2,
      entity_id: 'light.new',
    });
  });

  it('handleAction assist falls back to hass-toggle-assistant event', () => {
    const node = document.createElement('div');
    const hass = { auth: {} };
    const listener = vi.fn();
    node.addEventListener('hass-toggle-assistant', listener);

    handleAction(node, hass, {}, { action: 'assist' });

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('handleAction url opens target path', () => {
    const node = document.createElement('div');
    const hass = { callService: vi.fn() };
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    handleAction(
      node,
      hass,
      {},
      { action: 'url', url_path: 'https://example.com' }
    );

    expect(openSpy).toHaveBeenCalledWith('https://example.com');
  });
});
