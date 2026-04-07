/**
 * Tests for FoundryBarChartCard — day grouping logic
 *
 * Covers:
 *  - _fetchHistory: start time is midnight-aligned (not a rolling 24h window)
 *    when group_by === 'day'
 *  - _fetchHistory: group_by === 'hour' still uses the rolling hours_to_show window
 *  - _updateValues: bucket count equals days_to_show exactly (not days_to_show + 1)
 */

vi.mock('../src/cards/themes.js', () => ({
  loadThemes: vi.fn().mockResolvedValue({}),
  applyTheme: vi.fn((config) => config),
}));

vi.mock('../src/cards/fonts.js', () => ({
  ensureLedFont: vi.fn(),
}));

import '../src/cards/foundry-bar-chart-card.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// April 6, 2026 at 2:30 PM local — chosen so "today" has elapsed partial time
// and cannot be confused with a rolled-back 24h window.
const FAKE_NOW = new Date(2026, 3, 6, 14, 30, 0, 0);

function makeCard(configOverrides = {}) {
  const CardClass = customElements.get('foundry-bar-chart-card');
  const card = new CardClass();
  card.config = {
    entity: 'sensor.temperature',
    group_by: 'day',
    days_to_show: 1,
    hours_to_show: 24,
    bucket_count: 50,
    bucket_minutes: null,
    points_per_hour: null,
    aggregation: 'avg',
    bar_padding: 2,
    value_precision: 2,
    show_inspect_value: false,
    show_x_axis_minmax: false,
    show_y_axis_minmax: false,
    segments: [],
    segment_blend_width: 0,
    bar_range_blend: 'single',
    bar_color: '#d32f2f',
    font_color: '#000000',
    ...configOverrides,
  };
  card._hass = {
    states: {
      'sensor.temperature': {
        entity_id: 'sensor.temperature',
        state: '21.5',
        attributes: { unit_of_measurement: '°C' },
      },
    },
    callApi: vi.fn().mockResolvedValue([]),
  };
  // Suppress render so tests stay focused on the logic under test.
  card._renderHistory = vi.fn();
  return card;
}

/** Parse the ISO start timestamp out of the callApi URL. */
function getStartDateFromCallApi(card) {
  const url = card._hass.callApi.mock.calls[0][1];
  const isoStart = url.split('history/period/')[1].split('?')[0];
  return new Date(isoStart);
}

// ---------------------------------------------------------------------------
// _fetchHistory — start time alignment when group_by = 'day'
// ---------------------------------------------------------------------------

describe('FoundryBarChartCard._fetchHistory (group_by = day)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FAKE_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('days_to_show=1: start is today at midnight, not 24h ago', async () => {
    const card = makeCard({ days_to_show: 1 });
    await card._fetchHistory();

    const startDate = getStartDateFromCallApi(card);

    // Must be exactly midnight local time
    expect(startDate.getHours()).toBe(0);
    expect(startDate.getMinutes()).toBe(0);
    expect(startDate.getSeconds()).toBe(0);
    expect(startDate.getMilliseconds()).toBe(0);

    // Must be the same calendar day as "now" (not yesterday)
    expect(startDate.getDate()).toBe(FAKE_NOW.getDate());
    expect(startDate.getMonth()).toBe(FAKE_NOW.getMonth());
    expect(startDate.getFullYear()).toBe(FAKE_NOW.getFullYear());
  });

  test('days_to_show=2: start is yesterday at midnight', async () => {
    const card = makeCard({ days_to_show: 2 });
    await card._fetchHistory();

    const startDate = getStartDateFromCallApi(card);
    const expectedDate = new Date(FAKE_NOW);
    expectedDate.setDate(expectedDate.getDate() - 1);

    expect(startDate.getHours()).toBe(0);
    expect(startDate.getMinutes()).toBe(0);
    expect(startDate.getSeconds()).toBe(0);
    expect(startDate.getDate()).toBe(expectedDate.getDate());
    expect(startDate.getMonth()).toBe(expectedDate.getMonth());
  });

  test('days_to_show=7: start is midnight 6 days ago', async () => {
    const card = makeCard({ days_to_show: 7 });
    await card._fetchHistory();

    const startDate = getStartDateFromCallApi(card);
    const expectedDate = new Date(FAKE_NOW);
    expectedDate.setDate(expectedDate.getDate() - 6);

    expect(startDate.getHours()).toBe(0);
    expect(startDate.getMinutes()).toBe(0);
    expect(startDate.getSeconds()).toBe(0);
    expect(startDate.getDate()).toBe(expectedDate.getDate());
    expect(startDate.getMonth()).toBe(expectedDate.getMonth());
  });
});

