/**
 * Tests for FoundryButtonEditor
 *
 * Flat form structure with actions group for tap/hold/double_tap.
 * themeProperties covers 22 props.
 *
 * Covers:
 *  - _configToForm: hex→rgb, actions packing
 *  - _formToConfig: rgb→hex, actions unpacking
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

import '../src/cards/foundry-button-editor.js';

function makeEditor(configOverrides = {}) {
  const EditorClass = customElements.get('foundry-button-editor');
  const editor = new EditorClass();
  editor._themes = mockThemes;
  editor._config = {
    title: 'Button',
    theme: 'none',
    ring_style: 'brass',
    plate_color: '#f5f5f5',
    font_bg_color: '#ffffff',
    font_color: '#000000',
    plate_transparent: false,
    wear_level: 50,
    glass_effect_enabled: true,
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

function makeFormData(flatConfig, themeName, actionOverrides = {}) {
  return {
    title: flatConfig.title,
    theme: themeName ?? flatConfig.theme ?? 'none',
    ring_style: flatConfig.ring_style ?? 'brass',
    plate_color: hexToRgb(flatConfig.plate_color ?? '#f5f5f5'),
    font_bg_color: hexToRgb(flatConfig.font_bg_color ?? '#ffffff'),
    font_color: hexToRgb(flatConfig.font_color ?? '#000000'),
    plate_transparent: flatConfig.plate_transparent ?? false,
    wear_level: flatConfig.wear_level ?? 50,
    glass_effect_enabled: flatConfig.glass_effect_enabled ?? true,
    aged_texture: flatConfig.aged_texture ?? 'everywhere',
    aged_texture_intensity: flatConfig.aged_texture_intensity ?? 50,
    actions: {
      tap_action_action: 'more-info',
      tap_action_navigation_path: '',
      tap_action_service: '',
      tap_action_target_entity: '',
      hold_action_action: 'more-info',
      hold_action_navigation_path: '',
      hold_action_service: '',
      hold_action_target_entity: '',
      double_tap_action_action: 'more-info',
      double_tap_action_navigation_path: '',
      double_tap_action_service: '',
      double_tap_action_target_entity: '',
      ...actionOverrides,
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

describe('FoundryButtonEditor._configToForm', () => {
  test('converts hex plate_color to rgb array', () => {
    const editor = makeEditor();
    const data = editor._configToForm(editor._config);
    // '#f5f5f5' → [245, 245, 245]
    expect(data.plate_color).toEqual([245, 245, 245]);
  });

  test('applies theme values when theme is active', () => {
    const editor = makeEditor({ theme: 'brass' });
    const data = editor._configToForm(editor._config);
    // Brass plate_color '#8c7626' → [140, 118, 38]
    expect(data.plate_color).toEqual([140, 118, 38]);
  });

  test('packs actions into nested actions group', () => {
    const editor = makeEditor({
      tap_action: { action: 'navigate', navigation_path: '/lovelace/0' },
    });
    const data = editor._configToForm(editor._config);
    expect(data.actions.tap_action_action).toBe('navigate');
    expect(data.actions.tap_action_navigation_path).toBe('/lovelace/0');
  });

  test('actions group does not leak tap_action at top level', () => {
    const editor = makeEditor({
      tap_action: { action: 'more-info' },
    });
    const data = editor._configToForm(editor._config);
    expect(data.tap_action).toBeUndefined();
  });
});

describe('FoundryButtonEditor._formToConfig', () => {
  test('converts rgb plate_color back to hex', () => {
    const editor = makeEditor();
    const config = editor._formToConfig(makeFormData(editor._config, 'none'));
    expect(config.plate_color).toBe('#f5f5f5');
  });

  test('unpacks navigate tap_action from actions group', () => {
    const editor = makeEditor();
    const config = editor._formToConfig(
      makeFormData(editor._config, 'none', {
        tap_action_action: 'navigate',
        tap_action_navigation_path: '/dashboard',
      })
    );
    expect(config.tap_action).toEqual({
      action: 'navigate',
      navigation_path: '/dashboard',
    });
  });

  test('unpacks call-service tap_action with target entity', () => {
    const editor = makeEditor();
    const config = editor._formToConfig(
      makeFormData(editor._config, 'none', {
        tap_action_action: 'call-service',
        tap_action_service: 'light.turn_on',
        tap_action_target_entity: 'light.living_room',
      })
    );
    expect(config.tap_action).toMatchObject({
      action: 'call-service',
      service: 'light.turn_on',
      target: { entity_id: 'light.living_room' },
    });
  });

  test('removes actions key from resulting config', () => {
    const editor = makeEditor();
    const config = editor._formToConfig(makeFormData(editor._config, 'none'));
    expect(config.actions).toBeUndefined();
  });
});

describe('FoundryButtonEditor._handleFormChanged (theme change)', () => {
  test('applying brass theme gives brass plate_color', async () => {
    const editor = makeEditor({ theme: 'none' });
    const emitted = captureEvents(editor);

    await editor._handleFormChanged({
      detail: { value: makeFormData(editor._config, 'brass') },
    });

    expect(emitted).toHaveLength(1);
    expect(emitted[0].theme).toBe('brass');
    expect(emitted[0].plate_color).toBe('#8c7626');
    expect(emitted[0].ring_style).toBe('brass');
  });
});

describe('FoundryButtonEditor._handleFormChanged (override detection)', () => {
  function makeBrassEditor() {
    return makeEditor({
      theme: 'brass',
      plate_color: '#8c7626',
      rivet_color: '#6a5816',
      ring_style: 'brass',
      font_color: '#1a0a00',
      font_bg_color: '#fffde7',
      title_color: '#3e2723',
      number_color: '#3e2723',
      wear_level: 40,
      glass_effect_enabled: true,
      aged_texture: 'everywhere',
      aged_texture_intensity: 30,
      plate_transparent: false,
      tap_action: { action: 'more-info' },
      hold_action: { action: 'more-info' },
      double_tap_action: { action: 'more-info' },
    });
  }

  test('changing plate_color while brass active detaches theme', async () => {
    const editor = makeBrassEditor();
    const emitted = captureEvents(editor);

    const formData = makeFormData(editor._config, 'brass');
    formData.plate_color = [0, 255, 0]; // green override
    await editor._handleFormChanged({ detail: { value: formData } });

    expect(emitted).toHaveLength(1);
    expect(emitted[0].theme).toBe('none');
    expect(emitted[0].plate_color).toBe('#00ff00');
    expect(emitted[0].ring_style).toBe('brass');
  });

  test('changing only title stays on theme', async () => {
    const editor = makeBrassEditor();
    const emitted = captureEvents(editor);

    const formData = makeFormData(editor._config, 'brass');
    formData.title = 'Press Me';
    await editor._handleFormChanged({ detail: { value: formData } });

    expect(emitted).toHaveLength(1);
    expect(emitted[0].theme).toBe('brass');
    expect(emitted[0].title).toBe('Press Me');
  });

  test('no event fired when config is identical', async () => {
    const editor = makeBrassEditor();
    const emitted = captureEvents(editor);

    await editor._handleFormChanged({
      detail: { value: makeFormData(editor._config, 'brass') },
    });

    expect(emitted).toHaveLength(0);
  });
});
