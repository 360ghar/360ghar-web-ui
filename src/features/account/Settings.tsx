/**
 * Account tabs for notification settings, search preferences and saved auction
 * alerts. Flat forms and lists, the same cards as Profile and Security.
 * Every tab: skeleton after 150 ms, an error view with "Try again", 422 messages
 * under their fields, and a saving state on the button.
 */
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { refreshProfile, useAuthStore } from '@/features/auth/store';
import { api, call } from '@/lib/api/client';
import { ApiError, applyFieldErrors, describeError } from '@/lib/api/errors';
import type { components } from '@/lib/api/schema';
import { PROPERTY_TYPES } from '@/lib/api/enums';
import { compactPrice, formatDate, typeLabel } from '@/lib/format';
import type { Locale } from '@/lib/i18n/locale';
import { localizePath } from '@/lib/i18n/locale';
import { useCursorQuery } from '@/lib/infinite';
import { Icon } from '@/ui/icons/Icon';
import { Delayed, Skeleton } from '@/ui/react/Delayed';
import { Check, SelectField, TextField } from '@/ui/react/Field';
import { toast } from '@/ui/react/Toaster';
import { StateBlock } from '@/ui/states/StateBlock';
import { AcctState } from './AccountArt';
import { alertParts, NOTIFICATION_KEYS, prefsToValues, valuesToPatch, type Alert, type PrefValues } from './settingsModel';

type NotificationSettings = components['schemas']['NotificationSettings'];
type ScalarKey = Exclude<keyof PrefValues, 'property_type'>;

