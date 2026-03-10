/**
 * Tests for FoundryEntitiesEditor
 *
 * Covers:
 *  - _configToForm: hex→rgb conversion, entity stripping, theme-pre-apply
 *  - _formToConfig: rgb→hex reversal, entity object preservation
 *  - _handleFormChanged: theme change, override detection, non-theme change, no-op
 *  - _handleSingleEntityChange: string/object entity management, decimals handling
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

// Import registers the custom element
import '../src/cards/foundry-entities-editor.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeEditor(config = {}) {
  const EditorClass = customElements.get('foundry-entities-editor');
  const editor = new EditorClass();
  editor._themes = mockThemes;
  editor._config = {
    entities: ['sensor.temperature'],
    theme: 'none',
    title: 'Test',
    title_color: '#3e2723',
    title_font_size: 14,
    plate_color: '#f5f5f5',
    rivet_color: '#6d5d4b',
    font_color: '#000000',
    font_bg_color: '#ffffff',
    ring_style: 'brass',
    plate_transparent: false,
    wear_level: 50,
    glass_effect_enabled: true,
    aged_texture: 'everywhere',
    aged_texture_intensity: 50,
    ...config,
  };
  return editor;
}

/** Capture config-changed events emitted from the editor */
function captureEvents(editor) {
  const emitted = [];
  editor.addEventListener('config-changed', (e) =>
    emitted.push(e.detail.config)
  );
  return emitted;
}

// ---------------------------------------------------------------------------
// _configToForm
// ---------------------------------------------------------------------------

describe('FoundryEntitiesEditor._configToForm', () => {
  test('converts hex plate_color to rgb array', () => {
    const editor = makeEditor();
    const data = editor._configToForm(editor._config);
    // '#f5f5f5' → [245, 245, 245]
    expect(data.plate_color).toEqual([245, 245, 245]);
  });

  test('converts hex rivet_color to rgb array', () => {
    const editor = makeEditor();
    const data = editor._configToForm(editor._config);
    // '#6d5d4b' → [109, 93, 75]
    expect(data.rivet_color).toEqual([109, 93, 75]);
  });

  test('strips entity objects down to their string IDs', () => {
    const editor = makeEditor({
      entities: [{ entity: 'sensor.temperature', decimals: 2 }],
    });
    const data = editor._configToForm(editor._config);
    expect(data.entities).toEqual(['sensor.temperature']);
  });

  test('keeps plain string entities as-is', () => {
    const editor = makeEditor({
      entities: ['sensor.temperature', 'sensor.humidity'],
    });
    const data = editor._configToForm(editor._config);
    expect(data.entities).toEqual(['sensor.temperature', 'sensor.humidity']);
  });

  test('applies theme values before conversion when theme is active', () => {
    const editor = makeEditor({ theme: 'brass' });
    const data = editor._configToForm(editor._config);
    // Brass theme plate_color is '#8c7626' → [140, 118, 38]
    expect(data.plate_color).toEqual([140, 118, 38]);
  });

  test('applies theme default ring_style when theme is active', () => {
    const editor = makeEditor({ theme: 'brass', ring_style: undefined });
    const data = editor._configToForm(editor._config);
    expect(data.ring_style).toBe('brass');
  });
});

// ---------------------------------------------------------------------------
// _formToConfig
// ---------------------------------------------------------------------------

describe('FoundryEntitiesEditor._formToConfig', () => {
  test('converts rgb plate_color array back to hex', () => {
    const editor = makeEditor();
    const config = editor._formToConfig({ plate_color: [245, 245, 245] });
    expect(config.plate_color).toBe('#f5f5f5');
  });

  test('converts rgb rivet_color array back to hex', () => {
    const editor = makeEditor();
    const config = editor._formToConfig({ rivet_color: [109, 93, 75] });
    expect(config.rivet_color).toBe('#6d5d4b');
  });

  test('non-array plate_color (_rgbToHex) returns null', () => {
    const editor = makeEditor();
    const config = editor._formToConfig({ plate_color: '#8c7626' });
    expect(config.plate_color).toBeNull();
  });

  test('preserves per-entity object when entity ID matches', () => {
    const editor = makeEditor({
      entities: [{ entity: 'sensor.temperature', decimals: 2, name: 'Temp' }],
    });
    const config = editor._formToConfig({ entities: ['sensor.temperature'] });
    expect(config.entities[0]).toEqual({
      entity: 'sensor.temperature',
      decimals: 2,
      name: 'Temp',
    });
  });

  test('creates plain string when entity is new (not in existing map)', () => {
    const editor = makeEditor({ entities: ['sensor.temperature'] });
    const config = editor._formToConfig({ entities: ['sensor.humidity'] });
    expect(config.entities[0]).toBe('sensor.humidity');
  });

  test('preserves existing config fields not in formData', () => {
    const editor = makeEditor({ title: 'Original' });
    const config = editor._formToConfig({ plate_color: [1, 2, 3] });
    expect(config.title).toBe('Original');
  });

  test('does not touch entities when formData.entities is undefined', () => {
    const original = [{ entity: 'sensor.temperature', decimals: 3 }];
    const editor = makeEditor({ entities: original });
    const config = editor._formToConfig({ title: 'Changed' });
    expect(config.entities).toEqual(original);
  });
});

