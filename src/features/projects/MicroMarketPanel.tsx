/**
 * One micro-market: where it is, its price level, and the stage mix of the
 * projects inside it. Presentational: the market arrives as a prop.
 */
import { formatNum, rupees } from '@/lib/format';
import type { Locale } from '@/lib/i18n/locale';
import { localizePath } from '@/lib/i18n/locale';
import { Icon } from '@/ui/icons/Icon';
import { label, text, toneOf } from './text';
import type { MicroMarketDetail } from './types';

export type MicroMarketPanelProps = { locale: Locale; market: MicroMarketDetail };

export function MicroMarketPanel({ locale, market: m }: MicroMarketPanelProps) {
  const t = text(locale);
  // `stage_breakdown` is a map of stage name to project count, not a list of rows.
  const stages = Object.entries(m.stage_breakdown ?? {}).filter(([stage]) => Boolean(stage));
  const total = stages.reduce((sum, [, count]) => sum + count, 0);
  const figures = (
    [
      [t.mmProjects, m.project_count === null || m.project_count === undefined ? null : formatNum(m.project_count, locale)],
      [t.mmAvgPrice, m.avg_price_per_sqft === null || m.avg_price_per_sqft === undefined ? null : `${rupees(m.avg_price_per_sqft, locale)} ${t.perSqft}`],
      [t.location, [m.name, m.city].filter(Boolean).join(', ') || null],
      [t.district, m.district],
    ] as [string, string | null][]
  ).filter(([, v]) => Boolean(v));

  return (
    <div className="pj-market">
      {m.summary ? <p className="dh-lead">{m.summary}</p> : null}

      {figures.length > 0 ? (
        <dl className="sheet dh-slip mt-4">
          {figures.map(([key, value]) => (
            <div className="dh-fig" key={key}>
              <dt className="dh-fig-label">{key}</dt>
              <dd className="dh-fig-value">{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {stages.length > 0 ? (
        <section className="dh-section" aria-labelledby="pj-mm-stages">
          <h2 id="pj-mm-stages" className="dh-h2">
            {t.mmStageMix}
          </h2>
          <ul className="sheet dh-rows mt-4">
            {stages.map(([stage, count]) => (
              // The stage name is the key of the map, and the order is the API order.
              <li key={stage}>
                <div className="dh-row-head">
                  <h3 className="dh-row-title">{label(t.stageNames, stage) || t.none}</h3>
                  <span className={`dh-status ${toneOf(stage)}`}>{formatNum(count, locale)}</span>
                </div>
                {total > 0 ? (
                  <span className="pj-bar-track" aria-hidden="true">
                    <i className={`pj-bar-fill ${toneOf(stage)}`} style={{ width: `${Math.round((count / total) * 100)}%` }} />
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="dh-meta mt-4">{t.mmNoStages}</p>
      )}

      {m.latitude !== null && m.latitude !== undefined && m.longitude !== null && m.longitude !== undefined ? (
        <p className="mt-4">
          <a className="link" href={localizePath('/map-discovery', locale)}>
            {t.mmOnMap}
            <Icon name="arrow-up-right" size={16} className="arrow" />
          </a>
        </p>
      ) : null}
    </div>
  );
}

export default MicroMarketPanel;