const T = {
  en: {
    retry: 'Try again',
    saving: 'Saving…',
    save: 'Save',
    saved: 'Saved',
    // Notifications
    nHead: 'Notifications',
    nLead: 'Choose how we contact you. Changes apply after you save.',
    nKeys: {
      push_notifications: ['Push notifications', 'Visit updates and replies on your phone.'],
      email_notifications: ['Email', 'Visit confirmations, receipts and account notices.'],
      sms_notifications: ['Text messages (SMS)', 'Short alerts to your phone number.'],
      promotional_emails: ['Offers and news by email', 'New features and offers. Off unless you turn it on.'],
    } as Record<string, [string, string]>,
    // Preferences
    pHead: 'Search preferences',
    pLead: 'We use these to suggest homes. Leave a field empty for no preference.',
    purpose: 'Looking to',
    any: 'Any',
    purposes: { buy: 'Buy', rent: 'Rent', short_stay: 'Short stay' } as Record<string, string>,
    types: 'Property types',
    budget: 'Budget',
    budgetMin: 'Minimum (₹)',
    budgetMax: 'Maximum (₹)',
    beds: 'Bedrooms',
    bedsMin: 'At least',
    bedsMax: 'At most',
    area: 'Area (sq ft)',
    areaMin: 'Minimum',
    areaMax: 'Maximum',
    places: 'Preferred areas',
    placesHint: 'Separate with commas, for example Sector 56, Palam Vihar.',
    distance: 'Search distance (km)',
    number: 'Enter a number.',
    wholeNumber: 'Enter a whole number.',
    range: 'The maximum must not be lower than the minimum.',
    locHead: 'Your location',
    locBody: 'Save where you are now, so we can sort homes by distance.',
    locButton: 'Use my current location',
    locSaving: 'Locating…',
    locSaved: 'Location saved.',
    locDenied: 'Location is blocked in your browser. Allow it in the site settings, then try again.',
    // Alerts
    aHead: 'Saved auction alerts',
    aLead: 'We tell you when a bank auction matches an alert.',
    aAny: 'Any auction',
    aKeyword: 'Keyword',
    aPaused: 'Paused',
    aCreated: (d: string) => `Set on ${d}`,
    aNotified: (d: string) => `Last notified ${d}`,
    aDelete: 'Delete',
    aDeleteFor: (n: string) => `Delete alert: ${n}`,
    aConfirm: 'Delete this alert?',
    aConfirmYes: 'Yes, delete',
    aKeep: 'Keep it',
    aDeleted: 'Alert deleted.',
    aEmptyTitle: 'No auction alerts yet',
    aEmptyBody: 'Open a bank auction search, set your filters and choose "Set an alert".',
    aEmptyAction: 'Browse bank auctions',
    aMore: 'Load more',
  },
  hi: {
    retry: 'दोबारा कोशिश करें',
    saving: 'सेव हो रहा है…',
    save: 'सेव करें',
    saved: 'सेव हो गया',
    nHead: 'नोटिफ़िकेशन',
    nLead: 'चुनें कि हम आपसे कैसे संपर्क करें। बदलाव सेव करने के बाद लागू होंगे।',
    nKeys: {
      push_notifications: ['पुश नोटिफ़िकेशन', 'विज़िट की जानकारी और जवाब आपके फ़ोन पर।'],
      email_notifications: ['ईमेल', 'विज़िट की पुष्टि, रसीदें और अकाउंट की सूचनाएँ।'],
      sms_notifications: ['टेक्स्ट मैसेज (SMS)', 'आपके फ़ोन नंबर पर छोटे अलर्ट।'],
      promotional_emails: ['ऑफ़र और ख़बरें ईमेल पर', 'नए फ़ीचर और ऑफ़र। आप चालू करें तभी।'],
    } as Record<string, [string, string]>,
    pHead: 'खोज की पसंद',
    pLead: 'हम इनसे घर सुझाते हैं। पसंद न हो तो खाना खाली छोड़ें।',
    purpose: 'आप क्या चाहते हैं',
    any: 'कोई भी',
    purposes: { buy: 'ख़रीदना', rent: 'किराए पर', short_stay: 'छोटा प्रवास' } as Record<string, string>,
    types: 'प्रॉपर्टी के प्रकार',
    budget: 'बजट',
    budgetMin: 'कम से कम (₹)',
    budgetMax: 'ज़्यादा से ज़्यादा (₹)',
    beds: 'बेडरूम',
    bedsMin: 'कम से कम',
    bedsMax: 'ज़्यादा से ज़्यादा',
    area: 'क्षेत्रफल (वर्ग फ़ुट)',
    areaMin: 'कम से कम',
    areaMax: 'ज़्यादा से ज़्यादा',
    places: 'पसंदीदा इलाके',
    placesHint: 'कॉमा से अलग करें, जैसे सेक्टर 56, पालम विहार।',
    distance: 'खोज की दूरी (किमी)',
    number: 'एक संख्या लिखें।',
    wholeNumber: 'पूरी संख्या लिखें।',
    range: 'अधिकतम, न्यूनतम से कम नहीं हो सकता।',
    locHead: 'आपकी लोकेशन',
    locBody: 'अभी की लोकेशन सेव करें, ताकि हम घर दूरी के हिसाब से दिखा सकें।',
    locButton: 'मेरी मौजूदा लोकेशन इस्तेमाल करें',
    locSaving: 'लोकेशन ढूँढ रहे हैं…',
    locSaved: 'लोकेशन सेव हो गई।',
    locDenied: 'आपके ब्राउज़र में लोकेशन बंद है। साइट सेटिंग में अनुमति दें, फिर कोशिश करें।',
    aHead: 'सेव किए नीलामी अलर्ट',
    aLead: 'किसी अलर्ट से मेल खाती बैंक नीलामी आने पर हम बताएँगे।',
    aAny: 'कोई भी नीलामी',
    aKeyword: 'कीवर्ड',
    aPaused: 'रुका हुआ',
    aCreated: (d: string) => `${d} को बनाया`,
    aNotified: (d: string) => `आख़िरी सूचना ${d}`,
    aDelete: 'हटाएँ',
    aDeleteFor: (n: string) => `अलर्ट हटाएँ: ${n}`,
    aConfirm: 'यह अलर्ट हटाएँ?',
    aConfirmYes: 'हाँ, हटाएँ',
    aKeep: 'रहने दें',
    aDeleted: 'अलर्ट हटा दिया।',
    aEmptyTitle: 'अभी कोई नीलामी अलर्ट नहीं',
    aEmptyBody: 'बैंक नीलामी की खोज खोलें, फ़िल्टर चुनें और "अलर्ट लगाएँ" दबाएँ।',
    aEmptyAction: 'बैंक नीलामी देखें',
    aMore: 'और दिखाएँ',
  },
};

function Gate({ error, locale, retry }: { error: unknown; locale: Locale; retry: () => void }) {
  const d = describeError(error, locale);
  return <StateBlock compact scene={d.kind === 'network' ? 'offline' : 'error'} title={d.title} body={d.body} action={{ label: T[locale].retry, onClick: retry }} />;
}

function FormSkeleton() {
  return (
    <Delayed>
      <div className="skeleton-gate acct-card sheet max-w-2xl" aria-hidden="true">
        <div className="grid gap-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-5 w-full max-w-sm" />
        </div>
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-2/3" />
        <Skeleton className="h-11 w-24" />
      </div>
    </Delayed>
  );
}

function Head({ id, title, lead }: { id: string; title: string; lead: string }) {
  return (
    <div className="grid gap-1">
      <h2 id={id} className="text-xl">
        {title}
      </h2>
      <p className="text-sm text-ink-600">{lead}</p>
    </div>
  );
}

