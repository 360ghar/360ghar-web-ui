/**
 * Shared parts for tool islands: the island shell, a range field (slider plus
 * number box), the rate and tenure fields of the loan tools, number
 * formatting, URL-backed state for shareable values, and the copy-link and
 * reset buttons with their text. Styles are in tools.css.
 */
import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { Locale } from '@/lib/i18n/locale';
import { formatNum, parseNumber } from '@/lib/format';
import { Icon } from '@/ui/icons/Icon';
import { IslandBoundary } from '@/ui/react/IslandBoundary';
import { toast, Toaster } from '@/ui/react/Toaster';
import { copyText } from '@/ui/react/share';

export const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

/** Indian grouping: 1234567.891 -> "12,34,567.89". */
export function num(n: number, locale: Locale = 'en', digits = 2): string {
  return Number.isFinite(n) ? formatNum(n, locale, { maximumFractionDigits: digits }) : '0';
}

/** Whole rupees with Indian grouping: "₹12,34,568". */
export function inr(n: number, locale: Locale = 'en'): string {
  return `₹${num(Math.round(n), locale, 0)}`;
}

type NumberBoxProps = {
  id?: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  /** Shown while the box is not being edited. Default: Indian grouping. */
  format?: (n: number) => string;
  prefix?: string;
  suffix?: string;
  decimals?: boolean;
  className?: string;
  describedBy?: string;
  label?: string;
};

/**
 * Text box for a number. It shows the value with grouping (commas are
 * ignored when parsing); while typing it keeps the typed text and sends every
 * valid value inside [min, max]. On blur it clamps the value.
 */
function NumberBox({ id, value, onChange, min = 0, max = Number.MAX_SAFE_INTEGER, format, prefix, suffix, decimals = true, className = '', describedBy, label }: NumberBoxProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? (format ? format(value) : num(value, 'en', 4));
  return (
    <div className={`tool-num ${className}`}>
      {prefix ? (
        <span className="tool-num-affix" aria-hidden="true">
          {prefix}
        </span>
      ) : null}
      <input
        id={id}
        type="text"
        inputMode={decimals ? 'decimal' : 'numeric'}
        autoComplete="off"
        aria-label={label}
        aria-describedby={describedBy}
        value={shown}
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => {
          setDraft(e.target.value);
          const n = parseNumber(e.target.value);
          if (n !== null && n >= min && n <= max) onChange(n);
        }}
        onBlur={() => {
          const n = draft === null ? null : parseNumber(draft);
          if (n !== null) onChange(clamp(n, min, max));
          setDraft(null);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur();
        }}
      />
      {suffix ? (
        <span className="tool-num-affix" aria-hidden="true">
          {suffix}
        </span>
      ) : null}
    </div>
  );
}

