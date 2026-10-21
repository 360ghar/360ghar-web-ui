/**
 * One column per year of EMIs: principal at the foot, interest above it. All
 * numbers come from the person's own loan (math.ts). With a prepayment, the
 * years that are no longer paid stay as pale columns, so the saving shows.
 * The SVG holds the marks only; every word is HTML, so it stays readable at
 * 360 px. The year table below the chart has the same numbers.
 */
import type { CSSProperties } from 'react';
import { compactPrice } from '@/lib/format';
import type { Locale } from '@/lib/i18n/locale';
import { inr } from '../ui';
import { EMI_UI } from './content';
import { crossoverYear, type YearRow } from './math';

type Props = { rows: YearRow[]; base: YearRow[]; emi: number; locale: Locale };

const H = 100;
const STEP = 10;

export function PayoffChart({ rows, base, emi, locale }: Props) {
  const t = EMI_UI[locale];
  const n = base.length;
  const full = emi * 12;
  if (!n || !(full > 0)) return null;
  const first = rows[0]!;
  const cross = crossoverYear(rows);
  const ended = rows.length < n;
  const lump = rows.find((r) => r.extra > 0);
  const at = (year: number) => `${((year - 0.5) / n) * 100}%`;
  // Labels near an edge align to it, so they never leave the plot.
  const edge = (year: number) => ((year - 0.5) / n < 0.2 ? ' is-start' : (year - 0.5) / n > 0.8 ? ' is-end' : '');
  const lead = t.chartLead(inr(first.interest, locale), inr(first.principal + first.interest, locale), cross);

  // Axis labels: the crossover year, and the first and last year when they are clear of it.
  const mark = cross && cross > 1 && cross < n ? cross : null;
  const clear = (y: number) => !mark || Math.abs(y - mark) > n * 0.22;
  const marks = [...(clear(1) ? [1] : []), ...(mark ? [mark] : []), ...(clear(n) ? [n] : [])];

  return (
    <section className="tool-sheet" aria-labelledby="emi-chart">
      <div>
        <h2 id="emi-chart" className="tool-sheet-title">
          {t.chart}
        </h2>
        <p className="tool-note mt-1">
          {lead}
          {ended ? ` ${t.chartPrepay(rows.length, n)}` : ''}
        </p>
      </div>
      <figure className="tool-chart">
        <div className={`tool-chart-plot${lump ? ' has-flag' : ''}`}>
          {lump ? (
            <>
              <span className={`tool-chart-flag${edge(lump.year)}`} style={{ '--x': at(lump.year) } as CSSProperties}>
                {t.chartLump(compactPrice(lump.extra, locale))}
              </span>
              <i className="tool-chart-notch" style={{ '--x': at(lump.year) } as CSSProperties} aria-hidden="true" />
            </>
          ) : null}
          <svg viewBox={`0 0 ${n * STEP} ${H}`} preserveAspectRatio="none" role="img" aria-label={`${t.chart}. ${lead}`}>
            {base.map((b, i) => {
              const r = rows[i];
              const x = i * STEP + 1.2;
              const w = STEP - 2.4;
              if (!r) {
                const h = ((b.principal + b.interest) / full) * H;
                return <rect key={b.year} className="is-saved" x={x} y={H - h} width={w} height={h} />;
              }
              const ph = (r.principal / full) * H;
              const ih = (r.interest / full) * H;
              return (
                <g key={r.year}>
                  <rect className="is-a" x={x} y={H - ph} width={w} height={ph} />
                  <rect className="is-b" x={x} y={H - ph - ih} width={w} height={ih} />
                </g>
              );
            })}
          </svg>
        </div>
        <div className="tool-chart-axis" aria-hidden="true">
          {marks.map((y) => (
            <span key={y} className={y === mark ? 'is-mark' : y === 1 ? 'is-start' : 'is-end'} style={{ '--x': at(y) } as CSSProperties}>
              {t.chartYear(y)}
            </span>
          ))}
        </div>
        <figcaption>
          <ul className="tool-legend">
            <li>
              <i className="tool-key-a" aria-hidden="true" />
              {t.principal}
            </li>
            <li>
              <i className="tool-key-b" aria-hidden="true" />
              {t.interest}
            </li>
            {ended ? (
              <li>
                <i className="tool-key-saved" aria-hidden="true" />
                {t.chartSaved}
              </li>
            ) : null}
            {mark ? (
              <li>
                <i className="tool-key-mark" aria-hidden="true" />
                {t.chartCross}
              </li>
            ) : null}
          </ul>
        </figcaption>
      </figure>
    </section>
  );
}
