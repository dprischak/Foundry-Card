/**
 * Representative theme fixtures used across all test files.
 * These mirror the structure of real entries in themes.yaml.
 */
export const mockThemes = {
  brass: {
    plate_color: '#8c7626',
    rivet_color: '#6a5816',
    ring_style: 'brass',
    title_color: '#3e2723',
    font_color: '#1a0a00',
    font_bg_color: '#fffde7',
    number_color: '#3e2723',
    wear_level: 40,
    glass_effect_enabled: true,
    aged_texture: 'everywhere',
    aged_texture_intensity: 30,
    plate_transparent: false,
    // chart-specific
    line_color: '#bf8c00',
    line_width: 2,
    fill_under_line: false,
    grid_minor_color: '#e6d080',
    grid_major_color: '#b89a00',
    grid_opacity: 0.5,
    // bar-chart-specific
    bar_color: '#bf8c00',
    bar_padding: 2,
    // clock
    hour_hand_color: '#3e2723',
    minute_hand_color: '#3e2723',
    second_hand_color: '#c0392b',
  },
  dark: {
    plate_color: '#1a1a1a',
    rivet_color: '#333333',
    ring_style: 'black',
    title_color: '#e0e0e0',
    font_color: '#ffffff',
    font_bg_color: '#000000',
    number_color: '#cccccc',
    wear_level: 10,
    glass_effect_enabled: false,
    aged_texture: 'none',
    aged_texture_intensity: 0,
    plate_transparent: false,
    line_color: '#00bcd4',
    line_width: 1,
    fill_under_line: true,
    grid_minor_color: '#263238',
    grid_major_color: '#37474f',
    grid_opacity: 0.7,
    bar_color: '#00bcd4',
    bar_padding: 1,
    hour_hand_color: '#e0e0e0',
    minute_hand_color: '#e0e0e0',
    second_hand_color: '#ff5252',
  },
};
