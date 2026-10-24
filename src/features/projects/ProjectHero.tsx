/**
 * Project hero: the identity line (RERA number, developer, stage), the key
 * numbers, and the provenance note. Presentational: the project comes in as a
 * prop and nothing is fetched here.
 */
import { formatNum, rupees } from '@/lib/format';
import type { Locale } from '@/lib/i18n/locale';
import { localizePath } from '@/lib/i18n/locale';
import { Icon } from '@/ui/icons/Icon';
import { fmtDate } from '@/features/data-hub/format';
import { label, text, toneOf, withUnit } from './text';
import type { ProjectSummary } from './types';

export type ProjectHeroProps = { locale: Locale; project: ProjectSummary };

export function ProjectHero({ locale, project: p }: ProjectHeroProps) {
  const t = text(locale);
  const stage = label(t.stageNames, p.stage);
  const updated = fmtDate(p.updated_at, locale, 'long');
  const facts: { label: string; value: string }[] = [
    { label: t.units, value: p.total_units === null || p.total_units === undefined ? '—' : formatNum(p.total_units, locale) },
    { label: t.towers, value: p.towers === null || p.towers === undefined ? '—' : formatNum(p.towers, locale) },
    { label: t.landArea, value: withUnit(p.land_area_acres, t.acres, locale) },
    { label: t.far, value: p.proposed_far === null || p.proposed_far === undefined ? '—' : formatNum(p.proposed_far, locale, { maximumFractionDigits: 2 }) },
    { label: t.pricePerSqft, value: p.current_price_per_sqft === null || p.current_price_per_sqft === undefined ? t.noPrice : `${rupees(p.current_price_per_sqft, locale)} ${t.perSqft}` },
    { label: t.possession, value: fmtDate(p.possession_date, locale, 'long') ?? '—' },
    { label: t.complaints, value: p.complaint_count === null || p.complaint_count === undefined ? '—' : formatNum(p.complaint_count, locale) },
  ];

  return (
    <section className="dh-section pj-hero" aria-labelledby="pj-hero-name">
      <p id="pj-hero-name" className="pj-hero-name">
        {p.project_name}
      </p>

      <p className="pj-hero-meta">
        {p.rera_number ? (
          <span className="pj-chip">
            <Icon name="document" size={16} />
            <span className="visually-hidden">{t.reraNumber}: </span>
            <b className="tabular">{p.rera_number}</b>
          </span>
        ) : null}
        {p.developer_slug && p.developer_name ? (
          <a className="pj-chip is-link" href={localizePath(`/builder-reputation/${p.developer_slug}`, locale)}>
            <Icon name="crane" size={16} />
            <span className="visually-hidden">{t.developer}: </span>
            {p.developer_name}
          </a>
        ) : p.developer_name ? (
          <span className="pj-chip">
            <Icon name="crane" size={16} />
            {p.developer_name}
          </span>
        ) : null}
        {stage ? (
          <span className={`dh-status ${toneOf(p.stage)}`}>
            <Icon name={toneOf(p.stage) === 'is-good' ? 'check' : toneOf(p.stage) === 'is-bad' ? 'alert' : 'clock'} size={16} />
            {stage}
          </span>
        ) : null}
      </p>

      <dl className="sheet dh-slip pj-hero-facts">
        {facts.map((f) => (
          <div className="dh-fig" key={f.label}>
            <dt className="dh-fig-label">{f.label}</dt>
            <dd className="dh-fig-value">{f.value}</dd>
          </div>
        ))}
      </dl>

      <dl className="dh-facts">
        {p.location ? (
          <div>
            <dt>{t.location}</dt>
            <dd>{p.location}</dd>
          </div>
        ) : null}
        {p.district ? (
          <div>
            <dt>{t.district}</dt>
            <dd>{p.district}</dd>
          </div>
        ) : null}
        {p.proposed_completion_date ? (
          <div>
            <dt>{t.completion}</dt>
            <dd>{fmtDate(p.proposed_completion_date, locale, 'long') ?? p.proposed_completion_date}</dd>
          </div>
        ) : null}
        {p.status ? (
          <div>
            <dt>{t.status}</dt>
            <dd>{label(t.stageNames, p.status)}</dd>
          </div>
        ) : null}
      </dl>

      <p className="dh-meta pj-hero-source">
        {p.provenance?.verification_status === 'verified' ? `${t.verified}. ` : p.provenance ? `${t.unverified}. ` : ''}
        {updated ? `${t.updated(updated)}. ` : ''}
        {p.source_url ? (
          <a className="link" href={p.source_url} target="_blank" rel="noopener noreferrer">
            {t.openSource}
            <Icon name="arrow-up-right" size={16} className="arrow" />
          </a>
        ) : null}
      </p>
    </section>
  );
}

export default ProjectHero;
