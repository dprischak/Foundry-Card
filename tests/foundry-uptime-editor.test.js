/**
 * Tests for FoundryUptimeEditor
 *
 * Flat editor with alias packing (alias_ok/alias_ko → config.alias.ok/ko).
 * themeProperties: plate_color, rivet_color, title_color, font_color, font_bg_color,
 *                  ring_style, plate_transparent, glass_effect_enabled, wear_level,
 *                  aged_texture, aged_texture_intensity
 *
 * Covers:
 *  - _configToForm: hex→rgb, alias unpacking
 *  - _formToConfig: rgb→hex, alias packing
 *  - _handleFormChanged: theme change, plate_color override, non-theme field
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

import '../src/cards/foundry-uptime-editor.js';

function makeEditor(configOverrides = {}) {
  const EditorClass = customElements.get('foundry-uptime-editor');
  const editor = new EditorClass();
  editor._themes = mockThemes;
  editor._config = {
    entity: 'binary_sensor.motion',
    title: 'Uptime',
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
    alias: { ok: 'Online', ko: 'Offline' },
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
    entity: config.entity,
    title: config.title ?? 'Uptime',
    theme,
    ring_style: config.ring_style ?? 'brass',
    plate_color: hexToRgb(config.plate_color ?? '#f5f5f5'),
    rivet_color: hexToRgb(config.rivet_color ?? '#6d5d4b'),
    font_color: hexToRgb(config.font_color ?? '#000000'),
    font_bg_color: hexToRgb(config.font_bg_color ?? '#ffffff'),
    title_color: hexToRgb(config.title_color ?? '#3e2723'),
    plate_transparent: config.plate_transparent ?? false,
    wear_level: config.wear_level ?? 50,
    glass_effect_enabled: config.glass_effect_enabled ?? true,
    aged_texture: config.aged_texture ?? 'everywhere',
    aged_texture_intensity: config.aged_texture_intensity ?? 50,
    alias_ok: config.alias?.ok,
    alias_ko: config.alias?.ko,
  };
}

describe('FoundryUptimeEditor._configToForm', () => {
  test('converts hex plate_color to rgb array', () => {
    const editor = makeEditor();
    const data = editor._configToForm(editor._config);
    expect(data.plate_color).toEqual([245, 245, 245]);
  });

  test('unpacks alias into alias_ok and alias_ko', () => {
    const editor = makeEditor();
    const data = editor._configToForm(editor._config);
    expect(data.alias_ok).toBe('Online');
    expect(data.alias_ko).toBe('Offline');
  });

  test('applies theme values when theme is active', () => {
    const editor = makeEditor({ theme: 'brass' });
    const data = editor._configToForm(editor._config);
    // Brass plate_color '#8c7626' → [140, 118, 38]
    expect(data.plate_color).toEqual([140, 118, 38]);
  });
});

describe('FoundryUptimeEditor._formToConfig', () => {
  test('converts rgb plate_color back to hex', () => {
    const editor = makeEditor();
    const config = editor._formToConfig(makeFormData(editor._config));
    expect(config.plate_color).toBe('#f5f5f5');
  });

  test('packs alias_ok and alias_ko into config.alias', () => {
    const editor = makeEditor();
    const formData = makeFormData(editor._config);
    const config = editor._formToConfig(formData);
    expect(config.alias).toEqual({ ok: 'Online', ko: 'Offline' });
  });

  test('removes alias_ok and alias_ko flat keys from result', () => {
    const editor = makeEditor();
    const config = editor._formToConfig(makeFormData(editor._config));
    expect(config.alias_ok).toBeUndefined();
    expect(config.alias_ko).toBeUndefined();
  });

  test('hex string passes through unchanged via ensureHex', () => {
    const editor = makeEditor();
    const formData = makeFormData(editor._config);
    formData.plate_color = '#aabbcc'; // hex string instead of rgb array
    const config = editor._formToConfig(formData);
    expect(config.plate_color).toBe('#aabbcc');
  });
});

describe('FoundryUptimeEditor._handleFormChanged (theme change)', () => {
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

describe('FoundryUptimeEditor._handleFormChanged (override detection)', () => {
  function makeBrassEditor() {
    return makeEditor({
      theme: 'brass',
      plate_color: '#8c7626',
      rivet_color: '#6a5816',
      font_color: '#1a0a00',
      font_bg_color: '#fffde7',
      title_color: '#3e2723',
      ring_style: 'brass',
      plate_transparent: false,
      wear_level: 40,
      glass_effect_enabled: true,
      aged_texture: 'everywhere',
      aged_texture_intensity: 30,
    });
  }

  test('changing plate_color while brass active detaches theme', async () => {
    const editor = makeBrassEditor();
    const emitted = captureEvents(editor);

    const formData = makeFormData(editor._config, 'brass');
    formData.plate_color = [0, 0, 128]; // navy override
    await editor._handleFormChanged({ detail: { value: formData } });

    expect(emitted).toHaveLength(1);
    expect(emitted[0].theme).toBe('none');
    expect(emitted[0].plate_color).toBe('#000080');
    // Non-overridden theme props stay as themed values
    expect(emitted[0].ring_style).toBe('brass');
  });

  test('changing title (non-theme prop) stays on theme', async () => {
    const editor = makeBrassEditor();
    const emitted = captureEvents(editor);

    const formData = makeFormData(editor._config, 'brass');
    formData.title = 'System Status';
    await editor._handleFormChanged({ detail: { value: formData } });

    expect(emitted).toHaveLength(1);
    expect(emitted[0].theme).toBe('brass');
    expect(emitted[0].title).toBe('System Status');
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
