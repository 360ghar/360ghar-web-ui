/**
 * Local market data under a listing's location: circle rates and zoning for
 * the sector, and the neighbourhood score. Each part hides when the backend
 * has no data, and the whole block hides when none has.
 */
import { useQuery } from '@tanstack/react-query';
import { api, call } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { rupees } from '@/lib/format';
import type { Locale } from '@/lib/i18n/locale';
import { localizePath } from '@/lib/i18n/locale';
import { QueryProvider } from '@/lib/query';
import { IslandBoundary } from '@/ui/react/IslandBoundary';
import { Icon } from '@/ui/icons/Icon';
import { Skeleton } from '@/ui/react/Delayed';


const T = {
  en: {
    rates: (s: string) => `Circle rate in ${s}`,
    year: (y: number) => `revised ${y}`,
    perSqyd: 'per sq yd',
    noRate: 'Not published',
    perSqft: (v: string) => `${v} per sq ft`,
    ratesNote: 'The lowest value the government accepts for stamp duty on a sale.',
    zone: 'Zoning',
    landUse: 'Land use',
    far: 'FAR',
    coverage: 'Ground coverage',
    height: 'Max height',
    score: 'Neighbourhood score',
    transit: 'Transit',
    education: 'Schools',
    health: 'Health',
    retail: 'Shops',
    more: 'All circle rates',
    zoneMore: 'Zone details',
    types: { residential: 'Residential', commercial: 'Commercial', industrial: 'Industrial', agricultural: 'Agricultural', institutional: 'Institutional', plot: 'Plot' } as Record<string, string>,
  },
  hi: {
    rates: (s: string) => `${s} में सर्कल रेट`,
    year: (y: number) => `${y} में संशोधित`,
    perSqyd: 'प्रति वर्ग गज',
    noRate: 'प्रकाशित नहीं',
    perSqft: (v: string) => `${v} प्रति वर्ग फ़ुट`,
    ratesNote: 'बिक्री पर स्टांप ड्यूटी के लिए सरकार जो सबसे कम कीमत मानती है।',
    zone: 'ज़ोनिंग',
    landUse: 'ज़मीन का उपयोग',
    far: 'FAR',
    coverage: 'ग्राउंड कवरेज',
    height: 'अधिकतम ऊँचाई',
    score: 'पड़ोस का स्कोर',
    transit: 'ट्रांज़िट',
    education: 'स्कूल',
    health: 'स्वास्थ्य',
    retail: 'दुकानें',
    more: 'सभी सर्कल रेट',
    zoneMore: 'ज़ोन की जानकारी',
    types: { residential: 'आवासीय', commercial: 'व्यावसायिक', industrial: 'औद्योगिक', agricultural: 'कृषि', institutional: 'संस्थागत', plot: 'प्लॉट' } as Record<string, string>,
  },
};

const quiet = async <T,>(p: Promise<T>): Promise<T | null> => {
  try {
    return await p;
  } catch (e) {
    if (e instanceof ApiError && e.kind === 'not_found') return null;
    throw e;
  }
};

