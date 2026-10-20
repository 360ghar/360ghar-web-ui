/**
 * Talk to the listing's agent and book a visit. WhatsApp and call are plain
 * links (the owner's number is never shown: the agent, or the 360 Ghar team,
 * answers). A callback request goes to POST /api/v1/leads and needs no sign-in.
 * Booking a visit needs a signed-in user (POST /api/v1/visits). From 64rem the
 * visit form sits in the side rail; on phones it opens in a bottom sheet.
 */
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { useAuthStore } from '@/features/auth/store';
import { useAuth } from '@/features/auth/useAuth';
import { api, call } from '@/lib/api/client';
import { ApiError, applyFieldErrors, describeError } from '@/lib/api/errors';
import type { Property } from '@/lib/api/types';
import { formatDate } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import type { Locale } from '@/lib/i18n/locale';
import { localizePath } from '@/lib/i18n/locale';
import { loginHref } from '@/features/auth/flows';
import { MOBILE_RE, normalizeMobile } from '@/lib/phone';
import { QueryProvider } from '@/lib/query';
import { Icon } from '@/ui/icons/Icon';
import { SelectField, TextAreaField, TextField } from '@/ui/react/Field';
import { IslandBoundary } from '@/ui/react/IslandBoundary';
import { useIsClient } from '@/ui/react/useClient';
import { Sheet } from '@/ui/react/Sheet';
import { type Contact, phoneLabel, waLink } from './contact';
import { SLOTS, isoDay, slotLabel, slotOpen } from './slots';
import { VISIT_WINDOW_DAYS, visitDayFromParam } from './visitDay';

type Props = {
  locale: Locale;
  property: Pick<Property, 'id' | 'title'>;
  contact: Contact;
  available: boolean;
};

const T = {
  en: {
    contactLabel: 'Your 360 Ghar contact',
    team: '360 Ghar team',
    whatsapp: 'WhatsApp',
    call: 'Call',
    visitTitle: 'Book a visit',
    visitLead: 'Pick a day and a time for your visit request.',
    day: 'Day',
    today: 'Today',
    tomorrow: 'Tomorrow',
    time: 'Time',
    notes: 'Notes for the owner',
    addNote: 'Add a note',
    optional: '(optional)',
    book: 'Request this visit',
    booking: 'Sending…',
    signIn: 'Sign in to book a visit',
    booked: (when: string) => `Visit requested for ${when}. You can see it in your visits.`,
    seeVisits: 'See my visits',
    callback: 'Request a callback',
    cbTitle: 'Request a callback',
    cbLead: 'Leave your number and a note about this home.',
    phone: 'Your mobile number',
    note: 'Your note',
    send: 'Send request',
    sending: 'Sending…',
    cbDone: 'Thanks, we have your request.',
    already: (when: string) => `You have a visit on ${when}.`,
    errDate: 'Pick a day.',
    errTime: 'Pick a time in the future.',
    errPhone: 'Enter a 10-digit mobile number that starts with 6, 7, 8 or 9.',
    close: 'Close',
    gone: 'This home is no longer available.',
    seeSimilar: 'See similar homes',
  },
  hi: {
    contactLabel: 'आपका 360 Ghar संपर्क',
    team: '360 Ghar टीम',
    whatsapp: 'WhatsApp',
    call: 'कॉल करें',
    visitTitle: 'विज़िट बुक करें',
    visitLead: 'अपने विज़िट अनुरोध के लिए दिन और समय चुनें।',
    day: 'दिन',
    today: 'आज',
    tomorrow: 'कल',
    time: 'समय',
    notes: 'मालिक के लिए नोट',
    addNote: 'नोट जोड़ें',
    optional: '(वैकल्पिक)',
    book: 'यह विज़िट बुक करें',
    booking: 'भेज रहे हैं…',
    signIn: 'विज़िट बुक करने के लिए साइन इन करें',
    booked: (when: string) => `${when} के लिए विज़िट का अनुरोध भेज दिया। आप इसे अपनी विज़िट में देख सकते हैं।`,
    seeVisits: 'मेरी विज़िट देखें',
    callback: 'कॉलबैक का अनुरोध करें',
    cbTitle: 'कॉलबैक का अनुरोध करें',
    cbLead: 'इस घर के बारे में अपना नंबर और एक नोट छोड़ें।',
    phone: 'आपका मोबाइल नंबर',
    note: 'आपका नोट',
    send: 'अनुरोध भेजें',
    sending: 'भेज रहे हैं…',
    cbDone: 'धन्यवाद, हमें आपका अनुरोध मिल गया।',
    already: (when: string) => `आपकी विज़िट ${when} को है।`,
    errDate: 'एक दिन चुनें।',
    errTime: 'आगे का समय चुनें।',
    errPhone: '6, 7, 8 या 9 से शुरू होने वाला 10 अंकों का नंबर डालें।',
    close: 'बंद करें',
    gone: 'यह घर अब उपलब्ध नहीं है।',
    seeSimilar: 'ऐसे ही और घर देखें',
  },
};