function RootError({ message }: { message?: string | undefined }) {
  if (!message) return null;
  return (
    <p className="field-error" role="alert">
      <Icon name="alert" size={16} />
      {message}
    </p>
  );
}

/* ---------------------------- Notifications ---------------------------- */

export function Notifications({ locale }: { locale: Locale }) {
  const t = T[locale];
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['notification-settings'], queryFn: () => call(api.GET('/api/v1/users/notification-settings')) });
  const form = useForm<NotificationSettings>({ values: q.data });
  const save = useMutation({
    mutationFn: (body: NotificationSettings) => call(api.PUT('/api/v1/users/notification-settings', { body })),
    onSuccess: (data) => {
      qc.setQueryData(['notification-settings'], data);
      toast(t.saved, 'success');
    },
    onError: (e) => {
      if (!applyFieldErrors(e, form).length) form.setError('root', { message: describeError(e, locale).body });
    },
  });
  if (q.isPending) return <FormSkeleton />;
  if (q.isError) return <Gate error={q.error} locale={locale} retry={() => void q.refetch()} />;
  return (
    <section className="acct-card sheet max-w-2xl" aria-labelledby="acct-n-h">
      <Head id="acct-n-h" title={t.nHead} lead={t.nLead} />
      <form
        className="grid gap-4"
        noValidate
        onSubmit={form.handleSubmit((v) => {
          form.clearErrors();
          save.mutate(Object.fromEntries(NOTIFICATION_KEYS.map((k) => [k, Boolean(v[k])])) as NotificationSettings);
        })}
      >
        <fieldset className="grid gap-3">
          <legend className="sr-only">{t.nHead}</legend>
          {NOTIFICATION_KEYS.map((k) => (
            <div key={k} className="grid gap-1">
              <Check label={<span className="font-bold">{t.nKeys[k]![0]}</span>} aria-describedby={`n-${k}-hint`} {...form.register(k)} />
              <p id={`n-${k}-hint`} className="field-hint -mt-2 ps-9">
                {t.nKeys[k]![1]}
              </p>
              {form.formState.errors[k] ? (
                <p className="field-error ps-9">
                  <Icon name="alert" size={16} />
                  {form.formState.errors[k]?.message}
                </p>
              ) : null}
            </div>
          ))}
        </fieldset>
        <RootError message={form.formState.errors.root?.message} />
        <button type="submit" className="btn btn-primary justify-self-start" disabled={save.isPending}>
          {save.isPending ? t.saving : t.save}
        </button>
      </form>
    </section>
  );
}

/* ----------------------------- Preferences ----------------------------- */

const whole = (m: string) => z.string().trim().refine((v) => v === '' || /^\d+$/.test(v), m);
const amount = (m: string) => z.string().trim().refine((v) => v === '' || /^[\d,]+(\.\d+)?$/.test(v), m);
const num = (v: string) => (v.trim() === '' ? null : Number(v.replace(/,/g, '')));

function prefSchema(t: (typeof T)['en']) {
  return z
    .object({
      purpose: z.string(),
      property_type: z.array(z.string()),
      budget_min: amount(t.number),
      budget_max: amount(t.number),
      bedrooms_min: whole(t.wholeNumber),
      bedrooms_max: whole(t.wholeNumber),
      area_min: amount(t.number),
      area_max: amount(t.number),
      location_preference: z.string().max(500),
      max_distance_km: whole(t.wholeNumber),
    })
    .superRefine((v, ctx) => {
      for (const [lo, hi] of [
        ['budget_min', 'budget_max'],
        ['bedrooms_min', 'bedrooms_max'],
        ['area_min', 'area_max'],
      ] as const) {
        const a = num(v[lo]);
        const b = num(v[hi]);
        if (a !== null && b !== null && b < a) ctx.addIssue({ code: 'custom', path: [hi], message: t.range });
      }
    });
}

function UseLocation({ locale }: { locale: Locale }) {
  const t = T[locale];
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const send = useMutation({
    mutationFn: (c: { latitude: number; longitude: number }) => call(api.PUT('/api/v1/users/location', { body: c })),
    onSuccess: () => setMsg({ ok: true, text: t.locSaved }),
    onError: (e) => setMsg({ ok: false, text: describeError(e, locale).body }),
  });
  const [locating, setLocating] = useState(false);
  const go = () => {
    setMsg(null);
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setLocating(false);
        send.mutate({ latitude: p.coords.latitude, longitude: p.coords.longitude });
      },
      () => {
        setLocating(false);
        setMsg({ ok: false, text: t.locDenied });
      },
      { timeout: 15_000 },
    );
  };
  return (
    <section className="acct-card sheet content-start" aria-labelledby="acct-loc-h">
      <Head id="acct-loc-h" title={t.locHead} lead={t.locBody} />
      <button type="button" className="btn justify-self-start" disabled={locating || send.isPending} onClick={go}>
        <Icon name="locate" size={18} />
        {locating || send.isPending ? t.locSaving : t.locButton}
      </button>
      <p role="status" className={msg && !msg.ok ? 'field-error' : 'field-hint'}>
        {msg?.text}
      </p>
    </section>
  );
}

