/**
 * Stamp duty calculator. The backend does the arithmetic
 * (POST /data-hub/calculator/stamp-duty, a pure calculation). The page picks the
 * base value first: the higher of the deal value and area x circle rate, because
 * the backend does not apply that rule (backend-gaps R7). Used on
 * /stamp-duty-calculator (with the sector picker and the state table),
 * /circle-rates and /circle-rate/:slug (rate fixed by the page).
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useId, useState, type ReactNode, type SyntheticEvent } from 'react';
import { describeError } from '@/lib/api/errors';
import { rupees } from '@/lib/format';
import type { Locale } from '@/lib/i18n/locale';
import { localizePath } from '@/lib/i18n/locale';
import { Icon } from '@/ui/icons/Icon';
import { Segmented } from '@/ui/react/Segmented';
import { SelectField, TextField } from '@/ui/react/Field';
import { circleRatesPage, stampDuty, type BuyerType, type CircleRate } from './api';
import { duty, dutyBase, parseAmount, STATE_RATES } from './format';
import { Island } from './Island';
import { label, text } from './text';

type Fixed = { sector: string; property_type: string; rate_per_sqyd: number | null };
/** `children`: the paper scene for the empty result (static HTML from the page, no JS). */
type Props = { locale: Locale; sectors?: string[]; fixed?: Fixed; states?: boolean; title?: string; children?: ReactNode };

const haryana = (buyer: 'male' | 'female') => STATE_RATES.find((s) => s.state === 'Haryana' && s.buyer === buyer)!.rate;
// Haryana rates for the buyer picker. STATE_RATES has no joint row, so that rate stays here.
const BUYERS: { id: BuyerType; rate: number }[] = [
  { id: 'male', rate: haryana('male') },
  { id: 'female', rate: haryana('female') },
  { id: 'joint', rate: 6 },
];

