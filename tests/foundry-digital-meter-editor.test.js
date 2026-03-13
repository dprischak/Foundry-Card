/**
 * Tests for FoundryDigitalMeterCardEditor
 *
 * Grouped form: appearance (plate_color, rivet_color, face_color),
 * style_fonts_ticks (number_color, tick colors, animation_duration),
 * actions.
 *
 * NOTE: No needle_color in this editor (digital meter has no needle).
 *
 * Covers:
 *  - _configToForm: hex→rgb into groups; bottom_entity as flat key
 *  - _formToConfig: flattens groups, rgb→hex; no needle_color written
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

import '../src/cards/foundry-digital-meter-editor.js';

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

function makeEditor(configOverrides = {}) {
  const EditorClass = customElements.get('foundry-digital-meter-card-editor');
  const editor = new EditorClass();
  editor._themes = mockThemes;
  editor._config = {
    entity: 'sensor.level_left',
    bottom_entity: 'sensor.level_right',
    title: 'L',
    bottom_title: 'R',
    min: -60,
    max: 0,
    unit: 'dB',
    theme: 'none',
    ring_style: 'brass',
    plate_color: '#1a1a1a',
    rivet_color: '#6a5816',
    face_color: '#111111',
    number_color: '#9e9e9e',
    primary_tick_color: '#616161',
    secondary_tick_color: '#424242',
    font_color: '#000000',
    font_bg_color: '#ffffff',
    plate_transparent: false,
    glass_effect_enabled: true,
    wear_level: 30,
    aged_texture: 'glass_only',
    aged_texture_intensity: 15,
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

function makeGroupedFormData(flatConfig, themeName) {
  return {
    entity: flatConfig.entity,
    bottom_entity: flatConfig.bottom_entity,
    title: flatConfig.title,
    bottom_title: flatConfig.bottom_title,
    min: flatConfig.min,
    max: flatConfig.max,
    unit: flatConfig.unit,
    appearance: {
      theme: themeName ?? flatConfig.theme ?? 'none',
      ring_style: flatConfig.ring_style ?? 'brass',
      plate_color: hexToRgb(flatConfig.plate_color ?? '#1a1a1a'),
      rivet_color: hexToRgb(flatConfig.rivet_color ?? '#6a5816'),
      face_color: hexToRgb(flatConfig.face_color ?? '#111111'),
      plate_transparent: flatConfig.plate_transparent ?? false,
      glass_effect_enabled: flatConfig.glass_effect_enabled ?? true,
      wear_level: flatConfig.wear_level ?? 30,
      aged_texture: flatConfig.aged_texture ?? 'glass_only',
      aged_texture_intensity: flatConfig.aged_texture_intensity ?? 15,
      background_style: flatConfig.background_style ?? 'gradient',
    },
    style_fonts_ticks: {
      number_color: hexToRgb(flatConfig.number_color ?? '#9e9e9e'),
      primary_tick_color: hexToRgb(flatConfig.primary_tick_color ?? '#616161'),
      secondary_tick_color: hexToRgb(
        flatConfig.secondary_tick_color ?? '#424242'
      ),
    },
    actions: {
      tap_action_action: 'more-info',
      hold_action_action: 'more-info',
      double_tap_action_action: 'more-info',
    },
  };
}

// =============================================================================
describe('FoundryDigitalMeterCardEditor._configToForm', () => {
  test('nests plate_color as rgb in appearance group', () => {
    const editor = makeEditor();
    const data = editor._configToForm(editor._config);
    // '#1a1a1a' → [26, 26, 26]
    expect(data.appearance.plate_color).toEqual([26, 26, 26]);
  });

  test('nests number_color as rgb in style_fonts_ticks group', () => {
    const editor = makeEditor({ number_color: '#9e9e9e' });
    const data = editor._configToForm(editor._config);
    // '#9e9e9e' → [158, 158, 158]
    expect(data.style_fonts_ticks.number_color).toEqual([158, 158, 158]);
  });

  test('bottom_entity passes through as a flat key', () => {
    const editor = makeEditor({ bottom_entity: 'sensor.level_right' });
    const data = editor._configToForm(editor._config);
    expect(data.bottom_entity).toBe('sensor.level_right');
  });

  test('appearance group does NOT contain needle_color', () => {
    const editor = makeEditor();
    const data = editor._configToForm(editor._config);
    expect(data.appearance).not.toHaveProperty('needle_color');
    expect(data.style_fonts_ticks).not.toHaveProperty('needle_color');
  });

  test('applies brass theme values into appearance group', () => {
    const editor = makeEditor({ theme: 'brass' });
    const data = editor._configToForm(editor._config);
    // brass theme from mockThemes sets plate_color: '#8c7626' → [140, 118, 38]
    expect(data.appearance.plate_color).toEqual([140, 118, 38]);
  });
});

// =============================================================================
describe('FoundryDigitalMeterCardEditor._formToConfig', () => {
  test('flattens appearance and converts plate_color to hex', () => {
    const editor = makeEditor();
    const config = editor._formToConfig(
      makeGroupedFormData(editor._config, 'none')
    );
    expect(config.plate_color).toBe('#1a1a1a');
  });

  test('flattens style_fonts_ticks and converts number_color to hex', () => {
    const editor = makeEditor();
    const config = editor._formToConfig(
      makeGroupedFormData(editor._config, 'none')
    );
    expect(config.number_color).toBe('#9e9e9e');
  });

  test('removes group keys from resulting config', () => {
    const editor = makeEditor();
    const config = editor._formToConfig(
      makeGroupedFormData(editor._config, 'none')
    );
    expect(config.appearance).toBeUndefined();
    expect(config.style_fonts_ticks).toBeUndefined();
  });

  test('does NOT write needle_color to config', () => {
    const editor = makeEditor();
    const config = editor._formToConfig(
      makeGroupedFormData(editor._config, 'none')
    );
    expect(config.needle_color).toBeUndefined();
  });

  test('preserves bottom_entity as flat root key', () => {
    const editor = makeEditor({ bottom_entity: 'sensor.level_right' });
    const config = editor._formToConfig(
      makeGroupedFormData(editor._config, 'none')
    );
    expect(config.bottom_entity).toBe('sensor.level_right');
  });
});

// =============================================================================
describe('FoundryDigitalMeterCardEditor._handleFormChanged (theme change)', () => {
  test('applying brass theme gives brass plate_color', async () => {
    const editor = makeEditor({ theme: 'none' });
    const emitted = captureEvents(editor);

    await editor._handleFormChanged({
      detail: { value: makeGroupedFormData(editor._config, 'brass') },
    });

    expect(emitted).toHaveLength(1);
    expect(emitted[0].theme).toBe('brass');
    expect(emitted[0].plate_color).toBe('#8c7626');
  });
});

// =============================================================================
describe('FoundryDigitalMeterCardEditor._handleFormChanged (override detection)', () => {
  function makeBrassEditor() {
    return makeEditor({
      theme: 'brass',
      // Match every property that the brass mock theme defines exactly,
      // to avoid false-positive override detection.
      plate_color: '#8c7626',
      rivet_color: '#6a5816',
      ring_style: 'brass',
      font_color: '#1a0a00',
      font_bg_color: '#fffde7',
      number_color: '#3e2723', // set by brass theme
      wear_level: 40, // set by brass theme
      glass_effect_enabled: true, // set by brass theme
      aged_texture: 'everywhere', // set by brass theme
      aged_texture_intensity: 30, // set by brass theme
      plate_transparent: false, // set by brass theme
    });
  }

  // Build form data aligned with the mock brass theme so that only the
  // intentional change (e.g. plate_color) appears as an override.
  function makeBrassFormData(editor, themeName) {
    const fd = makeGroupedFormData(editor._config, themeName);
    // Remove fields not set by brass mock theme to avoid false-positive overrides:
    // primary_tick_color and secondary_tick_color are not in the brass theme.
    delete fd.style_fonts_ticks.primary_tick_color;
    delete fd.style_fonts_ticks.secondary_tick_color;
    // background_style and face_color are not in the brass theme.
    delete fd.appearance.background_style;
    delete fd.appearance.face_color;
    return fd;
  }

  test('changing plate_color while brass active detaches theme', async () => {
    const editor = makeBrassEditor();
    const emitted = captureEvents(editor);

    const formData = makeBrassFormData(editor, 'brass');
    formData.appearance.plate_color = [128, 0, 128]; // purple override
    await editor._handleFormChanged({ detail: { value: formData } });

    expect(emitted).toHaveLength(1);
    expect(emitted[0].theme).toBe('none');
    expect(emitted[0].plate_color).toBe('#800080');
    expect(emitted[0].ring_style).toBe('brass');
  });

  test('changing only title stays on theme', async () => {
    const editor = makeBrassEditor();
    const emitted = captureEvents(editor);

    const formData = makeBrassFormData(editor, 'brass');
    formData.title = 'Left';
    await editor._handleFormChanged({ detail: { value: formData } });

    expect(emitted).toHaveLength(1);
    expect(emitted[0].theme).toBe('brass');
    expect(emitted[0].title).toBe('Left');
  });

  test('changing bottom_entity stays on theme', async () => {
    const editor = makeBrassEditor();
    const emitted = captureEvents(editor);

    const formData = makeBrassFormData(editor, 'brass');
    formData.bottom_entity = 'sensor.new_entity';
    await editor._handleFormChanged({ detail: { value: formData } });

    expect(emitted).toHaveLength(1);
    expect(emitted[0].theme).toBe('brass');
    expect(emitted[0].bottom_entity).toBe('sensor.new_entity');
  });
});
