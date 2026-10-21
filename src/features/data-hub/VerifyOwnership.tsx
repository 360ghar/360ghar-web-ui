/**
 * Jamabandi land record lookup (island on /verify-ownership). Both endpoints
 * need a session, so signed-out users see a sign-in step first. The CAPTCHA
 * image is fetched with the bearer token and shown from a blob URL.
 * Wire fields: owner_names, area_kanal, area_marla, fetched_at.
 */
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '@/features/auth/useAuth';
import { api, call } from '@/lib/api/client';
import { ApiError, applyFieldErrors, describeError } from '@/lib/api/errors';
import type { Locale } from '@/lib/i18n/locale';
import { localizePath } from '@/lib/i18n/locale';
import { loginHref } from '@/features/auth/flows';
import { Icon } from '@/ui/icons/Icon';
import { SelectField, TextField } from '@/ui/react/Field';
import { StateBlock } from '@/ui/states/StateBlock';
import type { Jamabandi } from './api';
import { fmtDate } from './format';
import { Island } from './Island';
import { text } from './text';

type Props = { locale: Locale; tehsils: readonly string[] };

const buildSchema = (t: ReturnType<typeof text>) => {
  const req = z.string().trim().min(1, t.voRequired);
  return z.object({ tehsil: req, village: req, khasra_number: req, captcha_text: req });
};
type Values = z.infer<ReturnType<typeof buildSchema>>;

async function captchaBlob(): Promise<string> {
  return URL.createObjectURL(await call(api.GET('/api/v1/data-hub/jamabandi/captcha', { parseAs: 'blob' })));
}

function Lookup({ locale, tehsils }: Props) {
  const t = text(locale);
  const auth = useAuth();
  const [round, setRound] = useState(0);
  const [result, setResult] = useState<Jamabandi | null>(null);
  const signedIn = auth.status === 'authed';

  const captcha = useQuery({ queryKey: ['data-hub', 'captcha', round], queryFn: captchaBlob, enabled: signedIn && !result, gcTime: 0, staleTime: Infinity, retry: false });
  useEffect(() => {
    const url = captcha.data;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [captcha.data]);

  const schema = useMemo(() => buildSchema(text(locale)), [locale]);
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { tehsil: '', village: '', khasra_number: '', captcha_text: '' } });

  const lookup = useMutation({
    mutationFn: (v: Values) => call(api.POST('/api/v1/data-hub/jamabandi/lookup', { body: v })),
    onSuccess: (d) => setResult(d),
    onError: (e) => {
      form.setValue('captcha_text', '');
      setRound((n) => n + 1);
      // A 422 names the fields: show each message under its field.
      applyFieldErrors(e, form);
    },
  });

  if (!signedIn) {
    return (
      <div className="sheet dh-panel">
        <StateBlock
          scene="empty"
          compact
          title={t.voSignIn}
          body={t.voSignInBody}
          action={{ label: t.voSignInButton, href: loginHref(locale, localizePath('/verify-ownership', locale)) }}
        />
      </div>
    );
  }

  if (result) {
    const none = <span className="font-normal text-ink-600">{t.voNone}</span>;
    const area = [
      result.area_kanal != null ? `${result.area_kanal} ${t.voKanal}` : null,
      result.area_marla != null ? `${result.area_marla} ${t.voMarla}` : null,
    ]
      .filter(Boolean)
      .join(' ');
    return (
      <section className="sheet dh-panel" aria-labelledby="vo-result">
        <h2 id="vo-result" className="dh-panel-title">
          {t.voResult}
        </h2>
        <p className="dh-meta mb-3">
          {result.tehsil} · {result.village} · {t.voKhasra} {result.khasra_number}
        </p>
        <dl className="dh-dl">
          <dt>{t.voOwners}</dt>
          <dd>{result.owner_names.length ? <ul className="grid gap-1">{result.owner_names.map((o) => <li key={o}>{o}</li>)}</ul> : none}</dd>
          <dt>{t.voArea}</dt>
          <dd className="tabular">{area || none}</dd>
          <dt>{t.voMutation}</dt>
          <dd>{result.mutation_status ?? none}</dd>
          <dt>{t.voEncumbrance}</dt>
          <dd>{result.encumbrance ?? none}</dd>
          <dt>{t.voFetched}</dt>
          <dd>{fmtDate(result.fetched_at, locale, 'long')}</dd>
        </dl>
        {result.is_cached ? <p className="dh-meta mt-3">{t.voCached}</p> : null}
        <button
          type="button"
          className="btn mt-5"
          onClick={() => {
            setResult(null);
            form.reset();
            setRound((n) => n + 1);
          }}
        >
          {t.voAgain}
        </button>
      </section>
    );
  }

  const err = lookup.isError ? (lookup.error instanceof ApiError && (lookup.error.kind === 'unavailable' || lookup.error.status === 502) ? { title: t.voFailed, body: '' } : describeError(lookup.error, locale)) : null;
  const e = form.formState.errors;

  return (
    <form className="sheet dh-panel dh-form" noValidate onSubmit={form.handleSubmit((v) => lookup.mutate(v))} aria-labelledby="vo-form">
      <h2 id="vo-form" className="dh-panel-title">
        {locale === 'hi' ? 'ज़मीन का रिकॉर्ड खोजें' : 'Look up a land record'}
      </h2>
      <SelectField label={t.voTehsil} error={e.tehsil?.message} {...form.register('tehsil')}>
        <option value="">{t.voTehsilPick}</option>
        {tehsils.map((x) => (
          <option key={x} value={x}>
            {x}
          </option>
        ))}
      </SelectField>
      <div className="dh-form-row">
        <TextField label={t.voVillage} autoComplete="off" error={e.village?.message} {...form.register('village')} />
        <TextField label={t.voKhasra} autoComplete="off" placeholder="123/4" error={e.khasra_number?.message} {...form.register('khasra_number')} />
      </div>
      <div className="grid gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <div className="grid h-[52px] w-[180px] place-items-center rounded-sm bg-ink-100" aria-live="polite">
            {captcha.data ? (
              <img src={captcha.data} alt={t.voCaptchaAlt} width={180} height={52} className="h-full w-full object-contain" />
            ) : captcha.isError ? (
              <Icon name="alert" size={20} label={t.voCaptchaFail} />
            ) : (
              <span className="skeleton h-full w-full" />
            )}
          </div>
          <button type="button" className="btn btn-quiet" onClick={() => setRound((n) => n + 1)} disabled={captcha.isFetching}>
            <Icon name="retry" size={18} />
            {t.voCaptchaNew}
          </button>
        </div>
        {captcha.isError ? (
          <p className="field-error">
            <Icon name="alert" size={16} />
            {t.voCaptchaFail}
          </p>
        ) : null}
        <TextField label={t.voCaptcha} autoComplete="off" spellCheck={false} error={e.captcha_text?.message} {...form.register('captcha_text')} />
      </div>
      <button type="submit" className="btn btn-primary btn-block" disabled={lookup.isPending}>
        {lookup.isPending ? t.voBusy : t.voSubmit}
      </button>
      {err ? (
        <p className="field-error" role="alert">
          <Icon name="alert" size={16} />
          {err.title}
          {err.body ? ` ${err.body}` : ''}
        </p>
      ) : null}
    </form>
  );
}

export default function VerifyOwnership(props: Props) {
  return (
    <Island locale={props.locale}>
      <Lookup {...props} />
    </Island>
  );
}
