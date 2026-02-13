import yaml from 'js-yaml';

// Module-level cache
let cachedThemesPromise = null;

export async function loadThemes() {
  // if (cachedThemesPromise) {
  //   return cachedThemesPromise;
  // }

  const loadAll = async () => {
    const themes = {};
    // Determine base path from the current script's URL
    const basePath = new URL('.', import.meta.url).href;

    const load = async (filename) => {
      try {
        const url =
          new URL(filename, basePath).href + '?v=' + new Date().getTime();

        const response = await fetch(url);
        if (response.ok) {
          const text = await response.text();
          const data = yaml.load(text);

          // Handle duplicate theme names by appending numbers
          for (const [themeName, themeData] of Object.entries(data)) {
            let finalName = themeName;
            let counter = 2;

            // If theme name already exists, append a number
            while (themes[finalName]) {
              finalName = `${themeName}_${counter}`;
              counter++;
            }

            themes[finalName] = themeData;
          }
        } else {
          console.warn(`[Foundry Cards] Failed to fetch theme file: ${filename} (Status: ${response.status})`);
        }
      } catch (e) {
        console.warn(`Failed to load theme file: ${filename}`, e);
      }
    };

    // Load default themes
    await load('themes.yaml');

    // Attempt to load user themes (optional)
    await load('userthemes.yaml');

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
  ];

  for (const key of themeProperties) {
    if (theme[key] !== undefined) {
      newConfig[key] = theme[key];
    }
  }

  return newConfig;
}
