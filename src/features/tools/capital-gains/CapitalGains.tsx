import { useEffect, useState } from 'react';
import type { Locale } from '@/lib/i18n/locale';
import { SelectField, TextField } from '@/ui/react/Field';
import { Segmented } from '@/ui/react/Segmented';
import { inr, NumberField, numParam, oneOf, ResultPeek, ScrollArea, ToolActions, ToolShell, useShareState } from '../ui';
import { CG_UI, SLABS } from './content';
import { capitalGains, CII, FIRST_DATE, fromOldFy, fyOf, isDate, LATEST_CII_FY, type Calc } from './math';
import { RuleBars } from './RuleBars';
import './capital-gains.css';

type Asset = 'house' | 'land';
const DEFAULTS: { sale: number; purchase: number; expenses: number; pd: string; sd: string; slab: number; asset: Asset } = {
  sale: 5_000_000,
  purchase: 2_000_000,
  expenses: 50_000,
  pd: '2015-06-01',
  sd: '2025-06-01',
  slab: 30,
  asset: 'house',
};
const date = (raw: string) => (isDate(raw) && raw >= FIRST_DATE ? raw : undefined);
const PARSE = {
  sale: numParam(0, 1e11),
  purchase: numParam(0, 1e11),
  expenses: numParam(0, 1e10),
  pd: date,
  sd: date,
  slab: (raw: string) => ((SLABS as readonly number[]).includes(Number(raw)) ? Number(raw) : undefined),
  asset: oneOf(['house', 'land'] as const),
};

