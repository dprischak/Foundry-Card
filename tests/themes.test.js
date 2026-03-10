// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

// applyTheme is a pure function — import directly with no mocking needed.
// loadThemes requires browser globals — we stub them per test.
import { applyTheme } from '../src/cards/themes.js';

// ─── applyTheme ─────────────────────────────────────────────────────────────

describe('applyTheme', () => {
  const baseConfig = {
    plate_color: '#ffffff',
    rivet_color: '#cccccc',
    ring_style: 'none',
    title_color: '#000000',
    font_color: '#000000',
    wear_level: 50,
    glass_effect_enabled: true,
  };

  const theme = {
    plate_color: '#8c7626',
    rivet_color: '#6a5816',
    ring_style: 'brass',
    title_color: '#3e2723',
    font_color: '#1a0a00',
    wear_level: 40,
    // glass_effect_enabled intentionally absent
  };

  it('applies theme properties over config', () => {
    const result = applyTheme({ ...baseConfig }, theme);
    expect(result.plate_color).toBe('#8c7626');
    expect(result.rivet_color).toBe('#6a5816');
    expect(result.ring_style).toBe('brass');
    expect(result.title_color).toBe('#3e2723');
    expect(result.wear_level).toBe(40);
  });

  it('skips theme properties that are undefined in the theme', () => {
    const result = applyTheme({ ...baseConfig }, theme);
    // glass_effect_enabled not in theme → keep original value
    expect(result.glass_effect_enabled).toBe(true);
  });

  it('does not mutate the original config object', () => {
    const original = { ...baseConfig };
    applyTheme(original, theme);
    expect(original.plate_color).toBe('#ffffff');
  });

  it('returns config unchanged when theme is null', () => {
    const original = { ...baseConfig };
    const result = applyTheme(original, null);
    expect(result).toEqual(original);
  });

  it('returns config unchanged when theme is undefined', () => {
    const original = { ...baseConfig };
    const result = applyTheme(original, undefined);
    expect(result).toEqual(original);
  });

  it('applies all 30 recognized theme properties when present', () => {
    const fullTheme = {
      plate_color: '#111',
      rivet_color: '#222',
      ring_style: 'silver',
      title_color: '#333',
      font_color: '#444',
      font_bg_color: '#555',
      number_color: '#666',
      primary_tick_color: '#777',
      secondary_tick_color: '#888',
      background_style: 'solid',
      face_color: '#999',
      liquid_color: '#aaa',
      needle_color: '#bbb',
      plate_transparent: true,
      glass_effect_enabled: false,
      wear_level: 99,
      aged_texture: 'glass_only',
      aged_texture_intensity: 75,
      slider_color: '#ccc',
      knob_color: '#ddd',
      tick_color: '#eee',
      line_color: '#f00',
      line_width: 3,
      fill_under_line: true,
      grid_minor_color: '#f11',
      grid_major_color: '#f22',
      grid_opacity: 0.8,
      hour_hand_color: '#f33',
      minute_hand_color: '#f44',
      second_hand_color: '#f55',
    };
    const result = applyTheme({}, fullTheme);
    for (const [key, value] of Object.entries(fullTheme)) {
      expect(result[key]).toBe(value);
    }
  });

  it('ignores unknown properties not in the recognized list', () => {
    const themeWithExtra = {
      ...theme,
      custom_unknown_prop: 'should-be-ignored',
    };
    const result = applyTheme({ ...baseConfig }, themeWithExtra);
    expect(result.custom_unknown_prop).toBeUndefined();
  });
});

// ─── loadThemes ──────────────────────────────────────────────────────────────

describe('loadThemes', () => {
  const CACHE_KEY = 'foundry_cards_themes_cache';

  const yamlContent = `
brass:
  plate_color: "#8c7626"
  ring_style: brass
  wear_level: 40
dark:
  plate_color: "#1a1a1a"
  ring_style: black
  wear_level: 10
`;

  beforeEach(() => {
    // Clear localStorage stub before each test
    vi.stubGlobal('localStorage', {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
    });

    // Stub window and window.location.search with no query params
    vi.stubGlobal('window', { location: { search: '' } });
    vi.stubGlobal('location', { search: '' });

    // Stub fetch to return the YAML content
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(yamlContent),
      })
    );

    // Reset module so cachedThemesPromise singleton is cleared between tests
    vi.resetModules();
  });

  it('fetches and parses themes.yaml and userthemes.yaml', async () => {
    const { loadThemes } = await import('../src/cards/themes.js');
    const themes = await loadThemes();
    expect(themes).toHaveProperty('brass');
    expect(themes.brass.plate_color).toBe('#8c7626');
    expect(themes).toHaveProperty('dark');
  });

  it('uses localStorage cache when fresh', async () => {
    const cached = {
      timestamp: Date.now(),
      themes: { cached_theme: { plate_color: '#abcdef' } },
    };
    localStorage.getItem.mockReturnValue(JSON.stringify(cached));

    const { loadThemes } = await import('../src/cards/themes.js');
    const themes = await loadThemes();
    expect(themes).toHaveProperty('cached_theme');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('fetches fresh data when cache is stale', async () => {
    const stale = {
      timestamp: Date.now() - 15 * 60 * 1000, // 15 min ago — expired
      themes: { stale_theme: { plate_color: '#000000' } },
    };
    localStorage.getItem.mockReturnValue(JSON.stringify(stale));

    const { loadThemes } = await import('../src/cards/themes.js');
    const themes = await loadThemes();
    // Should have freshly fetched themes, not the stale one
    expect(themes).toHaveProperty('brass');
    expect(themes).not.toHaveProperty('stale_theme');
    expect(fetch).toHaveBeenCalled();
  });

  it('saves fetched themes to localStorage', async () => {
    const { loadThemes } = await import('../src/cards/themes.js');
    await loadThemes();
    expect(localStorage.setItem).toHaveBeenCalledWith(
      CACHE_KEY,
      expect.stringContaining('"brass"')
    );
  });

  it('handles fetch failure gracefully (returns empty or partial themes)', async () => {
    fetch.mockResolvedValue({ ok: false, status: 404 });
    const { loadThemes } = await import('../src/cards/themes.js');
    const themes = await loadThemes();
    expect(themes).toBeDefined();
    expect(typeof themes).toBe('object');
  });

  it('deduplicates theme names with counter suffix', async () => {
    // Both files return a theme named "brass" → second becomes "brass_2"
    fetch.mockResolvedValue({
      ok: true,
      text: () =>
        Promise.resolve(`
brass:
  plate_color: "#8c7626"
`),
    });

    const { loadThemes } = await import('../src/cards/themes.js');
    const themes = await loadThemes();
    expect(themes).toHaveProperty('brass');
    expect(themes).toHaveProperty('brass_2');
  });
});
