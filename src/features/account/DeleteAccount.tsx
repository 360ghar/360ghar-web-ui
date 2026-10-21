/**
 * Account deletion. Signed in: confirm, then DELETE /api/v1/users/me (the canonical route, 204).
 * Signed out: the backend has no request endpoint (backend-gaps M6), so the
 * form opens an email to privacy@360ghar.com, as the old site did.
 */
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { signOut } from '@/features/auth/store';
import { useAuth } from '@/features/auth/useAuth';
import { api, call } from '@/lib/api/client';
import { describeError } from '@/lib/api/errors';
import type { Locale } from '@/lib/i18n/locale';
import { localizePath } from '@/lib/i18n/locale';
import { loginHref } from '@/features/auth/flows';
import { EMAIL_RE } from '@/lib/phone';
import { Icon } from '@/ui/icons/Icon';
import { Check, SelectField, TextAreaField, TextField } from '@/ui/react/Field';
import { IslandBoundary } from '@/ui/react/IslandBoundary';

const T = {
  en: {
    title: 'Delete your account',
    lead: 'This removes your profile, saved homes, visits and listings. It cannot be undone.',
    confirm: 'I understand that this cannot be undone.',
    delete: 'Delete my account',
    deleting: 'Deleting…',
    done: 'Your account is deleted.',
    outLead: 'Not signed in? Send us a request and we will delete your data within 30 days.',
    email: 'Email on the account',
    reason: 'Reason',
    reasons: [
      ['privacy', 'Privacy'],
      ['inactivity', 'I do not use it'],
      ['duplicate', 'Duplicate account'],
      ['security', 'Security concern'],
      ['poor_experience', 'Poor experience'],
      ['other', 'Other'],
    ],
    message: 'Anything else',
    send: 'Email the request',
    signIn: 'Sign in to delete it now',
    badEmail: 'Enter a valid email.',
    whatTitle: 'What we delete',
    what: [
      ['user', 'Your profile: name, email, mobile number and photo'],
      ['heart', 'Your saved homes'],
      ['calendar', 'Your visits, past and upcoming'],
      ['home', 'The listings you posted'],
    ],
    signedOut: 'You are signed out on every device.',
    keep: 'Keep my account',
  },
  hi: {
    title: 'अपना अकाउंट डिलीट करें',
    lead: 'इससे आपकी प्रोफ़ाइल, सेव किए घर, विज़िट और लिस्टिंग हट जाएँगी। इसे वापस नहीं किया जा सकता।',
    confirm: 'मैं समझता/समझती हूँ कि इसे वापस नहीं किया जा सकता।',
    delete: 'मेरा अकाउंट डिलीट करें',
    deleting: 'डिलीट हो रहा है…',
    done: 'आपका अकाउंट डिलीट हो गया।',
    outLead: 'साइन इन नहीं हैं? अनुरोध भेजें, हम 30 दिन में आपका डेटा हटा देंगे।',
    email: 'अकाउंट का ईमेल',
    reason: 'वजह',
    reasons: [
      ['privacy', 'प्राइवेसी'],
      ['inactivity', 'इस्तेमाल नहीं करता/करती'],
      ['duplicate', 'दूसरा अकाउंट है'],
      ['security', 'सुरक्षा की चिंता'],
      ['poor_experience', 'अनुभव अच्छा नहीं रहा'],
      ['other', 'अन्य'],
    ],
    message: 'कुछ और',
    send: 'ईमेल से अनुरोध भेजें',
    signIn: 'अभी डिलीट करने के लिए साइन इन करें',
    badEmail: 'सही ईमेल डालें।',
    whatTitle: 'हम क्या हटाते हैं',
    what: [
      ['user', 'आपकी प्रोफ़ाइल: नाम, ईमेल, मोबाइल नंबर और फ़ोटो'],
      ['heart', 'आपके सेव किए घर'],
      ['calendar', 'आपकी विज़िट, पुरानी और आने वाली'],
      ['home', 'आपकी पोस्ट की गई लिस्टिंग'],
    ],
    signedOut: 'आप हर डिवाइस से साइन आउट हो जाते हैं।',
    keep: 'अकाउंट रखें',
  },
};

