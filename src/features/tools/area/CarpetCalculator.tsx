import type { Locale } from '@/lib/i18n/locale';
import { num, numParam, RangeField, ResultPeek, ToolActions, ToolShell, useShareState } from '../ui';
import { carpetAreas } from './carpet';
import { CARPET_UI } from './content';
import './area.css';

const DEFAULTS = { super: 1000, loading: 30, walls: 15 };
const PARSE = { super: numParam(100, 20_000), loading: numParam(15, 50), walls: numParam(0, 40) };

function Carpet({ locale }: { locale: Locale }) {
  const t = CARPET_UI[locale];
  const { state, set, reset, link } = useShareState(DEFAULTS, PARSE);
  const a = carpetAreas(state.super, state.loading, state.walls);
  const sqft = (n: number) => `${num(Math.round(n), locale, 0)} ${t.sqft}`;
  const pct = (n: number) => (state.super > 0 ? (n / state.super) * 100 : 0);
  // Side of a square whose area is this share of the super area (the outer square is 100).
  const side = (n: number) => (state.super > 0 ? Math.sqrt(n / state.super) * 100 : 0);
  const parts = [
    { key: 'a', label: t.partCarpet, value: a.carpet },
    { key: 'b', label: t.partWalls, value: a.walls },
    { key: 'c', label: t.partCommon, value: a.common },
  ];

  return (
    <>
      <div className="tool-split">
        <section className="tool-sheet" aria-labelledby="carpet-inputs">
          <ResultPeek label={t.carpet} value={sqft(a.carpet)} target="carpet-result" />
          <h2 id="carpet-inputs" className="tool-sheet-title">
            {t.title}
          </h2>
          <RangeField
            label={t.super}
            value={state.super}
            min={100}
            max={20_000}
            step={10}
            suffix={t.sqft}
            decimals={false}
            format={sqft}
            hint={t.superHint}
            onChange={(n) => set({ super: n })}
          />
          <RangeField label={t.loading} value={state.loading} min={15} max={50} step={1} suffix="%" format={(n) => `${n}%`} hint={t.loadingHint} onChange={(n) => set({ loading: n })} />
          <RangeField label={t.walls} value={state.walls} min={0} max={40} step={1} suffix="%" format={(n) => `${n}%`} hint={t.wallsHint} onChange={(n) => set({ walls: n })} />
          <ToolActions locale={locale} link={link} onReset={reset} />
        </section>

        <section className="tool-result" aria-live="polite" aria-labelledby="carpet-result">
          <div>
            <h2 id="carpet-result" className="tool-result-label">
              {t.carpet}
            </h2>
            <output className="tool-figure" data-testid="carpet-result">
              {num(Math.round(a.carpet), locale, 0)}
              <span className="tool-figure-unit">{t.sqft}</span>
            </output>
            <p className="tool-result-sub">{t.carpetSub}</p>
          </div>
          <dl className="tool-stats">
            <div>
              <dt>{t.builtUp}</dt>
              <dd>{sqft(a.builtUp)}</dd>
            </div>
            <div>
              <dt>{t.loadingArea}</dt>
              <dd>{sqft(a.loading)}</dd>
            </div>
          </dl>
          <div>
            <p className="tool-result-label">{t.split}</p>
            <div className="area-nest">
              {/* Three sheets drawn to scale by area: the super area, the built-up area inside it, the carpet inside that. */}
              <svg viewBox="0 0 100 100" role="img" aria-label={parts.map((p) => `${p.label} ${Math.round(pct(p.value))}%`).join(', ')}>
                {[
                  { cls: 'tool-bar-c', side: 100 },
                  { cls: 'tool-bar-b', side: side(a.builtUp) },
                  { cls: 'tool-bar-a', side: side(a.carpet) },
                ].map((q) => (q.side > 0 ? <rect key={q.cls} className={q.cls} x={0} y={100 - q.side} width={q.side} height={q.side} /> : null))}
              </svg>
              <ul className="tool-legend area-nest-legend">
                {parts.map((p) => (
                  <li key={p.key}>
                    <i className={`tool-bar-${p.key}`} aria-hidden="true" />
                    {p.label} {Math.round(pct(p.value))}%
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default function CarpetCalculator({ locale }: { locale: Locale }) {
  return (
    <ToolShell locale={locale}>
      <Carpet locale={locale} />
    </ToolShell>
  );
}
