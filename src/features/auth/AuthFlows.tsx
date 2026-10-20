/**
 * Sign-in flows on Supabase auth, as in the old site: identifier first, then a
 * password or a one-time code, a password step after a first code sign-in,
 * Google OAuth, adding a phone, and profile completion. Fixes from the old
 * site: register sends the full name; register checks the identifier first
 * (an existing account goes to sign-in instead of a silent password reset);
 * reset-password needs the code step; the /hi locale survives Google sign-in;
 * the phone from /add-phone is saved in the backend profile.
 */
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { api, call } from '@/lib/api/client';
import { ApiError, describeError } from '@/lib/api/errors';
import type { Locale } from '@/lib/i18n/locale';
import { localizePath } from '@/lib/i18n/locale';
import { Icon } from '@/ui/icons/Icon';
import { Check, TextField } from '@/ui/react/Field';
import { IslandBoundary } from '@/ui/react/IslandBoundary';
import { dobProblem, loginHref, maskIdentifier, parseIdentifier, passwordProblems, pathForStage, safeNext, type Identifier } from './flows';
import { initAuth, refreshProfile, useAuthStore } from './store';
import { useAuth } from './useAuth';
import { supabase } from './supabase';

export type Mode = 'login' | 'register' | 'forgot' | 'reset' | 'callback' | 'add-phone' | 'profile';

