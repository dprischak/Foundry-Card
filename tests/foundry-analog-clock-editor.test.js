/**
 * Tests for FoundryAnalogClockCardEditor
 *
 * Grouped form: appearance (plate_color, rivet_color, face_color),
 * colors_typography (hour_hand_color, minute_hand_color, second_hand_color).
 * Clock-specific themeProperties include hour/minute/second hand colors.
 *
 * Covers:
 *  - _configToForm: hex→rgb inside groups, flat keys deleted
 *  - _formToConfig: flattens groups, rgb→hex
 *  - _handleFormChanged: theme change, plate_color override, non-theme change
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

import '../src/cards/foundry-analog-clock-editor.js';

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
  const EditorClass = customElements.get('foundry-analog-clock-editor');
  const editor = new EditorClass();
  editor._themes = mockThemes;
  editor._config = {
    title: 'Clock',
    theme: 'none',
    ring_style: 'brass',
    plate_color: '#8c7626',
    rivet_color: '#6a5816',
    face_color: '#f8f8f0',
    hour_hand_color: '#3e2723',
    minute_hand_color: '#3e2723',
    second_hand_color: '#C41E3A',
    number_color: '#3e2723',
    primary_tick_color: '#3e2723',
    secondary_tick_color: '#5d4e37',
    plate_transparent: false,
    background_style: 'gradient',
    glass_effect_enabled: true,
    wear_level: 40,
    aged_texture: 'everywhere',
    aged_texture_intensity: 30,
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
    title: flatConfig.title,
    appearance: {
      theme: themeName ?? flatConfig.theme ?? 'none',
      ring_style: flatConfig.ring_style ?? 'brass',
      plate_color: hexToRgb(flatConfig.plate_color ?? '#8c7626'),
      rivet_color: hexToRgb(flatConfig.rivet_color ?? '#6a5816'),
      face_color: hexToRgb(flatConfig.face_color ?? '#f8f8f0'),
      plate_transparent: flatConfig.plate_transparent ?? false,
      background_style: flatConfig.background_style ?? 'gradient',
      glass_effect_enabled: flatConfig.glass_effect_enabled ?? true,
      wear_level: flatConfig.wear_level ?? 40,
      aged_texture: flatConfig.aged_texture ?? 'everywhere',
      aged_texture_intensity: flatConfig.aged_texture_intensity ?? 30,
    },
    colors_typography: {
      hour_hand_color: hexToRgb(flatConfig.hour_hand_color ?? '#3e2723'),
      minute_hand_color: hexToRgb(flatConfig.minute_hand_color ?? '#3e2723'),
      second_hand_color: hexToRgb(flatConfig.second_hand_color ?? '#C41E3A'),
      number_color: hexToRgb(flatConfig.number_color ?? '#3e2723'),
      primary_tick_color: hexToRgb(flatConfig.primary_tick_color ?? '#3e2723'),
      secondary_tick_color: hexToRgb(
        flatConfig.secondary_tick_color ?? '#5d4e37'
      ),
    },
    actions: {
      tap_action_action: 'more-info',
      hold_action_action: 'more-info',
      double_tap_action_action: 'more-info',
    },
  };
}

describe('FoundryAnalogClockCardEditor._configToForm', () => {
  test('nests plate_color as rgb in appearance group', () => {
    const editor = makeEditor();
    const data = editor._configToForm(editor._config);
    // '#8c7626' → [140, 118, 38]
    expect(data.appearance.plate_color).toEqual([140, 118, 38]);
  });

  test('nests hour_hand_color as rgb in colors_typography group', () => {
    const editor = makeEditor({ hour_hand_color: '#3e2723' });
    const data = editor._configToForm(editor._config);
    // '#3e2723' → [62, 39, 35]
    expect(data.colors_typography.hour_hand_color).toEqual([62, 39, 35]);
  });

  test('applies theme values — appearance group gets brass plate_color when theme active', () => {
    const editor = makeEditor({ theme: 'brass' });
    const data = editor._configToForm(editor._config);
    expect(data.appearance.plate_color).toEqual([140, 118, 38]);
  });

  test('flat theme key deleted — theme lives in appearance', () => {
    const editor = makeEditor({ theme: 'brass' });
    const data = editor._configToForm(editor._config);
    expect(data.theme).toBeUndefined();
    expect(data.appearance.theme).toBe('brass');
  });

  test('second_hand_color from brass theme applied in colors_typography', () => {
    const editor = makeEditor({ theme: 'brass' });
    const data = editor._configToForm(editor._config);
    // Brass second_hand_color '#c0392b' → [192, 57, 43]
    expect(data.colors_typography.second_hand_color).toEqual([192, 57, 43]);
  });
});

describe('FoundryAnalogClockCardEditor._formToConfig', () => {
  test('flattens appearance, converts plate_color to hex', () => {
    const editor = makeEditor();
    const config = editor._formToConfig(
      makeGroupedFormData(editor._config, 'none')
    );
    expect(config.plate_color).toBe('#8c7626');
  });

  test('flattens colors_typography, converts hour_hand_color to hex', () => {
    const editor = makeEditor();
    const config = editor._formToConfig(
      makeGroupedFormData(editor._config, 'none')
    );
    expect(config.hour_hand_color).toBe('#3e2723');
  });

  test('removes group keys from resulting config', () => {
    const editor = makeEditor();
    const config = editor._formToConfig(
      makeGroupedFormData(editor._config, 'none')
    );
    expect(config.appearance).toBeUndefined();
    expect(config.colors_typography).toBeUndefined();
  });
});

describe('FoundryAnalogClockCardEditor._handleFormChanged (theme change)', () => {
  test('applying brass theme gives brass plate_color and second_hand_color', async () => {
    const editor = makeEditor({ theme: 'none' });
    const emitted = captureEvents(editor);

    await editor._handleFormChanged({
      detail: { value: makeGroupedFormData(editor._config, 'brass') },
    });

    expect(emitted).toHaveLength(1);
    expect(emitted[0].theme).toBe('brass');
    expect(emitted[0].plate_color).toBe('#8c7626');
    expect(emitted[0].second_hand_color).toBe('#c0392b');
  });
});

describe('FoundryAnalogClockCardEditor._handleFormChanged (override detection)', () => {
  function makeBrassEditor() {
    return makeEditor({
      theme: 'brass',
      plate_color: '#8c7626',
      rivet_color: '#6a5816',
      ring_style: 'brass',
      hour_hand_color: '#3e2723',
      minute_hand_color: '#3e2723',
      second_hand_color: '#c0392b',
      font_color: '#1a0a00',
      font_bg_color: '#fffde7',
    });
  }

  test('changing plate_color while brass active detaches theme', async () => {
    const editor = makeBrassEditor();
    const emitted = captureEvents(editor);

    const formData = makeGroupedFormData(editor._config, 'brass');
    formData.appearance.plate_color = [0, 128, 0]; // override
    await editor._handleFormChanged({ detail: { value: formData } });

    expect(emitted).toHaveLength(1);
    expect(emitted[0].theme).toBe('none');
    expect(emitted[0].plate_color).toBe('#008000');
    // Non-overridden prop retains brass value
    expect(emitted[0].ring_style).toBe('brass');
  });

  test('changing only title stays on theme', async () => {
    const editor = makeBrassEditor();
    const emitted = captureEvents(editor);

    const formData = makeGroupedFormData(editor._config, 'brass');
    formData.title = 'New Clock';
    await editor._handleFormChanged({ detail: { value: formData } });

    expect(emitted).toHaveLength(1);
    expect(emitted[0].theme).toBe('brass');
    expect(emitted[0].title).toBe('New Clock');
  });
});
