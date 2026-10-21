import type { ReactNode } from 'react';

type Props<T> = {
  /** Accessible name. Use `labelledBy` instead when a visible heading names the group. */
  label?: string;
  labelledBy?: string;
  value: T | undefined;
  options: readonly (readonly [T, ReactNode])[];
  onChange: (v: T) => void;
  disabled?: (v: T) => boolean;
  /** A radio group of the shared `.toggle` buttons (the filter and tool forms), laid out by `className` and `optionClassName`. */
  radio?: boolean;
  className?: string;
  optionClassName?: string;
};

/**
 * One segmented control: a single container, the chosen segment filled, the
 * others plain. Toggle buttons with `aria-pressed`, each 44 px tall.
 * With `radio`: `role="radiogroup"` with `role="radio"` buttons and `aria-checked`.
 */
export function Segmented<T extends string | number | undefined>({ label, labelledBy, value, options, onChange, disabled, radio, className, optionClassName }: Props<T>) {
  const names = { 'aria-label': label, 'aria-labelledby': labelledBy };
  if (radio) {
    return (
      <div role="radiogroup" {...names} className={className}>
        {options.map(([v, text]) => (
          <button
            key={v === undefined ? '' : String(v)}
            type="button"
            role="radio"
            aria-checked={value === v}
            disabled={disabled?.(v)}
            className={optionClassName ? `toggle ${optionClassName}` : 'toggle'}
            onClick={() => onChange(v)}
          >
            {text}
          </button>
        ))}
      </div>
    );
  }
  return (
    <div role="group" {...names} className="inline-flex max-w-full flex-wrap rounded-[var(--radius-md)] bg-paper p-[3px] shadow-[inset_0_0_0_1px_var(--color-ink-400)]">
      {options.map(([v, text]) => (
        <button
          key={v === undefined ? '' : String(v)}
          type="button"
          aria-pressed={value === v}
          disabled={disabled?.(v)}
          onClick={() => onChange(v)}
          className="min-h-11 cursor-pointer rounded-[var(--radius-sm)] px-4 text-[0.9375rem] font-semibold text-ink-800 transition-colors duration-150 hover:bg-mist-100 disabled:cursor-not-allowed disabled:text-ink-400 disabled:hover:bg-transparent aria-pressed:bg-pine-800 aria-pressed:text-white aria-pressed:hover:bg-pine-800"
        >
          {text}
        </button>
      ))}
    </div>
  );
}
