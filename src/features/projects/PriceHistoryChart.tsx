/**
 * Price per sq ft over time, one line per unit type.
 *
 * The series is sparse and irregular (a launch price, then a filing price each
 * year), so the chart is drawn against the periods on record rather than against
 * calendar time, and the axis labels carry the real period names. The same
 * observations are repeated as a table under the chart, so the numbers are
 * readable without the drawing.
 *
 * Presentational: `points` arrives as a prop. The helpers come from
 * `data-hub/charts.ts` (`niceCeil`, `median`); nothing there is changed.
 */
import { formatNum, rupees } from '@/lib/format';
import type { Locale } from '@/lib/i18n/locale';
import { median, niceCeil } from '@/features/data-hub/charts';
import { label, text } from './text';
import type { PricePoint } from './types';

export type PriceHistoryChartProps = { locale: Locale; points: PricePoint[] };

const W = 1000;
const H = 300;
/** Distinct line colours, cycled when a project has more unit types than this. */
const SERIES = 5;

type Row = { period: string; unitType: string; value: number; source: string };

export function PriceHistoryChart({ locale, points }: PriceHistoryChartProps) {
  const t = text(locale);
  const rows: Row[] = (points ?? [])
    .filter((p) => typeof p.price_per_sqft === 'number' && p.price_per_sqft > 0)
    .map((p) => ({ period: p.period_start ?? p.quarter ?? '', unitType: p.unit_type ?? '', value: p.price_per_sqft as number, source: p.source }))
    .filter((r) => r.period !== '');

  if (rows.length === 0) return null;

  const periods = [...new Set(rows.map((r) => r.period))].sort();
  const unitTypes = [...new Set(rows.map((r) => r.unitType))];
  const values = rows.map((r) => r.value);
  const top = niceCeil(Math.max(...values));
  // The scale starts at a round step below the lowest reading, so a small move stays visible.
  const base = Math.max(0, top - niceCeil(top - Math.min(...values)));
  const span = top - base || 1;

  const x = (period: string) => (periods.length === 1 ? W / 2 : (periods.indexOf(period) / (periods.length - 1)) * W);
  const y = (value: number) => H - ((value - base) / span) * H;

  const guides = [0, 0.5, 1].map((f) => base + span * f);
  const series = unitTypes.map((unitType, i) => ({
    unitType,
    color: i % SERIES,
    line: rows
      .filter((r) => r.unitType === unitType)
      .sort((a, b) => periods.indexOf(a.period) - periods.indexOf(b.period))
      .map((r) => `${x(r.period)},${y(r.value)}`)
      .join(' '),
    dots: rows.filter((r) => r.unitType === unitType),
  }));

  const latest = rows[rows.length - 1]!;
  const lowest = rows.reduce((a, b) => (b.value < a.value ? b : a));
  const highest = rows.reduce((a, b) => (b.value > a.value ? b : a));
  const mid = median(values);
  const first = rows[0];
  const changePct = first && first.value > 0 && latest ? ((latest.value - first.value) / first.value) * 100 : null;

  const summary = [
    `${t.phHighest}: ${rupees(highest.value, locale)} (${highest.period})`,
    `${t.phLowest}: ${rupees(lowest.value, locale)} (${lowest.period})`,
    `${t.phLatest}: ${rupees(latest.value, locale)} (${latest.period})`,
  ].join('. ');

  return (
    <section className="dh-section pj-chart" aria-labelledby="pj-price-history">
      <h2 id="pj-price-history" className="dh-h2">
        {t.priceHistoryTitle}
      </h2>
      <p className="dh-meta mt-2">{t.phLead(rows.length)}</p>

      <figure className="pj-chart-fig">
        <div className="pj-chart-plot">
          {guides.map((g, i) => (
            <span className="pj-chart-guide" key={i} style={{ top: `${((H - y(g)) / H) * 100}%` }}>
              <i>{rupees(Math.round(g), locale)}</i>
            </span>
          ))}
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={`${t.priceHistoryTitle}. ${summary}`}>
            {series.map((s) => (
              <polyline key={s.unitType || 'all'} className={`pj-line is-${s.color}`} points={s.line} vectorEffect="non-scaling-stroke" />
            ))}
          </svg>
          <div className="pj-chart-dots" aria-hidden="true">
            {series.flatMap((s) =>
              s.dots.map((d, i) => (
                <i key={`${s.unitType}-${d.period}-${i}`} className={`pj-dot is-${s.color}`} style={{ left: `${(x(d.period) / W) * 100}%`, top: `${(y(d.value) / H) * 100}%` }} />
              )),
            )}
          </div>
        </div>

        <div className="pj-chart-axis">
          {[periods[0], periods[Math.floor((periods.length - 1) / 2)], periods[periods.length - 1]]
            .filter((p, i, all): p is string => Boolean(p) && all.indexOf(p) === i)
            .map((p) => (
              <span key={p} style={{ left: `${(x(p) / W) * 100}%` }}>
                {p}
              </span>
            ))}
        </div>

        <figcaption className="pj-chart-cap">
          <dl className="dh-facts">
            <div>
              <dt>{t.phHighest}</dt>
              <dd>
                {rupees(highest.value, locale)} · {highest.period}
              </dd>
            </div>
            <div>
              <dt>{t.phLowest}</dt>
              <dd>
                {rupees(lowest.value, locale)} · {lowest.period}
              </dd>
            </div>
            {mid !== null ? (
              <div>
                <dt>{t.phAxisY}</dt>
                <dd>{rupees(Math.round(mid), locale)}</dd>
              </div>
            ) : null}
            {changePct !== null ? (
              <div>
                <dt>{t.phChange}</dt>
                <dd>
                  {changePct > 0 ? '+' : ''}
                  {formatNum(changePct, locale, { maximumFractionDigits: 1 })}%
                </dd>
              </div>
            ) : null}
          </dl>

          {unitTypes.length > 0 && unitTypes[0] !== '' ? (
            <ul className="pj-chart-keys">
              {series.map((s) => (
                <li key={s.unitType}>
                  <i className={`pj-key is-${s.color}`} aria-hidden="true" />
                  {s.unitType}
                </li>
              ))}
            </ul>
          ) : null}

          <ul className="pj-chart-keys">
            {(['launch', 'filing', 'derived'] as const).map((s) => (
              <li key={s}>{t.phSources[s]}</li>
            ))}
          </ul>
          <p className="dh-meta">{t.sourcesNote}</p>
        </figcaption>
      </figure>

      <div className="dh-scroll sheet dh-sheet mt-4">
        <table className="dh-table">
          <caption className="visually-hidden">{t.phTableCaption}</caption>
          <thead>
            <tr>
              <th scope="col">{t.phAxisX}</th>
              <th scope="col">{t.colUnitType}</th>
              <th scope="col" className="num">
                {t.phAxisY}
              </th>
              <th scope="col">{t.source}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <th scope="row" className="font-normal">
                  {r.period}
                </th>
                <td>{r.unitType || t.none}</td>
                <td className="num">{rupees(r.value, locale)}</td>
                <td>{label(t.phSources, r.source)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default PriceHistoryChart;
