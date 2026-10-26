import type { Locale } from '@/lib/i18n/locale';
import { NumberField, numParam, ResultPeek, ToolActions, ToolShell, useShareState } from '../ui';
import { CG_UI } from './content';
import { preTaxGain } from './math';
import './capital-gains.css';

const DEFAULTS = { sale: 5_000_000, purchase: 2_000_000, expenses: 50_000 };
const PARSE = {
  sale: numParam(0, 1e11),
  purchase: numParam(0, 1e11),
  expenses: numParam(0, 1e10),
};

function Cg({ locale }: { locale: Locale }) {
  const t = CG_UI[locale];
  const { state, set, reset, link } = useShareState(DEFAULTS, PARSE);
  const gain = preTaxGain(state.sale, state.purchase, state.expenses);

  return (
    <div className="tool-split">
      <section className="tool-sheet" aria-labelledby="cg-inputs">
        <ResultPeek label={t.result} value={inr(gain, locale)} target="cg-result" />
        <h2 id="cg-inputs" className="tool-sheet-title">
          {t.details}
        </h2>
        <NumberField label={t.sale} prefix="₹" decimals={false} value={state.sale} max={1e11} onChange={(n) => set({ sale: n })} />
        <NumberField label={t.purchase} prefix="₹" decimals={false} value={state.purchase} max={1e11} onChange={(n) => set({ purchase: n })} />
        <NumberField label={t.expenses} prefix="₹" decimals={false} value={state.expenses} max={1e10} hint={t.expensesHint} onChange={(n) => set({ expenses: n })} />
        <ToolActions locale={locale} link={link} onReset={reset} />
      </section>

      <section className="tool-result" aria-live="polite" aria-labelledby="cg-result">
        <div>
          <h2 id="cg-result" className="tool-result-label">
            {t.result}
          </h2>
          <output className="tool-figure" data-testid="cg-value">
            {inr(gain, locale)}
          </output>
          <p className="tool-result-sub">{t.note}</p>
        </div>
      </section>
    </div>
  );
}

function inr(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale === 'hi' ? 'hi-IN' : 'en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CapitalGains(props: { locale: Locale; labels: { loss: string } }) {
  return (
    <ToolShell locale={props.locale}>
      <Cg locale={props.locale} />
    </ToolShell>
  );
}