function Cg({ locale, labels }: { locale: Locale; labels: { loss: string } }) {
  const t = CG_UI[locale];
  const { state: s, set, reset, link } = useShareState(DEFAULTS, PARSE);
  const [invest, setInvest] = useState({ newHouse: 0, bonds: 0, saleCii: CII[LATEST_CII_FY]! });

  // Old share links used financial years (?py=2015-2016&sy=2024-2025).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const pd = q.has('pd') ? undefined : fromOldFy(q.get('py') ?? '');
    const sd = q.has('sd') ? undefined : fromOldFy(q.get('sy') ?? '');
    if (pd || sd) set({ ...(pd ? { pd } : {}), ...(sd ? { sd } : {}) });
    if (q.has('py') || q.has('sy')) {
      q.delete('py');
      q.delete('sy');
      const rest = q.toString();
      window.history.replaceState(window.history.state, '', `${window.location.pathname}${rest ? `?${rest}` : ''}`);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const datesOk = s.sd > s.pd;
  const saleFy = fyOf(s.sd);
  const needCii = CII[saleFy] === undefined;
  const r = datesOk ? capitalGains({ sale: s.sale, purchase: s.purchase, expenses: s.expenses, bought: s.pd, sold: s.sd, slab: s.slab, asset: s.asset, ...invest }) : null;
  const saved = r && r.longTerm ? r.pay.taxBefore - r.pay.tax : 0;
  const why = !r ? '' : r.regime === 'choice' ? t.why.choice(r.pay === r.plain ? 'plain' : 'indexed') : t.why[r.regime];

  const status = (c: Calc | null) => (!c ? t.na : r && c === r.pay ? t.pays : t.higher);
  const cell = (c: Calc | null, v: (c: Calc) => string) => (c ? v(c) : '–');

  return (
    <>
      <div className="tool-split">
        <section className="tool-sheet" aria-labelledby="cg-inputs">
          <ResultPeek label={t.result} value={r ? inr(r.pay.tax, locale) : '–'} target="cg-result" />
          <h2 id="cg-inputs" className="tool-sheet-title">
            {t.details}
          </h2>
          <fieldset className="field">
            <legend className="field-label">{t.asset}</legend>
            <Segmented
              radio
              className="flex flex-wrap gap-2 pt-1"
              label={t.asset}
              value={s.asset}
              options={(['house', 'land'] as const).map((a) => [a, t[a]] as const)}
              onChange={(a) => set({ asset: a })}
            />
          </fieldset>
          <NumberField label={t.sale} prefix="₹" decimals={false} value={s.sale} max={1e11} onChange={(n) => set({ sale: n })} />
          <NumberField label={t.purchase} prefix="₹" decimals={false} value={s.purchase} max={1e11} hint={t.purchaseHint} onChange={(n) => set({ purchase: n })} />
          <div className="grid items-start gap-4 sm:grid-cols-2">
            <TextField label={t.bought} type="date" min={FIRST_DATE} value={s.pd} onChange={(e) => date(e.target.value) && set({ pd: e.target.value })} />
            <TextField
              label={t.sold}
              type="date"
              min={FIRST_DATE}
              value={s.sd}
              error={datesOk ? undefined : t.dateError}
              onChange={(e) => date(e.target.value) && set({ sd: e.target.value })}
            />
          </div>
          <NumberField label={t.expenses} prefix="₹" decimals={false} value={s.expenses} max={1e10} hint={t.expensesHint} onChange={(n) => set({ expenses: n })} />
          <SelectField label={t.slab} hint={t.slabHint} value={s.slab} onChange={(e) => set({ slab: Number(e.target.value) })}>
            {SLABS.map((n) => (
              <option key={n} value={n}>
                {n}%
              </option>
            ))}
          </SelectField>
          {needCii ? (
            <NumberField label={t.cii(saleFy)} decimals={false} value={invest.saleCii} min={1} max={2000} hint={t.ciiHint} onChange={(n) => setInvest((v) => ({ ...v, saleCii: n }))} />
          ) : null}
          <ToolActions
            locale={locale}
            link={link}
            onReset={() => {
              reset();
              setInvest({ newHouse: 0, bonds: 0, saleCii: CII[LATEST_CII_FY]! });
            }}
          />
        </section>

        <div className="tool-stack">
          <section className="tool-result" aria-live="polite" aria-labelledby="cg-result">
            <div>
              <h2 id="cg-result" className="tool-result-label">
                {t.result}
              </h2>
              <output className="tool-figure" data-testid="cg-value">
                {r ? inr(r.pay.tax, locale) : '–'}
              </output>
              <p className="tool-result-sub">{r ? (r.loss ? labels.loss : why) : t.dateError}</p>
            </div>
            {r ? (
              <dl className="tool-stats">
                <div>
                  <dt>{t.gain}</dt>
                  <dd>{inr(r.pay.gain, locale)}</dd>
                </div>
                <div>
                  <dt>{t.held}</dt>
                  <dd>
                    {t.heldValue(r.months)}
                    <span className="cg-term">{r.longTerm ? t.longTerm : t.shortTerm}</span>
                  </dd>
                </div>
                {saved > 0 ? (
                  <div>
                    <dt>{t.saved}</dt>
                    <dd>{inr(saved, locale)}</dd>
                  </div>
                ) : null}
              </dl>
            ) : null}
            <p className="tool-result-sub">{t.cess}</p>
          </section>

          {r ? (
            <section className="tool-sheet" aria-labelledby="cg-compare">
              <h2 id="cg-compare" className="tool-sheet-title">
                {r.longTerm ? t.compare : t.compareShort}
              </h2>
              <RuleBars r={r} purchase={s.purchase} slab={s.slab} locale={locale} />
              <ScrollArea label={r.longTerm ? t.compare : t.compareShort}>
                {r.longTerm ? (
                  <table className="tool-table cg-table cg-two">
                    <thead>
                      <tr>
                        <th scope="col">
                          <span className="visually-hidden">{t.compare}</span>
                        </th>
                        {[
                          { c: r.plain, h: t.plainCol },
                          { c: r.indexed, h: t.indexedCol },
                        ].map(({ c, h }) => (
                          <th key={h} scope="col" className={r.pay === c ? 'is-pay' : undefined}>
                            {h}
                            <span className="cg-status">{status(c)}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th scope="row">{t.net}</th>
                        <td>{cell(r.plain, () => inr(r.net, locale))}</td>
                        <td>{cell(r.indexed, () => inr(r.net, locale))}</td>
                      </tr>
                      <tr>
                        <th scope="row">{t.cost}</th>
                        <td>{cell(r.plain, (c) => inr(c.cost, locale))}</td>
                        <td>
                          {cell(r.indexed, (c) => inr(c.cost, locale))}
                          {r.indexed ? <span className="cg-status">{t.costIndexed(r.ciiBuy, r.ciiSale)}</span> : null}
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">{t.gain}</th>
                        <td>{cell(r.plain, (c) => inr(c.gain, locale))}</td>
                        <td>{cell(r.indexed, (c) => inr(c.gain, locale))}</td>
                      </tr>
                      <tr>
                        <th scope="row">{t.exemptions}</th>
                        <td>{cell(r.plain, (c) => `− ${inr(c.exemption, locale)}`)}</td>
                        <td>{cell(r.indexed, (c) => `− ${inr(c.exemption, locale)}`)}</td>
                      </tr>
                      <tr>
                        <th scope="row">{t.taxable}</th>
                        <td>{cell(r.plain, (c) => inr(c.taxable, locale))}</td>
                        <td>{cell(r.indexed, (c) => inr(c.taxable, locale))}</td>
                      </tr>
                      <tr className="cg-total">
                        <th scope="row">{t.tax}</th>
                        <td data-testid="cg-plain">{cell(r.plain, (c) => inr(c.tax, locale))}</td>
                        <td data-testid="cg-indexed">{cell(r.indexed, (c) => inr(c.tax, locale))}</td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <table className="tool-table cg-table">
                    <tbody>
                      <tr>
                        <th scope="row">{t.net}</th>
                        <td>{inr(r.net, locale)}</td>
                      </tr>
                      <tr>
                        <th scope="row">{t.cost}</th>
                        <td>{inr(r.pay.cost, locale)}</td>
                      </tr>
                      <tr>
                        <th scope="row">{t.gain}</th>
                        <td>{inr(r.pay.gain, locale)}</td>
                      </tr>
                      <tr className="cg-total">
                        <th scope="row">{t.slabCol(s.slab)}</th>
                        <td>{inr(r.pay.tax, locale)}</td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </ScrollArea>
            </section>
          ) : null}

          {r && r.longTerm && Math.max(r.plain?.gain ?? 0, r.indexed?.gain ?? 0) > 0 ? (
            <section className="tool-sheet" aria-labelledby="cg-reinvest">
              <div>
                <h2 id="cg-reinvest" className="tool-sheet-title">
                  {t.reinvest}
                </h2>
                <p className="tool-note mt-1">{t.reinvestLead}</p>
              </div>
              <NumberField
                label={s.asset === 'house' ? t.s54 : t.s54f}
                hint={s.asset === 'house' ? t.s54Hint : t.s54fHint}
                prefix="₹"
                decimals={false}
                value={invest.newHouse}
                max={1e11}
                onChange={(n) => setInvest((v) => ({ ...v, newHouse: n }))}
              />
              <NumberField label={t.s54ec} hint={t.s54ecHint} prefix="₹" decimals={false} value={invest.bonds} max={1e11} onChange={(n) => setInvest((v) => ({ ...v, bonds: n }))} />
            </section>
          ) : null}
        </div>
      </div>
    </>
  );
}

export default function CapitalGains({ locale, labels }: { locale: Locale; labels: { loss: string } }) {
  return (
    <ToolShell locale={locale}>
      <Cg locale={locale} labels={labels} />
    </ToolShell>
  );
}