const T = {
  en: {
    loginTitle: 'Sign in',
    loginLead: 'Use your mobile number or email.',
    registerTitle: 'Create your account',
    registerLead: 'Save homes, book visits and talk to your relationship manager.',
    forgotTitle: 'Reset your password',
    forgotLead: 'We will send a code to your phone or email.',
    resetTitle: 'Choose a new password',
    callbackTitle: 'Signing you in…',
    phoneTitle: 'Add your mobile number',
    phoneLead: 'Owners and your relationship manager use it to reach you about visits.',
    profileTitle: 'A few details',
    profileLead: 'We need your name and date of birth to finish your account.',
    identifier: 'Mobile number or email',
    identifierHint: 'For example 98104 67231 or you@example.com',
    badIdentifier: 'Enter a 10-digit mobile number or a valid email.',
    continue: 'Continue',
    password: 'Password',
    newPassword: 'New password',
    confirm: 'Confirm password',
    mismatch: 'The passwords do not match.',
    pwRule: 'At least 8 characters, with one capital letter and one number.',
    signIn: 'Sign in',
    useCode: 'Sign in with a one-time code instead',
    forgot: 'Forgot password?',
    code: '6-digit code',
    codeSent: (to: string) => `We sent a code to ${to}.`,
    verify: 'Verify',
    resend: 'Send a new code',
    resendIn: (s: number) => `Send a new code in ${s} s`,
    change: 'Use a different number or email',
    setPassword: 'Set a password',
    setPasswordLead: 'Next time you can sign in with it, or with a code.',
    save: 'Save and continue',
    google: 'Continue with Google',
    or: 'or',
    noAccount: 'New to 360Ghar?',
    createOne: 'Create an account',
    haveAccount: 'Already have an account?',
    fullName: 'Full name',
    nameRule: 'Enter your full name (2 letters or more).',
    terms: 'I accept the terms of service and the privacy policy.',
    termsRule: 'Accept the terms to continue.',
    exists: 'This number or email already has an account.',
    signInInstead: 'Sign in instead',
    noAccountFound: 'We could not find an account for this number or email.',
    phone: 'Mobile number',
    phoneRule: 'Enter a 10-digit mobile number that starts with 6, 7, 8 or 9.',
    skip: 'Skip for now',
    dob: 'Date of birth',
    dobYoung: 'You must be 18 or older.',
    dobOld: 'Check the year.',
    dobRequired: 'Enter your date of birth.',
    done: 'Password saved.',
    resetExpired: 'This reset link is no longer valid. Request a new code.',
    requestCode: 'Request a new code',
    errBadPassword: 'The password is wrong. Try again or sign in with a code.',
    errBadCode: 'That code is wrong or has expired. Request a new one.',
    errRate: 'Too many tries. Wait a minute, then try again.',
    errPhoneTaken: 'This mobile number is already used by another account. Use a different number.',
    errAuthOff: 'Sign-in is not available right now. Try again later.',
    callbackFailed: 'We could not finish signing you in. Try again.',
    backToLogin: 'Back to sign in',
    progress: 'Steps',
    stepsLogin: ['Number or email', 'Password or code', 'New password'],
    stepsRegister: ['Your details', 'Code', 'Password'],
    stepsReset: ['Number or email', 'Code', 'New password'],
    stepsPhone: ['Number', 'Code'],
    willUse: (v: string) => `We will use ${v}.`,
    changeId: 'Change',
    methods: { google: 'Google', email_password: 'email and password', phone_password: 'mobile and password', phone_otp: 'mobile and code', email_otp: 'email and code' } as Record<string, string>,
    lastUsedLine: (m: string) => `Last time you signed in with ${m}`,
    createInstead: 'Create an account instead',
  },
  hi: {
    loginTitle: 'साइन इन',
    loginLead: 'अपना मोबाइल नंबर या ईमेल डालें।',
    registerTitle: 'अपना अकाउंट बनाएँ',
    registerLead: 'घर सेव करें, विज़िट बुक करें और अपने रिलेशनशिप मैनेजर से बात करें।',
    forgotTitle: 'पासवर्ड रीसेट करें',
    forgotLead: 'हम आपके फ़ोन या ईमेल पर कोड भेजेंगे।',
    resetTitle: 'नया पासवर्ड चुनें',
    callbackTitle: 'साइन इन हो रहा है…',
    phoneTitle: 'अपना मोबाइल नंबर जोड़ें',
    phoneLead: 'मालिक और आपका रिलेशनशिप मैनेजर विज़िट के लिए इसी पर संपर्क करते हैं।',
    profileTitle: 'कुछ जानकारी',
    profileLead: 'अकाउंट पूरा करने के लिए आपका नाम और जन्मतिथि चाहिए।',
    identifier: 'मोबाइल नंबर या ईमेल',
    identifierHint: 'जैसे 98104 67231 या you@example.com',
    badIdentifier: '10 अंकों का मोबाइल नंबर या सही ईमेल डालें।',
    continue: 'आगे बढ़ें',
    password: 'पासवर्ड',
    newPassword: 'नया पासवर्ड',
    confirm: 'पासवर्ड दोबारा डालें',
    mismatch: 'दोनों पासवर्ड एक जैसे नहीं हैं।',
    pwRule: 'कम से कम 8 अक्षर, एक बड़ा अक्षर और एक अंक।',
    signIn: 'साइन इन करें',
    useCode: 'इसके बजाय कोड से साइन इन करें',
    forgot: 'पासवर्ड भूल गए?',
    code: '6 अंकों का कोड',
    codeSent: (to: string) => `हमने ${to} पर कोड भेजा है।`,
    verify: 'जाँचें',
    resend: 'नया कोड भेजें',
    resendIn: (s: number) => `${s} सेकंड बाद नया कोड भेजें`,
    change: 'दूसरा नंबर या ईमेल इस्तेमाल करें',
    setPassword: 'पासवर्ड सेट करें',
    setPasswordLead: 'अगली बार आप इससे या कोड से साइन इन कर सकते हैं।',
    save: 'सेव करें और आगे बढ़ें',
    google: 'Google से आगे बढ़ें',
    or: 'या',
    noAccount: '360Ghar पर नए हैं?',
    createOne: 'अकाउंट बनाएँ',
    haveAccount: 'पहले से अकाउंट है?',
    fullName: 'पूरा नाम',
    nameRule: 'अपना पूरा नाम डालें (कम से कम 2 अक्षर)।',
    terms: 'मैं सेवा की शर्तें और प्राइवेसी पॉलिसी मानता/मानती हूँ।',
    termsRule: 'आगे बढ़ने के लिए शर्तें मानें।',
    exists: 'इस नंबर या ईमेल पर पहले से अकाउंट है।',
    signInInstead: 'साइन इन करें',
    noAccountFound: 'इस नंबर या ईमेल पर कोई अकाउंट नहीं मिला।',
    phone: 'मोबाइल नंबर',
    phoneRule: '6, 7, 8 या 9 से शुरू होने वाला 10 अंकों का नंबर डालें।',
    skip: 'अभी छोड़ें',
    dob: 'जन्मतिथि',
    dobYoung: 'आपकी उम्र 18 साल या ज़्यादा होनी चाहिए।',
    dobOld: 'साल जाँचें।',
    dobRequired: 'अपनी जन्मतिथि डालें।',
    done: 'पासवर्ड सेव हो गया।',
    resetExpired: 'यह रीसेट अब मान्य नहीं है। नया कोड मँगाएँ।',
    requestCode: 'नया कोड मँगाएँ',
    errBadPassword: 'पासवर्ड गलत है। दोबारा कोशिश करें या कोड से साइन इन करें।',
    errBadCode: 'कोड गलत है या उसकी समय सीमा खत्म हो गई। नया कोड मँगाएँ।',
    errRate: 'बहुत ज़्यादा कोशिशें। एक मिनट रुकें, फिर कोशिश करें।',
    errPhoneTaken: 'यह मोबाइल नंबर किसी दूसरे अकाउंट में इस्तेमाल हो रहा है। कोई दूसरा नंबर डालें।',
    errAuthOff: 'अभी साइन इन उपलब्ध नहीं है। बाद में कोशिश करें।',
    callbackFailed: 'साइन इन पूरा नहीं हो सका। दोबारा कोशिश करें।',
    backToLogin: 'साइन इन पर वापस',
    progress: 'चरण',
    stepsLogin: ['नंबर या ईमेल', 'पासवर्ड या कोड', 'नया पासवर्ड'],
    stepsRegister: ['आपकी जानकारी', 'कोड', 'पासवर्ड'],
    stepsReset: ['नंबर या ईमेल', 'कोड', 'नया पासवर्ड'],
    stepsPhone: ['नंबर', 'कोड'],
    willUse: (v: string) => `हम ${v} इस्तेमाल करेंगे।`,
    changeId: 'बदलें',
    methods: { google: 'Google', email_password: 'ईमेल और पासवर्ड', phone_password: 'मोबाइल और पासवर्ड', phone_otp: 'मोबाइल और कोड', email_otp: 'ईमेल और कोड' } as Record<string, string>,
    lastUsedLine: (m: string) => `पिछली बार आपने ${m} से साइन इन किया`,
    createInstead: 'इसके बजाय अकाउंट बनाएँ',
  },
};
type Strings = (typeof T)['en'];