/** A label above a NumberBox, with an optional hint. */
export function NumberField({ label, hint, className = '', ...box }: Omit<NumberBoxProps, 'id' | 'describedBy' | 'label'> & { label: string; hint?: ReactNode }) {
  const id = useId();
  return (
    <div className={`field ${className}`}>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <NumberBox id={id} describedBy={hint ? `${id}-hint` : undefined} className="tool-num-full" {...box} />
      {hint ? (
        <p id={`${id}-hint`} className="field-hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

type RangeFieldProps = {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step: number;
  /** Text for the slider value and the scale ends. */
  format: (n: number) => string;
  /** Format for the number box. Default: Indian grouping. */
  boxFormat?: (n: number) => string;
  prefix?: string;
  suffix?: string;
  hint?: ReactNode;
  decimals?: boolean;
};

/** A visible label with a number box, then a native slider and its scale. */
export function RangeField({ label, value, onChange, min, max, step, format, boxFormat, prefix, suffix, hint, decimals = true }: RangeFieldProps) {
  const id = useId();
  const pct = max > min ? ((clamp(value, min, max) - min) / (max - min)) * 100 : 0;
  return (
    <div className="tool-range">
      <div className="tool-range-head">
        <label htmlFor={id} className="field-label">
          {label}
        </label>
        <NumberBox
          id={id}
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          format={boxFormat}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals}
          describedBy={hint ? `${id}-hint` : undefined}
        />
      </div>
      <input
        type="range"
        className="tool-slider"
        aria-label={label}
        aria-valuetext={format(value)}
        min={min}
        max={max}
        step={step}
        value={clamp(value, min, max)}
        style={{ '--pct': `${pct}%` } as CSSProperties}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="tool-range-scale" aria-hidden="true">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
      {hint ? (
        <p id={`${id}-hint`} className="field-hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

type Parsers<T> = { [K in keyof T]: (raw: string) => T[K] | undefined };

/** Number param inside [min, max]; anything else is ignored. */
export const numParam = (min: number, max: number) => (raw: string) => {
  const n = Number(raw);
  return raw.trim() !== '' && Number.isFinite(n) ? clamp(n, min, max) : undefined;
};

/** String param from a fixed list. */
export const oneOf =
  <V extends string>(values: readonly V[]) =>
  (raw: string): V | undefined =>
    (values as readonly string[]).includes(raw) ? (raw as V) : undefined;

/**
 * State that lives in the URL query, so a link shares the calculation.
 * The first render uses the defaults (same as the server HTML). After
 * hydration the URL values are read; later changes are written back with
 * replaceState (debounced; values equal to the default are left out).
 */
export function useShareState<T extends Record<string, string | number>>(defaults: T, parsers: Parsers<T>) {
  const [state, setState] = useState<T>(defaults);
  const ready = useRef(false);
  const init = useRef({ defaults, parsers });

  useEffect(() => {
    const { parsers: p } = init.current;
    const q = new URLSearchParams(window.location.search);
    const patch: Partial<T> = {};
    for (const k of Object.keys(p) as (keyof T)[]) {
      const raw = q.get(k as string);
      if (raw === null) continue;
      const v = p[k](raw);
      if (v !== undefined) patch[k] = v;
    }
    ready.current = true;
    // The URL can only be read after hydration, so this one update is intended.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (Object.keys(patch).length) setState((s) => ({ ...s, ...patch }));
  }, []);

  useEffect(() => {
    if (!ready.current) return;
    const id = window.setTimeout(() => {
      const url = new URL(window.location.href);
      writeParams(url.searchParams, state, init.current.defaults);
      if (url.href !== window.location.href) window.history.replaceState(window.history.state, '', url);
    }, 400);
    return () => window.clearTimeout(id);
  }, [state]);

  const set = (patch: Partial<T>) => setState((s) => ({ ...s, ...patch }));
  const reset = () => setState(init.current.defaults);
  /** Full link for this state (does not wait for the debounced URL write). */
  const link = () => {
    const url = new URL(window.location.href);
    writeParams(url.searchParams, state, init.current.defaults, true);
    return url.href;
  };
  return { state, set, reset, link };
}

function writeParams<T extends Record<string, string | number>>(q: URLSearchParams, state: T, defaults: T, all = false) {
  for (const k of Object.keys(defaults)) {
    if (!all && state[k] === defaults[k]) q.delete(k);
    else q.set(k, String(state[k]));
  }
}

const TEXT = {
  en: {
    share: 'Copy link',
    reset: 'Reset',
    copied: 'Link copied',
    copyFailed: 'Could not copy the link',
    rate: 'Interest rate (per year)',
    tenure: 'Loan tenure',
    yrs: 'yrs',
    years: (n: number) => `${n} ${n === 1 ? 'year' : 'years'}`,
  },
  hi: {
    share: 'लिंक कॉपी करें',
    reset: 'रीसेट',
    copied: 'लिंक कॉपी हो गया',
    copyFailed: 'लिंक कॉपी नहीं हो सका',
    rate: 'ब्याज दर (सालाना)',
    tenure: 'लोन अवधि',
    yrs: 'साल',
    years: (n: number) => `${n} साल`,
  },
};

/** Copies a link and tells the person what happened. */
async function shareLink(url: string, locale: Locale) {
  const t = TEXT[locale];
  const ok = await copyText(url);
  toast(ok ? t.copied : t.copyFailed, ok ? 'success' : 'error');
}

/** "Copy link" and "Reset" under a calculator form. `link` comes from `useShareState`. */
export function ToolActions({ locale, link, onReset }: { locale: Locale; link: () => string; onReset: () => void }) {
  const t = TEXT[locale];
  return (
    <div className="tool-actions">
      <button type="button" className="btn" onClick={() => shareLink(link(), locale)}>
        <Icon name="share" size={18} />
        {t.share}
      </button>
      <button type="button" className="btn btn-quiet" onClick={onReset}>
        <Icon name="retry" size={18} />
        {t.reset}
      </button>
    </div>
  );
}

/**
 * Root of a tool island: the error boundary, the tool desk and the toaster.
 * Pass the island body as the child; it renders the sections of the desk.
 */
export function ToolShell({ locale, className, children }: { locale: Locale; className?: string; children: ReactNode }) {
  return (
    <IslandBoundary locale={locale}>
      <div className={className ? `tool-desk ${className}` : 'tool-desk'}>
        {children}
        <Toaster />
      </div>
    </IslandBoundary>
  );
}

export const RATE_TENURE_DEFAULTS = { rate: 8.5, tenure: 20 };
export const RATE_TENURE_PARSE = { rate: numParam(1, 20), tenure: numParam(1, 30) };

/** Interest rate (1 to 20 %) and tenure (1 to 30 years) of the EMI and loan tools. */
export function RateTenureFields({ locale, rate, tenure, set }: { locale: Locale; rate: number; tenure: number; set: (patch: { rate?: number; tenure?: number }) => void }) {
  const t = TEXT[locale];
  return (
    <>
      <RangeField label={t.rate} value={rate} min={1} max={20} step={0.05} suffix="%" format={(n) => `${n}%`} onChange={(n) => set({ rate: n })} />
      <RangeField label={t.tenure} value={tenure} min={1} max={30} step={1} suffix={t.yrs} decimals={false} format={t.years} onChange={(n) => set({ tenure: Math.round(n) })} />
    </>
  );
}

/** Scrollable box for wide or tall tables. Focusable, so keyboard users can scroll it. */
export function ScrollArea({ label, tall = false, children }: { label: string; tall?: boolean; children: ReactNode }) {
  return (
    // Scrollable regions must be reachable by keyboard (axe: scrollable-region-focusable).
    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
    <div className={`tool-scroll${tall ? ' is-tall' : ''}`} tabIndex={0} role="region" aria-label={label}>
      {children}
    </div>
  );
}

/**
 * Phones only: the answer rides at the bottom of the screen while the person
 * works through a long form, and links down to the full result.
 */
export function ResultPeek({ label, value, target }: { label: string; value: ReactNode; target: string }) {
  return (
    <a className="tool-peek" href={`#${target}`}>
      <span className="tool-peek-label">{label}</span>
      <span className="tool-peek-value">{value}</span>
    </a>
  );
}
