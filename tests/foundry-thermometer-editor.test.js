/**
 * Tests for FoundryThermometerEditor
 *
 * Flat form structure with liquid_color, face_color, plate_color, rivet_color.
 *
 * Covers:
 *  - _configToForm: hex→rgb for liquid_color and plate_color
 *  - _formToConfig: rgb→hex reversal
 *  - _handleFormChanged: theme change, plate_color override detection
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

import '../src/cards/foundry-thermometer-editor.js';

function makeEditor(configOverrides = {}) {
  const EditorClass = customElements.get('foundry-thermometer-editor');
  const editor = new EditorClass();
  editor._themes = mockThemes;
  editor._config = {
    entity: 'sensor.temperature',
    title: 'Thermometer',
    theme: 'none',
    ring_style: 'brass',
    plate_color: '#f5f5f5',
    rivet_color: '#6d5d4b',
    liquid_color: '#cc0000',
    face_color: '#f8f8f0',
    number_color: '#3e2723',
    primary_tick_color: '#000000',
    secondary_tick_color: '#000000',
    font_bg_color: '#ffffff',
    plate_transparent: false,
    wear_level: 50,
    aged_texture: 'everywhere',
    aged_texture_intensity: 50,
    background_style: 'gradient',
    segments: [],
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

describe('FoundryThermometerEditor._configToForm', () => {
  test('converts hex plate_color to rgb array', () => {
    const editor = makeEditor();
    const data = editor._configToForm(editor._config);
    // '#f5f5f5' → [245, 245, 245]
    expect(data.plate_color).toEqual([245, 245, 245]);
  });

  test('converts hex liquid_color to rgb array', () => {
    const editor = makeEditor({ liquid_color: '#cc0000' });
    const data = editor._configToForm(editor._config);
    // '#cc0000' → [204, 0, 0]
    expect(data.liquid_color).toEqual([204, 0, 0]);
  });

  test('converts hex face_color to rgb array', () => {
    const editor = makeEditor({ face_color: '#f8f8f0' });
    const data = editor._configToForm(editor._config);
    // '#f8f8f0' → [248, 248, 240]
    expect(data.face_color).toEqual([248, 248, 240]);
  });

  test('applies theme values when theme is active', () => {
    const editor = makeEditor({ theme: 'brass' });
    const data = editor._configToForm(editor._config);
    expect(data.plate_color).toEqual([140, 118, 38]);
  });
});

describe('FoundryThermometerEditor._formToConfig', () => {
  test('converts rgb plate_color back to hex', () => {
    const editor = makeEditor();
    const config = editor._formToConfig({ plate_color: [245, 245, 245] });
    expect(config.plate_color).toBe('#f5f5f5');
  });

  test('converts rgb liquid_color back to hex', () => {
    const editor = makeEditor();
    const config = editor._formToConfig({ liquid_color: [204, 0, 0] });
    expect(config.liquid_color).toBe('#cc0000');
  });

  test('preserves segments from existing config', () => {
    const segs = [{ from: 0, to: 50, color: '#4CAF50' }];
    const editor = makeEditor({ segments: segs });
    const config = editor._formToConfig({});
    expect(config.segments).toEqual(segs);
  });
});

describe('FoundryThermometerEditor._handleFormChanged (theme change)', () => {
  test('applying brass theme sets brass plate_color', async () => {
    const editor = makeEditor({ theme: 'none' });
    const emitted = captureEvents(editor);

    await editor._handleFormChanged({
      detail: {
        value: {
          entity: 'sensor.temperature',
          theme: 'brass',
          title: 'Thermometer',
          plate_color: [245, 245, 245],
          rivet_color: [109, 93, 75],
          liquid_color: [204, 0, 0],
          face_color: [248, 248, 240],
          number_color: [62, 39, 35],
          primary_tick_color: [0, 0, 0],
          secondary_tick_color: [0, 0, 0],
          font_bg_color: [255, 255, 255],
          ring_style: 'brass',
          plate_transparent: false,
          wear_level: 50,
          aged_texture: 'everywhere',
          aged_texture_intensity: 50,
        },
      },
    });

    expect(emitted).toHaveLength(1);
    expect(emitted[0].theme).toBe('brass');
    expect(emitted[0].plate_color).toBe('#8c7626');
  });
});

describe('FoundryThermometerEditor._handleFormChanged (override detection)', () => {
  function makeBrassEditor() {
    return makeEditor({
      theme: 'brass',
      plate_color: '#8c7626',
      rivet_color: '#6a5816',
      ring_style: 'brass',
      wear_level: 40,
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
          entity: 'sensor.temperature',
          theme: 'brass',
          title: 'Thermometer',
          plate_color: [0, 0, 255], // user changed
          rivet_color: [106, 88, 22],
          ring_style: 'brass',
          liquid_color: [204, 0, 0],
          face_color: [248, 248, 240],
          number_color: [62, 39, 35],
          primary_tick_color: [0, 0, 0],
          secondary_tick_color: [0, 0, 0],
          font_bg_color: [255, 255, 255],
          wear_level: 40,
          aged_texture: 'everywhere',
          aged_texture_intensity: 30,
          plate_transparent: false,
        },
      },
    });

    expect(emitted).toHaveLength(1);
    expect(emitted[0].theme).toBe('none');
    expect(emitted[0].plate_color).toBe('#0000ff');
  });

  test('changing only title stays on theme', async () => {
    const editor = makeBrassEditor();
    const emitted = captureEvents(editor);

    await editor._handleFormChanged({
      detail: {
        value: {
          entity: 'sensor.temperature',
          theme: 'brass',
          title: 'New Title',
          plate_color: [140, 118, 38],
          rivet_color: [106, 88, 22],
          ring_style: 'brass',
          liquid_color: [204, 0, 0],
          face_color: [248, 248, 240],
          number_color: [62, 39, 35],
          primary_tick_color: [0, 0, 0],
          secondary_tick_color: [0, 0, 0],
          font_bg_color: [255, 255, 255],
          wear_level: 40,
          aged_texture: 'everywhere',
          aged_texture_intensity: 30,
          plate_transparent: false,
        },
      },
    });

    expect(emitted).toHaveLength(1);
    expect(emitted[0].theme).toBe('brass');
    expect(emitted[0].title).toBe('New Title');
  });
});