// ---------------------------------------------------------------------------
// _handleFormChanged — theme change (branch 1)
// ---------------------------------------------------------------------------

describe('FoundryEntitiesEditor._handleFormChanged (theme change)', () => {
  test('applying brass theme populates brass-theme properties', async () => {
    const editor = makeEditor({ theme: 'none' });
    const emitted = captureEvents(editor);

    await editor._handleFormChanged({
      detail: {
        value: {
          entities: ['sensor.temperature'],
          theme: 'brass',
          title: 'Test',
          title_color: [62, 39, 35],
          title_font_size: 14,
          plate_color: [245, 245, 245],
          rivet_color: [109, 93, 75],
          font_color: [0, 0, 0],
          font_bg_color: [255, 255, 255],
          ring_style: 'brass',
          plate_transparent: false,
          wear_level: 50,
          glass_effect_enabled: true,
          aged_texture: 'everywhere',
          aged_texture_intensity: 50,
        },
      },
    });

    expect(emitted).toHaveLength(1);
    expect(emitted[0].theme).toBe('brass');
    expect(emitted[0].plate_color).toBe('#8c7626');
    expect(emitted[0].rivet_color).toBe('#6a5816');
    expect(emitted[0].ring_style).toBe('brass');
  });

  test('switching from brass to dark applies dark theme', async () => {
    const editor = makeEditor({
      theme: 'brass',
      plate_color: '#8c7626',
      rivet_color: '#6a5816',
      ring_style: 'brass',
    });
    const emitted = captureEvents(editor);

    await editor._handleFormChanged({
      detail: {
        value: {
          entities: ['sensor.temperature'],
          theme: 'dark',
          title: 'Test',
          plate_color: [140, 118, 38],
          rivet_color: [106, 88, 22],
          ring_style: 'brass',
        },
      },
    });

    expect(emitted).toHaveLength(1);
    expect(emitted[0].theme).toBe('dark');
    expect(emitted[0].plate_color).toBe('#1a1a1a');
    expect(emitted[0].ring_style).toBe('black');
  });
});

// ---------------------------------------------------------------------------
// _handleFormChanged — override detection (branch 2)
// ---------------------------------------------------------------------------

