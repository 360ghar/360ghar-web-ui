/**
 * Market pulse: one reading per city, as a table. Each row carries the date the
 * reading was captured and the date it was computed, so a stale reading is
 * visible. Presentational: the rows arrive as a prop.
 *
 * The price columns are drawn only when some reading carries a price. No RERA
 * register publishes a rate per square foot, so today every reading has neither
 * a price nor a 90-day change and both columns are left out entirely: a column
 * of dashes reads as a figure that is temporarily missing, when the truth is
 * that no source for it exists. If a price source is ever wired the columns
 * return on their own, which is why this tests the rows rather than a flag.
 */
import { formatNum, rupees } from '@/lib/format';
import type { Locale } from '@/lib/i18n/locale';
import { fmtDate } from '@/features/data-hub/format';
import { label, text } from './text';
import type { MarketPulse } from './types';

export type MarketPulsePanelProps = { locale: Locale; rows: MarketPulse[] };

const DASH = '—';

export function MarketPulsePanel({ locale, rows }: MarketPulsePanelProps) {
  const t = text(locale);
  const list = (rows ?? []).filter(Boolean);
  if (list.length === 0) return null;

  const hasPrice = list.some(
    (row) => row.avg_price_per_sqft !== null && row.avg_price_per_sqft !== undefined
  );
  const hasChange = list.some(
    (row) => row.price_change_90d_pct !== null && row.price_change_90d_pct !== undefined
  );

  const change = (pct: number | null | undefined) => {
    if (pct === null || pct === undefined) return { text: DASH, tone: '' };
    const value = `${Math.abs(pct).toFixed(1)}%`;
    if (pct > 0) return { text: t.mpUp(value), tone: 'is-bad' };
    if (pct < 0) return { text: t.mpDown(value), tone: 'is-good' };
    return { text: t.mpFlat, tone: '' };
  };

  return (
    <section className="dh-section pj-pulse" aria-labelledby="pj-pulse-table">
      <h2 id="pj-pulse-table" className="dh-h2">
        {t.mpCity}
      </h2>
      <p className="dh-meta mt-2">{t.mpLead(list.length)}</p>
      <div className="dh-scroll sheet dh-sheet mt-4">
        <table className="dh-table">
          <caption className="visually-hidden">{t.mpLead(list.length)}</caption>
          <thead>
            <tr>
              <th scope="col">{t.mpCity}</th>
              {hasPrice ? (
                <th scope="col" className="num">
                  {t.mpAvgPrice}
                </th>
              ) : null}
              {hasChange ? <th scope="col">{t.mpChange90}</th> : null}
              <th scope="col" className="num">
                {t.mpRegistrations}
              </th>
              <th scope="col" className="num">
                {t.mpComplaints}
              </th>
              <th scope="col">{t.mpSentiment}</th>
              <th scope="col">{t.mpDate}</th>
            </tr>
          </thead>
          <tbody>
            {list.map((row, i) => {
              const c = change(row.price_change_90d_pct);
              return (
                // A reading has no id of its own, and the order is the API order.
                <tr key={i}>
                  <th scope="row" className="font-normal">
                    {row.city}
                  </th>
                  {hasPrice ? (
                    <td className="num">{row.avg_price_per_sqft === null || row.avg_price_per_sqft === undefined ? DASH : rupees(row.avg_price_per_sqft, locale)}</td>
                  ) : null}
                  {hasChange ? (
                    <td>
                      <span className={c.tone ? `dh-status ${c.tone}` : undefined}>{c.text}</span>
                    </td>
                  ) : null}
                  <td className="num">{row.new_registrations === null || row.new_registrations === undefined ? DASH : formatNum(row.new_registrations, locale)}</td>
                  <td className="num">{row.new_complaints === null || row.new_complaints === undefined ? DASH : formatNum(row.new_complaints, locale)}</td>
                  <td>{label(t.sentiments, row.sentiment) || DASH}</td>
                  <td>
                    {fmtDate(row.captured_on, locale, 'long') ?? DASH}
                    {row.computed_at ? <span className="pj-pulse-computed">{t.mpComputed(fmtDate(row.computed_at, locale, 'long') ?? DASH)}</span> : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default MarketPulsePanel;
