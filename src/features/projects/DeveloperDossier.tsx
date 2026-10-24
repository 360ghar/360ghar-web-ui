/**
 * The developer dossier: the five-pillar score, the counts behind it, and the
 * developer's projects. Used on the existing /builder-reputation/[slug] page
 * (the route stays where it is) and on project pages that link to a developer.
 *
 * Presentational: the developer arrives as a prop. The ring is `ScoreRing`, the
 * same one the builder pages already render.
 */
import { formatNum } from '@/lib/format';
import type { Locale } from '@/lib/i18n/locale';
import { localizePath } from '@/lib/i18n/locale';
import { Icon } from '@/ui/icons/Icon';
import { fmtDate, scoreBand } from '@/features/data-hub/format';
import { ScoreRing } from '@/features/data-hub/ScoreRing';
import { label, text, toneOf } from './text';
import type { DeveloperDetail } from './types';

export type DeveloperDossierProps = { locale: Locale; developer: DeveloperDetail };

const BAND_TONE = { good: 'is-good', average: 'is-wait', poor: 'is-bad' } as const;

export function DeveloperDossier({ locale, developer: d }: DeveloperDossierProps) {
  const t = text(locale);
  const score = d.score ?? null;
  const total = score?.total_score ?? d.total_score ?? null;
  const computed = fmtDate(score?.computed_at ?? null, locale, 'long');
  const projects = d.projects ?? [];

  const pillars = score
    ? ([
        ['delivery', score.delivery],
        ['regulatory', score.regulatory],
        ['complaints', score.complaints],
        ['financials', score.financials],
        ['market_reception', score.market_reception],
      ] as const).filter(([, v]) => typeof v === 'number')
    : [];

  const counts = score
    ? (
        [
          [t.ddProjects, score.project_count],
          [t.ddDelivered, score.delivered_count],
          [t.ddUnderConstruction, score.under_construction_count],
          [t.ddComplaints, score.complaint_count],
        ] as const
      ).filter(([, v]) => typeof v === 'number')
    : [];

  const facts = (
    [
      [t.ddCin, d.cin],
      [t.ddHeadquarters, d.headquarters],
      [t.ddFounded, d.founded_year === null ? null : String(d.founded_year)],
      [t.ddListed, d.is_listed === null || d.is_listed === undefined ? null : d.is_listed ? t.yes : t.no],
      [t.ddGeographies, d.geographies?.length ? d.geographies.join(', ') : null],
    ] as [string, string | null][]
  ).filter(([, v]) => Boolean(v));

  return (
    <div className="pj-dossier">
      <section className="dh-section" aria-labelledby="pj-dossier-score">
        <h2 id="pj-dossier-score" className="dh-h2">
          {t.ddScoreTitle}
        </h2>

        {total === null ? (
          <p className="dh-meta mt-3">{t.ddScorePending}</p>
        ) : (
          <div className="sheet dh-slip pj-dossier-slip mt-4">
            <div className="flex items-center gap-5">
              <ScoreRing score={total} label={`${t.ddTotal}: ${Math.round(total)}`} />
              <div className="dh-fig">
                <span className="dh-fig-label">{t.ddTotal}</span>
                <span className="text-xl font-bold">{label(t.bands, scoreBand(total))}</span>
              </div>
            </div>
            {counts.map(([key, value]) => (
              <div className="dh-fig" key={key}>
                <span className="dh-fig-label">{key}</span>
                <span className="dh-fig-value">{formatNum(value as number, locale)}</span>
              </div>
            ))}
          </div>
        )}

        {pillars.length > 0 ? (
          <>
            <h3 className="field-label mt-6">{t.ddPillarsTitle}</h3>
            <dl className="pj-pillars mt-3">
              {pillars.map(([key, value]) => (
                <div className="pj-pillar" key={key}>
                  <dt>{t.ddPillars[key] ?? key}</dt>
                  <dd>
                    <span className="pj-pillar-track" aria-hidden="true">
                      <i className={`pj-pillar-fill ${BAND_TONE[scoreBand(value as number)]}`} style={{ width: `${Math.max(0, Math.min(100, value as number))}%` }} />
                    </span>
                    <b className="tabular">{Math.round(value as number)}</b>
                  </dd>
                </div>
              ))}
            </dl>
          </>
        ) : null}

        <p className="dh-meta mt-4">
          {t.ddHow}
          {computed ? ` ${t.ddComputed(computed)}.` : ''}
        </p>
      </section>

      {d.summary || d.dossier || facts.length > 0 ? (
        <section className="dh-section" aria-labelledby="pj-dossier-about">
          <h2 id="pj-dossier-about" className="dh-h2">
            {t.ddSummary}
          </h2>
          {d.summary ? <p className="mt-3">{d.summary}</p> : null}
          {d.dossier ? <p className="mt-3">{d.dossier}</p> : null}
          {facts.length > 0 ? (
            <dl className="dh-dl mt-4">
              {facts.flatMap(([k, v]) => [<dt key={`${k}-dt`}>{k}</dt>, <dd key={`${k}-dd`}>{v}</dd>])}
            </dl>
          ) : null}
          {d.website_url ? (
            <p className="mt-3">
              <a className="link" href={d.website_url} target="_blank" rel="noopener noreferrer">
                {t.ddWebsite}
                <Icon name="arrow-up-right" size={16} className="arrow" />
              </a>
            </p>
          ) : null}
        </section>
      ) : null}

      <section className="dh-section" aria-labelledby="pj-dossier-projects">
        <h2 id="pj-dossier-projects" className="dh-h2">
          {t.ddPortfolio}
        </h2>
        {projects.length === 0 ? (
          <p className="dh-meta mt-3">{t.ddNoProjects}</p>
        ) : (
          <ul className="sheet dh-rows mt-4">
            {projects.map((p) => (
              <li key={p.slug}>
                <div className="dh-row-head">
                  <h3 className="dh-row-title">
                    <a href={localizePath(`/project/${p.slug}`, locale)}>{p.project_name}</a>
                  </h3>
                  {p.stage ? <span className={`dh-status ${toneOf(p.stage)}`}>{label(t.stageNames, p.stage)}</span> : null}
                </div>
                <p className="dh-row-sub">{[p.location, p.district].filter(Boolean).join(' · ')}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default DeveloperDossier;