// ---------------------------------------------------------------------------
// _fetchHistory — group_by = 'hour' still uses rolling window
// ---------------------------------------------------------------------------

describe('FoundryBarChartCard._fetchHistory (group_by = hour)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FAKE_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('hours_to_show=24: start is exactly 24 hours before now', async () => {
    const card = makeCard({ group_by: 'hour', hours_to_show: 24 });
    await card._fetchHistory();

    const startDate = getStartDateFromCallApi(card);
    const expected = new Date(FAKE_NOW.getTime() - 24 * 3600 * 1000);

    // Allow a small tolerance (< 1 second) for execution time
    expect(Math.abs(startDate.getTime() - expected.getTime())).toBeLessThan(
      1000
    );

    // Should NOT be at midnight — it should be 14:30 yesterday
    expect(startDate.getHours()).toBe(FAKE_NOW.getHours());
    expect(startDate.getMinutes()).toBe(FAKE_NOW.getMinutes());
  });
});

// ---------------------------------------------------------------------------
// _updateValues — bucket count matches days_to_show exactly
// ---------------------------------------------------------------------------

describe('FoundryBarChartCard._updateValues (group_by = day)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FAKE_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('days_to_show=1: exactly 1 bucket (today only)', () => {
    const card = makeCard({ days_to_show: 1 });
    card._history = [];
    card._updateValues();

    expect(card._chartBucketCount).toBe(1);
    expect(card._chartBuckets).toHaveLength(1);
  });

  test('days_to_show=2: exactly 2 buckets (yesterday + today)', () => {
    const card = makeCard({ days_to_show: 2 });
    card._history = [];
    card._updateValues();

    expect(card._chartBucketCount).toBe(2);
    expect(card._chartBuckets).toHaveLength(2);
  });

  test('days_to_show=7: exactly 7 buckets', () => {
    const card = makeCard({ days_to_show: 7 });
    card._history = [];
    card._updateValues();

    expect(card._chartBucketCount).toBe(7);
    expect(card._chartBuckets).toHaveLength(7);
  });

  test('bucket ids are sequential starting from 0', () => {
    const card = makeCard({ days_to_show: 3 });
    card._history = [];
    card._updateValues();

    expect(card._chartBuckets.map((b) => b.id)).toEqual([0, 1, 2]);
  });

  test('history values are aggregated into buckets correctly', () => {
    const card = makeCard({ days_to_show: 2, aggregation: 'avg' });
    // Two readings: 10 early yesterday, 20 today
    const yesterdayMidnight = new Date(FAKE_NOW);
    yesterdayMidnight.setDate(yesterdayMidnight.getDate() - 1);
    yesterdayMidnight.setHours(0, 0, 0, 0);
    const todayMidnight = new Date(FAKE_NOW);
    todayMidnight.setHours(0, 0, 0, 0);

    card._history = [
      {
        last_changed: new Date(
          yesterdayMidnight.getTime() + 3600 * 1000
        ).toISOString(), // yesterday 01:00 → state becomes 10
        state: '10',
      },
      {
        last_changed: todayMidnight.toISOString(), // today midnight → state becomes 20
        state: '20',
      },
    ];
    card._updateValues();

    expect(card._chartBucketCount).toBe(2);
    // Bucket 0 = yesterday: value should be 10 (or average covering 10→20 transition at midnight)
    // Bucket 1 = today: value should reflect 20
    expect(card._chartBuckets[0].value).not.toBeNull();
    expect(card._chartBuckets[1].value).not.toBeNull();
    expect(card._chartBuckets[1].value).toBe(20);
  });
});
