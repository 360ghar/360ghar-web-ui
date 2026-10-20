import { useMemo, useState } from 'react';
import { compactPrice } from '@/lib/format';
import type { Locale } from '@/lib/i18n/locale';
import { Icon } from '@/ui/icons/Icon';
import { inr, NumberField, numParam, RangeField, RATE_TENURE_DEFAULTS, RATE_TENURE_PARSE, RateTenureFields, ResultPeek, ScrollArea, ToolActions, ToolShell, useShareState } from '../ui';
import { EMI_UI } from './content';
import { balanceAfter, prepayment, schedule, summary } from './math';
import { PayoffChart } from './PayoffChart';

const DEFAULTS = { amount: 1_000_000, ...RATE_TENURE_DEFAULTS };
const PARSE = { amount: numParam(100_000, 10_000_000), ...RATE_TENURE_PARSE };

function Emi({ locale }: { locale: Locale }) {
  const t = EMI_UI[locale];
  const { state, set, reset, link } = useShareState(DEFAULTS, PARSE);
  const { amount, rate, tenure } = state;
  const [prepay, setPrepay] = useState({ amount: 0, month: 12 });

  const s = useMemo(() => summary(amount, rate, tenure), [amount, rate, tenure]);
  const rows = useMemo(() => schedule(amount, rate, tenure), [amount, rate, tenure]);
  const month = Math.min(prepay.month, s.months - 1);
  const owed = useMemo(() => balanceAfter(amount, rate, tenure, month), [amount, rate, tenure, month]);
  const lump = Math.min(prepay.amount, owed);
  const p = useMemo(() => (prepay.amount > 0 ? prepayment(amount, rate, tenure, lump, month) : null), [amount, rate, tenure, prepay.amount, lump, month]);
  const paid = useMemo(() => (lump > 0 ? schedule(amount, rate, tenure, { amount: lump, afterMonth: month }) : null), [amount, rate, tenure, lump, month]);
  const pPct = s.totalPayment > 0 ? (amount / s.totalPayment) * 100 : 0;

  return (
    <>
      <div className="tool-split">
        <section className="tool-sheet" aria-labelledby="emi-inputs">
          <ResultPeek label={t.emi} value={inr(s.emi, locale)} target="emi-result" />
          <h2 id="emi-inputs" className="tool-sheet-title">
            {t.details}
          </h2>
          <RangeField
            label={t.amount}
            value={amount}
            min={100_000}
            max={10_000_000}
            step={50_000}
            prefix="₹"
            decimals={false}
            format={(n) => compactPrice(n, locale)}
            onChange={(n) => set({ amount: n })}
          />
          <RateTenureFields locale={locale} rate={rate} tenure={tenure} set={set} />
          <ToolActions
            locale={locale}
            link={link}
            onReset={() => {
              reset();
              setPrepay({ amount: 0, month: 12 });
            }}
          />
        </section>

        <div className="tool-stack">
          <section className="tool-result" aria-live="polite" aria-labelledby="emi-result">
            <div>
              <h2 id="emi-result" className="tool-result-label">
                {t.emi}
              </h2>
              <output className="tool-figure" data-testid="emi-value">
                {inr(s.emi, locale)}
              </output>
              <p className="tool-result-sub">{t.forTenure(tenure, s.months)}</p>
            </div>
            <dl className="tool-stats">
              <div>
                <dt>{t.totalInterest}</dt>
                <dd>{inr(s.totalInterest, locale)}</dd>
              </div>
              <div>
                <dt>{t.totalPayment}</dt>
                <dd>{inr(s.totalPayment, locale)}</dd>
              </div>
            </dl>
            <div>
              <div className="tool-bar" role="img" aria-label={`${t.principal} ${Math.round(pPct)}%, ${t.interest} ${100 - Math.round(pPct)}%`}>
                <span className="tool-bar-a" style={{ width: `${pPct}%` }} />
                <span className="tool-bar-b" style={{ width: `${100 - pPct}%` }} />
              </div>
              <ul className="tool-legend">
                <li>
                  <i className="tool-bar-a" aria-hidden="true" />
                  {t.principal} {Math.round(pPct)}%
                </li>
                <li>
                  <i className="tool-bar-b" aria-hidden="true" />
                  {t.interest} {100 - Math.round(pPct)}%
                </li>
              </ul>
            </div>
          </section>

          <section className="tool-sheet" aria-labelledby="emi-prepay">
            <div>
              <h2 id="emi-prepay" className="tool-sheet-title">
                {t.prepay}
              </h2>
              <p className="tool-note mt-1">{t.prepayLead}</p>
            </div>
            <div className="grid items-start gap-4 sm:grid-cols-2">
              <NumberField
                label={t.prepayAmount}
                prefix="₹"
                decimals={false}
                value={prepay.amount}
                min={0}
                max={Math.round(owed)}
                onChange={(n) => setPrepay((v) => ({ ...v, amount: n }))}
              />
              <NumberField
                label={t.prepayMonth}
                decimals={false}
                value={month}
                min={1}
                max={s.months - 1}
                hint={t.ym(month)}
                onChange={(n) => setPrepay((v) => ({ ...v, month: Math.round(n) }))}
              />
            </div>
            {p ? (
              <dl className="tool-lines" aria-live="polite">
                <div>
                  <dt>{t.monthsSaved}</dt>
                  <dd>{p.monthsSaved}</dd>
                </div>
                <div>
                  <dt>{t.newTenure}</dt>
                  <dd>{t.ym(p.newMonths)}</dd>
                </div>
                <div className="is-total">
                  <dt>{t.interestSaved}</dt>
                  <dd>{inr(p.interestSaved, locale)}</dd>
                </div>
              </dl>
            ) : (
              <p className="tool-note">{t.prepayNone}</p>
            )}
          </section>
        </div>
      </div>

      <PayoffChart rows={paid ?? rows} base={rows} emi={s.emi} locale={locale} />

      <details className="tool-sheet tool-details">
        <summary>
          {t.schedule}
          <Icon name="chevron-down" size={22} className="tool-details-icon" />
        </summary>
        <ScrollArea label={t.schedule} tall>
          <table className="tool-table">
            <thead>
              <tr>
                <th scope="col">{t.year}</th>
                <th scope="col">{t.principal}</th>
                <th scope="col">{t.interest}</th>
                <th scope="col">{t.balance}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.year}>
                  <th scope="row">{r.year}</th>
                  <td>{inr(r.principal, locale)}</td>
                  <td>{inr(r.interest, locale)}</td>
                  <td>{inr(r.balance, locale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
      </details>
    </>
  );
}

export default function EmiCalculator({ locale }: { locale: Locale }) {
  return (
    <ToolShell locale={locale}>
      <Emi locale={locale} />
    </ToolShell>
  );
}
