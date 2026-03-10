/**
 * Tests for FoundryDigitalClockCardEditor
 *
 * Grouped form: appearance (plate_color, rivet_color, font_color), layout.
 * themeProperties covers 21 props.
 *
 * Covers:
 *  - _configToForm: groups appearance w/ rgb colors
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

import '../src/cards/foundry-digital-clock-editor.js';

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
  const EditorClass = customElements.get('foundry-digital-clock-editor');
  const editor = new EditorClass();
  editor._themes = mockThemes;
  editor._config = {
    title: 'Digital Clock',
    theme: 'none',
    ring_style: 'brass',
    plate_color: '#f5f5f5',
    rivet_color: '#6d5d4b',
    font_color: '#000000',
    font_bg_color: '#ffffff',
    title_color: '#3e2723',
    plate_transparent: false,
    wear_level: 50,
    glass_effect_enabled: true,
    aged_texture: 'everywhere',
    aged_texture_intensity: 50,
    use_24h_format: true,
    show_seconds: true,
    title_font_size: 14,
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
      plate_color: hexToRgb(flatConfig.plate_color ?? '#f5f5f5'),
      rivet_color: hexToRgb(flatConfig.rivet_color ?? '#6d5d4b'),
      font_color: hexToRgb(flatConfig.font_color ?? '#000000'),
      font_bg_color: hexToRgb(flatConfig.font_bg_color ?? '#ffffff'),
      title_color: hexToRgb(flatConfig.title_color ?? '#3e2723'),
      plate_transparent: flatConfig.plate_transparent ?? false,
      wear_level: flatConfig.wear_level ?? 50,
      glass_effect_enabled: flatConfig.glass_effect_enabled ?? true,
      aged_texture: flatConfig.aged_texture ?? 'everywhere',
      aged_texture_intensity: flatConfig.aged_texture_intensity ?? 50,
    },
    layout: {
      title_font_size: flatConfig.title_font_size ?? 14,
      use_24h_format: flatConfig.use_24h_format ?? true,
      show_seconds: flatConfig.show_seconds ?? true,
    },
  };
}

describe('FoundryDigitalClockCardEditor._configToForm', () => {
  test('nests plate_color as rgb in appearance group', () => {
    const editor = makeEditor();
    const data = editor._configToForm(editor._config);
    // '#f5f5f5' → [245, 245, 245]
    expect(data.appearance.plate_color).toEqual([245, 245, 245]);
  });

  test('nests title_color as rgb in appearance group', () => {
    const editor = makeEditor({ title_color: '#3e2723' });
    const data = editor._configToForm(editor._config);
    // '#3e2723' → [62, 39, 35]
    expect(data.appearance.title_color).toEqual([62, 39, 35]);
  });

  test('applies theme plate_color when theme active', () => {
    const editor = makeEditor({ theme: 'brass' });
    const data = editor._configToForm(editor._config);
    expect(data.appearance.plate_color).toEqual([140, 118, 38]);
  });

  test('includes use_24h_format in layout group', () => {
    const editor = makeEditor({ use_24h_format: false });
    const data = editor._configToForm(editor._config);
    expect(data.layout.use_24h_format).toBe(false);
  });
});

describe('FoundryDigitalClockCardEditor._formToConfig', () => {
  test('flattens appearance, converts plate_color to hex', () => {
    const editor = makeEditor();
    const config = editor._formToConfig(
      makeGroupedFormData(editor._config, 'none')
    );
    expect(config.plate_color).toBe('#f5f5f5');
  });

  test('flattens appearance, converts rivet_color to hex', () => {
    const editor = makeEditor();
    const config = editor._formToConfig(
      makeGroupedFormData(editor._config, 'none')
    );
    expect(config.rivet_color).toBe('#6d5d4b');
  });

  test('flattens layout into config', () => {
    const editor = makeEditor({ show_seconds: false });
    const formData = makeGroupedFormData(editor._config, 'none');
    formData.layout.show_seconds = false;
    const config = editor._formToConfig(formData);
    expect(config.show_seconds).toBe(false);
  });

  test('removes group keys from result', () => {
    const editor = makeEditor();
    const config = editor._formToConfig(
      makeGroupedFormData(editor._config, 'none')
    );
    expect(config.appearance).toBeUndefined();
    expect(config.layout).toBeUndefined();
  });
});

describe('FoundryDigitalClockCardEditor._handleFormChanged (theme change)', () => {
  test('applying brass theme gives brass plate_color', async () => {
    const editor = makeEditor({ theme: 'none' });
    const emitted = captureEvents(editor);

    await editor._handleFormChanged({
      detail: { value: makeGroupedFormData(editor._config, 'brass') },
    });

    expect(emitted).toHaveLength(1);
    expect(emitted[0].theme).toBe('brass');
    expect(emitted[0].plate_color).toBe('#8c7626');
    expect(emitted[0].ring_style).toBe('brass');
  });
});

describe('FoundryDigitalClockCardEditor._handleFormChanged (override detection)', () => {
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
      number_color: '#3e2723',
    });
  }

  test('changing plate_color while brass active detaches theme', async () => {
    const editor = makeBrassEditor();
    const emitted = captureEvents(editor);

    const formData = makeGroupedFormData(editor._config, 'brass');
    formData.appearance.plate_color = [0, 0, 128]; // navy override
    await editor._handleFormChanged({ detail: { value: formData } });

    expect(emitted).toHaveLength(1);
    expect(emitted[0].theme).toBe('none');
    expect(emitted[0].plate_color).toBe('#000080');
    expect(emitted[0].ring_style).toBe('brass');
  });

  test('changing only title stays on theme', async () => {
    const editor = makeBrassEditor();
    const emitted = captureEvents(editor);

    const formData = makeGroupedFormData(editor._config, 'brass');
    formData.title = 'Living Room Clock';
    await editor._handleFormChanged({ detail: { value: formData } });

    expect(emitted).toHaveLength(1);
    expect(emitted[0].theme).toBe('brass');
    expect(emitted[0].title).toBe('Living Room Clock');
  });

  test('no event fired when config is identical', async () => {
    const editor = makeBrassEditor();
    const emitted = captureEvents(editor);

    await editor._handleFormChanged({
      detail: { value: makeGroupedFormData(editor._config, 'brass') },
    });

    expect(emitted).toHaveLength(0);
  });
});
