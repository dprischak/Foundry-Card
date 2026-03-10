/**
 * Tests for FoundryChartEditor
 *
 * Covers:
 *  - _configToForm: hex→rgb conversion including line_color and grid colors
 *  - _formToConfig: rgb→hex reversal
 *  - _handleFormChanged: theme change, line_color override detection, non-theme change, no-op
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

import '../src/cards/foundry-chart-editor.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeEditor(config = {}) {
  const EditorClass = customElements.get('foundry-chart-editor');
  const editor = new EditorClass();
  editor._themes = mockThemes;
  editor._config = {
    entity: 'sensor.temperature',
    title: 'My Chart',
    theme: 'none',
    plate_color: '#f5f5f5',
    rivet_color: '#6d5d4b',
    title_color: '#3e2723',
    font_color: '#000000',
    font_bg_color: '#ffffff',
    ring_style: 'brass',
    line_color: '#2196f3',
    line_width: 2,
    grid_minor_color: '#e0e0e0',
    grid_major_color: '#bdbdbd',
    grid_opacity: 0.5,
    fill_under_line: false,
    plate_transparent: false,
    wear_level: 50,
    glass_effect_enabled: true,
    aged_texture: 'everywhere',
    aged_texture_intensity: 50,
    ...config,
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

// ---------------------------------------------------------------------------
// _configToForm
// ---------------------------------------------------------------------------

describe('FoundryChartEditor._configToForm', () => {
  test('converts hex plate_color to rgb array', () => {
    const editor = makeEditor();
    const data = editor._configToForm(editor._config);
    expect(data.plate_color).toEqual([245, 245, 245]);
  });

  test('converts hex line_color to rgb array', () => {
    const editor = makeEditor({ line_color: '#2196f3' });
    const data = editor._configToForm(editor._config);
    // '#2196f3' → [33, 150, 243]
    expect(data.line_color).toEqual([33, 150, 243]);
  });

  test('converts hex grid_major_color to rgb array', () => {
    const editor = makeEditor({ grid_major_color: '#bdbdbd' });
    const data = editor._configToForm(editor._config);
    // '#bdbdbd' → [189, 189, 189]
    expect(data.grid_major_color).toEqual([189, 189, 189]);
  });

  test('applies theme values when theme is active', () => {
    const editor = makeEditor({ theme: 'brass' });
    const data = editor._configToForm(editor._config);
    // brass line_color '#bf8c00' → [191, 140, 0]
    expect(data.line_color).toEqual([191, 140, 0]);
  });

  test('defaults theme to none when not set', () => {
    const editor = makeEditor({ theme: undefined });
    const data = editor._configToForm(editor._config);
    expect(data.theme).toBe('none');
  });
});

// ---------------------------------------------------------------------------
// _formToConfig
// ---------------------------------------------------------------------------

describe('FoundryChartEditor._formToConfig', () => {
  test('converts rgb plate_color back to hex', () => {
    const editor = makeEditor();
    const config = editor._formToConfig({ plate_color: [245, 245, 245] });
    expect(config.plate_color).toBe('#f5f5f5');
  });

  test('converts rgb line_color back to hex', () => {
    const editor = makeEditor();
    const config = editor._formToConfig({ line_color: [33, 150, 243] });
    expect(config.line_color).toBe('#2196f3');
  });

  test('hex string line_color passes through unchanged', () => {
    const editor = makeEditor();
    const config = editor._formToConfig({ line_color: '#bf8c00' });
    expect(config.line_color).toBe('#bf8c00');
  });

  test('preserves existing config fields not in formData', () => {
    const editor = makeEditor({ title: 'Original' });
    const config = editor._formToConfig({ line_color: [33, 150, 243] });
    expect(config.title).toBe('Original');
  });
});

// ---------------------------------------------------------------------------
// _handleFormChanged — theme change
// ---------------------------------------------------------------------------

describe('FoundryChartEditor._handleFormChanged (theme change)', () => {
  test('applying brass theme sets brass line_color and plate_color', async () => {
    const editor = makeEditor({ theme: 'none' });
    const emitted = captureEvents(editor);

    await editor._handleFormChanged({
      detail: {
        value: {
          entity: 'sensor.temperature',
          theme: 'brass',
          title: 'My Chart',
          plate_color: [245, 245, 245],
          rivet_color: [109, 93, 75],
          title_color: [62, 39, 35],
          font_color: [0, 0, 0],
          font_bg_color: [255, 255, 255],
          ring_style: 'brass',
          line_color: [33, 150, 243],
          line_width: 2,
          grid_minor_color: [224, 224, 224],
          grid_major_color: [189, 189, 189],
          grid_opacity: 0.5,
          fill_under_line: false,
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
    expect(emitted[0].line_color).toBe('#bf8c00');
    expect(emitted[0].ring_style).toBe('brass');
  });

  test('switching from brass to dark applies dark line_color', async () => {
    const editor = makeEditor({
      theme: 'brass',
      plate_color: '#8c7626',
      line_color: '#bf8c00',
    });
    const emitted = captureEvents(editor);

    await editor._handleFormChanged({
      detail: {
        value: {
          entity: 'sensor.temperature',
          theme: 'dark',
          title: 'My Chart',
          plate_color: [140, 118, 38],
          line_color: [191, 140, 0],
        },
      },
    });

    expect(emitted).toHaveLength(1);
    expect(emitted[0].theme).toBe('dark');
    expect(emitted[0].plate_color).toBe('#1a1a1a');
    expect(emitted[0].line_color).toBe('#00bcd4');
  });
});

// ---------------------------------------------------------------------------
// _handleFormChanged — override detection
// ---------------------------------------------------------------------------

describe('FoundryChartEditor._handleFormChanged (override detection)', () => {
  function makeBrassEditor() {
    return makeEditor({
      theme: 'brass',
      plate_color: '#8c7626',
      rivet_color: '#6a5816',
      title_color: '#3e2723',
      font_color: '#1a0a00',
      font_bg_color: '#fffde7',
      ring_style: 'brass',
      line_color: '#bf8c00',
      line_width: 2,
      fill_under_line: false,
      grid_minor_color: '#e6d080',
      grid_major_color: '#b89a00',
      grid_opacity: 0.5,
      wear_level: 40,
      glass_effect_enabled: true,
      aged_texture: 'everywhere',
      aged_texture_intensity: 30,
      plate_transparent: false,
    });
  }

  test('changing line_color while brass active detaches theme', async () => {
    const editor = makeBrassEditor();
    const emitted = captureEvents(editor);

    await editor._handleFormChanged({
      detail: {
        value: {
          entity: 'sensor.temperature',
          theme: 'brass',
          title: 'My Chart',
          plate_color: [140, 118, 38],
          rivet_color: [106, 88, 22],
          title_color: [62, 39, 35],
          font_color: [26, 10, 0],
          font_bg_color: [255, 253, 231],
          ring_style: 'brass',
          line_color: [0, 0, 255], // user changed from brass '#bf8c00'
          line_width: 2,
          fill_under_line: false,
          grid_minor_color: [230, 208, 128],
          grid_major_color: [184, 154, 0],
          grid_opacity: 0.5,
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
    expect(emitted[0].line_color).toBe('#0000ff');
    // Non-overridden props retain brass theme values
    expect(emitted[0].plate_color).toBe('#8c7626');
    expect(emitted[0].ring_style).toBe('brass');
  });

  test('changing only title while theme active does not detach', async () => {
    const editor = makeBrassEditor();
    const emitted = captureEvents(editor);

    await editor._handleFormChanged({
      detail: {
        value: {
          entity: 'sensor.temperature',
          theme: 'brass',
          title: 'New Title', // only this changed
          plate_color: [140, 118, 38],
          rivet_color: [106, 88, 22],
          title_color: [62, 39, 35],
          font_color: [26, 10, 0],
          font_bg_color: [255, 253, 231],
          ring_style: 'brass',
          line_color: [191, 140, 0],
          line_width: 2,
          fill_under_line: false,
          grid_minor_color: [230, 208, 128],
          grid_major_color: [184, 154, 0],
          grid_opacity: 0.5,
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
    expect(emitted[0].line_color).toBe('#bf8c00');
  });

  test('no event when config is identical', async () => {
    const editor = makeBrassEditor();
    const emitted = captureEvents(editor);

    await editor._handleFormChanged({
      detail: {
        value: {
          entity: 'sensor.temperature',
          theme: 'brass',
          title: 'My Chart',
          plate_color: [140, 118, 38],
          rivet_color: [106, 88, 22],
          title_color: [62, 39, 35],
          font_color: [26, 10, 0],
          font_bg_color: [255, 253, 231],
          ring_style: 'brass',
          line_color: [191, 140, 0],
          line_width: 2,
          fill_under_line: false,
          grid_minor_color: [230, 208, 128],
          grid_major_color: [184, 154, 0],
          grid_opacity: 0.5,
          wear_level: 40,
          glass_effect_enabled: true,
          aged_texture: 'everywhere',
          aged_texture_intensity: 30,
          plate_transparent: false,
        },
      },
    });

    expect(emitted).toHaveLength(0);
  });
});