const LAST_METHOD_KEY = '360ghar:lastAuthMethod';
type Method = 'google' | 'email_password' | 'phone_password' | 'phone_otp' | 'email_otp';

function recordMethod(method: Method, id?: Identifier | null) {
  try {
    localStorage.setItem(LAST_METHOD_KEY, JSON.stringify({ method, identifierHint: id ? maskIdentifier(id) : null, ts: Date.now() }));
  } catch {
    // Storage blocked: only the "last used" badge is lost.
  }
  // Needs the API token: after a fresh sign-in, initAuth() loads the session first.
  void initAuth()
    .then(() => call(api.POST('/api/v1/auth/last-method', { body: { method } })))
    .catch(() => undefined);
}

function supabaseMessage(error: { message?: string; code?: string; status?: number } | null, t: Strings): string {
  const m = `${error?.code ?? ''} ${error?.message ?? ''}`.toLowerCase();
  if (m.includes('invalid login') || m.includes('invalid_credentials')) return t.errBadPassword;
  if (m.includes('expired') || m.includes('invalid') || m.includes('otp')) return t.errBadCode;
  if (m.includes('rate') || error?.status === 429) return t.errRate;
  return error?.message || t.errAuthOff;
}

function useResend(seconds = 30) {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    if (left <= 0) return;
    const id = window.setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [left]);
  return { left, start: useCallback(() => setLeft(seconds), [seconds]) };
}

/** Reads an SMS code when the browser supports the WebOTP API (Android Chrome). */
function useWebOtp(active: boolean, onCode: (c: string) => void) {
  useEffect(() => {
    if (!active || !('OTPCredential' in window)) return;
    const ac = new AbortController();
    (navigator.credentials.get({ otp: { transport: ['sms'] }, signal: ac.signal } as CredentialRequestOptions) as Promise<{ code?: string } | null>)
      .then((c) => c?.code && onCode(c.code))
      .catch(() => undefined);
    return () => ac.abort();
  }, [active, onCode]);
}

type StepsProp = { labels: string[]; at: number; name: string };

/** Where the user is in a multi-step flow: done steps carry a tick. */
function Steps({ labels, at, name }: StepsProp) {
  return (
    <ol className="auth-steps" aria-label={name}>
      {labels.map((l, i) => (
        <li key={l} data-state={i < at ? 'done' : i === at ? 'now' : 'next'} aria-current={i === at ? 'step' : undefined}>
          {i < at ? <Icon name="check" size={14} /> : <span className="tabular">{i + 1}</span>}
          {l}
        </li>
      ))}
    </ol>
  );
}

function Shell({ title, lead, steps, children }: { title: string; lead?: ReactNode; steps?: StepsProp; children: ReactNode }) {
  return (
    <div className="auth-card">
      <h1 className="auth-title">{title}</h1>
      {lead ? <p className="auth-lead">{lead}</p> : null}
      {steps ? <Steps {...steps} /> : null}
      <div className="auth-body">{children}</div>
    </div>
  );
}

const phoneText = (v: string) => `+91 ${v.slice(0, 5)} ${v.slice(5)}`;

function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p className="field-error" role="alert">
      <Icon name="alert" size={16} />
      {message}
    </p>
  );
}

async function finish(locale: Locale, nextRaw: string | null) {
  const next = safeNext(nextRaw, locale);
  // The session was just stored: this loads the SDK and the API token.
  await initAuth();
  await refreshProfile();
  window.location.assign(pathForStage(useAuthStore.getState().stage?.stage, next, locale));
}

function nextParam(): string | null {
  return new URLSearchParams(window.location.search).get('next');
}

/* ------------------------------ Google ------------------------------ */

