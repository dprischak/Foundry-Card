/**
 * Tests for FoundryGaugeCardEditor
 *
 * The gauge editor uses a grouped form structure:
 *   appearance, colors_typography, high_needle, actions
 * _configToForm nests themed props into groups; _formToConfig flattens them back.
 *
 * Covers:
 *  - _configToForm: hex→rgb inside appearance group
 *  - _formToConfig: flattens groups, rgb→hex conversion
 *  - _handleFormChanged: theme change, face_color override detection, non-theme change
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

import '../src/cards/foundry-gauge-editor.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Base flat config (what's stored in YAML / this._config) */
function makeBaseConfig(overrides = {}) {
  return {
    entity: 'sensor.temperature',
    title: 'Gauge',
    theme: 'none',
    plate_color: '#f5f5f5',
    rivet_color: '#6d5d4b',
    ring_style: 'brass',
    face_color: '#f8f8f0',
    needle_color: '#c41e3a',
    number_color: '#3e2723',
    primary_tick_color: '#3e2723',
    secondary_tick_color: '#5d4e37',
    font_color: '#000000',
    font_bg_color: '#ffffff',
    title_color: '#3e2723',
    plate_transparent: false,
    wear_level: 50,
    glass_effect_enabled: true,
    aged_texture: 'everywhere',
    aged_texture_intensity: 50,
    background_style: 'gradient',
    segments: [],
    ...overrides,
  };
}

function makeEditor(configOverrides = {}) {
  const EditorClass = customElements.get('foundry-gauge-card-editor');
  const editor = new EditorClass();
  editor._themes = mockThemes;
  editor._config = makeBaseConfig(configOverrides);
  return editor;
}

function captureEvents(editor) {
  const emitted = [];
  editor.addEventListener('config-changed', (e) =>
    emitted.push(e.detail.config)
  );
  return emitted;
}

/** Build grouped formData that mirrors _configToForm output */
function makeGroupedFormData(flatConfig, themeName = 'none') {
  return {
    entity: flatConfig.entity,
    title: flatConfig.title,
    appearance: {
      theme: themeName,
      ring_style: flatConfig.ring_style ?? 'brass',
      rivet_color: hexToRgb(flatConfig.rivet_color ?? '#6d5d4b'),
      plate_color: hexToRgb(flatConfig.plate_color ?? '#f5f5f5'),
      plate_transparent: flatConfig.plate_transparent ?? false,
      wear_level: flatConfig.wear_level ?? 50,
      glass_effect_enabled: flatConfig.glass_effect_enabled ?? true,
      aged_texture: flatConfig.aged_texture ?? 'everywhere',
      aged_texture_intensity: flatConfig.aged_texture_intensity ?? 50,
      background_style: flatConfig.background_style ?? 'gradient',
      face_color: hexToRgb(flatConfig.face_color ?? '#f8f8f0'),
    },
    colors_typography: {
      needle_color: hexToRgb(flatConfig.needle_color ?? '#C41E3A'),
      number_color: hexToRgb(flatConfig.number_color ?? '#3e2723'),
      primary_tick_color: hexToRgb(flatConfig.primary_tick_color ?? '#3e2723'),
      secondary_tick_color: hexToRgb(
        flatConfig.secondary_tick_color ?? '#5d4e37'
      ),
    },
    high_needle: {
      high_needle_enabled: false,
      high_needle_color: [255, 152, 0],
      high_needle_duration: 3600,
    },
    actions: {
      tap_action_action: 'more-info',
      hold_action_action: 'more-info',
      double_tap_action_action: 'more-info',
    },
  };
}

function hexToRgb(hex) {
  if (!hex || !hex.startsWith('#')) return undefined;
  let c = hex.substring(1);
  if (c.length === 3)
    c = c
      .split('')
      .map((s) => s + s)
      .join('');
  const num = parseInt(c, 16);
  return [num >> 16, (num >> 8) & 255, num & 255];
}

// ---------------------------------------------------------------------------
// _configToForm
// ---------------------------------------------------------------------------

