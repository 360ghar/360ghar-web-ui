import type { Locale } from '@/lib/i18n/locale';
import { Icon } from '@/ui/icons/Icon';
import { SelectField } from '@/ui/react/Field';
import { num, NumberField, numParam, oneOf, ToolActions, ToolShell, useShareState } from '../ui';
import { CONVERTER_UI, SHORT } from './content';
import { convert, fmtArea, SQFT_PER, type Unit } from './units';
import './area.css';

type Props = {
  locale: Locale;
  units: Unit[];
  /** Long unit names (from tools.json). */
  labels: Record<Unit, string>;
  defaults: { v: number; from: Unit; to: Unit };
  /** Show the size of one unit of each side as two bars. */
  compare?: boolean;
};

/** 9.6 -> "9.6 m", 12500 -> "12.5 km". */
function metres(m: number, locale: Locale) {
  return m >= 10_000 ? `${num(m / 1000, locale, 1)} km` : `${num(m, locale, 1)} m`;
}

function Converter({ locale, units, labels, defaults, compare = false }: Props) {
  const t = CONVERTER_UI[locale];
  const short = SHORT[locale];
  const parsers = { v: numParam(0, 1e12), from: oneOf(units), to: oneOf(units) };
  const { state, set, reset, link } = useShareState(defaults, parsers);
  const { v, from, to } = state;
  const result = convert(v, from, to);
  const big = Math.max(SQFT_PER[from], SQFT_PER[to]);
  // Side of a square plot of this area, in feet.
  const side = Math.sqrt(Math.max(convert(v, from, 'sq_ft'), 0));
  const options = units.map((u) => (
    <option key={u} value={u}>
      {labels[u]}
    </option>
  ));

  return (
    <>
      <div className="tool-split">
        <section className="tool-sheet" aria-labelledby="conv-inputs">
          <h2 id="conv-inputs" className="tool-sheet-title">
            {t.title}
          </h2>
          <NumberField label={t.value} value={v} min={0} max={1e12} format={(n) => fmtArea(n, 'en')} onChange={(n) => set({ v: n })} />
          <div className="area-units">
            <SelectField label={t.from} value={from} onChange={(e) => set({ from: e.target.value as Unit })}>
              {options}
            </SelectField>
            <button type="button" className="btn btn-quiet area-swap" aria-label={t.swap} onClick={() => set({ from: to, to: from })}>
              <Icon name="compare" size={20} className="icon-turn" />
              <span className="area-swap-text" aria-hidden="true">
                {t.swap}
              </span>
            </button>
            <SelectField label={t.to} value={to} onChange={(e) => set({ to: e.target.value as Unit })}>
              {options}
            </SelectField>
          </div>
          <p className="tool-note">{t.unitNote}</p>
          <ToolActions locale={locale} link={link} onReset={reset} />
        </section>

        <section className="tool-result" aria-live="polite" aria-labelledby="conv-result">
          <div>
            <h2 id="conv-result" className="tool-result-label">
              {t.is(fmtArea(v, locale), short[from])}
            </h2>
            <output className="tool-figure" data-testid="area-result">
              {fmtArea(result, locale)}
              <span className="tool-figure-unit">{short[to]}</span>
            </output>
            <p className="tool-result-sub">{t.rate(short[from], fmtArea(convert(1, from, to), locale), short[to])}</p>
          </div>
          <div className="area-figs">
            {side > 0 ? (
              <figure className="area-plot">
                {/* The area drawn as a square, with its side marked along the foot. */}
                <svg viewBox="0 0 100 116" aria-hidden="true" focusable="false">
                  <rect className="area-plot-sq" x="0" y="0" width="100" height="100" />
                  <path className="area-plot-dim" d="M0 110H100M0 104V116M100 104V116" />
                </svg>
                <figcaption>
                  <span className="tool-result-label">{t.plot}</span>
                  <span className="tool-result-sub block">{t.side(num(side, locale, 1), metres(side * 0.3048, locale))}</span>
                </figcaption>
              </figure>
            ) : null}
            {compare ? (
              <div className="area-sizes">
                <p className="tool-result-label">{t.sizes}</p>
                <svg viewBox="0 0 200 100" aria-hidden="true" focusable="false">
                  {[from, to].map((u, i) => {
                    const k = Math.sqrt(SQFT_PER[u] / big) * 100;
                    return <rect key={`${u}-${i}`} className={i === 0 ? 'tool-bar-a' : 'tool-bar-b'} x={i * 108} y={100 - k} width={Math.max(k, 0.8)} height={Math.max(k, 0.8)} />;
                  })}
                </svg>
                <ul className="tool-legend">
                  {[from, to].map((u, i) => (
                    <li key={`${u}-${i}`}>
                      <i className={i === 0 ? 'tool-bar-a' : 'tool-bar-b'} aria-hidden="true" />
                      {t.oneIs(short[u], fmtArea(SQFT_PER[u], locale))}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>
      </div>
      <section className="tool-sheet" aria-labelledby="conv-all">
        <h2 id="conv-all" className="tool-sheet-title">
          {t.all}
        </h2>
        <dl className="area-all">
          {units.map((u) => (
            <div key={u}>
              <dt>{labels[u]}</dt>
              <dd>{fmtArea(convert(v, from, u), locale)}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}

export default function UnitConverter(props: Props) {
  return (
    <ToolShell locale={props.locale}>
      <Converter {...props} />
    </ToolShell>
  );
}
