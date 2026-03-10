/**
 * Tests for FoundryHomeThermostatEditor
 *
 * Flat form structure. Note: _handleFormChanged always fires the event
 * (no JSON.stringify diff guard).
 *
 * Covers:
 *  - _configToForm: hex→rgb for plate_color, font_color, title_color
 *  - _formToConfig: rgb→hex reversal
 *  - _handleFormChanged: theme change, plate_color override
 */

import { mockThemes } from './helpers/mock-themes.js';

vi.mock('../src/cards/themes.js', async (importOriginal) => {
  const actual = await importOriginal();
  const helpers = await import('./helpers/mock-themes.js');
  return {
    loadThemes: vi.fn().mockResolvedValue(helpers.mockThemes),
    applyTheme: actual.applyTheme,
  };
});

import '../src/cards/foundry-homethermostat-editor.js';

function makeEditor(configOverrides = {}) {
  const EditorClass = customElements.get('foundry-homethermostat-editor');
  const editor = new EditorClass();
  editor._themes = mockThemes;
  editor._config = {
    entity: 'climate.thermostat',
    title: 'Thermostat',
    theme: 'none',
    ring_style: 'brass',
    plate_color: '#2b2b2b',
    rivet_color: '#6d5d4b',
    font_color: '#ff0055',
    font_bg_color: '#1a1a1a',
    title_color: '#3e2723',
    plate_transparent: false,
    wear_level: 50,
    glass_effect_enabled: true,
    aged_texture: 'everywhere',
    aged_texture_intensity: 50,
    ...configOverrides,
  };
  return editor;
}

function captureEvents(editor) {
  const emitted = [];
  editor.addEventListener('config-changed', (e) =>
    emitted.push(e.detail.config)
  );
  return emitted;
}

describe('FoundryHomeThermostatEditor._configToForm', () => {
  test('converts hex plate_color to rgb array', () => {
    const editor = makeEditor({ plate_color: '#2b2b2b' });
    const data = editor._configToForm(editor._config);
    // '#2b2b2b' → [43, 43, 43]
    expect(data.plate_color).toEqual([43, 43, 43]);
  });

  test('converts hex title_color to rgb array', () => {
    const editor = makeEditor({ title_color: '#3e2723' });
    const data = editor._configToForm(editor._config);
    // '#3e2723' → [62, 39, 35]
    expect(data.title_color).toEqual([62, 39, 35]);
  });

  test('applies theme values when theme is active', () => {
    const editor = makeEditor({ theme: 'brass' });
    const data = editor._configToForm(editor._config);
    // Brass plate_color '#8c7626' → [140, 118, 38]
    expect(data.plate_color).toEqual([140, 118, 38]);
  });
});

describe('FoundryHomeThermostatEditor._formToConfig', () => {
  test('converts rgb plate_color back to hex', () => {
    const editor = makeEditor();
    const config = editor._formToConfig({ plate_color: [43, 43, 43] });
    expect(config.plate_color).toBe('#2b2b2b');
  });

  test('converts rgb title_color back to hex', () => {
    const editor = makeEditor();
    const config = editor._formToConfig({ title_color: [62, 39, 35] });
    expect(config.title_color).toBe('#3e2723');
  });

  test('non-array plate_color (_rgbToHex) returns null', () => {
    const editor = makeEditor();
    const config = editor._formToConfig({ plate_color: '#1a1a1a' });
    expect(config.plate_color).toBeNull();
  });
});

describe('FoundryHomeThermostatEditor._handleFormChanged (theme change)', () => {
  test('applying brass theme populates brass plate_color', async () => {
    const editor = makeEditor({ theme: 'none' });
    const emitted = captureEvents(editor);

    await editor._handleFormChanged({
      detail: {
        value: {
          entity: 'climate.thermostat',
          theme: 'brass',
          title: 'Thermostat',
          plate_color: [43, 43, 43],
          rivet_color: [109, 93, 75],
          font_color: [255, 0, 85],
          font_bg_color: [26, 26, 26],
          title_color: [62, 39, 35],
          ring_style: 'brass',
          plate_transparent: false,
          wear_level: 50,
          glass_effect_enabled: true,
          aged_texture: 'everywhere',
          aged_texture_intensity: 50,
        },
      },
    });

    expect(emitted.length).toBeGreaterThanOrEqual(1);
    // Take the last emitted config (homethermostat always fires)
    const config = emitted[emitted.length - 1];
    expect(config.theme).toBe('brass');
    expect(config.plate_color).toBe('#8c7626');
  });
});

describe('FoundryHomeThermostatEditor._handleFormChanged (override detection)', () => {
  function makeBrassEditor() {
    return makeEditor({
      theme: 'brass',
      plate_color: '#8c7626',
      rivet_color: '#6a5816',
      ring_style: 'brass',
      title_color: '#3e2723',
      font_color: '#1a0a00',
      font_bg_color: '#fffde7',
      wear_level: 40,
      glass_effect_enabled: true,
      aged_texture: 'everywhere',
      aged_texture_intensity: 30,
      plate_transparent: false,
    });
  }

  test('changing plate_color while brass active detaches theme', async () => {
    const editor = makeBrassEditor();
    const emitted = captureEvents(editor);

    await editor._handleFormChanged({
      detail: {
        value: {
          entity: 'climate.thermostat',
          theme: 'brass',
          title: 'Thermostat',
          plate_color: [255, 255, 0], // user changed
          rivet_color: [106, 88, 22],
          ring_style: 'brass',
          title_color: [62, 39, 35],
          font_color: [26, 10, 0],
          font_bg_color: [255, 253, 231],
          wear_level: 40,
          glass_effect_enabled: true,
          aged_texture: 'everywhere',
          aged_texture_intensity: 30,
          plate_transparent: false,
        },
      },
    });

    const config = emitted[emitted.length - 1];
    expect(config.theme).toBe('none');
    expect(config.plate_color).toBe('#ffff00');
  });
});
