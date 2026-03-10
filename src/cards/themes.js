import yaml from 'js-yaml';

// Module-level cache for the current page session
let cachedThemesPromise = null;

const CACHE_KEY = 'foundry_cards_themes_cache';
const CACHE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

export async function loadThemes() {
  if (cachedThemesPromise) {
    return cachedThemesPromise;
  }

  const loadAll = async () => {
    const themes = {};
    const basePath = new URL('.', import.meta.url).href;
    const now = Date.now();

    // Check for ?refreshcache=true in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const forceRefresh = urlParams.get('refreshcache') === 'true';

    // Try to load from localStorage first
    if (!forceRefresh) {
      try {
        const cachedString = localStorage.getItem(CACHE_KEY);
        if (cachedString) {
          const cachedData = JSON.parse(cachedString);
          if (
            cachedData &&
            cachedData.timestamp &&
            now - cachedData.timestamp < CACHE_EXPIRY_MS
          ) {
            return cachedData.themes;
          }
        }
      } catch (e) {
        console.warn(
          '[Foundry Cards] Failed to read theme cache from localStorage:',
          e
        );
      }
    }

    // Function to load and parse a specific file
    const loadFile = async (filename) => {
      try {
        // Append a timestamp if forceRefresh is true to bypass browser cache completely
        const cacheBuster = forceRefresh ? `?v=${now}` : '';
        const url = new URL(`${filename}${cacheBuster}`, basePath).href;

        // cache: 'no-cache' forces the browser to validate with the server (ETag/Last-Modified).
        // If unchanged, it returns a 304 fast.
        const response = await fetch(url, { cache: 'no-cache' });

        if (response.ok) {
          const text = await response.text();
          const data = yaml.load(text);
          if (!data) return;

          // Handle duplicate theme names
          for (const [themeName, themeData] of Object.entries(data)) {
            let finalName = themeName;
            let counter = 2;
            while (themes[finalName]) {
              finalName = `${themeName}_${counter}`;
              counter++;
            }
            themes[finalName] = themeData;
          }
        } else {
          console.warn(
            `[Foundry Cards] Failed to fetch theme file: ${filename} (Status: ${response.status})`
          );
        }
      } catch (e) {
        console.warn(
          `[Foundry Cards] Exception loading theme file: ${filename}`,
          e
        );
      }
    };

    // Load both files
    await loadFile('themes.yaml');
    await loadFile('userthemes.yaml');

    // Save to localStorage
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          timestamp: now,
          themes: themes,
        })
      );
    } catch (e) {
      console.warn(
        '[Foundry Cards] Failed to save theme cache to localStorage:',
        e
      );
    }

    return themes;
  };

  cachedThemesPromise = loadAll();
  return cachedThemesPromise;
}

export function applyTheme(config, theme) {
  if (!theme) return config;

  const newConfig = { ...config };

  // List of all support theme properties to copy over
  const themeProperties = [
    'plate_color',
    'rivet_color',
    'ring_style',
    'title_color',
    'font_color',
    'font_bg_color',
    'number_color',
    'primary_tick_color',
    'secondary_tick_color',
    'background_style',
    'face_color',
    'liquid_color',
    'needle_color',
    'plate_transparent',
    'glass_effect_enabled',
    'wear_level',
    'aged_texture',
    'aged_texture_intensity',
    'slider_color',
    'knob_color',
    'tick_color',
    'line_color',
    'line_width',
    'fill_under_line',
    'grid_minor_color',
    'grid_major_color',
    'grid_opacity',
    'hour_hand_color',
    'minute_hand_color',
    'second_hand_color',
    'bar_color',
  ];

  for (const key of themeProperties) {
    if (theme[key] !== undefined) {
      newConfig[key] = theme[key];
    }
  }

  return newConfig;
}