describe('FoundryGaugeCardEditor._configToForm', () => {
  test('nests plate_color as rgb array inside appearance group', () => {
    const editor = makeEditor();
    const data = editor._configToForm(editor._config);
    // '#f5f5f5' → [245, 245, 245]
    expect(data.appearance.plate_color).toEqual([245, 245, 245]);
  });

  test('nests needle_color as rgb inside colors_typography group', () => {
    const editor = makeEditor();
    const data = editor._configToForm(editor._config);
    // '#C41E3A' → [196, 30, 58]
    expect(data.colors_typography.needle_color).toEqual([196, 30, 58]);
  });

  test('applies theme values when theme is active — appearance group', () => {
    const editor = makeEditor({ theme: 'brass' });
    const data = editor._configToForm(editor._config);
    // Brass theme plate_color '#8c7626' → [140, 118, 38]
    expect(data.appearance.plate_color).toEqual([140, 118, 38]);
  });

  test('packs tap/hold/double_tap actions into actions group', () => {
    const editor = makeEditor({
      tap_action: { action: 'navigate', navigation_path: '/lovelace' },
    });
    const data = editor._configToForm(editor._config);
    expect(data.actions.tap_action_action).toBe('navigate');
    expect(data.actions.tap_action_navigation_path).toBe('/lovelace');
  });

  test('deletes flat theme key so it only lives inside appearance', () => {
    const editor = makeEditor({ theme: 'brass' });
    const data = editor._configToForm(editor._config);
    expect(data.theme).toBeUndefined();
    expect(data.appearance.theme).toBe('brass');
  });
});

// ---------------------------------------------------------------------------
// _formToConfig
// ---------------------------------------------------------------------------

