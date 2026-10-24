/**
 * The project detail body, one section per sub-record of `ProjectDetail`.
 *
 * Every section renders nothing when its data is empty, so a project that filed
 * no cost table, no NOCs or no bank account shows a shorter page rather than an
 * empty table or a placeholder. Presentational: the project arrives as a prop.
 */
import type { ReactNode } from 'react';
import { formatNum, rupees } from '@/lib/format';
import type { Locale } from '@/lib/i18n/locale';
import { localizePath } from '@/lib/i18n/locale';
import { Icon } from '@/ui/icons/Icon';
import { fmtDate } from '@/features/data-hub/format';
import { label, text, toneOf, withUnit } from './text';
import type { ProjectDetail } from './types';

export type ProjectSectionsProps = { locale: Locale; project: ProjectDetail };

const DASH = '—';

/** One titled block. The heading is the section's accessible name. */
function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section className="dh-section" aria-labelledby={id}>
      <h2 id={id} className="dh-h2">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** A definition list of label/value rows. Rows with no value are dropped by the caller. */
function Facts({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="dh-dl mt-4">
      {rows.flatMap(([k, v]) => [<dt key={`${k}-dt`}>{k}</dt>, <dd key={`${k}-dd`}>{v}</dd>])}
    </dl>
  );
}

/**
 * A table. `rows` are cell nodes; the first cell of a row is its header cell.
 * A caption is always present, hidden, so the table has an accessible name.
 */
