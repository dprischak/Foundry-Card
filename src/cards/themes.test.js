import { describe, expect, it, vi } from 'vitest';

describe('themes', () => {
  it('applyTheme returns original config when no theme is provided', async () => {
    const { applyTheme } = await import('./themes.js');
    const config = { title: 'Foundry' };

    const result = applyTheme(config, null);

    expect(result).toBe(config);
  });

  it('applyTheme copies only supported theme properties', async () => {
    const { applyTheme } = await import('./themes.js');
    const config = { title: 'Chart', line_width: 2 };
    const theme = {
      line_width: 4,
      plate_color: '#222222',
      unsupported: 'x',
    };

    const result = applyTheme(config, theme);

    expect(result).toEqual({
      title: 'Chart',
      line_width: 4,
      plate_color: '#222222',
    });
    expect(result.unsupported).toBeUndefined();
  });

  it('loadThemes loads default and user themes and handles duplicate names', async () => {
    vi.resetModules();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));

    const fetchMock = vi.fn(async (url) => {
      const pathname = new URL(url).pathname;
      if (pathname.endsWith('/themes.yaml')) {
        return {
          ok: true,
          text: async () =>
            `classic:\n  plate_color: '#111111'\n  ring_style: brass`,
        };
      }
      if (pathname.endsWith('/userthemes.yaml')) {
        return {
          ok: true,
          text: async () =>
            `classic:\n  plate_color: '#222222'\ncustom:\n  font_color: '#ffffff'`,
        };
      }
      return { ok: false, status: 404, text: async () => '' };
    });

    vi.stubGlobal('fetch', fetchMock);
    const { loadThemes } = await import('./themes.js');

    const result = await loadThemes();

    expect(Object.keys(result)).toEqual(['classic', 'classic_2', 'custom']);
    expect(result.classic.plate_color).toBe('#111111');
    expect(result.classic_2.plate_color).toBe('#222222');
    expect(result.custom.font_color).toBe('#ffffff');
    expect(fetchMock).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });

  it('loadThemes returns empty object when fetch fails', async () => {
    vi.resetModules();
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 500 }))
    );

    const { loadThemes } = await import('./themes.js');
    const result = await loadThemes();

    expect(result).toEqual({});
    expect(warnSpy).toHaveBeenCalled();
  });
});
