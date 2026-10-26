import type { Locale } from '@/lib/i18n/locale';
import { Segmented } from '@/ui/react/Segmented';
import { TextField } from '@/ui/react/Field';
import { num, NumberField, numParam, oneOf, ToolActions, ToolShell, useShareState } from '../ui';
import { MOFA_UI } from './content';
import { convertCarpet, type Direction } from './mofa';
import './area.css';

const DIRS = ['mofa_to_rera', 'rera_to_mofa'] as const;
const DEFAULTS = { v: 1000, dir: 'mofa_to_rera' as Direction, pct: '' };
const PARSE = {
  v: numParam(0, 1e7),
  dir: oneOf(DIRS),
  pct: (raw: string) => (raw.trim() && Number.isFinite(Number(raw)) && Number(raw) >= 0 && Number(raw) <= 100 ? raw : undefined),
};

function Mofa({ locale }: { locale: Locale }) {
  const t = MOFA_UI[locale];
  const { state, set, reset, link } = useShareState(DEFAULTS, PARSE);
  const { v, dir, pct } = state;
  const pctValue = pct === '' ? undefined : Number(pct);
  const validPct = pctValue !== undefined && Number.isFinite(pctValue) && pctValue >= 0 && pctValue <= 100;
  const converted = validPct ? convertCarpet(v, dir, pctValue) : null;
  const toRera = dir === 'mofa_to_rera';
  const sqft = (n: number) => `${num(n, locale, 0)} ${t.sqft}`;

  return (
    <>
      <div className="tool-split">
        <section className="tool-sheet" aria-labelledby="mofa-inputs">
          <h2 id="mofa-inputs" className="tool-sheet-title">
            {t.title}
          </h2>
          <div className="field">
            <span className="field-label" id="mofa-dir">
              {t.direction}
            </span>
            <Segmented
              radio
              className="area-dir"
              labelledBy="mofa-dir"
              value={dir}
              options={DIRS.map((d) => [d, d === 'mofa_to_rera' ? t.toRera : t.toMofa] as const)}
              onChange={(d) => set({ dir: d })}
            />
          </div>
          <NumberField label={toRera ? t.mofa : t.rera} suffix={t.sqft} decimals={false} value={v} min={0} max={1e7} onChange={(n) => set({ v: n })} />
          <TextField
            label={t.uplift}
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            step="any"
            value={pct}
            hint={t.upliftHint}
            error={pct && !validPct ? t.assumptionError : undefined}
            onChange={(e) => set({ pct: e.target.value })}
          />
          <ToolActions locale={locale} link={link} onReset={reset} />
        </section>

        <section className="tool-result" aria-live="polite" aria-labelledby="mofa-result">
          <div>
            <h2 id="mofa-result" className="tool-result-label">
              {t.result}
            </h2>
            <output className="tool-figure" data-testid="mofa-result">
              {converted ? (
                <>
                  {num(converted.result, locale, 0)}
                  <span className="tool-figure-unit">{t.sqft}</span>
                </>
              ) : (
                t.enterAssumption
              )}
            </output>
          </div>
          {converted ? (
            <dl className="tool-stats">
              <div>
                <dt>{t.inputArea}</dt>
                <dd>{sqft(v)}</dd>
              </div>
              <div>
                <dt>{t.delta}</dt>
                <dd>
                  {converted.delta > 0 ? '+' : ''}
                  {sqft(converted.delta)}
                </dd>
              </div>
            </dl>
          ) : null}
          <p className="tool-result-sub">{t.estimate}</p>
        </section>
      </div>
    </>
  );
}

export default function MofaConverter({ locale }: { locale: Locale }) {
  return (
    <ToolShell locale={locale}>
      <Mofa locale={locale} />
    </ToolShell>
  );
}