describe('FoundryEntitiesEditor._handleFormChanged (override detection)', () => {
  function makeBrassEditor() {
    return makeEditor({
      theme: 'brass',
      plate_color: '#8c7626',
      rivet_color: '#6a5816',
      ring_style: 'brass',
      title_color: '#3e2723',
      font_color: '#1a0a00',
      font_bg_color: '#fffde7',
      number_color: '#3e2723',
      wear_level: 40,
      glass_effect_enabled: true,
      aged_texture: 'everywhere',
      aged_texture_intensity: 30,
      plate_transparent: false,
    });
  }

  test('changing plate_color while theme is brass detaches theme to none', async () => {
    const editor = makeBrassEditor();
    const emitted = captureEvents(editor);

    // Simulate: user changed plate_color from brass (#8c7626) to red (#ff0000)
    await editor._handleFormChanged({
      detail: {
        value: {
          entities: ['sensor.temperature'],
          theme: 'brass',
          title: 'Test',
          plate_color: [255, 0, 0], // user changed this
          rivet_color: [106, 88, 22],
          ring_style: 'brass',
          title_color: [62, 39, 35],
          font_color: [26, 10, 0],
          font_bg_color: [255, 253, 231],
          number_color: [62, 39, 35],
          wear_level: 40,
          glass_effect_enabled: true,
          aged_texture: 'everywhere',
          aged_texture_intensity: 30,
          plate_transparent: false,
        },
      },
    });

    expect(emitted).toHaveLength(1);
    expect(emitted[0].theme).toBe('none');
    expect(emitted[0].plate_color).toBe('#ff0000');
    // Non-overridden props should retain brass theme values
    expect(emitted[0].ring_style).toBe('brass');
    expect(emitted[0].rivet_color).toBe('#6a5816');
  });

  test('non-theme field change keeps theme intact', async () => {
    const editor = makeBrassEditor();
    const emitted = captureEvents(editor);

    // User changed title only — no theme property changed
    await editor._handleFormChanged({
      detail: {
        value: {
          entities: ['sensor.temperature'],
          theme: 'brass',
          title: 'New Title', // only this changed
          plate_color: [140, 118, 38], // same as brass
          rivet_color: [106, 88, 22],
          ring_style: 'brass',
          title_color: [62, 39, 35],
          font_color: [26, 10, 0],
          font_bg_color: [255, 253, 231],
          number_color: '#3e2723',
          wear_level: 40,
          glass_effect_enabled: true,
          aged_texture: 'everywhere',
          aged_texture_intensity: 30,
          plate_transparent: false,
        },
      },
    });

    expect(emitted).toHaveLength(1);
    expect(emitted[0].theme).toBe('brass');
    expect(emitted[0].title).toBe('New Title');
    expect(emitted[0].plate_color).toBe('#8c7626');
  });

  test('no event fired when config is identical to current', async () => {
    const editor = makeBrassEditor();
    const emitted = captureEvents(editor);

    // Form produces exact same config as current
    await editor._handleFormChanged({
      detail: {
        value: {
          entities: ['sensor.temperature'],
          theme: 'brass',
          title: 'Test', // same as makeEditor default
          plate_color: [140, 118, 38],
          rivet_color: [106, 88, 22],
          ring_style: 'brass',
          title_color: [62, 39, 35],
          font_color: [26, 10, 0],
          font_bg_color: [255, 253, 231],
          number_color: '#3e2723',
          wear_level: 40,
          glass_effect_enabled: true,
          aged_texture: 'everywhere',
          aged_texture_intensity: 30,
          plate_transparent: false,
        },
      },
    });

    // Either no event, or if theme wasn't changed and no override detected, still no event
    // because JSON.stringify diff guard fires only when config actually changed
    // (plate_color in form = '#8c7626' from _rgbToHex([140, 118, 38]), same as _config.plate_color)
    expect(emitted).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// _handleSingleEntityChange
// ---------------------------------------------------------------------------

describe('FoundryEntitiesEditor._handleSingleEntityChange', () => {
  test('reverts to plain string when all fields are blank/default', () => {
    const editor = makeEditor({
      entities: [{ entity: 'sensor.temperature', name: 'Temp', decimals: 2 }],
    });
    const emitted = captureEvents(editor);

    editor._handleSingleEntityChange(0, {
      name: '',
      secondary_info: 'none',
      decimals: '',
      time_format: 'default',
      clock_format: 'local',
    });

    expect(emitted).toHaveLength(1);
    expect(emitted[0].entities[0]).toBe('sensor.temperature');
  });

  test('creates object entity when name is provided', () => {
    const editor = makeEditor({ entities: ['sensor.temperature'] });
    const emitted = captureEvents(editor);

    editor._handleSingleEntityChange(0, {
      name: 'My Sensor',
      secondary_info: 'none',
      decimals: '',
    });

    expect(emitted[0].entities[0]).toMatchObject({
      entity: 'sensor.temperature',
      name: 'My Sensor',
    });
    expect(emitted[0].entities[0].decimals).toBeUndefined();
  });

  test('creates object entity with decimals', () => {
    const editor = makeEditor({ entities: ['sensor.temperature'] });
    const emitted = captureEvents(editor);

    editor._handleSingleEntityChange(0, {
      name: '',
      secondary_info: 'none',
      decimals: '2',
    });

    expect(emitted[0].entities[0]).toMatchObject({
      entity: 'sensor.temperature',
      decimals: 2,
    });
  });

  test('creates object entity with integer-parsed decimals', () => {
    const editor = makeEditor({ entities: ['sensor.temperature'] });
    const emitted = captureEvents(editor);

    editor._handleSingleEntityChange(0, {
      name: '',
      secondary_info: 'none',
      decimals: 3,
    });

    expect(emitted[0].entities[0].decimals).toBe(3);
  });

  test('handles object entity as source (preserves entity ID)', () => {
    const editor = makeEditor({
      entities: [{ entity: 'sensor.temperature', decimals: 1 }],
    });
    const emitted = captureEvents(editor);

    editor._handleSingleEntityChange(0, {
      name: 'New Name',
      secondary_info: 'none',
      decimals: '',
    });

    expect(emitted[0].entities[0].entity).toBe('sensor.temperature');
    expect(emitted[0].entities[0].name).toBe('New Name');
  });

  test('does not affect other entities in the array', () => {
    const editor = makeEditor({
      entities: ['sensor.temperature', 'sensor.humidity'],
    });
    captureEvents(editor);

    editor._handleSingleEntityChange(0, {
      name: 'Temp',
      secondary_info: 'none',
      decimals: '',
    });

    expect(editor._config.entities[1]).toBe('sensor.humidity');
  });
});
