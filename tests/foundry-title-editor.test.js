/**
 * Tests for FoundryTitleEditor
 *
 * Simplest flat editor with only 6 themeProperties.
 * themeProperties: plate_color, rivet_color, title_color,
 *                  plate_transparent, aged_texture, aged_texture_intensity
 *
 * Covers:
 *  - _configToForm: hex→rgb, defaults, theme applied when active
 *  - _formToConfig: rgb→hex for 3 color fields
 *  - _handleFormChanged: theme change, title_color override, non-theme field
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

import '../src/cards/foundry-title-editor.js';

function makeEditor(configOverrides = {}) {
  const EditorClass = customElements.get('foundry-title-editor');
  const editor = new EditorClass();
  editor._themes = mockThemes;
  editor._config = {
    title: 'My Title',
    theme: 'none',
    title_font_size: 18,
    plate_color: '#f5f5f5',
    rivet_color: '#6d5d4b',
    title_color: '#3e2723',
    plate_transparent: false,
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

function makeFormData(config, themeOverride) {
  const theme = themeOverride ?? config.theme ?? 'none';
  return {
    title: config.title ?? 'Title',
    theme,
    title_font_size: config.title_font_size ?? 18,
    plate_color: hexToRgb(config.plate_color ?? '#f5f5f5'),
    rivet_color: hexToRgb(config.rivet_color ?? '#6d5d4b'),
    title_color: hexToRgb(config.title_color ?? '#3e2723'),
    plate_transparent: config.plate_transparent ?? false,
    aged_texture: config.aged_texture ?? 'everywhere',
    aged_texture_intensity: config.aged_texture_intensity ?? 50,
  };
}

describe('FoundryTitleEditor._configToForm', () => {
  test('converts hex plate_color to rgb array', () => {
    const editor = makeEditor();
    const data = editor._configToForm(editor._config);
    expect(data.plate_color).toEqual([245, 245, 245]);
  });

  test('converts hex title_color to rgb array', () => {
    const editor = makeEditor({ title_color: '#3e2723' });
    const data = editor._configToForm(editor._config);
    // '#3e2723' → [62, 39, 35]
    expect(data.title_color).toEqual([62, 39, 35]);
  });

  test('converts hex rivet_color to rgb array', () => {
    const editor = makeEditor({ rivet_color: '#6d5d4b' });
    const data = editor._configToForm(editor._config);
    // '#6d5d4b' → [109, 93, 75]
    expect(data.rivet_color).toEqual([109, 93, 75]);
  });

  test('applies theme values when theme is active', () => {
    const editor = makeEditor({ theme: 'brass' });
    const data = editor._configToForm(editor._config);
    // Brass plate_color '#8c7626' → [140, 118, 38]
    expect(data.plate_color).toEqual([140, 118, 38]);
  });

  test('preserves non-color fields', () => {
    const editor = makeEditor({ title: 'Section Header', title_font_size: 24 });
    const data = editor._configToForm(editor._config);
    expect(data.title).toBe('Section Header');
    expect(data.title_font_size).toBe(24);
  });
});

describe('FoundryTitleEditor._formToConfig', () => {
  test('converts rgb plate_color back to hex', () => {
    const editor = makeEditor();
    const config = editor._formToConfig(makeFormData(editor._config));
    expect(config.plate_color).toBe('#f5f5f5');
  });

  test('converts rgb title_color back to hex', () => {
    const editor = makeEditor();
    const config = editor._formToConfig(makeFormData(editor._config));
    expect(config.title_color).toBe('#3e2723');
  });

  test('non-array plate_color (_rgbToHex) returns null', () => {
    const editor = makeEditor();
    const formData = makeFormData(editor._config);
    // Title editor _rgbToHex returns null for non-array input
    formData.plate_color = '#aabbcc';
    const config = editor._formToConfig(formData);
    expect(config.plate_color).toBeNull();
  });
});

describe('FoundryTitleEditor._handleFormChanged (theme change)', () => {
  test('switching to brass theme applies brass plate_color', async () => {
    const editor = makeEditor({ theme: 'none' });
    const emitted = captureEvents(editor);

    await editor._handleFormChanged({
      detail: { value: makeFormData(editor._config, 'brass') },
    });

    expect(emitted).toHaveLength(1);
    expect(emitted[0].theme).toBe('brass');
    expect(emitted[0].plate_color).toBe('#8c7626');
  });
});

describe('FoundryTitleEditor._handleFormChanged (override detection)', () => {
  function makeBrassEditor() {
    return makeEditor({
      theme: 'brass',
      plate_color: '#8c7626',
      rivet_color: '#6a5816',
      title_color: '#3e2723',
      plate_transparent: false,
      aged_texture: 'everywhere',
      aged_texture_intensity: 30,
    });
  }

  test('changing title_color while brass active detaches theme', async () => {
    const editor = makeBrassEditor();
    const emitted = captureEvents(editor);

    const formData = makeFormData(editor._config, 'brass');
    formData.title_color = [0, 128, 255]; // custom blue
    await editor._handleFormChanged({ detail: { value: formData } });

    expect(emitted).toHaveLength(1);
    expect(emitted[0].theme).toBe('none');
    expect(emitted[0].title_color).toBe('#0080ff');
    // Non-overridden theme props stay as themed values
    expect(emitted[0].plate_color).toBe('#8c7626');
  });

  test('changing title text (non-theme prop) stays on theme', async () => {
    const editor = makeBrassEditor();
    const emitted = captureEvents(editor);

    const formData = makeFormData(editor._config, 'brass');
    formData.title = 'New Section';
    await editor._handleFormChanged({ detail: { value: formData } });

    expect(emitted).toHaveLength(1);
    expect(emitted[0].theme).toBe('brass');
    expect(emitted[0].title).toBe('New Section');
  });

  test('no event when config unchanged', async () => {
    const editor = makeBrassEditor();
    const emitted = captureEvents(editor);

    await editor._handleFormChanged({
      detail: { value: makeFormData(editor._config, 'brass') },
    });

    expect(emitted).toHaveLength(0);
  });
});
