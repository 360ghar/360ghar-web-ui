import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm, type Resolver } from 'react-hook-form';
import type { Locale } from '@/lib/i18n/locale';
import { Icon } from '@/ui/icons/Icon';
import { SelectField, TextAreaField, TextField } from '@/ui/react/Field';
import { useIsClient } from '@/ui/react/useClient';
import { ToolShell } from '../ui';
import { SECTIONS, UI, type Field, type Kind } from './content';
import { defaults, requestDraft, schemaFor, toFields, type Draft, type DraftFailure } from './draft';
import './legal.css';

type Values = Record<string, string>;

function Paper({ draft, locale, kind }: { draft: Draft; locale: Locale; kind: Kind }) {
  const t = UI[locale];
  return (
    <article className="ld-paper" aria-label={draft.title || t.preview}>
      {draft.title ? <h3 className="ld-title">{draft.title}</h3> : null}
      {draft.clauses.map((c, i) => (
        <section key={i} className="ld-clause">
          {c.heading ? <h4>{c.heading}</h4> : null}
          {c.text.split('\n').map((line, j) => (line.trim() ? <p key={j}>{line}</p> : null))}
        </section>
      ))}
      <aside className="ld-disclaimer" data-kind={kind}>
        <strong>{t.disclaimerTitle}.</strong> {t.disclaimer}
      </aside>
    </article>
  );
}

function Drafter({ kind, locale }: { kind: Kind; locale: Locale }) {
  const t = UI[locale];
  const i = locale === 'hi' ? 1 : 0;
  const isClient = useIsClient();
  const form = useForm<Values>({ resolver: zodResolver(schemaFor(kind)) as Resolver<Values>, defaultValues: defaults(kind), mode: 'onTouched' });
  const { errors } = form.formState;
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [failure, setFailure] = useState<DraftFailure | null>(null);

  const message = (f: Field, code: string | undefined) => (!code ? undefined : code === 'required' ? t.required : f.type === 'num' ? t.number : f.type === 'date' ? t.date : t.required);

  const submit = form.handleSubmit(async (values) => {
    setBusy(true);
    setFailure(null);
    // A failed second try must not leave the first draft to print.
    setDraft(null);
    const r = await requestDraft(kind, toFields(kind, values));
    setBusy(false);
    if ('draft' in r) {
      setDraft(r.draft);
      document.getElementById('ld-preview')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else setFailure(r.failure);
  });

  const field = (f: Field) => {
    const common = { label: f.label[i], optional: f.optional ? t.optional : undefined, hint: f.hint?.[i], error: message(f, errors[f.name]?.message) };
    if (f.type === 'select')
      return (
        <SelectField key={f.name} {...common} {...form.register(f.name)}>
          {f.options!.map(([v, label]) => (
            <option key={v} value={v}>
              {label[i]}
            </option>
          ))}
        </SelectField>
      );
    if (f.type === 'area') return <TextAreaField key={f.name} {...common} rows={f.max && f.max > 400 ? 5 : 2} maxLength={f.max} {...form.register(f.name)} />;
    return (
      <TextField
        key={f.name}
        {...common}
        type={f.type === 'date' ? 'date' : 'text'}
        inputMode={f.type === 'num' ? (f.int ? 'numeric' : 'decimal') : undefined}
        maxLength={f.type === 'text' ? f.max : undefined}
        autoComplete="off"
        {...form.register(f.name)}
      />
    );
  };

  const failText = failure === 'rate' ? t.rate : failure === 'unavailable' ? t.signIn : failure ? t.failed : null;

  return (
    <>
      <div className="tool-split">
        <form className="tool-sheet" onSubmit={submit} noValidate aria-label={t.generate}>
          {SECTIONS[kind].map((s) => (
            <fieldset key={s.title[0]} className="ld-fieldset">
              <legend className="ld-legend">{s.title[i]}</legend>
              {s.fields.map(field)}
            </fieldset>
          ))}
          <p className="tool-note">{t.private}</p>
          <div className="tool-actions">
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? t.working : t.generate}
            </button>
          </div>
          {failText ? (
            <p className="field-error" role="alert">
              <Icon name="alert" size={16} />
              {failText}
            </p>
          ) : null}
        </form>

        <div className="tool-stack ld-side">
          <section className="tool-sheet" aria-labelledby="ld-preview">
            <h2 id="ld-preview" className="tool-sheet-title">
              {t.preview}
            </h2>
            {draft ? (
              <>
                <Paper draft={draft} locale={locale} kind={kind} />
                <div className="tool-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => window.print()}
                  >
                    <Icon name="print" size={18} />
                    {t.print}
                  </button>
                  <button type="button" className="btn btn-quiet" onClick={() => document.querySelector<HTMLElement>('form.tool-sheet select, form.tool-sheet input, form.tool-sheet textarea')?.focus()}>
                    {t.again}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="tool-note">{t.empty}</p>
                <aside className="ld-disclaimer">
                  <strong>{t.disclaimerTitle}.</strong> {t.disclaimer}
                </aside>
              </>
            )}
          </section>
        </div>
      </div>
      {isClient && draft
        ? createPortal(
            <div className="ld-print" aria-hidden="true">
              <Paper draft={draft} locale={locale} kind={kind} />
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

export default function LegalDrafter({ kind, locale }: { kind: Kind; locale: Locale }) {
  return (
    <ToolShell locale={locale}>
      <Drafter kind={kind} locale={locale} />
    </ToolShell>
  );
}