describe('FoundryGaugeCardEditor._formToConfig', () => {
  test('flattens appearance group into top-level config', () => {
    const editor = makeEditor();
    const config = editor._formToConfig(
      makeGroupedFormData(editor._config, 'none')
    );
    expect(config.theme).toBe('none');
    expect(config.ring_style).toBe('brass');
  });

  test('converts rgb plate_color from appearance group back to hex', () => {
    const editor = makeEditor();
    const formData = makeGroupedFormData(editor._config, 'none');
    formData.appearance.plate_color = [245, 245, 245];
    const config = editor._formToConfig(formData);
    expect(config.plate_color).toBe('#f5f5f5');
  });

  test('converts rgb needle_color from colors_typography group back to hex', () => {
    const editor = makeEditor();
    const formData = makeGroupedFormData(editor._config, 'none');
    formData.colors_typography.needle_color = [196, 30, 58];
    const config = editor._formToConfig(formData);
    expect(config.needle_color).toBe('#c41e3a');
  });

  test('unpacks navigate tap_action from actions group', () => {
    const editor = makeEditor();
    const formData = makeGroupedFormData(editor._config, 'none');
    formData.actions.tap_action_action = 'navigate';
    formData.actions.tap_action_navigation_path = '/dashboard';
    const config = editor._formToConfig(formData);
    expect(config.tap_action).toEqual({
      action: 'navigate',
      navigation_path: '/dashboard',
    });
  });

  test('removes group keys from resulting config', () => {
    const editor = makeEditor();
    const config = editor._formToConfig(
      makeGroupedFormData(editor._config, 'none')
    );
    expect(config.appearance).toBeUndefined();
    expect(config.colors_typography).toBeUndefined();
    expect(config.high_needle).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// _handleFormChanged — theme change
// ---------------------------------------------------------------------------

describe('FoundryGaugeCardEditor._handleFormChanged (theme change)', () => {
  test('applying brass theme populates brass plate_color in flat config', async () => {
    const editor = makeEditor({ theme: 'none' });
    const emitted = captureEvents(editor);

    const formData = makeGroupedFormData(editor._config, 'brass');
    await editor._handleFormChanged({ detail: { value: formData } });

    expect(emitted).toHaveLength(1);
    expect(emitted[0].theme).toBe('brass');
    expect(emitted[0].plate_color).toBe('#8c7626');
    expect(emitted[0].ring_style).toBe('brass');
  });
});

// ---------------------------------------------------------------------------
// _handleFormChanged — override detection
// ---------------------------------------------------------------------------

describe('FoundryGaugeCardEditor._handleFormChanged (override detection)', () => {
  function makeBrassEditor() {
    return makeEditor({
      theme: 'brass',
      plate_color: '#8c7626',
      rivet_color: '#6a5816',
      ring_style: 'brass',
      wear_level: 40,
      glass_effect_enabled: true,
      aged_texture: 'everywhere',
      aged_texture_intensity: 30,
      plate_transparent: false,
      font_color: '#1a0a00',
      font_bg_color: '#fffde7',
    });
  }

  test('changing face_color while brass active detaches theme', async () => {
    const editor = makeBrassEditor();
    const emitted = captureEvents(editor);

    const formData = makeGroupedFormData(editor._config, 'brass');
    // Simulate user changing face_color from brass default to pure red
    formData.appearance.face_color = [255, 0, 0];
    await editor._handleFormChanged({ detail: { value: formData } });

    expect(emitted).toHaveLength(1);
    expect(emitted[0].theme).toBe('none');
    expect(emitted[0].face_color).toBe('#ff0000');
    // Non-overridden props retain brass values
    expect(emitted[0].plate_color).toBe('#8c7626');
  });

  test('changing only title does not detach theme', async () => {
    const editor = makeBrassEditor();
    const emitted = captureEvents(editor);

    const formData = makeGroupedFormData(editor._config, 'brass');
    formData.title = 'New Title';
    await editor._handleFormChanged({ detail: { value: formData } });

    expect(emitted).toHaveLength(1);
    expect(emitted[0].theme).toBe('brass');
    expect(emitted[0].title).toBe('New Title');
    expect(emitted[0].plate_color).toBe('#8c7626');
  });
});

// ---------------------------------------------------------------------------
// Entity theme — _handleFormChanged
// ---------------------------------------------------------------------------

describe('FoundryGaugeCardEditor._handleFormChanged (entity theme)', () => {
  function makeEntityEditor() {
    // Simulate a config that was previously stamped with brass values
    // when the user switched to entity theme (same as what _handleFormChanged does).
    const editor = makeEditor({
      theme: 'entity',
      themeentity: 'input_select.gauge_theme',
      // Brass-stamped values (matching mockThemes.brass)
      plate_color: '#8c7626',
      rivet_color: '#6a5816',
      ring_style: 'brass',
      font_color: '#1a0a00',
      font_bg_color: '#fffde7',
      number_color: '#3e2723',
      wear_level: 40,
      glass_effect_enabled: true,
      aged_texture: 'everywhere',
      aged_texture_intensity: 30,
      plate_transparent: false,
    });
    // Simulate hass with the entity pointing to the 'brass' theme
    editor._hass = {
      states: {
        'input_select.gauge_theme': { state: 'brass' },
      },
    };
    return editor;
  }

  test('switching to entity theme applies the live entity theme values', async () => {
    const editor = makeEditor({ theme: 'none' });
    editor._hass = {
      states: {
        'input_select.gauge_theme': { state: 'brass' },
      },
    };
    const emitted = captureEvents(editor);

    const formData = makeGroupedFormData(editor._config, 'entity');
    formData.appearance.themeentity = 'input_select.gauge_theme';
    await editor._handleFormChanged({ detail: { value: formData } });

    expect(emitted).toHaveLength(1);
    expect(emitted[0].theme).toBe('entity');
    // Brass theme values should be applied
    expect(emitted[0].plate_color).toBe('#8c7626');
    expect(emitted[0].ring_style).toBe('brass');
  });

  test('changing ring_style while entity theme is active detaches theme to none', async () => {
    const editor = makeEntityEditor();
    const emitted = captureEvents(editor);

    const formData = makeGroupedFormData(editor._config, 'entity');
    formData.appearance.themeentity = 'input_select.gauge_theme';
    formData.appearance.ring_style = 'chrome'; // override a themed prop
    await editor._handleFormChanged({ detail: { value: formData } });

    expect(emitted).toHaveLength(1);
    expect(emitted[0].theme).toBe('none');
    expect(emitted[0].ring_style).toBe('chrome');
    // Non-overridden themed props stay from brass
    expect(emitted[0].plate_color).toBe('#8c7626');
  });

  test('changing only title while entity theme is active keeps entity theme', async () => {
    const editor = makeEntityEditor();
    const emitted = captureEvents(editor);

    const formData = makeGroupedFormData(editor._config, 'entity');
    formData.appearance.themeentity = 'input_select.gauge_theme';
    formData.title = 'Updated Title';
    await editor._handleFormChanged({ detail: { value: formData } });

    expect(emitted).toHaveLength(1);
    expect(emitted[0].theme).toBe('entity');
    expect(emitted[0].title).toBe('Updated Title');
  });

  test('_configToForm applies live entity theme values for display', () => {
    const editor = makeEntityEditor();
    const data = editor._configToForm(editor._config);
    // Should show brass plate_color in the form
    expect(data.appearance.plate_color).toEqual([140, 118, 38]); // '#8c7626'
    expect(data.appearance.theme).toBe('entity');
  });

  test('_configToForm uses raw config when themeentity entity not in hass states', () => {
    const editor = makeEntityEditor();
    editor._hass = { states: {} }; // entity missing
    const data = editor._configToForm(editor._config);
    // Falls back to raw config value (no theme applied)
    expect(data.appearance.plate_color).toEqual([140, 118, 38]); // '#8c7626' from raw config
  });
});