export function Preferences({ locale }: { locale: Locale }) {
  const t = T[locale];
  const profile = useAuthStore((s) => s.profile);
  const profileError = useAuthStore((s) => s.profileError);
  const schema = useMemo(() => prefSchema(T[locale]), [locale]);
  const form = useForm<PrefValues>({ resolver: zodResolver(schema), values: prefsToValues(profile?.preferences) });
  const save = useMutation({
    mutationFn: (v: PrefValues) => call(api.PUT('/api/v1/users/preferences', { body: valuesToPatch(v) })),
    onSuccess: async () => {
      await refreshProfile();
      toast(t.saved, 'success');
    },
    onError: (e) => {
      if (!applyFieldErrors(e, form).length) form.setError('root', { message: describeError(e, locale).body });
    },
  });
  if (!profile && profileError) return <Gate error={profileError} locale={locale} retry={() => void refreshProfile()} />;
  if (!profile) return <FormSkeleton />;
  const err = form.formState.errors;
  const pair = (lo: ScalarKey, hi: ScalarKey, labels: [string, string], mode: 'numeric') => (
    <div className="grid gap-4 sm:grid-cols-2">
      <TextField label={labels[0]} inputMode={mode} autoComplete="off" error={err[lo]?.message as string | undefined} {...form.register(lo)} />
      <TextField label={labels[1]} inputMode={mode} autoComplete="off" error={err[hi]?.message as string | undefined} {...form.register(hi)} />
    </div>
  );
  return (
    <div className="acct-tab-grid">
      <section className="acct-card sheet" aria-labelledby="acct-p-h">
        <Head id="acct-p-h" title={t.pHead} lead={t.pLead} />
        <form
          className="grid max-w-lg gap-5"
          noValidate
          onSubmit={form.handleSubmit((v) => {
            form.clearErrors('root');
            save.mutate(v);
          })}
        >
          <SelectField label={t.purpose} error={err.purpose?.message} {...form.register('purpose')}>
            <option value="">{t.any}</option>
            {Object.entries(t.purposes).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </SelectField>
          <fieldset className="grid gap-1">
            <legend className="field-label">{t.types}</legend>
            <div className="grid gap-x-4 sm:grid-cols-2">
              {PROPERTY_TYPES.map((p) => (
                <Check key={p} label={typeLabel(p, locale)} value={p} {...form.register('property_type')} />
              ))}
            </div>
            {err.property_type ? <p className="field-error">{err.property_type.message}</p> : null}
          </fieldset>
          <fieldset className="grid gap-3">
            <legend className="field-label">{t.budget}</legend>
            {pair('budget_min', 'budget_max', [t.budgetMin, t.budgetMax], 'numeric')}
          </fieldset>
          <fieldset className="grid gap-3">
            <legend className="field-label">{t.beds}</legend>
            {pair('bedrooms_min', 'bedrooms_max', [t.bedsMin, t.bedsMax], 'numeric')}
          </fieldset>
          <fieldset className="grid gap-3">
            <legend className="field-label">{t.area}</legend>
            {pair('area_min', 'area_max', [t.areaMin, t.areaMax], 'numeric')}
          </fieldset>
          <TextField label={t.places} hint={t.placesHint} autoComplete="off" error={err.location_preference?.message} {...form.register('location_preference')} />
          <TextField label={t.distance} inputMode="numeric" autoComplete="off" error={err.max_distance_km?.message} {...form.register('max_distance_km')} />
          <RootError message={err.root?.message} />
          <button type="submit" className="btn btn-primary justify-self-start" disabled={save.isPending}>
            {save.isPending ? t.saving : t.save}
          </button>
        </form>
      </section>
      <UseLocation locale={locale} />
    </div>
  );
}

/* --------------------------- Saved auction alerts --------------------------- */

type AlertPages = { pages: { items: Alert[] }[]; pageParams: unknown[] };

const AUCTION_TYPE: Record<Locale, Record<string, string>> = {
  en: { residential: 'Residential', commercial: 'Commercial', industrial: 'Industrial', plot: 'Plot' },
  hi: { residential: 'रिहायशी', commercial: 'कमर्शियल', industrial: 'औद्योगिक', plot: 'प्लॉट' },
};

function AlertRow({ a, locale, confirming, setConfirming, onDelete }: { a: Alert; locale: Locale; confirming: boolean; setConfirming: (id: number | null) => void; onDelete: () => void }) {
  const t = T[locale];
  const yes = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (confirming) yes.current?.focus();
  }, [confirming]);
  const { title, detail } = alertParts(a, (v) => AUCTION_TYPE[locale][v] ?? v, (n) => compactPrice(n, locale), t.aAny, t.aKeyword);
  const day = (iso: string) => formatDate(iso, locale, { day: 'numeric', month: 'short', year: 'numeric' });
  return (
    <li className="grid gap-3 border-b border-ink-100 py-4 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="grid gap-1">
        <p className="font-bold">
          {title}
          {a.is_active ? null : <span className="ms-2 text-sm font-normal text-ink-600">({t.aPaused})</span>}
        </p>
        {detail ? <p className="text-sm text-ink-800">{detail}</p> : null}
        <p className="text-sm text-ink-600">
          {t.aCreated(day(a.created_at))}
          {a.last_notified_at ? ` · ${t.aNotified(day(a.last_notified_at))}` : ''}
        </p>
      </div>
      {confirming ? (
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t.aConfirm}>
          <span className="basis-full font-bold">{t.aConfirm}</span>
          <button ref={yes} type="button" className="btn btn-primary" onClick={onDelete}>
            {t.aConfirmYes}
          </button>
          <button type="button" className="btn" onClick={() => setConfirming(null)}>
            {t.aKeep}
          </button>
        </div>
      ) : (
        <button type="button" className="btn justify-self-start" aria-label={t.aDeleteFor(title)} onClick={() => setConfirming(a.id)}>
          <Icon name="trash" size={18} />
          {t.aDelete}
        </button>
      )}
    </li>
  );
}

