/**
 * Tests for FoundrySliderEditor
 *
 * Uses grouped form structure: appearance, colors_typography, knob_settings
 *
 * Covers:
 *  - _configToForm: groups appearance with rgb colors, theme applies
 *  - _formToConfig: flattens groups, rgb→hex
 *  - _handleFormChanged: theme change, slider_color override detection
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

import '../src/cards/foundry-slider-editor.js';

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
  const EditorClass = customElements.get('foundry-slider-editor');
  const editor = new EditorClass();
  editor._themes = mockThemes;
  editor._config = {
    entity: 'input_number.slider',
    title: 'Slider',
    theme: 'none',
    ring_style: 'brass',
    plate_color: '#8c7626',
    rivet_color: '#6a5816',
    face_color: '#8c7626',
    font_bg_color: '#ffffff',
    font_color: '#000000',
    slider_color: '#444444',
    knob_color: '#c9a961',
    primary_tick_color: '#000000',
    secondary_tick_color: '#000000',
    plate_transparent: false,
    wear_level: 50,
    aged_texture: 'glass_only',
    aged_texture_intensity: 50,
    background_style: 'gradient',
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
      face_color: hexToRgb(flatConfig.face_color ?? '#8c7626'),
      font_bg_color: hexToRgb(flatConfig.font_bg_color ?? '#ffffff'),
      plate_transparent: flatConfig.plate_transparent ?? false,
      wear_level: flatConfig.wear_level ?? 50,
      aged_texture: flatConfig.aged_texture ?? 'glass_only',
      aged_texture_intensity: flatConfig.aged_texture_intensity ?? 50,
      background_style: flatConfig.background_style ?? 'gradient',
    },
    colors_typography: {
      font_color: hexToRgb(flatConfig.font_color ?? '#000000'),
      number_color: hexToRgb(flatConfig.number_color ?? '#3e2723'),
      slider_color: hexToRgb(flatConfig.slider_color ?? '#444444'),
      primary_tick_color: hexToRgb(flatConfig.primary_tick_color ?? '#000000'),
      secondary_tick_color: hexToRgb(
        flatConfig.secondary_tick_color ?? '#000000'
      ),
    },
    knob_settings: {
      knob_color: hexToRgb(flatConfig.knob_color ?? '#c9a961'),
    },
  };
}

describe('FoundrySliderEditor._configToForm', () => {
  test('nests plate_color as rgb in appearance group', () => {
    const editor = makeEditor({ plate_color: '#8c7626' });
    const data = editor._configToForm(editor._config);
    expect(data.appearance.plate_color).toEqual([140, 118, 38]);
  });

  test('nests slider_color as rgb in colors_typography group', () => {
    const editor = makeEditor({ slider_color: '#444444' });
    const data = editor._configToForm(editor._config);
    // '#444444' → [68, 68, 68]
    expect(data.colors_typography.slider_color).toEqual([68, 68, 68]);
  });

  test('applies theme values inside appearance group when theme active', () => {
    const editor = makeEditor({ theme: 'brass' });
    const data = editor._configToForm(editor._config);
    // Brass theme plate_color '#8c7626' → [140, 118, 38]
    expect(data.appearance.plate_color).toEqual([140, 118, 38]);
  });

  test('nests knob_color in knob_settings group', () => {
    const editor = makeEditor({ knob_color: '#c9a961' });
    const data = editor._configToForm(editor._config);
    // '#c9a961' → [201, 169, 97]
    expect(data.knob_settings.knob_color).toEqual([201, 169, 97]);
  });

  test('flat theme key is deleted, theme lives in appearance', () => {
    const editor = makeEditor({ theme: 'brass' });
    const data = editor._configToForm(editor._config);
    expect(data.theme).toBeUndefined();
    expect(data.appearance.theme).toBe('brass');
  });
});

describe('FoundrySliderEditor._formToConfig', () => {
  test('flattens appearance and converts plate_color to hex', () => {
    const editor = makeEditor();
    const config = editor._formToConfig(
      makeGroupedFormData(editor._config, 'none')
    );
    expect(config.plate_color).toBe('#8c7626');
  });

  test('flattens colors_typography and converts slider_color to hex', () => {
    const editor = makeEditor();
    const formData = makeGroupedFormData(editor._config, 'none');
    formData.colors_typography.slider_color = [100, 100, 100];
    const config = editor._formToConfig(formData);
    expect(config.slider_color).toBe('#646464');
  });

  test('removes group keys from resulting config', () => {
    const editor = makeEditor();
    const config = editor._formToConfig(
      makeGroupedFormData(editor._config, 'none')
    );
    expect(config.appearance).toBeUndefined();
    expect(config.colors_typography).toBeUndefined();
    expect(config.knob_settings).toBeUndefined();
  });
});

describe('FoundrySliderEditor._handleFormChanged (theme change)', () => {
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

describe('FoundrySliderEditor._handleFormChanged (override detection)', () => {
  test('changing plate_color while brass active detaches theme', async () => {
    const editor = makeEditor({
      theme: 'brass',
      plate_color: '#8c7626',
      rivet_color: '#6a5816',
      ring_style: 'brass',
      wear_level: 40,
      glass_effect_enabled: true,
      aged_texture: 'everywhere',
      aged_texture_intensity: 30,
      plate_transparent: false,
    });
    const emitted = captureEvents(editor);

    const formData = makeGroupedFormData(editor._config, 'brass');
    formData.appearance.plate_color = [255, 0, 0]; // override
    await editor._handleFormChanged({ detail: { value: formData } });

    expect(emitted).toHaveLength(1);
    expect(emitted[0].theme).toBe('none');
    expect(emitted[0].plate_color).toBe('#ff0000');
  });

  test('changing only title does not detach theme', async () => {
    const editor = makeEditor({
      theme: 'brass',
      plate_color: '#8c7626',
      rivet_color: '#6a5816',
      ring_style: 'brass',
      font_color: '#1a0a00',
      font_bg_color: '#fffde7',
      number_color: '#3e2723',
      glass_effect_enabled: true,
      wear_level: 40,
      aged_texture: 'everywhere',
      aged_texture_intensity: 30,
    });
    const emitted = captureEvents(editor);

    const formData = makeGroupedFormData(editor._config, 'brass');
    formData.title = 'New Title';
    await editor._handleFormChanged({ detail: { value: formData } });

    expect(emitted).toHaveLength(1);
    expect(emitted[0].theme).toBe('brass');
    expect(emitted[0].title).toBe('New Title');
  });
});
