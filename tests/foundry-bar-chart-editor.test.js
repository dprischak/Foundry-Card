/**
 * Tests for FoundryBarChartEditor
 *
 * Covers:
 *  - _configToForm: hex→rgb conversion including bar_color and grid colors
 *  - _formToConfig: rgb→hex reversal, actions unpacking
 *  - _handleFormChanged: theme change, bar_color override detection, non-theme change, no-op
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

import '../src/cards/foundry-bar-chart-editor.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeEditor(config = {}) {
  const EditorClass = customElements.get('foundry-bar-chart-editor');
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
    bar_color: '#2196f3',
    bar_padding: 2,
    grid_minor_color: '#e0e0e0',
    grid_major_color: '#bdbdbd',
    grid_opacity: 0.5,
    fill_under_line: false,
    plate_transparent: false,
    wear_level: 50,
    glass_effect_enabled: true,
    aged_texture: 'everywhere',
    aged_texture_intensity: 50,
    segments: [],
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

describe('FoundryBarChartEditor._configToForm', () => {
  test('converts hex plate_color to rgb array', () => {
    const editor = makeEditor();
    const data = editor._configToForm(editor._config);
    // '#f5f5f5' → [245, 245, 245]
    expect(data.plate_color).toEqual([245, 245, 245]);
  });

  test('converts hex bar_color to rgb array', () => {
    const editor = makeEditor({ bar_color: '#2196f3' });
    const data = editor._configToForm(editor._config);
    // '#2196f3' → [33, 150, 243]
    expect(data.bar_color).toEqual([33, 150, 243]);
  });

  test('converts hex grid_minor_color to rgb array', () => {
    const editor = makeEditor({ grid_minor_color: '#e0e0e0' });
    const data = editor._configToForm(editor._config);
    // '#e0e0e0' → [224, 224, 224]
    expect(data.grid_minor_color).toEqual([224, 224, 224]);
  });

  test('applies theme values when theme is active', () => {
    const editor = makeEditor({ theme: 'brass' });
    const data = editor._configToForm(editor._config);
    // Brass theme plate_color '#8c7626' → [140, 118, 38]
    expect(data.plate_color).toEqual([140, 118, 38]);
  });

  test('defaults theme to none when not set', () => {
    const editor = makeEditor({ theme: undefined });
    const data = editor._configToForm(editor._config);
    expect(data.theme).toBe('none');
  });

  test('packs actions into nested actions object', () => {
    const editor = makeEditor({
      tap_action: { action: 'more-info' },
      hold_action: { action: 'navigate', navigation_path: '/dashboard' },
    });
    const data = editor._configToForm(editor._config);
    expect(data.actions.tap_action_action).toBe('more-info');
    expect(data.actions.hold_action_action).toBe('navigate');
    expect(data.actions.hold_action_navigation_path).toBe('/dashboard');
  });
});

// ---------------------------------------------------------------------------
// _formToConfig
// ---------------------------------------------------------------------------

describe('FoundryBarChartEditor._formToConfig', () => {
  test('converts rgb plate_color back to hex', () => {
    const editor = makeEditor();
    const config = editor._formToConfig({ plate_color: [245, 245, 245] });
    expect(config.plate_color).toBe('#f5f5f5');
  });

  test('converts rgb bar_color back to hex', () => {
    const editor = makeEditor();
    const config = editor._formToConfig({ bar_color: [33, 150, 243] });
    expect(config.bar_color).toBe('#2196f3');
  });

  test('hex string bar_color passes through unchanged', () => {
    const editor = makeEditor();
    const config = editor._formToConfig({ bar_color: '#bf8c00' });
    expect(config.bar_color).toBe('#bf8c00');
  });

  test('unpacks navigate tap_action from actions group', () => {
    const editor = makeEditor();
    const config = editor._formToConfig({
      actions: {
        tap_action_action: 'navigate',
        tap_action_navigation_path: '/lovelace',
        hold_action_action: 'more-info',
        double_tap_action_action: 'more-info',
      },
    });
    expect(config.tap_action).toEqual({
      action: 'navigate',
      navigation_path: '/lovelace',
    });
    expect(config.hold_action).toEqual({ action: 'more-info' });
  });

  test('unpacks call-service tap_action with target entity', () => {
    const editor = makeEditor();
    const config = editor._formToConfig({
      actions: {
        tap_action_action: 'call-service',
        tap_action_service: 'light.turn_on',
        tap_action_target_entity: 'light.bedroom',
        hold_action_action: 'more-info',
        double_tap_action_action: 'more-info',
      },
    });
    expect(config.tap_action).toEqual({
      action: 'call-service',
      service: 'light.turn_on',
      target: { entity_id: 'light.bedroom' },
    });
  });
});

// ---------------------------------------------------------------------------
// _handleFormChanged — theme change
// ---------------------------------------------------------------------------

describe('FoundryBarChartEditor._handleFormChanged (theme change)', () => {
  test('applying brass theme sets brass bar_color and plate_color', async () => {
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
          bar_color: [33, 150, 243],
          bar_padding: 2,
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
    expect(emitted[0].ring_style).toBe('brass');
  });
});

// ---------------------------------------------------------------------------
// _handleFormChanged — override detection
// ---------------------------------------------------------------------------

describe('FoundryBarChartEditor._handleFormChanged (override detection)', () => {
  function makeBrassEditor() {
    return makeEditor({
      theme: 'brass',
      plate_color: '#8c7626',
      rivet_color: '#6a5816',
      title_color: '#3e2723',
      font_color: '#1a0a00',
      font_bg_color: '#fffde7',
      ring_style: 'brass',
      bar_color: '#bf8c00',
      bar_padding: 2,
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

  test('changing bar_color while brass active detaches theme', async () => {
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
          bar_color: [255, 0, 0], // user changed from brass '#bf8c00'
          bar_padding: 2,
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
    expect(emitted[0].bar_color).toBe('#ff0000');
    // Non-overridden props retain brass theme values
    expect(emitted[0].plate_color).toBe('#8c7626');
    expect(emitted[0].ring_style).toBe('brass');
  });

  test('changing only title while theme active does not detach theme', async () => {
    const editor = makeBrassEditor();
    const emitted = captureEvents(editor);

    await editor._handleFormChanged({
      detail: {
        value: {
          entity: 'sensor.temperature',
          theme: 'brass',
          title: 'Updated Title', // only this changed
          plate_color: [140, 118, 38],
          rivet_color: [106, 88, 22],
          title_color: [62, 39, 35],
          font_color: [26, 10, 0],
          font_bg_color: [255, 253, 231],
          ring_style: 'brass',
          bar_color: [191, 140, 0],
          bar_padding: 2,
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
    expect(emitted[0].title).toBe('Updated Title');
    expect(emitted[0].bar_color).toBe('#bf8c00');
  });

  test('no event fired when config would be identical', async () => {
    const editor = makeBrassEditor();
    const emitted = captureEvents(editor);

    // Form sends back brass-exact values (no change)
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
          bar_color: [191, 140, 0],
          bar_padding: 2,
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
