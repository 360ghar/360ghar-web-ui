/**
 * The monthly income as one strip: other expenses, EMIs already paid, the EMI
 * the new loan can take, and what is left. A bracket marks the EMI limit
 * (FOIR x income after expenses). All numbers are the person's own (math.ts).
 */
import type { CSSProperties } from 'react';
import type { Locale } from '@/lib/i18n/locale';
import { inr } from '../ui';
import { LOAN_UI } from './content';

type Props = { income: number; expenses: number; emis: number; foir: number; maxEmi: number; locale: Locale };

export function IncomeSplit({ income, expenses, emis, foir, maxEmi, locale }: Props) {
  const t = LOAN_UI[locale];
  if (!(income > 0)) return null;
  const spent = Math.min(expenses, income);
  const base = income - spent;
  const cap = base * foir;
  const now = Math.min(emis, income - spent);
  const free = Math.max(income - spent - now - maxEmi, 0);
  const parts = [
    // `v` sizes the segment (capped to the income); `shown` is what the person entered.
    { key: 'exp', label: t.partExpenses, v: spent, shown: expenses },
    { key: 'emis', label: t.partEmis, v: now, shown: emis },
    { key: 'new', label: t.partNew, v: maxEmi, shown: maxEmi },
    { key: 'free', label: t.partFree, v: free, shown: free },
  ];
  const pct = (v: number) => (v / income) * 100;
  const x0 = pct(spent);
  const x1 = Math.min(pct(spent + cap), 100);
  let x = 0;

  return (
    <section className="tool-sheet" aria-labelledby="loan-split">
      <div>
        <h2 id="loan-split" className="tool-sheet-title">
          {t.split}
        </h2>
        <p className="tool-note mt-1">{t.splitLead(Math.round(foir * 100), inr(base, locale), inr(cap, locale))}</p>
      </div>
      <figure className="tool-chart loan-split">
        <div className="loan-cap" style={{ '--x0': `${x0}%`, '--x1': `${x1}%` } as CSSProperties} aria-hidden="true">
          <span className={x0 + (x1 - x0) / 2 > 70 ? 'is-end' : x0 + (x1 - x0) / 2 < 30 ? 'is-start' : undefined}>{t.cap(inr(cap, locale))}</span>
        </div>
        <svg viewBox="0 0 1000 12" preserveAspectRatio="none" role="img" aria-label={parts.map((p) => `${p.label} ${inr(p.shown, locale)}`).join(', ')}>
          {parts.map((p) => {
            const w = (p.v / income) * 1000;
            const el = w > 0 ? <rect key={p.key} className={`is-${p.key}`} x={x} y={0} width={w} height={12} /> : null;
            x += w;
            return el;
          })}
        </svg>
        <figcaption>
          <ul className="tool-legend loan-legend">
            {parts
              .filter((p) => p.shown > 0 || p.key === 'new')
              .map((p) => (
                <li key={p.key}>
                  <i className={`is-${p.key}`} aria-hidden="true" />
                  {p.label} <b>{inr(p.shown, locale)}</b>
                </li>
              ))}
          </ul>
        </figcaption>
      </figure>
    </section>
  );
}
