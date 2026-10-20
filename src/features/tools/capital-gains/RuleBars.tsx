/**
 * The two tax rules as two bars on one scale: each bar is the net sale price,
 * split into the cost used, the exempt part, the gain left after tax, and the
 * tax at the right end. The numbers are the person's own (math.ts); the
 * table under the bars has every figure.
 */
import type { Locale } from '@/lib/i18n/locale';
import { inr } from '../ui';
import { CG_UI } from './content';
import type { Calc, CgResult } from './math';

type Row = { name: string; c: Calc; pays: boolean };

const W = 1000;

function Bar({ c, net, purchase }: { c: Calc; net: number; purchase: number }) {
  const k = W / net;
  const bought = Math.min(purchase, net);
  const cost = Math.min(Math.max(c.cost, 0), net);
  const parts = [
    { cls: 'is-bought', v: bought },
    { cls: 'is-indexed', v: Math.max(cost - bought, 0) },
    { cls: 'is-exempt', v: Math.max(c.exemption, 0) },
    { cls: 'is-rest', v: Math.max(c.taxable - c.tax, 0) },
    { cls: 'is-tax', v: Math.max(c.tax, 0) },
  ];
  let x = 0;
  return (
    <svg viewBox={`0 0 ${W} 12`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
      {parts.map((p) => {
        const w = Math.min(p.v * k, W - x);
        const el = w > 0 ? <rect key={p.cls} className={p.cls} x={x} y={0} width={w} height={12} /> : null;
        x += Math.max(w, 0);
        return el;
      })}
    </svg>
  );
}

export function RuleBars({ r, purchase, slab, locale }: { r: CgResult; purchase: number; slab: number; locale: Locale }) {
  const t = CG_UI[locale];
  if (r.loss || !(r.net > 0)) return null;
  const rows: Row[] = r.longTerm
    ? [
        ...(r.plain ? [{ name: t.plainCol, c: r.plain, pays: r.pay === r.plain }] : []),
        ...(r.indexed ? [{ name: t.indexedCol, c: r.indexed, pays: r.pay === r.indexed }] : []),
      ]
    : [{ name: t.slabCol(slab), c: r.pay, pays: true }];
  const indexed = rows.some((x) => x.c.cost > purchase);
  const exempt = rows.some((x) => x.c.exemption > 0);

  return (
    <figure className="cg-bars">
      <p className="tool-note">{t.barsLead}</p>
      {rows.map((row) => (
        <div key={row.name} className={`cg-bar${row.pays ? ' is-pay' : ''}`}>
          <div className="cg-bar-head">
            <span className="cg-bar-name">{row.name}</span>
            <span className="cg-bar-tax">
              {t.tax} {inr(row.c.tax, locale)}
            </span>
          </div>
          <Bar c={row.c} net={r.net} purchase={purchase} />
          {rows.length > 1 ? <span className="cg-bar-status">{row.pays ? t.pays : t.higher}</span> : null}
        </div>
      ))}
      <figcaption>
        <ul className="tool-legend cg-legend">
          <li>
            <i className="is-bought" aria-hidden="true" />
            {t.barPurchase}
          </li>
          {indexed ? (
            <li>
              <i className="is-indexed" aria-hidden="true" />
              {t.barIndexed}
            </li>
          ) : null}
          {exempt ? (
            <li>
              <i className="is-exempt" aria-hidden="true" />
              {t.barExempt}
            </li>
          ) : null}
          <li>
            <i className="is-rest" aria-hidden="true" />
            {t.barRest}
          </li>
          <li>
            <i className="is-tax" aria-hidden="true" />
            {t.tax}
          </li>
        </ul>
      </figcaption>
    </figure>
  );
}