const today = () => isoDay(new Date());

/** The next `n` days from today, for the day buttons: "Today", "Tomorrow", then "Sat" / "4 Oct". */
function nextDays(n: number, locale: Locale) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return { iso: isoDay(d), top: i === 0 ? T[locale].today : i === 1 ? T[locale].tomorrow : formatDate(d, locale, { weekday: 'short' }), bottom: formatDate(d, locale, { day: 'numeric', month: 'short' }) };
  });
}

function whenLabel(iso: string, locale: Locale) {
  return formatDate(iso, locale, { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
}

function goSignIn(locale: Locale) {
  window.location.assign(loginHref(locale));
}

const DESKTOP = '(min-width: 64rem)';

/** True from 64rem. The server render and hydration say true, so the form is in the page HTML without JavaScript. */
function useDesktop(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(DESKTOP);
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    },
    () => window.matchMedia(DESKTOP).matches,
    () => true,
  );
}

function VisitForm({ locale, propertyId, onBooked }: { locale: Locale; propertyId: number; onBooked: () => void }) {
  const t = T[locale];
  const status = useAuthStore((s) => s.status);
  const isClient = useIsClient();
  const [done, setDone] = useState<string | null>(null);

  const schema = z
    .object({ date: z.string().min(1, t.errDate), time: z.string().min(1, t.errTime), notes: z.string().max(500).optional() })
    .refine((v) => v.date >= today(), { path: ['date'], message: t.errDate })
    .refine((v) => new Date(`${v.date}T${v.time}`) > new Date(), { path: ['time'], message: t.errTime });

  const visit = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { date: '', time: '11:00', notes: '' } });
  const day = useWatch({ control: visit.control, name: 'date' });
  const days = isClient ? nextDays(VISIT_WINDOW_DAYS, locale) : null;

  // `?visit_date=YYYY-MM-DD` (from the WebMCP tool) preselects that day. Read after hydration, so the first render
  // matches the server HTML. Invalid or out-of-window values are ignored. The form is never submitted from here.
  const preselected = useRef(false);
  useEffect(() => {
    if (preselected.current) return;
    preselected.current = true;
    const wanted = visitDayFromParam(new URLSearchParams(window.location.search).get('visit_date'));
    if (!wanted) return;
    visit.setValue('date', wanted);
    if (!slotOpen(wanted, visit.getValues('time'))) visit.setValue('time', SLOTS.find((x) => slotOpen(wanted, x)) ?? SLOTS[0]!);
  }, [visit]);

  const onVisit = visit.handleSubmit(async (v) => {
    if (status !== 'authed') return goSignIn(locale);
    const at = new Date(`${v.date}T${v.time}`);
    try {
      await call(api.POST('/api/v1/visits', { body: { property_id: propertyId, scheduled_date: at.toISOString(), special_requirements: v.notes || null } }));
      haptic('success');
      setDone(whenLabel(at.toISOString(), locale));
      onBooked();
    } catch (error) {
      if (error instanceof ApiError && error.kind === 'unauthorized') return goSignIn(locale);
      if (error instanceof ApiError && error.fields.scheduled_date) visit.setError('date', { message: error.fields.scheduled_date });
      else visit.setError('root', { message: describeError(error, locale).body });
    }
  });

  if (done)
    return (
      <div className="contact-done" role="status">
        <Icon name="check" size={18} />
        <p>{t.booked(done)}</p>
        <a className="link" href={localizePath('/account?tab=visits', locale)}>
          {t.seeVisits}
        </a>
      </div>
    );

  return (
    <form className="contact-form grid gap-3" onSubmit={onVisit} noValidate>
      <fieldset className="contact-days">
        <legend className="field-label">{t.day}</legend>
        {/* Dates depend on the visitor's clock, so the buttons appear after hydration; the boxes keep their place. */}
        <div className="contact-day-row">
          {days
            ? days.map((d) => (
                <button
                  key={d.iso}
                  type="button"
                  className="toggle contact-day"
                  aria-pressed={day === d.iso}
                  onClick={() => {
                    visit.setValue('date', d.iso, { shouldValidate: visit.formState.isSubmitted });
                    if (!slotOpen(d.iso, visit.getValues('time'))) visit.setValue('time', SLOTS.find((x) => slotOpen(d.iso, x)) ?? SLOTS[0]!);
                  }}
                >
                  <span>{d.top}</span>
                  <small>{d.bottom}</small>
                </button>
              ))
            : Array.from({ length: 4 }, (_, i) => <span key={i} className="skeleton contact-day" aria-hidden="true" />)}
        </div>
        {visit.formState.errors.date ? (
          <p className="field-error" role="alert">
            <Icon name="alert" size={16} />
            {visit.formState.errors.date.message}
          </p>
        ) : null}
      </fieldset>
      <SelectField label={t.time} defaultValue="11:00" error={visit.formState.errors.time?.message} {...visit.register('time')}>
        {SLOTS.map((s) => (
          <option key={s} value={s} disabled={isClient && Boolean(day) && !slotOpen(day, s)}>
            {slotLabel(s, locale)}
          </option>
        ))}
      </SelectField>
      <details className="contact-more">
        <summary>{t.addNote}</summary>
        <TextAreaField label={t.notes} optional={t.optional} rows={2} maxLength={500} {...visit.register('notes')} className="min-h-[4.5rem]" />
      </details>
      {visit.formState.errors.root ? (
        <p className="field-error" role="alert">
          <Icon name="alert" size={16} />
          {visit.formState.errors.root.message}
        </p>
      ) : null}
      <button
        type={status === 'anon' ? 'button' : 'submit'}
        onClick={status === 'anon' ? () => goSignIn(locale) : undefined}
        className="btn btn-primary btn-block"
        disabled={visit.formState.isSubmitting}
      >
        <Icon name="calendar" size={18} />
        {visit.formState.isSubmitting ? t.booking : status === 'authed' || status === 'unknown' ? t.book : t.signIn}
      </button>
    </form>
  );
}

