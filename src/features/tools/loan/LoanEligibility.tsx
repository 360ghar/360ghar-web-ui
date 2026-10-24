import { compactPrice } from '@/lib/format';
import type { Locale } from '@/lib/i18n/locale';
import { inr, numParam, RangeField, RATE_TENURE_DEFAULTS, RATE_TENURE_PARSE, RateTenureFields, ResultPeek, ToolActions, ToolShell, useShareState } from '../ui';
import { LOAN_UI } from './content';
import { IncomeSplit } from './IncomeSplit';
import { estimateLoanScenario } from './math';

const DEFAULTS = { income: 50_000, emi: 0, expenses: 10_000, ...RATE_TENURE_DEFAULTS };
const PARSE = {
  income: numParam(10_000, 500_000),
  emi: numParam(0, 100_000),
  expenses: numParam(0, 100_000),
  ...RATE_TENURE_PARSE,
};

function Loan({ locale }: { locale: Locale }) {
  const t = LOAN_UI[locale];
  const { state, set, reset, link } = useShareState(DEFAULTS, PARSE);
  const input = { income: state.income, emis: state.emi, expenses: state.expenses, rate: state.rate, tenure: state.tenure };
  const e = estimateLoanScenario(input);
  const money = (n: number) => compactPrice(n, locale);

  return (
    <>
      <div className="tool-split">
        <section className="tool-sheet" aria-labelledby="loan-inputs">
          <ResultPeek label={t.result} value={inr(e.maxLoan, locale)} target="loan-result" />
          <h2 id="loan-inputs" className="tool-sheet-title">
            {t.details}
          </h2>
          <RangeField label={t.income} value={state.income} min={10_000} max={500_000} step={5_000} prefix="₹" decimals={false} format={money} onChange={(n) => set({ income: n })} />
          <RangeField label={t.emis} value={state.emi} min={0} max={100_000} step={1_000} prefix="₹" decimals={false} format={money} onChange={(n) => set({ emi: n })} />
          <RangeField label={t.expenses} value={state.expenses} min={0} max={100_000} step={1_000} prefix="₹" decimals={false} format={money} onChange={(n) => set({ expenses: n })} />
          <RateTenureFields locale={locale} rate={state.rate} tenure={state.tenure} set={set} />
          <ToolActions locale={locale} link={link} onReset={reset} />
        </section>

        <div className="tool-stack">
          <section className="tool-result" aria-live="polite" aria-labelledby="loan-result">
            <div>
              <h2 id="loan-result" className="tool-result-label">
                {t.result}
              </h2>
              <output className="tool-figure" data-testid="loan-value">
                {inr(e.maxLoan, locale)}
              </output>
              <p className="tool-result-sub">{e.maxLoan > 0 ? t.sub(state.rate, state.tenure) : t.none}</p>
            </div>
            <dl className="tool-stats">
              <div>
                <dt>{t.maxEmi}</dt>
                <dd>{inr(e.maxEmi, locale)}</dd>
              </div>
              <div>
              <dt>{t.incomeShare}</dt>
              <dd>{Math.round(e.incomeShare * 100)}%</dd>
              </div>
            </dl>
            <p className="tool-result-sub">{t.note}</p>
          </section>

          <IncomeSplit income={state.income} expenses={state.expenses} emis={state.emi} incomeShare={e.incomeShare} maxEmi={e.maxEmi} locale={locale} />
        </div>
      </div>
    </>
  );
}

export default function LoanEligibility({ locale }: { locale: Locale }) {
  return (
    <ToolShell locale={locale}>
      <Loan locale={locale} />
    </ToolShell>
  );
}