function Calculator({ locale, sectors, fixed, states = false, title, children }: Props) {
  const t = text(locale);
  const id = useId();
  const [value, setValue] = useState('');
  const [buyer, setBuyer] = useState<BuyerType>('male');
  const [sector, setSector] = useState('');
  const [ptype, setPtype] = useState('residential');
  const [area, setArea] = useState('');
  const [error, setError] = useState<string | null>(null);

  const client = useQueryClient();
  const ratesQuery = { queryKey: ['data-hub', 'sector-rates', sector], queryFn: async () => (await circleRatesPage({ sector }, null)).items, staleTime: 3600_000 };
  const rates = useQuery({ ...ratesQuery, enabled: Boolean(sector) && !fixed });
  const pickRate = (rows: CircleRate[] | undefined) => rows?.find((x) => x.property_type === ptype)?.rate_per_sqyd ?? null;
  const rate = fixed ? fixed.rate_per_sqyd : pickRate(rates.data);
  const hasSector = Boolean(fixed || sector);

  const calc = useMutation({
    mutationFn: (base: number) => stampDuty({ property_value: base, buyer_type: buyer }),
  });

  const deal = parseAmount(value);
  const areaSqyd = hasSector ? parseAmount(area) : null;

  const submit = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (!deal) {
      setError(t.sdValueError);
      return;
    }
    setError(null);
    // The sector rates may still be loading when the button is pressed: wait for them.
    let r = rate;
    if (!fixed && sector && areaSqyd && r === null) r = pickRate(await client.query(ratesQuery).catch(() => undefined));
    calc.mutate(dutyBase(deal, areaSqyd, r).value);
  };

  const r = calc.data;
  const shownBase = calc.variables ?? null;
  // The two values the duty is chosen from (current inputs), for the bars.
  const shown = deal ? dutyBase(deal, areaSqyd, rate) : { circleValue: null };
  const serverError = calc.isError ? describeError(calc.error, locale) : null;

  return (
    <div className="dh-split">
      <form className="sheet dh-panel dh-form" onSubmit={(e) => void submit(e)} noValidate aria-labelledby={`${id}-title`}>
        <h2 id={`${id}-title`} className="dh-panel-title">
          {title ?? t.sdTitle}
        </h2>
        <TextField
          label={t.sdValue}
          hint={t.sdValueHint}
          inputMode="numeric"
          autoComplete="off"
          placeholder="85,00,000"
          value={value}
          error={error ?? undefined}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(null);
          }}
        />
        <fieldset className="dh-fieldset">
          <legend className="field-label">{locale === 'hi' ? 'खरीदार' : 'Buyer'}</legend>
          <Segmented
            radio
            className="dh-seg"
            label={locale === 'hi' ? 'खरीदार' : 'Buyer'}
            value={buyer}
            options={BUYERS.map((b) => [b.id, <>{t.buyers[b.id]} <span className="tabular">{b.rate}%</span></>] as const)}
            onChange={setBuyer}
          />
        </fieldset>

        {sectors && !fixed ? (
          <div className="dh-form-row">
            <SelectField label={t.sdSector} hint={sector ? undefined : t.sdSectorHint} value={sector} onChange={(e) => setSector(e.target.value)}>
              <option value="">{t.sdSectorAny}</option>
              {sectors.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </SelectField>
            {sector ? (
              <SelectField label={t.sdRateType} value={ptype} onChange={(e) => setPtype(e.target.value)}>
                {(rates.data?.length ? rates.data.map((x) => x.property_type) : ['residential', 'commercial', 'plot']).map((p) => (
                  <option key={p} value={p}>
                    {label(t.types, p)}
                  </option>
                ))}
              </SelectField>
            ) : null}
          </div>
        ) : null}

        {hasSector ? (
          <TextField
            label={t.sdArea}
            optional={locale === 'hi' ? '(वैकल्पिक)' : '(optional)'}
            hint={rate ? t.sdAreaHint(rupees(rate, locale)) : undefined}
            inputMode="decimal"
            autoComplete="off"
            value={area}
            onChange={(e) => setArea(e.target.value)}
          />
        ) : null}

        <button type="submit" className="btn btn-primary btn-block" disabled={calc.isPending}>
          {calc.isPending ? t.sdBusy : t.sdSubmit}
        </button>
        {serverError ? (
          <p className="field-error" role="alert">
            <Icon name="alert" size={16} />
            {serverError.title}. {serverError.body}
          </p>
        ) : null}
      </form>

      <div className="grid gap-6">
        <div className="dh-slip-wrap soft-lift" data-depth="2" aria-live="polite">
          <div className="grain dh-slip is-stack bg-mist-100">
            {r && shownBase ? (
              <>
                <div className="dh-fig">
                  <span className="dh-fig-label">{t.sdTotal}</span>
                  <span className="dh-fig-value">{rupees(r.total_cost, locale)}</span>
                  <span className="dh-fig-note">
                    {t.sdBase} {rupees(r.property_value, locale)}
                  </span>
                </div>
                <dl className="dh-dl self-start">
                  <dt>{t.sdDuty(r.stamp_duty_rate)}</dt>
                  <dd className="tabular">{rupees(r.stamp_duty_amount, locale)}</dd>
                  <dt>{t.sdReg}</dt>
                  <dd className="tabular">{rupees(r.registration_fee, locale)}</dd>
                </dl>
                {deal && shown.circleValue ? <BaseBars deal={deal} circle={shown.circleValue} locale={locale} /> : null}
                {deal && shownBase > deal ? <p className="dh-fig-note">{t.sdByCircle(rupees(shownBase, locale))}</p> : null}
                {r.current_bank_rate ? (
                  <div>
                    <p className="dh-fig-note">{t.sdLoan(r.current_bank_rate)}</p>
                    <a className="link" href={localizePath('/emi-calculator', locale)}>
                      {t.sdEmi}
                      <Icon name="arrow-up-right" size={16} className="arrow" />
                    </a>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="dh-sd-empty">
                {children ? <div className="dh-sd-art">{children}</div> : null}
                <div className="dh-fig">
                  <span className="dh-fig-label">{t.sdTotal}</span>
                  <span className="dh-fig-note">{t.sdEmpty}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {states ? (
          <section aria-labelledby={`${id}-states`}>
            <h2 id={`${id}-states`} className="dh-panel-title mb-1">
              {t.sdStates}
            </h2>
            <p className="dh-meta mb-3">{t.sdStatesLead}</p>
            <div className="sheet dh-sheet">
              <table className="dh-table">
                <thead>
                  <tr>
                    <th scope="col">{t.sdStateCol}</th>
                    <th scope="col" className="num">
                      {t.sdRateCol}
                    </th>
                    <th scope="col" className="num">
                      {t.sdAmountCol}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {STATE_RATES.map((s) => (
                    <tr key={`${s.state}-${s.buyer}`}>
                      <td>
                        {t.states[s.state]}, {t.buyers[s.buyer]?.toLowerCase()}
                      </td>
                      <td className="num">{s.rate}%</td>
                      <td className="num">
                        <span className="dh-sd-cell">
                          <svg className="dh-sd-bar" viewBox="0 0 100 8" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                            <rect x="0" y="0" width={(s.rate / MAX_RATE) * 100} height="8" rx="1" />
                          </svg>
                          {deal ? rupees(duty(deal, s.rate), locale) : '–'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

const MAX_RATE = Math.max(...STATE_RATES.map((x) => x.rate));

/** Deal value and circle-rate value as two bars on one scale; the higher one is used. */
function BaseBars({ deal, circle, locale }: { deal: number; circle: number; locale: Locale }) {
  const t = text(locale);
  const top = Math.max(deal, circle);
  const rows = [
    { label: t.sdDeal, v: deal, used: deal >= circle },
    { label: t.sdCircle, v: circle, used: circle > deal },
  ];
  return (
    <ul className="dh-sd-base">
      {rows.map((row) => (
        <li key={row.label} className={row.used ? 'is-used' : undefined}>
          <span className="dh-sd-base-head">
            <span>
              {row.label}
              {row.used ? <span className="dh-sd-used"> · {t.sdUsed}</span> : null}
            </span>
            <b className="tabular">{rupees(row.v, locale)}</b>
          </span>
          <svg viewBox="0 0 100 8" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <rect x="0" y="0" width={(row.v / top) * 100} height="8" rx="1" />
          </svg>
        </li>
      ))}
    </ul>
  );
}

export default function StampDuty(props: Props) {
  return (
    <Island locale={props.locale}>
      <Calculator {...props} />
    </Island>
  );
}