function GoogleButton({ locale, t }: { locale: Locale; t: Strings }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      className="btn btn-block"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        const sb = await supabase();
        if (!sb) return setBusy(false);
        try {
          sessionStorage.setItem('oauth:next', safeNext(nextParam(), locale));
        } catch {
          // The callback falls back to the home page.
        }
        const origin = window.location.origin.replace('://www.', '://');
        await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${origin}${localizePath('/auth/callback', locale)}` } });
      }}
    >
      <Icon name="brand:google" size={18} />
      {t.google}
    </button>
  );
}

/* ------------------------------ Code step ------------------------------ */

function CodeStep({
  id,
  t,
  onVerify,
  onResend,
  onBack,
}: {
  id: Identifier;
  t: Strings;
  onVerify: (code: string) => Promise<string | null>;
  onResend: () => Promise<string | null>;
  onBack: () => void;
}) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const timer = useResend();
  const started = useRef(false);
  useEffect(() => {
    if (!started.current) {
      started.current = true;
      timer.start();
    }
  }, [timer]);

  const submit = useCallback(
    async (c: string) => {
      if (!/^\d{6}$/.test(c)) return setError(t.errBadCode);
      setBusy(true);
      setError(await onVerify(c));
      setBusy(false);
    },
    [onVerify, t],
  );
  useWebOtp(id.kind === 'phone', (c) => {
    setCode(c);
    void submit(c);
  });

  return (
    <form
      className="grid gap-4"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        void submit(code);
      }}
    >
      <p className="text-ink-800" role="status">
        {t.codeSent(maskIdentifier(id))}
      </p>
      <TextField
        label={t.code}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        pattern="\d{6}"
        className="auth-code tabular"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        error={error ?? undefined}
        autoFocus
      />
      <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
        {t.verify}
      </button>
      <div className="auth-more">
        <button
          type="button"
          className="btn btn-quiet"
          disabled={timer.left > 0}
          onClick={async () => {
            setError(await onResend());
            timer.start();
          }}
        >
          {timer.left > 0 ? t.resendIn(timer.left) : t.resend}
        </button>
        <button type="button" className="btn btn-quiet" onClick={onBack}>
          {t.change}
        </button>
      </div>
    </form>
  );
}

/* ------------------------------ Password step ------------------------------ */

function NewPassword({ t, onSave, submitLabel }: { t: Strings; onSave: (pw: string) => Promise<string | null>; submitLabel: string }) {
  const schema = z
    .object({ pw: z.string().refine((v) => passwordProblems(v).length === 0, t.pwRule), confirm: z.string() })
    .refine((v) => v.pw === v.confirm, { path: ['confirm'], message: t.mismatch });
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { pw: '', confirm: '' } });
  return (
    <form
      className="grid gap-4"
      noValidate
      onSubmit={form.handleSubmit(async (v) => {
        const err = await onSave(v.pw);
        if (err) form.setError('root', { message: err });
      })}
    >
      <TextField label={t.newPassword} type="password" autoComplete="new-password" hint={t.pwRule} error={form.formState.errors.pw?.message} {...form.register('pw')} />
      <TextField label={t.confirm} type="password" autoComplete="new-password" error={form.formState.errors.confirm?.message} {...form.register('confirm')} />
      <FormError message={form.formState.errors.root?.message} />
      <button type="submit" className="btn btn-primary btn-block" disabled={form.formState.isSubmitting}>
        {submitLabel}
      </button>
    </form>
  );
}

/* ------------------------------ Login ------------------------------ */

function checkIdentifier(id: Identifier) {
  return call(api.POST('/api/v1/auth/identifier-status', { body: { identifier: id.kind === 'phone' ? id.e164 : id.value } }));
}

async function sendCode(id: Identifier, createUser: boolean, fullName?: string) {
  const sb = await supabase();
  if (!sb) return { message: 'auth unavailable' };
  const options = { shouldCreateUser: createUser, ...(fullName ? { data: { full_name: fullName } } : {}) };
  const { error } = id.kind === 'phone' ? await sb.auth.signInWithOtp({ phone: id.e164, options }) : await sb.auth.signInWithOtp({ email: id.value, options });
  return error;
}

async function verifyCode(id: Identifier, token: string) {
  const sb = await supabase();
  if (!sb) return { message: 'auth unavailable' };
  const { error } = id.kind === 'phone' ? await sb.auth.verifyOtp({ phone: id.e164, token, type: 'sms' }) : await sb.auth.verifyOtp({ email: id.value, token, type: 'email' });
  return error;
}

/** Confirms what we read from the field, so a typo shows before "Continue". */
function idHint(value: string, t: Strings): string {
  const id = parseIdentifier(value);
  if (!id) return t.identifierHint;
  return t.willUse(id.kind === 'phone' ? phoneText(id.value) : id.value);
}

function IdentifierForm({ t, onNext, busyLabel }: { t: Strings; onNext: (id: Identifier) => Promise<string | null>; busyLabel?: string }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="grid gap-4"
      noValidate
      onSubmit={async (e) => {
        e.preventDefault();
        const id = parseIdentifier(value);
        if (!id) return setError(t.badIdentifier);
        setBusy(true);
        setError(await onNext(id));
        setBusy(false);
      }}
    >
      <TextField label={t.identifier} hint={idHint(value, t)} autoComplete="username" inputMode="email" value={value} onChange={(e) => setValue(e.target.value)} error={error ?? undefined} autoFocus />
      <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
        {busy && busyLabel ? busyLabel : t.continue}
      </button>
    </form>
  );
}

function Login({ locale, t }: { locale: Locale; t: Strings }) {
  const [step, setStep] = useState<'id' | 'password' | 'code' | 'set-password'>('id');
  const [id, setId] = useState<Identifier | null>(null);
  const [hasPassword, setHasPassword] = useState(false);
  const [last, setLast] = useState<{ method: string; identifierHint?: string } | null>(null);
  const pwForm = useForm<{ pw: string }>({ defaultValues: { pw: '' } });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LAST_METHOD_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- storage is read after hydration on purpose
      if (raw) setLast(JSON.parse(raw));
    } catch {
      // No badge.
    }
  }, []);

  const toCode = async (target: Identifier) => {
    const err = await sendCode(target, true);
    if (err) return supabaseMessage(err, t);
    setStep('code');
    return null;
  };
  // A first sign-in with a code adds a third step: choosing a password.
  const labels = hasPassword || step !== 'set-password' ? t.stepsLogin.slice(0, 2) : t.stepsLogin;
  const steps = (at: number): StepsProp => ({ labels, at, name: t.progress });
  const changeId = (
    <button type="button" className="link auth-change" onClick={() => setStep('id')}>
      {t.changeId}
    </button>
  );

  if (step === 'id')
    return (
      <Shell title={t.loginTitle} lead={t.loginLead} steps={steps(0)}>
        {last ? (
          <p className="auth-last">
            <Icon name="clock" size={16} />
            <span>
              {t.lastUsedLine(t.methods[last.method] ?? last.method)}
              {last.identifierHint ? ` · ${last.identifierHint}` : ''}
            </span>
          </p>
        ) : null}
        <IdentifierForm
          t={t}
          onNext={async (v) => {
            setId(v);
            try {
              const s = await checkIdentifier(v);
              setHasPassword(s.has_password);
              if (s.next_step === 'password') {
                setStep('password');
                return null;
              }
              return await toCode(v);
            } catch (e) {
              if (e instanceof ApiError && e.kind === 'rate_limited') return t.errRate;
              return describeError(e, locale).body;
            }
          }}
        />
        <Divider t={t} />
        <GoogleButton locale={locale} t={t} />
        <p className="auth-switch">
          {t.noAccount}{' '}
          <a className="link" href={localizePath('/register', locale) + window.location.search}>
            {t.createOne}
          </a>
        </p>
      </Shell>
    );

  if (step === 'password' && id)
    return (
      <Shell
        title={t.loginTitle}
        lead={
          <>
            {maskIdentifier(id)} {changeId}
          </>
        }
        steps={steps(1)}
      >
        <form
          className="grid gap-4"
          noValidate
          onSubmit={pwForm.handleSubmit(async ({ pw }) => {
            const sb = await supabase();
            if (!sb) return pwForm.setError('root', { message: t.errAuthOff });
            const { error } = id.kind === 'phone' ? await sb.auth.signInWithPassword({ phone: id.e164, password: pw }) : await sb.auth.signInWithPassword({ email: id.value, password: pw });
            if (error) return pwForm.setError('root', { message: supabaseMessage(error, t) });
            recordMethod(id.kind === 'phone' ? 'phone_password' : 'email_password', id);
            await finish(locale, nextParam());
          })}
        >
          <TextField label={t.password} type="password" autoComplete="current-password" autoFocus {...pwForm.register('pw', { required: true })} />
          <FormError message={pwForm.formState.errors.root?.message} />
          <button type="submit" className="btn btn-primary btn-block" disabled={pwForm.formState.isSubmitting}>
            {t.signIn}
          </button>
          <div className="auth-more">
            <button type="button" className="btn btn-quiet" onClick={() => void toCode(id).then((m) => m && pwForm.setError('root', { message: m }))}>
              {t.useCode}
            </button>
            <a className="btn btn-quiet" href={localizePath('/forgot-password', locale)}>
              {t.forgot}
            </a>
          </div>
        </form>
      </Shell>
    );

  if (step === 'code' && id)
    return (
      <Shell title={t.loginTitle} steps={steps(1)}>
        <CodeStep
          id={id}
          t={t}
          onBack={() => setStep('id')}
          onResend={async () => {
            const e = await sendCode(id, true);
            return e ? supabaseMessage(e, t) : null;
          }}
          onVerify={async (c) => {
            const e = await verifyCode(id, c);
            if (e) return supabaseMessage(e, t);
            recordMethod(id.kind === 'phone' ? 'phone_otp' : 'email_otp', id);
            if (!hasPassword) {
              setStep('set-password');
              return null;
            }
            await finish(locale, nextParam());
            return null;
          }}
        />
      </Shell>
    );

  return (
    <Shell title={t.setPassword} lead={t.setPasswordLead} steps={steps(2)}>
      <NewPassword
        t={t}
        submitLabel={t.save}
        onSave={async (pw) => {
          const sb = await supabase();
          const { error } = (await sb?.auth.updateUser({ password: pw })) ?? { error: { message: 'auth unavailable' } };
          if (error) return supabaseMessage(error, t);
          if (id) recordMethod(id.kind === 'phone' ? 'phone_password' : 'email_password', id);
          await finish(locale, nextParam());
          return null;
        }}
      />
    </Shell>
  );
}

function Divider({ t }: { t: Strings }) {
  return (
    <div className="auth-or" aria-hidden="true">
      <span>{t.or}</span>
    </div>
  );
}

/* ------------------------------ Register ------------------------------ */

function Register({ locale, t }: { locale: Locale; t: Strings }) {
  const [step, setStep] = useState<'details' | 'code' | 'password'>('details');
  const [id, setId] = useState<Identifier | null>(null);
  const [name, setName] = useState('');
  const [exists, setExists] = useState(false);
  const schema = z.object({
    name: z.string().trim().min(2, t.nameRule),
    identifier: z.string().refine((v) => parseIdentifier(v) !== null, t.badIdentifier),
    terms: z.literal(true, { message: t.termsRule }),
  });
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { name: '', identifier: '' } });
  const steps = (at: number): StepsProp => ({ labels: t.stepsRegister, at, name: t.progress });
  const typed = useWatch({ control: form.control, name: 'identifier' });

  if (step === 'details')
    return (
      <Shell title={t.registerTitle} lead={t.registerLead} steps={steps(0)}>
        <form
          className="grid gap-4"
          noValidate
          onSubmit={form.handleSubmit(async (v) => {
            const parsed = parseIdentifier(v.identifier)!;
            setExists(false);
            try {
              const s = await checkIdentifier(parsed);
              if (s.exists && s.verified) {
                setExists(true);
                return;
              }
            } catch (e) {
              return form.setError('root', { message: describeError(e, locale).body });
            }
            const err = await sendCode(parsed, true, v.name.trim());
            if (err) return form.setError('root', { message: supabaseMessage(err, t) });
            setId(parsed);
            setName(v.name.trim());
            setStep('code');
          })}
        >
          <TextField label={t.fullName} autoComplete="name" error={form.formState.errors.name?.message} {...form.register('name')} autoFocus />
          <TextField label={t.identifier} hint={idHint(typed ?? '', t)} autoComplete="username" error={form.formState.errors.identifier?.message} {...form.register('identifier')} />
          <div>
            <Check
              label={
                locale === 'hi' ? (
                  <>
                    मैं{' '}
                    <a className="underline" href={localizePath('/policies/terms-of-service', locale)} target="_blank" rel="noopener">
                      सेवा की शर्तें
                    </a>{' '}
                    और{' '}
                    <a className="underline" href={localizePath('/policies/privacy-policy', locale)} target="_blank" rel="noopener">
                      प्राइवेसी पॉलिसी
                    </a>{' '}
                    मानता/मानती हूँ।
                  </>
                ) : (
                  <>
                    I accept the{' '}
                    <a className="underline" href={localizePath('/policies/terms-of-service', locale)} target="_blank" rel="noopener">
                      terms of service
                    </a>{' '}
                    and the{' '}
                    <a className="underline" href={localizePath('/policies/privacy-policy', locale)} target="_blank" rel="noopener">
                      privacy policy
                    </a>
                    .
                  </>
                )
              }
              {...form.register('terms')}
            />
            <FormError message={form.formState.errors.terms?.message} />
          </div>
          {exists ? (
            <p className="auth-note" role="alert">
              {t.exists}{' '}
              <a className="link" href={localizePath('/login', locale)}>
                {t.signInInstead}
              </a>
            </p>
          ) : null}
          <FormError message={form.formState.errors.root?.message} />
          <button type="submit" className="btn btn-primary btn-block" disabled={form.formState.isSubmitting}>
            {t.continue}
          </button>
        </form>
        <Divider t={t} />
        <GoogleButton locale={locale} t={t} />
        <p className="auth-switch">
          {t.haveAccount}{' '}
          <a className="link" href={localizePath('/login', locale)}>
            {t.signIn}
          </a>
        </p>
      </Shell>
    );

  if (step === 'code' && id)
    return (
      <Shell title={t.registerTitle} steps={steps(1)}>
        <CodeStep
          id={id}
          t={t}
          onBack={() => setStep('details')}
          onResend={async () => {
            const e = await sendCode(id, true, name);
            return e ? supabaseMessage(e, t) : null;
          }}
          onVerify={async (c) => {
            const e = await verifyCode(id, c);
            if (e) return supabaseMessage(e, t);
            recordMethod(id.kind === 'phone' ? 'phone_otp' : 'email_otp', id);
            // Keep the name in the backend profile too (the old site dropped it).
            void call(api.PUT('/api/v1/users/profile', { body: { full_name: name } })).catch(() => undefined);
            setStep('password');
            return null;
          }}
        />
      </Shell>
    );

  return (
    <Shell title={t.setPassword} lead={t.setPasswordLead} steps={steps(2)}>
      <NewPassword
        t={t}
        submitLabel={t.save}
        onSave={async (pw) => {
          const sb = await supabase();
          const { error } = (await sb?.auth.updateUser({ password: pw })) ?? { error: { message: 'auth unavailable' } };
          if (error) return supabaseMessage(error, t);
          await finish(locale, nextParam() ?? localizePath('/account', locale));
          return null;
        }}
      />
    </Shell>
  );
}

/* ------------------------------ Forgot and reset ------------------------------ */

function Forgot({ locale, t }: { locale: Locale; t: Strings }) {
  const [id, setId] = useState<Identifier | null>(null);
  const [missing, setMissing] = useState(false);
  const steps = (at: number): StepsProp => ({ labels: t.stepsReset, at, name: t.progress });
  if (!id)
    return (
      <Shell title={t.forgotTitle} lead={t.forgotLead} steps={steps(0)}>
        <IdentifierForm
          t={t}
          onNext={async (v) => {
            setMissing(false);
            try {
              const s = await checkIdentifier(v);
              if (!s.exists) {
                setMissing(true);
                return t.noAccountFound;
              }
            } catch (e) {
              return describeError(e, locale).body;
            }
            const err = await sendCode(v, false);
            if (err) return supabaseMessage(err, t);
            setId(v);
            return null;
          }}
        />
        {missing ? (
          <p className="auth-note">
            <a className="link" href={localizePath('/register', locale)}>
              {t.createInstead}
            </a>
          </p>
        ) : null}
        <p className="auth-switch">
          <a className="link" href={localizePath('/login', locale)}>
            {t.backToLogin}
          </a>
        </p>
      </Shell>
    );
  return (
    <Shell title={t.forgotTitle} steps={steps(1)}>
      <CodeStep
        id={id}
        t={t}
        onBack={() => setId(null)}
        onResend={async () => {
          const e = await sendCode(id, false);
          return e ? supabaseMessage(e, t) : null;
        }}
        onVerify={async (c) => {
          const e = await verifyCode(id, c);
          if (e) return supabaseMessage(e, t);
          try {
            sessionStorage.setItem('passwordResetFlow', '1');
          } catch {
            // The reset page asks for a new code if the flag is missing.
          }
          window.location.assign(localizePath('/reset-password', locale));
          return null;
        }}
      />
    </Shell>
  );
}

function Reset({ locale, t }: { locale: Locale; t: Strings }) {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  useEffect(() => {
    void (async () => {
      let flag = false;
      try {
        flag = sessionStorage.getItem('passwordResetFlow') === '1';
      } catch {
        flag = false;
      }
      const sb = await supabase();
      const session = (await sb?.auth.getSession())?.data.session;
      setAllowed(Boolean(flag && session));
    })();
  }, []);
  const steps: StepsProp = { labels: t.stepsReset, at: 2, name: t.progress };
  if (allowed === null) return <Shell title={t.resetTitle}>{null}</Shell>;
  if (!allowed)
    return (
      <Shell title={t.resetTitle} lead={t.resetExpired}>
        <a className="btn btn-primary btn-block" href={localizePath('/forgot-password', locale)}>
          {t.requestCode}
        </a>
      </Shell>
    );
  return (
    <Shell title={t.resetTitle} steps={steps}>
      <NewPassword
        t={t}
        submitLabel={t.save}
        onSave={async (pw) => {
          const sb = await supabase();
          const { error } = (await sb?.auth.updateUser({ password: pw })) ?? { error: { message: 'auth unavailable' } };
          if (error) return supabaseMessage(error, t);
          try {
            sessionStorage.removeItem('passwordResetFlow');
          } catch {
            // Nothing to clean.
          }
          await finish(locale, localizePath('/account', locale));
          return null;
        }}
      />
    </Shell>
  );
}

/* ------------------------------ Callback and phone ------------------------------ */

function Callback({ locale, t }: { locale: Locale; t: Strings }) {
  const [failed, setFailed] = useState<string | null>(null);
  useEffect(() => {
    void (async () => {
      const q = new URLSearchParams(window.location.search);
      if (q.get('error') || q.get('error_description')) return setFailed(q.get('error_description') ?? t.callbackFailed);
      const code = q.get('code');
      if (!code) return setFailed(t.callbackFailed);
      const sb = await supabase();
      const res = await sb?.auth.exchangeCodeForSession(code);
      if (!res || res.error) return setFailed(supabaseMessage(res?.error ?? null, t));
      recordMethod('google');
      let next = '/';
      try {
        next = sessionStorage.getItem('oauth:next') ?? '/';
        sessionStorage.removeItem('oauth:next');
      } catch {
        // Default next.
      }
      next = safeNext(next, locale);
      await initAuth();
      if (!res.data.user?.phone) return window.location.replace(`${localizePath('/add-phone', locale)}?next=${encodeURIComponent(next)}`);
      await finish(locale, next);
    })();
  }, [locale, t]);
  if (failed)
    return (
      <Shell title={t.callbackFailed} lead={failed}>
        <a className="btn btn-primary btn-block" href={localizePath('/login', locale)}>
          {t.backToLogin}
        </a>
      </Shell>
    );
  return (
    <Shell title={t.callbackTitle}>
      <p className="auth-wait" role="status">
        <span className="chat-typing" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </p>
    </Shell>
  );
}

function AddPhone({ locale, t }: { locale: Locale; t: Strings }) {
  const [id, setId] = useState<Identifier | null>(null);
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const next = safeNext(typeof window === 'undefined' ? null : nextParam(), locale);
  const steps = (at: number): StepsProp => ({ labels: t.stepsPhone, at, name: t.progress });
  if (!id)
    return (
      <Shell title={t.phoneTitle} lead={t.phoneLead} steps={steps(0)}>
        <form
          className="grid gap-4"
          noValidate
          onSubmit={async (e) => {
            e.preventDefault();
            const parsed = parseIdentifier(value);
            if (!parsed || parsed.kind !== 'phone') return setError(t.phoneRule);
            const sb = await supabase();
            const res = await sb?.auth.updateUser({ phone: parsed.e164 });
            if (!res || res.error) return setError(supabaseMessage(res?.error ?? null, t));
            setError(null);
            setId(parsed);
          }}
        >
          <TextField
            label={t.phone}
            inputMode="numeric"
            autoComplete="tel-national"
            maxLength={13}
            hint={parseIdentifier(value)?.kind === 'phone' ? t.willUse(phoneText(parseIdentifier(value)!.value)) : undefined}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            error={error ?? undefined}
            autoFocus
          />
          <button type="submit" className="btn btn-primary btn-block">
            {t.continue}
          </button>
          <a className="btn btn-quiet btn-block" href={next}>
            {t.skip}
          </a>
        </form>
      </Shell>
    );
  return (
    <Shell title={t.phoneTitle} steps={steps(1)}>
      <CodeStep
        id={id}
        t={t}
        onBack={() => setId(null)}
        onResend={async () => {
          const sb = await supabase();
          const res = await sb?.auth.updateUser({ phone: id.kind === 'phone' ? id.e164 : '' });
          return res?.error ? supabaseMessage(res.error, t) : null;
        }}
        onVerify={async (c) => {
          const sb = await supabase();
          const res = await sb?.auth.verifyOtp({ phone: id.kind === 'phone' ? id.e164 : '', token: c, type: 'phone_change' });
          if (!res || res.error) return supabaseMessage(res?.error ?? null, t);
          // Save the phone in the backend profile too (the old site did not). Needs the API token.
          // An empty phone is a 422, so nothing is sent for an email identifier. A phone that
          // belongs to another account is a 409 PHONE_TAKEN: show it. Other failures do not block.
          await initAuth();
          if (id.kind === 'phone') {
            try {
              await call(api.PUT('/api/v1/users/me/phone', { body: { phone: id.e164 } }));
            } catch (e) {
              if (e instanceof ApiError && e.code === 'PHONE_TAKEN') return t.errPhoneTaken;
              if (e instanceof ApiError && e.kind === 'validation') return e.message;
            }
          }
          await finish(locale, next);
          return null;
        }}
      />
    </Shell>
  );
}

/* ------------------------------ Profile completion ------------------------------ */

function Profile({ locale, t }: { locale: Locale; t: Strings }) {
  const profile = useAuthStore((s) => s.profile);
  const status = useAuth((s) => s.status);
  const schema = z.object({
    name: z.string().trim().min(2, t.nameRule),
    dob: z.string().superRefine((v, ctx) => {
      const p = dobProblem(v);
      if (p) ctx.addIssue({ code: 'custom', message: p === 'young' ? t.dobYoung : p === 'old' ? t.dobOld : t.dobRequired });
    }),
  });
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { name: '', dob: '' } });
  useEffect(() => {
    if (profile) form.reset({ name: profile.full_name ?? '', dob: profile.date_of_birth ?? '' });
  }, [profile, form]);
  useEffect(() => {
    if (status === 'anon') window.location.assign(loginHref(locale, window.location.pathname));
  }, [status, locale]);

  return (
    <Shell title={t.profileTitle} lead={t.profileLead}>
      <form
        className="grid gap-4"
        noValidate
        onSubmit={form.handleSubmit(async (v) => {
          try {
            await call(api.PUT('/api/v1/users/profile', { body: { full_name: v.name.trim(), date_of_birth: v.dob } }));
          } catch (e) {
            if (e instanceof ApiError && e.fields.date_of_birth) return form.setError('dob', { message: e.fields.date_of_birth });
            if (e instanceof ApiError && e.fields.full_name) return form.setError('name', { message: e.fields.full_name });
            return form.setError('root', { message: describeError(e, locale).body });
          }
          await refreshProfile();
          const next = safeNext(nextParam(), locale);
          const stage = useAuthStore.getState().stage?.stage;
          // Never loop back to this page.
          window.location.assign(stage === 'profile_completion' ? next : pathForStage(stage, next, locale));
        })}
      >
        <TextField label={t.fullName} autoComplete="name" error={form.formState.errors.name?.message} {...form.register('name')} />
        <TextField label={t.dob} type="date" autoComplete="bday" error={form.formState.errors.dob?.message} {...form.register('dob')} />
        <FormError message={form.formState.errors.root?.message} />
        <button type="submit" className="btn btn-primary btn-block" disabled={form.formState.isSubmitting}>
          {t.save}
        </button>
      </form>
    </Shell>
  );
}

export default function AuthFlows({ mode, locale = 'en' }: { mode: Mode; locale?: Locale }) {
  const t = T[locale];
  const view =
    mode === 'login' ? (
      <Login locale={locale} t={t} />
    ) : mode === 'register' ? (
      <Register locale={locale} t={t} />
    ) : mode === 'forgot' ? (
      <Forgot locale={locale} t={t} />
    ) : mode === 'reset' ? (
      <Reset locale={locale} t={t} />
    ) : mode === 'callback' ? (
      <Callback locale={locale} t={t} />
    ) : mode === 'add-phone' ? (
      <AddPhone locale={locale} t={t} />
    ) : (
      <Profile locale={locale} t={t} />
    );
  return (
    <IslandBoundary locale={locale} compact>
      {view}
    </IslandBoundary>
  );
}