function CallbackForm({ locale, propertyId }: { locale: Locale; propertyId: number }) {
  const t = T[locale];
  const [sent, setSent] = useState(false);
  const schema = z.object({
    phone: z.string().transform((v) => normalizeMobile(v) || v.trim()).pipe(z.string().regex(MOBILE_RE, t.errPhone)),
    note: z.string().max(500).optional(),
    website: z.string().optional(),
  });
  const form = useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { phone: '', note: '', website: '' } });

  const onSend = form.handleSubmit(async (v) => {
    try {
      await call(api.POST('/api/v1/leads', { body: { property_id: propertyId, phone: v.phone, note: v.note || null, website: v.website || null } }));
      haptic('success');
      setSent(true);
    } catch (error) {
      // A 422 names the field (phone, note); a 429 or any other failure shows the message.
      if (!applyFieldErrors(error, form).length) form.setError('root', { message: describeError(error, locale).body });
    }
  });

  if (sent)
    return (
      <p className="contact-done" role="status">
        <Icon name="check" size={18} /> {t.cbDone}
      </p>
    );

  return (
    <form className="grid gap-4" onSubmit={onSend} noValidate>
      <p className="contact-lead">{t.cbLead}</p>
      <TextField label={t.phone} inputMode="numeric" autoComplete="tel-national" maxLength={16} error={form.formState.errors.phone?.message} {...form.register('phone')} />
      <TextAreaField label={t.note} optional={t.optional} rows={2} maxLength={500} {...form.register('note')} />
      {/* Honeypot: people never see or fill it. */}
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="contact-hp" {...form.register('website')} />
      {form.formState.errors.root ? (
        <p className="field-error" role="alert">
          <Icon name="alert" size={16} />
          {form.formState.errors.root.message}
        </p>
      ) : null}
      <button type="submit" className="btn btn-primary" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? t.sending : t.send}
      </button>
    </form>
  );
}