function DataTable({ caption, head, rows }: { caption: string; head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="dh-scroll sheet dh-sheet mt-4">
      <table className="dh-table">
        <caption className="visually-hidden">{caption}</caption>
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, i) => (
            // Rows have no stable id in the filing, and the order is the filing order.
            <tr key={i}>
              {cells.map((cell, j) =>
                j === 0 ? (
                  <th key={j} scope="row" className="font-normal">
                    {cell}
                  </th>
                ) : (
                  <td key={j}>{cell}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ProjectSections({ locale, project: p }: ProjectSectionsProps) {
  const t = text(locale);
  const s = (v: string | number | null | undefined): string => (v === null || v === undefined || v === '' ? DASH : String(v));
  const num = (v: number | null | undefined, opts?: Intl.NumberFormatOptions): string => (v === null || v === undefined ? DASH : formatNum(v, locale, opts));
  const money = (v: number | null | undefined): string => (v === null || v === undefined ? DASH : rupees(v, locale));
  const date = (v: string | null | undefined): string => fmtDate(v, locale, 'long') ?? DASH;
  const flag = (v: boolean | null | undefined): string => (v === null || v === undefined ? DASH : v ? t.yes : t.no);
  const sqm = (v: number | null | undefined): string => (v === null || v === undefined ? DASH : `${formatNum(v, locale, { maximumFractionDigits: 2 })} ${t.sqm}`);
  const share = (v: number | null | undefined): string => (v === null || v === undefined ? DASH : `${formatNum(v, locale, { maximumFractionDigits: 2 })}%`);

  const profile = p.profile;
  const land = p.land_usage ?? [];
  const expenditure = p.expenditure ?? [];
  const units = p.unit_configs ?? [];
  const specs = p.specifications ?? [];
  const facilities = p.facilities ?? [];
  const nocs = p.nocs ?? [];
  const people = p.people ?? [];
  const documents = p.documents ?? [];
  const nearby = p.nearby ?? [];
  const statutory = p.statutory ?? null;
  const bank = p.bank_account ?? null;

  const profileRows: [string, ReactNode][] = profile
    ? (
        [
          [t.portalId, s(profile.portal_project_id)],
          [t.reraReceived, date(profile.rera_received_date)],
          [t.constructionStart, date(profile.construction_start_date)],
          [t.completion, date(profile.proposed_completion_date)],
          [t.licensedLand, withUnit(profile.licensed_land_acres, t.acres, locale)],
          [t.landArea, sqm(profile.land_area_sqm)],
          [t.floors, num(profile.floors)],
          [t.unitsPerAcre, num(profile.units_per_acre)],
          [t.permissibleFar, num(profile.permissible_far, { maximumFractionDigits: 2 })],
          [t.far, num(profile.proposed_far, { maximumFractionDigits: 2 })],
          [t.stage, label(t.stageNames, profile.stage) || DASH],
        ] as [string, ReactNode][]
      ).filter(([, v]) => v !== DASH)
    : [];

  const cost = p.cost;
  const costFigures: { label: string; value: string }[] = cost
    ? [
        { label: t.costHeads.land!, value: money(cost.land_cost) },
        { label: t.costHeads.construction!, value: money(cost.construction_cost) },
        { label: t.costHeads.infrastructure!, value: money(cost.infrastructure_cost) },
        { label: t.costHeads.other!, value: money(cost.other_cost) },
        { label: t.colTotal, value: money(cost.total_cost) },
      ].filter((f) => f.value !== DASH)
    : [];

  const statutoryRows: [string, ReactNode][] = statutory
    ? (
        [
          [t.loiNumber, s(statutory.loi_number)],
          [t.loiDate, date(statutory.loi_date)],
          [t.licenceNumber, s(statutory.licence_number)],
          [t.licenceDate, date(statutory.licence_date)],
          [t.electricLoad, statutory.electric_load_kw === null || statutory.electric_load_kw === undefined ? DASH : formatNum(statutory.electric_load_kw, locale, { maximumFractionDigits: 2 })],
          [t.water, flag(statutory.water_available)],
          [t.stormWater, flag(statutory.storm_water_available)],
          [t.sewerage, flag(statutory.sewerage_available)],
        ] as [string, ReactNode][]
      ).filter(([, v]) => v !== DASH)
    : [];
  // `plan_approvals` is a map of approval name to whether it was obtained, not a list.
  const plans = Object.entries(statutory?.plan_approvals ?? {});

  const bankRows: [string, ReactNode][] = bank
    ? (
        [
          [t.colBank, s(bank.bank_name)],
          [t.colBranch, s(bank.branch_name)],
          [t.colIfsc, s(bank.ifsc)],
          [t.colMicr, s(bank.micr)],
          [t.colBranchCode, s(bank.branch_code)],
        ] as [string, ReactNode][]
      ).filter(([, v]) => v !== DASH)
    : [];

  const scale: { label: string; value: string }[] = [
    { label: t.towers, value: num(p.towers) },
    { label: t.units, value: num(p.total_units) },
    { label: t.landArea, value: withUnit(p.land_area_acres, t.acres, locale) },
    { label: t.far, value: num(p.proposed_far, { maximumFractionDigits: 2 }) },
    { label: t.launchPrice, value: profile?.launch_price_per_sqft === null || profile?.launch_price_per_sqft === undefined ? DASH : `${rupees(profile.launch_price_per_sqft, locale)} ${t.perSqft}` },
    { label: t.priceNow, value: p.current_price_per_sqft === null || p.current_price_per_sqft === undefined ? DASH : `${rupees(p.current_price_per_sqft, locale)} ${t.perSqft}` },
    { label: t.coordinates, value: profile?.latitude === null || profile?.latitude === undefined || profile?.longitude === null || profile?.longitude === undefined ? DASH : `${formatNum(profile.latitude, locale, { maximumFractionDigits: 5 })}, ${formatNum(profile.longitude, locale, { maximumFractionDigits: 5 })}` },
  ].filter((f) => f.value !== DASH);

  return (
    <div className="pj-sections">
      {profileRows.length > 0 ? (
        <Section id="pj-overview" title={t.overviewTitle}>
          <Facts rows={profileRows} />
        </Section>
      ) : null}

      {scale.length > 0 ? (
        <Section id="pj-development" title={t.developmentTitle}>
          <dl className="sheet dh-slip mt-4">
            {scale.map((f) => (
              <div className="dh-fig" key={f.label}>
                <dt className="dh-fig-label">{f.label}</dt>
                <dd className="dh-fig-value">{f.value}</dd>
              </div>
            ))}
          </dl>
          {profile?.latitude !== null && profile?.latitude !== undefined ? (
            <p className="mt-3">
              <a className="link" href={localizePath('/map-discovery', locale)}>
                {t.viewOnMap}
                <Icon name="arrow-up-right" size={16} className="arrow" />
              </a>
            </p>
          ) : null}
        </Section>
      ) : null}

      {land.length > 0 ? (
        <Section id="pj-land" title={t.landUsageTitle}>
          <DataTable
            caption={t.landUsageTitle}
            head={[t.colParticular, t.colAreaSqm, t.colAreaAcres, t.colShare]}
            rows={land.map((r) => [s(r.particular), sqm(r.area_sqm), withUnit(r.area_acres, t.acres, locale), share(r.percentage)])}
          />
        </Section>
      ) : null}

      {costFigures.length > 0 ? (
        <Section id="pj-cost" title={t.costTitle}>
          <Facts rows={costFigures.map((f) => [f.label, f.value] as [string, ReactNode])} />
        </Section>
      ) : null}

      {expenditure.length > 0 ? (
        <Section id="pj-expenditure" title={t.expenditureTitle}>
          <DataTable
            caption={t.expenditureTitle}
            head={[t.colYear, t.colQuarter, t.colCategory, t.colParticular, t.colAmount]}
            rows={expenditure.map((r) => [num(r.year), s(r.quarter), s(r.category), s(r.particular), money(r.amount)])}
          />
        </Section>
      ) : null}

      {units.length > 0 ? (
        <Section id="pj-units" title={t.unitsTitle}>
          <DataTable
            caption={t.unitsTitle}
            head={[t.colUnitType, t.colCarpet, t.colBuiltUp, t.colSuperBuiltUp, t.colEfficiency, t.colUnits, t.colTowers, t.colParkings, t.colPrice]}
            rows={units.map((u) => [
              s(u.unit_type),
              sqm(u.carpet_area_sqm),
              sqm(u.built_up_area_sqm),
              sqm(u.super_built_up_area_sqm),
              u.carpet_efficiency === null || u.carpet_efficiency === undefined ? DASH : share(u.carpet_efficiency <= 1 ? u.carpet_efficiency * 100 : u.carpet_efficiency),
              num(u.units),
              num(u.towers),
              num(u.parkings),
              money(u.price),
            ])}
          />
        </Section>
      ) : null}

      {specs.length > 0 ? (
        <Section id="pj-specs" title={t.specsTitle}>
          <DataTable
            caption={t.specsTitle}
            head={[t.colScope, t.colUnitType, t.colSpecKey, t.colSpecValue]}
            rows={specs.map((r) => [s(r.scope), s(r.unit_type), s(r.spec_key), s(r.spec_value)])}
          />
        </Section>
      ) : null}

      {facilities.length > 0 ? (
        <Section id="pj-facilities" title={t.facilitiesTitle}>
          <DataTable
            caption={t.facilitiesTitle}
            head={[t.colFacility, t.colEstimatedCost, t.colFacilityStatus]}
            rows={facilities.map((r) => [s(r.facility), money(r.estimated_cost), label(t.stageNames, r.status) || DASH])}
          />
        </Section>
      ) : null}

      {nocs.length > 0 ? (
        <Section id="pj-nocs" title={t.nocsTitle}>
          <DataTable
            caption={t.nocsTitle}
            head={[t.colFacility, t.colProvider, t.colApproved, t.colReference]}
            rows={nocs.map((r) => [s(r.facility), s(r.provider_agency), flag(r.approved), s(r.approval_reference)])}
          />
        </Section>
      ) : null}

      {statutoryRows.length > 0 || plans.length > 0 ? (
        <Section id="pj-statutory" title={t.statutoryTitle}>
          {statutoryRows.length > 0 ? <Facts rows={statutoryRows} /> : null}
          {plans.length > 0 ? (
            <>
              <h3 className="field-label mt-5">{t.planApprovals}</h3>
              <ul className="dh-rows sheet mt-2">
                {plans.map(([plan, obtained]) => (
                  <li key={plan}>
                    <div className="dh-row-head">
                      <h3 className="dh-row-title">{plan}</h3>
                      <span className={`dh-status ${obtained ? 'is-good' : 'is-wait'}`}>{obtained ? t.yes : t.no}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </Section>
      ) : null}

      {people.length > 0 ? (
        <Section id="pj-people" title={t.peopleTitle}>
          <ul className="dh-rows sheet mt-4">
            {people.map((person, i) => (
              <li key={i}>
                <div className="dh-row-head">
                  <h3 className="dh-row-title">{person.name || DASH}</h3>
                  <span className="dh-status is-plain">{label(t.roles, person.role) || DASH}</span>
                </div>
                {person.pan_last4 ? (
                  <dl className="dh-facts">
                    <div>
                      <dt>{t.colPan}</dt>
                      <dd className="tabular">{person.pan_last4}</dd>
                    </div>
                  </dl>
                ) : null}
              </li>
            ))}
          </ul>
          <p className="dh-meta mt-3">{t.peopleNote}</p>
        </Section>
      ) : null}

      {bankRows.length > 0 ? (
        <Section id="pj-bank" title={t.bankTitle}>
          <Facts rows={bankRows} />
          <p className="dh-meta mt-3">{t.bankNote}</p>
        </Section>
      ) : null}

      {documents.length > 0 ? (
        <Section id="pj-documents" title={t.documentsTitle}>
          <ul className="dh-rows sheet mt-4">
            {documents.map((doc, i) => (
              <li key={i}>
                <div className="dh-row-head">
                  <h3 className="dh-row-title">{doc.description || `${t.colDocument} ${s(doc.ordinal)}`}</h3>
                  {doc.uploaded_on ? <span className="tabular text-ink-800">{date(doc.uploaded_on)}</span> : null}
                </div>
                {doc.view_url ? (
                  <a className="link" href={doc.view_url} target="_blank" rel="noopener noreferrer">
                    {t.openDocument}
                    <Icon name="arrow-up-right" size={16} className="arrow" />
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
          <p className="dh-meta mt-3">{t.documentsNote}</p>
        </Section>
      ) : null}

      {nearby.length > 0 ? (
        <Section id="pj-nearby" title={t.nearbyTitle}>
          <ul className="dh-rows sheet mt-4">
            {nearby.map((other, i) => (
              <li key={i}>
                <div className="dh-row-head">
                  <h3 className="dh-row-title">
                    {other.slug ? <a href={localizePath(`/project/${other.slug}`, locale)}>{other.project_name || other.slug}</a> : other.project_name || DASH}
                  </h3>
                  {other.stage ? <span className={`dh-status ${toneOf(other.stage)}`}>{label(t.stageNames, other.stage)}</span> : null}
                </div>
                {/* The route sends list-level rows: there is no distance on the wire. */}
                {other.developer_name ? <p className="dh-row-sub">{other.developer_name}</p> : null}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </div>
  );
}

export default ProjectSections;