function Panels({ id, sector, locale }: { id: number; sector: string | null; locale: Locale }) {
  const t = T[locale];
  const rates = useQuery({
    queryKey: ['circle', sector],
    enabled: Boolean(sector),
    queryFn: async () => (await call(api.GET('/api/v1/data-hub/circle-rates', { params: { query: { sector: sector!, limit: 6 } } }))).items,
  });
  const zone = useQuery({
    queryKey: ['zone', sector],
    enabled: Boolean(sector),
    queryFn: async () => (await call(api.GET('/api/v1/data-hub/zoning', { params: { query: { sector: sector!, limit: 1 } } }))).items[0] ?? null,
  });
  const score = useQuery({
    queryKey: ['hood', id],
    queryFn: () => quiet(call(api.GET('/api/v1/data-hub/neighbourhood/{listing_id}', { params: { path: { listing_id: id } } }))),
  });

  const loading = rates.isPending && zone.isPending && score.isPending && Boolean(sector);
  // The sector filter matches substrings (backend-gaps R16): keep the rows of this sector only.
  const own = (rates.data ?? []).filter((r) => r.sector.toLowerCase() === (sector ?? '').toLowerCase());
  const year = own.reduce((y, r) => Math.max(y, r.revision_year ?? 0), 0);
  const z = zone.data;
  const s = score.data;
  const parts = Number(own.length > 0) + Number(Boolean(z)) + Number(Boolean(s));
  if (!loading && parts === 0) return null;
  if (loading) return <Skeleton className="prop-rates h-32" />;

  return (
    <div className="prop-data-grid">
      {own.length ? (
        <div className="prop-rates">
          <h3>
            {t.rates(sector!)}
            {year ? <span className="font-normal text-ink-600">, {t.year(year)}</span> : null}
          </h3>
          <ul className="prop-rate-rows tabular">
            {own.map((r) => (
              <li key={r.id}>
                <span>{t.types[r.property_type] ?? r.property_type}</span>
                <span className="v">
                  {/* A null rate is "not published", never a price of 0. */}
                  {r.rate_per_sqyd ? (
                    <>
                      {rupees(r.rate_per_sqyd, locale)} <small className="font-sans text-sm font-normal text-ink-600">{t.perSqyd}</small>
                    </>
                  ) : (
                    <small className="font-sans text-sm font-normal text-ink-600">{t.noRate}</small>
                  )}
                </span>
                {r.rate_per_sqft ? <span className="s">{t.perSqft(rupees(r.rate_per_sqft, locale))}</span> : null}
              </li>
            ))}
          </ul>
          <p className="prop-rates-note">
            {t.ratesNote}{' '}
            <a className="link" href={localizePath('/circle-rates', locale)}>
              {t.more} <Icon name="arrow-up-right" size={14} className="arrow" />
            </a>
          </p>
        </div>
      ) : null}
      {z ? (
        <div className="prop-rates">
          <h3>{t.zone}</h3>
          <dl className="prop-dl">
            {z.land_use ? (
              <>
                <dt>{t.landUse}</dt>
                <dd className="capitalize">{z.land_use}</dd>
              </>
            ) : null}
            {z.far_limit != null ? (
              <>
                <dt>{t.far}</dt>
                <dd>{z.far_limit}</dd>
              </>
            ) : null}
            {z.max_coverage_pct != null ? (
              <>
                <dt>{t.coverage}</dt>
                <dd>{z.max_coverage_pct}%</dd>
              </>
            ) : null}
            {z.max_height_m != null ? (
              <>
                <dt>{t.height}</dt>
                <dd>{z.max_height_m} m</dd>
              </>
            ) : null}
          </dl>
          <a className="link" href={localizePath(`/zone-checker/${z.slug}`, locale)}>
            {t.zoneMore} <Icon name="arrow-up-right" size={14} className="arrow" />
          </a>
        </div>
      ) : null}
      {s ? (
        <div className="prop-rates">
          <h3>
            {t.score}: <span className="tabular">{s.overall_score ?? '–'}/100</span>
          </h3>
          <ul className="prop-scores">
            {(
              [
                ['transit', s.transit_score],
                ['education', s.education_score],
                ['health', s.health_score],
                ['retail', s.retail_score],
              ] as const
            )
              .filter(([, v]) => v != null)
              .map(([k, v]) => (
                <li key={k}>
                  <span>{t[k]}</span>
                  <span className="prop-bar" aria-hidden="true">
                    <span style={{ width: `${Math.max(0, Math.min(100, v!))}%` }} />
                  </span>
                  <span className="tabular">{v}</span>
                </li>
              ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export default function DataHubPanels(props: { id: number; sector: string | null; locale: Locale }) {
  return (
    <QueryProvider>
      <IslandBoundary locale={props.locale} compact>
        <Panels {...props} />
      </IslandBoundary>
    </QueryProvider>
  );
}