export function SavedAlerts({ locale }: { locale: Locale }) {
  const t = T[locale];
  const qc = useQueryClient();
  const [confirming, setConfirming] = useState<number | null>(null);
  const q = useCursorQuery({
    key: ['auction-alerts'],
    fetch: (cursor) => call(api.GET('/api/v1/data-hub/auctions/alerts/me', { params: { query: { limit: 20, ...(cursor ? { cursor } : {}) } } })),
  });
  const drop = (id: number) => (old: AlertPages | undefined) => (old ? { ...old, pages: old.pages.map((p) => ({ ...p, items: p.items.filter((x) => x.id !== id) })) } : old);
  const remove = useMutation({
    mutationFn: (id: number) => call(api.DELETE('/api/v1/data-hub/auctions/alerts/{alert_id}', { params: { path: { alert_id: id } } })),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['auction-alerts'] });
      const prev = qc.getQueryData(['auction-alerts']);
      qc.setQueryData(['auction-alerts'], drop(id));
      setConfirming(null);
      return { prev };
    },
    onError: (e, _id, ctx) => {
      // Already gone: the list is right as it is.
      if (e instanceof ApiError && e.kind === 'not_found') return;
      if (ctx?.prev) qc.setQueryData(['auction-alerts'], ctx.prev);
      toast(describeError(e, locale).body, 'error');
    },
    onSuccess: () => toast(t.aDeleted, 'success'),
  });
  if (q.isPending) return <FormSkeleton />;
  if (q.isError) return <Gate error={q.error} locale={locale} retry={() => void q.refetch()} />;
  const items = q.data.pages.flatMap((p) => p.items);
  if (!items.length) return <AcctState name="listings" title={t.aEmptyTitle} body={t.aEmptyBody} action={{ label: t.aEmptyAction, href: localizePath('/bank-auctions', locale) }} />;
  return (
    <section className="acct-card sheet max-w-3xl" aria-labelledby="acct-a-h">
      <Head id="acct-a-h" title={t.aHead} lead={t.aLead} />
      <ul aria-labelledby="acct-a-h">
        {items.map((a) => (
          <AlertRow key={a.id} a={a} locale={locale} confirming={confirming === a.id} setConfirming={setConfirming} onDelete={() => remove.mutate(a.id)} />
        ))}
      </ul>
      {q.hasNextPage ? (
        <div className="mt-4 flex justify-center">
          <button type="button" className="btn" disabled={q.isFetchingNextPage} onClick={() => void q.fetchNextPage()}>
            {t.aMore}
          </button>
        </div>
      ) : null}
    </section>
  );
}
