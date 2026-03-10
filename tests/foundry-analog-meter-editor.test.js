/**
 * Tests for FoundryAnalogMeterCardEditor
 *
 * Grouped form: appearance (plate_color, rivet_color, face_color),
 * style_fonts_ticks (needle_color, number_color, tick colors), actions.
 *
 * Covers:
 *  - _configToForm: hex→rgb into groups
 *  - _formToConfig: flattens groups, rgb→hex
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

import '../src/cards/foundry-analog-meter-editor.js';

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
  const EditorClass = customElements.get('foundry-analog-meter-card-editor');
  const editor = new EditorClass();
  editor._themes = mockThemes;
  editor._config = {
    entity: 'sensor.temperature',
    title: 'Meter',
    theme: 'none',
    ring_style: 'brass',
    plate_color: '#8c7626',
    rivet_color: '#6a5816',
    face_color: '#f8f8f0',
    needle_color: '#1a1a1a',
    number_color: '#3e2723',
    primary_tick_color: '#3e2723',
    secondary_tick_color: '#5d4e37',
    font_color: '#000000',
    font_bg_color: '#ffffff',
    plate_transparent: false,
    glass_effect_enabled: true,
    wear_level: 40,
    aged_texture: 'everywhere',
    aged_texture_intensity: 30,
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
    title: flatConfig.title,
    appearance: {
      theme: themeName ?? flatConfig.theme ?? 'none',
      ring_style: flatConfig.ring_style ?? 'brass',
      plate_color: hexToRgb(flatConfig.plate_color ?? '#8c7626'),
      rivet_color: hexToRgb(flatConfig.rivet_color ?? '#6a5816'),
      face_color: hexToRgb(flatConfig.face_color ?? '#f8f8f0'),
      plate_transparent: flatConfig.plate_transparent ?? false,
      glass_effect_enabled: flatConfig.glass_effect_enabled ?? true,
      wear_level: flatConfig.wear_level ?? 40,
      aged_texture: flatConfig.aged_texture ?? 'everywhere',
      aged_texture_intensity: flatConfig.aged_texture_intensity ?? 30,
      background_style: flatConfig.background_style ?? 'gradient',
    },
    style_fonts_ticks: {
      needle_color: hexToRgb(flatConfig.needle_color ?? '#1a1a1a'),
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

describe('FoundryAnalogMeterCardEditor._configToForm', () => {
  test('nests plate_color as rgb in appearance group', () => {
    const editor = makeEditor();
    const data = editor._configToForm(editor._config);
    // '#8c7626' → [140, 118, 38]
    expect(data.appearance.plate_color).toEqual([140, 118, 38]);
  });

  test('nests needle_color as rgb in style_fonts_ticks group', () => {
    const editor = makeEditor({ needle_color: '#1a1a1a' });
    const data = editor._configToForm(editor._config);
    // '#1a1a1a' → [26, 26, 26]
    expect(data.style_fonts_ticks.needle_color).toEqual([26, 26, 26]);
  });

  test('applies brass theme values into appearance group', () => {
    const editor = makeEditor({ theme: 'brass' });
    const data = editor._configToForm(editor._config);
    expect(data.appearance.plate_color).toEqual([140, 118, 38]);
  });
});

describe('FoundryAnalogMeterCardEditor._formToConfig', () => {
  test('flattens appearance and converts plate_color to hex', () => {
    const editor = makeEditor();
    const config = editor._formToConfig(
      makeGroupedFormData(editor._config, 'none')
    );
    expect(config.plate_color).toBe('#8c7626');
  });

  test('flattens style_fonts_ticks and converts needle_color to hex', () => {
    const editor = makeEditor();
    const config = editor._formToConfig(
      makeGroupedFormData(editor._config, 'none')
    );
    expect(config.needle_color).toBe('#1a1a1a');
  });

  test('removes group keys from resulting config', () => {
    const editor = makeEditor();
    const config = editor._formToConfig(
      makeGroupedFormData(editor._config, 'none')
    );
    expect(config.appearance).toBeUndefined();
    expect(config.style_fonts_ticks).toBeUndefined();
  });
});

describe('FoundryAnalogMeterCardEditor._handleFormChanged (theme change)', () => {
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

describe('FoundryAnalogMeterCardEditor._handleFormChanged (override detection)', () => {
  function makeBrassEditor() {
    return makeEditor({
      theme: 'brass',
      plate_color: '#8c7626',
      rivet_color: '#6a5816',
      ring_style: 'brass',
      font_color: '#1a0a00',
      font_bg_color: '#fffde7',
    });
  }

  test('changing plate_color while brass active detaches theme', async () => {
    const editor = makeBrassEditor();
    const emitted = captureEvents(editor);

    const formData = makeGroupedFormData(editor._config, 'brass');
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

    const formData = makeGroupedFormData(editor._config, 'brass');
    formData.title = 'Updated Meter';
    await editor._handleFormChanged({ detail: { value: formData } });

    expect(emitted).toHaveLength(1);
    expect(emitted[0].theme).toBe('brass');
    expect(emitted[0].title).toBe('Updated Meter');
  });
});