function Panel({ locale, property, contact, available }: Props) {
  const t = T[locale];
  const status = useAuth((s) => s.status);
  const desktop = useDesktop();
  const [cb, setCb] = useState(false);
  const [book, setBook] = useState(false);
  // Browser-only values are read after hydration, so the first render matches the server HTML.
  const isClient = useIsClient();
  const pageUrl = isClient ? window.location.href.split('?')[0] ?? '' : '';


  // On phones, any "Book a visit" link on the page opens the sheet instead of jumping to the rail.
  useEffect(() => {
    if (desktop) return;
    const onClick = (e: MouseEvent) => {
      if (!(e.target instanceof Element) || !e.target.closest('[data-open-visit]')) return;
      e.preventDefault();
      setBook(true);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [desktop]);

  // Signed-in users see their existing visit (the SSR page is anonymous and cached).
  const mine = useQuery({
    queryKey: ['property-me', property.id],
    queryFn: () => call(api.GET('/api/v1/properties/{property_id}', { params: { path: { property_id: property.id } } })),
    enabled: status === 'authed' && available,
    staleTime: 60_000,
  });
  const next = mine.data?.user_next_visit_date;

  if (!available)
    return (
      <div className="contact">
        <p className="contact-note">
          <Icon name="alert" size={16} /> {t.gone}
        </p>
        <a className="btn btn-primary btn-block" href="#prop-similar">
          {t.seeSimilar}
        </a>
      </div>
    );

  return (
    <div className="contact">
      <p className="contact-owner">
        <Icon name="user" size={20} />
        <span>
          <span className="contact-owner-label">{t.contactLabel}</span>
          <strong>{contact.name ?? t.team}</strong>
        </span>
      </p>

      <div className="grid gap-2">
        <a className="btn btn-ink btn-block" href={waLink(contact.phone, property.title, pageUrl, locale)} target="_blank" rel="noopener">
          <Icon name="brand:whatsapp" size={18} />
          {t.whatsapp}
        </a>
        <a className="btn btn-block tabular" href={`tel:${contact.phone}`}>
          <Icon name="phone" size={18} />
          {t.call} {phoneLabel(contact.phone)}
        </a>
        <button type="button" className="btn btn-quiet btn-block" onClick={() => setCb(true)}>
          {t.callback}
        </button>
      </div>

      <div className="contact-visit">
        <h2 className="font-display text-xl">{t.visitTitle}</h2>
        <p className="contact-lead">{t.visitLead}</p>
      </div>
      {next ? (
        <p className="contact-note">
          <Icon name="calendar" size={16} /> {t.already(whenLabel(next, locale))}
        </p>
      ) : null}
      {desktop ? (
        <VisitForm locale={locale} propertyId={property.id} onBooked={() => void mine.refetch()} />
      ) : (
        <>
          <button type="button" className="btn btn-primary btn-block" onClick={() => setBook(true)}>
            <Icon name="calendar" size={18} />
            {t.visitTitle}
          </button>
          <Sheet open={book} onClose={() => setBook(false)} title={t.visitTitle} closeLabel={t.close}>
            <VisitForm locale={locale} propertyId={property.id} onBooked={() => void mine.refetch()} />
          </Sheet>
        </>
      )}

      <Sheet open={cb} onClose={() => setCb(false)} title={t.cbTitle} variant="dialog" closeLabel={t.close}>
        <CallbackForm locale={locale} propertyId={property.id} />
      </Sheet>
    </div>
  );
}

export default function ContactPanel(props: Props) {
  return (
    <QueryProvider>
      <IslandBoundary locale={props.locale} compact>
        <Panel {...props} />
      </IslandBoundary>
    </QueryProvider>
  );
}
