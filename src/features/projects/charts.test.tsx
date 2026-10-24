import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import MapDiscovery from './MapDiscovery';
import PriceHistoryChart from './PriceHistoryChart';
import { text } from './text';
import type { PricePoint, ProjectMapPoint } from './types';

const point = (over: Partial<PricePoint>): PricePoint => ({ quarter: '', period_start: null, unit_type: '', price_per_sqft: null, source: 'filing', ...over });

describe('price history chart', () => {
  it('renders nothing without observations', () => {
    expect(renderToStaticMarkup(<PriceHistoryChart locale="en" points={[]} />)).toBe('');
    expect(renderToStaticMarkup(<PriceHistoryChart locale="en" points={[point({ period_start: '2025-Q1' })]} />)).toBe('');
  });

  it('repeats the observations as a table, in both locales', () => {
    const points = [point({ period_start: '2024-Q1', unit_type: '3 BHK', price_per_sqft: 9_000, source: 'launch' }), point({ period_start: '2025-Q1', unit_type: '3 BHK', price_per_sqft: 11_000, source: 'filing' })];
    const html = renderToStaticMarkup(<PriceHistoryChart locale="en" points={points} />);

    expect(html).toContain('<table');
    expect(html).toContain('2024-Q1');
    expect(html).toContain('3 BHK');
    expect(html).toContain(text('en').phSources.launch!);
    expect(html).not.toContain(text('hi').priceHistoryTitle);

    const hindi = renderToStaticMarkup(<PriceHistoryChart locale="hi" points={points} />);
    expect(hindi).toContain(text('hi').priceHistoryTitle);
  });

  it('puts the highest guide at the top of the plot', () => {
    const points = [point({ period_start: '2024-Q1', unit_type: '3 BHK', price_per_sqft: 9_000 }), point({ period_start: '2025-Q1', unit_type: '3 BHK', price_per_sqft: 11_000 })];
    const html = renderToStaticMarkup(<PriceHistoryChart locale="en" points={points} />);
    const tops = [...html.matchAll(/class="pj-chart-guide" style="top:([\d.]+)%"/g)].map((m) => Number(m[1]));
    expect(tops).toEqual([100, 50, 0]);
  });

  it('reads the change within one unit type, and only with two periods', () => {
    const one = renderToStaticMarkup(<PriceHistoryChart locale="en" points={[point({ period_start: '2024-Q1', unit_type: '3 BHK', price_per_sqft: 9_000 })]} />);
    expect(one).not.toContain(text('en').phChange);
    const mixed = [point({ period_start: '2024-Q1', unit_type: '2 BHK', price_per_sqft: 5_000 }), point({ period_start: '2025-Q1', unit_type: '3 BHK', price_per_sqft: 11_000 })];
    expect(renderToStaticMarkup(<PriceHistoryChart locale="en" points={mixed} />)).not.toContain(text('en').phChange);
    const same = [point({ period_start: '2024-Q1', unit_type: '3 BHK', price_per_sqft: 10_000 }), point({ period_start: '2025-Q1', unit_type: '3 BHK', price_per_sqft: 11_000 })];
    expect(renderToStaticMarkup(<PriceHistoryChart locale="en" points={same} />)).toContain('+10%');
  });

  it('drops a period it cannot place on the axis', () => {
    const html = renderToStaticMarkup(<PriceHistoryChart locale="en" points={[point({ unit_type: '3 BHK', price_per_sqft: 9_000 })]} />);
    expect(html).toBe('');
  });
});

const mapPoint = (over: Partial<ProjectMapPoint>): ProjectMapPoint => ({ slug: 'a', project_name: 'A', developer_name: null, latitude: null, longitude: null, stage: null, ...over });

describe('map discovery overlay', () => {
  it('lists the points without coordinates instead of dropping them', () => {
    const points = [mapPoint({ slug: 'placed', project_name: 'Placed', latitude: 28.45, longitude: 77.03 }), mapPoint({ slug: 'unplaced', project_name: 'Unplaced' })];
    const html = renderToStaticMarkup(<MapDiscovery locale="en" points={points} bounds={null} />);

    expect(html).toContain(text('en').mapUnlocated);
    expect(html).toContain('/project/unplaced');
    expect(html).toContain('/project/placed');
    // No map library: the points are positioned with percentages.
    expect(html).toContain('style="left:');
    expect(html).not.toContain('<canvas');
  });

  it('says so when no point has coordinates', () => {
    const html = renderToStaticMarkup(<MapDiscovery locale="en" points={[mapPoint({})]} bounds={null} />);
    expect(html).toContain(text('en').mapEmpty);
  });
});
