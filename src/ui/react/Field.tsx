import { forwardRef, useId, useState, type ChangeEvent, type InputHTMLAttributes, type KeyboardEvent, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { Icon } from '@/ui/icons/Icon';

type Common = { label: string; hint?: ReactNode; error?: string | undefined; optional?: string };

function Frame({ id, label, hint, error, optional, children }: Common & { id: string; children: ReactNode }) {
  return (
    <div className="field">
      <label htmlFor={id} className="field-label">
        {label}
        {optional ? <span className="font-normal text-ink-600"> {optional}</span> : null}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="field-hint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="field-error">
          <Icon name="alert" size={16} />
          {error}
        </p>
      ) : null}
    </div>
  );
}

const describedBy = (id: string, hint: unknown, error: unknown) =>
  [error ? `${id}-error` : hint ? `${id}-hint` : ''].filter(Boolean).join(' ') || undefined;

type TextFieldProps = Common &
  InputHTMLAttributes<HTMLInputElement> & {
    /**
     * Commit mode: typing stays in the box, and `onCommit(text)` runs on blur or Enter.
     * `value` is then the committed value; a change of it replaces the typed text.
     */
    onCommit?: (value: string) => void;
  };

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, hint, error, optional, id, className = '', onCommit, ...rest },
  ref,
) {
  const auto = useId();
  const fid = id ?? auto;
  const [draft, setDraft] = useState<string | null>(null);
  const commit = () => {
    if (draft !== null) onCommit?.(draft);
    setDraft(null);
  };
  const commitProps = onCommit && {
    value: draft ?? String(rest.value ?? ''),
    onChange: (e: ChangeEvent<HTMLInputElement>) => setDraft(e.target.value),
    onBlur: commit,
    onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') commit();
    },
  };
  return (
    <Frame id={fid} label={label} hint={hint} error={error} optional={optional}>
      <input
        ref={ref}
        id={fid}
        className={`input ${className}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(fid, hint, error)}
        {...rest}
        {...commitProps}
      />
    </Frame>
  );
});

export const SelectField = forwardRef<HTMLSelectElement, Common & SelectHTMLAttributes<HTMLSelectElement>>(function SelectField(
  { label, hint, error, optional, id, className = '', children, ...rest },
  ref,
) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <Frame id={fid} label={label} hint={hint} error={error} optional={optional}>
      <select
        ref={ref}
        id={fid}
        className={`select ${className}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(fid, hint, error)}
        {...rest}
      >
        {children}
      </select>
    </Frame>
  );
});

export const TextAreaField = forwardRef<HTMLTextAreaElement, Common & TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function TextAreaField({ label, hint, error, optional, id, className = '', ...rest }, ref) {
    const auto = useId();
    const fid = id ?? auto;
    return (
      <Frame id={fid} label={label} hint={hint} error={error} optional={optional}>
        <textarea
          ref={ref}
          id={fid}
          className={`textarea ${className}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(fid, hint, error)}
          {...rest}
        />
      </Frame>
    );
  },
);

export const Check = forwardRef<HTMLInputElement, { label: ReactNode } & InputHTMLAttributes<HTMLInputElement>>(function Check(
  { label, className = '', ...rest },
  ref,
) {
  return (
    <label className={`check ${className}`}>
      <input ref={ref} type={rest.type ?? 'checkbox'} {...rest} />
      <span>{label}</span>
    </label>
  );
});