type Strings = (typeof T)['en'];

/** The data that goes, as a plain list with bare icons. */
function WhatGoes({ t, signedIn }: { t: Strings; signedIn: boolean }) {
  return (
    <section className="del-what" aria-labelledby="del-what-h">
      <h2 id="del-what-h">{t.whatTitle}</h2>
      <ul>
        {t.what.map(([icon, text]) => (
          <li key={icon}>
            <Icon name={icon as 'user' | 'heart' | 'calendar' | 'home'} size={20} />
            {text}
          </li>
        ))}
        {signedIn ? (
          <li>
            <Icon name="logout" size={20} />
            {t.signedOut}
          </li>
        ) : null}
      </ul>
    </section>
  );
}

function openMail({ email, reason, message }: { email: string; reason: string; message: string }) {
  const subject = encodeURIComponent('Account deletion request');
  const body = encodeURIComponent(`Email: ${email}\nReason: ${reason}\n\n${message}`);
  window.location.href = `mailto:privacy@360ghar.com?subject=${subject}&body=${body}`;
}

/** Signed out: opens an email to privacy@360ghar.com. */
function RequestForm({ locale, t }: { locale: Locale; t: Strings }) {
  const schema = z.object({ email: z.string().regex(EMAIL_RE, t.badEmail), reason: z.string(), message: z.string() });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { email: '', reason: 'privacy', message: '' } });

  return (
    <form
      className="grid max-w-lg gap-4"
      noValidate
      onSubmit={handleSubmit(openMail)}
    >
      <p className="text-ink-800">{t.outLead}</p>
      <WhatGoes t={t} signedIn={false} />
      <TextField label={t.email} type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
      <SelectField label={t.reason} {...register('reason')}>
        {t.reasons.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </SelectField>
      <TextAreaField label={t.message} rows={3} {...register('message')} />
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <button type="submit" className="btn btn-ink">
          {t.send}
        </button>
        <a className="link" href={loginHref(locale, localizePath('/delete-account', locale))}>
          {t.signIn}
        </a>
      </div>
    </form>
  );
}

function Inner({ locale }: { locale: Locale }) {
  const t = T[locale];
  const status = useAuth((s) => s.status);
  const [sure, setSure] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === 'unknown') return <span className="skeleton block h-40 w-full max-w-lg" aria-hidden="true" />;

  if (status === 'authed')
    return (
      <div className="grid max-w-lg gap-5">
        <p className="text-ink-800">{t.lead}</p>
        <WhatGoes t={t} signedIn />
        <Check label={t.confirm} checked={sure} onChange={(e) => setSure(e.target.checked)} />
        {error ? (
          <p className="field-error" role="alert">
            <Icon name="alert" size={16} />
            {error}
          </p>
        ) : null}
        <button
          type="button"
          className="btn btn-ink justify-self-start"
          disabled={!sure || busy}
          onClick={async () => {
            setBusy(true);
            try {
              await call(api.DELETE('/api/v1/users/me'));
              await signOut();
              window.location.assign(`${localizePath('/', locale)}?deleted=1`);
            } catch (e) {
              setError(describeError(e, locale).body);
              setBusy(false);
            }
          }}
        >
          <Icon name="trash" size={18} />
          {busy ? t.deleting : t.delete}
        </button>
        <a className="link justify-self-start" href={localizePath('/account', locale)}>
          {t.keep}
        </a>
      </div>
    );

  return <RequestForm locale={locale} t={t} />;
}

export default function DeleteAccount({ locale = 'en' }: { locale?: Locale }) {
  return (
    <IslandBoundary locale={locale} compact>
      <Inner locale={locale} />
    </IslandBoundary>
  );
}
