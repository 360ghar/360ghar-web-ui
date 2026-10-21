/**
 * Account area (client only; needs a session). Tabs: overview, saved homes,
 * visits, my listings, profile, preferences, notifications, auction alerts, security. Old ?tab= values still work.
 * Fixes from the old site: edit and delete on listings work; visits have their
 * own list with cancel and reschedule; profile saves only the fields the
 * backend accepts; lists load every page.
 */
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { dobProblem, loginHref, passwordProblems } from '@/features/auth/flows';
import { refreshProfile, signOut, useAuthStore } from '@/features/auth/store';
import { useAuth } from '@/features/auth/useAuth';
import { supabase } from '@/features/auth/supabase';
import FavouriteButton from '@/features/favourites/FavouriteButton';
import { useFavourites } from '@/features/favourites/store';
import { PropertyCardSkeleton, PropertyCardView } from '@/features/property/PropertyCardView';
import { COMPARE_MAX, compareHref, toggleCompare, useCompareStore } from '@/features/search/compare';
import { api, call, multipart, timeoutMs, UPLOAD_TIMEOUT_MS } from '@/lib/api/client';
import { ApiError, describeError } from '@/lib/api/errors';
import type { components } from '@/lib/api/schema';
import type { ItemOf, PageShape, Property, PropertyPage } from '@/lib/api/types';
import { COMPANY_EMAIL } from '@/lib/company';
import { areaSqft, bhkLabel, formatDate, homeKind, imageUrl, intlLocale, listingPrice, placeLine, srcSet, typeLabel } from '@/lib/format';
import type { Locale } from '@/lib/i18n/locale';
import { localizePath } from '@/lib/i18n/locale';
import { useCursorQuery } from '@/lib/infinite';
import { QueryProvider } from '@/lib/query';
import { Icon } from '@/ui/icons/Icon';
import { Delayed, Skeleton } from '@/ui/react/Delayed';
import { Segmented } from '@/ui/react/Segmented';
import { Check, SelectField, TextField } from '@/ui/react/Field';
import { IslandBoundary } from '@/ui/react/IslandBoundary';
import { Sheet } from '@/ui/react/Sheet';
import { Tabs } from '@/ui/react/Tabs';
import { toast, Toaster } from '@/ui/react/Toaster';
import { StateBlock } from '@/ui/states/StateBlock';
import { AcctState, NoPhoto, Vignette } from './AccountArt';
import { Notifications, Preferences, SavedAlerts } from './Settings';
import { visitIcs } from './ics';

type Visit = components['schemas']['Visit'];
type TabId = 'overview' | 'favorites' | 'visits' | 'listings' | 'profile' | 'preferences' | 'notifications' | 'alerts' | 'security';

const ALIASES: Record<string, TabId> = {
  home: 'overview',
  overview: 'overview',
  favorites: 'favorites',
  favourites: 'favorites',
  fav: 'favorites',
  visits: 'visits',
  'my-properties': 'listings',
  properties: 'listings',
  listings: 'listings',
  profile: 'profile',
  details: 'profile',
  'account-details': 'profile',
  address: 'profile',
  preferences: 'preferences',
  'search-preferences': 'preferences',
  notifications: 'notifications',
  'notification-settings': 'notifications',
  alerts: 'alerts',
  'auction-alerts': 'alerts',
  'change-password': 'security',
  password: 'security',
  security: 'security',
};

const T = {
  en: {
    title: 'Your account',
    hello: (n: string) => `Hello, ${n}`,
    tabs: {
      overview: 'Overview',
      favorites: 'Saved homes',
      visits: 'Visits',
      listings: 'My listings',
      profile: 'Profile',
      preferences: 'Preferences',
      notifications: 'Notifications',
      alerts: 'Auction alerts',
      security: 'Security',
    },
    signInTitle: 'Sign in to see your account',
    signInBody: 'Your saved homes, visits and listings are here after you sign in.',
    signIn: 'Sign in',
    saved: 'Saved homes',
    upcoming: 'Upcoming visits',
    listings: 'Your listings',
    missing: 'Your profile is missing:',
    fields: {
      full_name: 'full name',
      date_of_birth: 'date of birth',
      phone: 'mobile number',
      email: 'email',
    } as Record<string, string>,
    complete: 'Complete your profile',
    noSaved: 'No saved homes yet',
    noSavedBody: 'Tap the heart on any home to keep it here.',
    browse: 'Browse homes',
    upcomingTab: 'Upcoming',
    pastTab: 'Past',
    noVisits: 'No visits here',
    noVisitsBody: 'Book a visit from any home page. It shows up here.',
    cancel: 'Cancel visit',
    reschedule: 'Change time',
    cancelTitle: 'Cancel this visit?',
    reason: 'Reason',
    reasons: ['My plans changed', 'I found another home', 'The time does not work', 'Other'],
    keep: 'Keep the visit',
    confirmCancel: 'Cancel the visit',
    cancelled: 'Visit cancelled.',
    newTime: 'New date and time',
    save: 'Save',
    saving: 'Saving…',
    rescheduled: 'Visit moved.',
    status: {
      requested: 'Requested',
      confirmed: 'Confirmed',
      completed: 'Done',
      cancelled: 'Cancelled',
      reschedule_suggested: 'New time suggested',
    } as Record<string, string>,
    noListings: 'You have not listed a home yet',
    noListingsBody: 'List your home free. We photograph it in 360° and verify it.',
    post: 'Post a property',
    edit: 'Edit',
    remove: 'Remove',
    removeTitle: 'Remove this listing?',
    removeBody: 'It goes offline now. You can post it again later.',
    keepIt: 'Keep it',
    removed: 'Listing removed.',
    fullName: 'Full name',
    dob: 'Date of birth',
    email: 'Email',
    phone: 'Mobile number',
    verified: 'Verified',
    notVerified: 'Not verified',
    addPhone: 'Add a mobile number',
    contactChange: `To change your email or number, contact ${COMPANY_EMAIL}.`,
    photo: 'Profile photo',
    upload: 'Upload a photo',
    uploaded: 'Photo updated.',
    profileSaved: 'Profile saved.',
    current: 'Current password',
    newPw: 'New password',
    confirm: 'Confirm new password',
    pwRule: 'At least 8 characters, with one capital letter and one number.',
    mismatch: 'The passwords do not match.',
    wrong: 'The current password is wrong.',
    pwSaved: 'Password changed.',
    noPassword: 'Signed up with a code or Google? Set a password with the reset flow.',
    setViaReset: 'Set a password',
    signOut: 'Sign out',
    deleteAccount: 'Delete my account',
    loadMore: 'Load more',
    young: 'You must be 18 or older.',
    old: 'Check the year.',
    required: 'Enter your date of birth.',
    nameRule: 'Enter your full name (2 letters or more).',
    create: 'Create an account',
    nextVisit: 'Next visit',
    visitsBooked: (n: number) => `${n} booked`,
    noNextVisit: 'No visit booked',
    noNextVisitBody: 'See a home in person. Book a visit from its page.',
    findHome: 'Find a home to visit',
    savedCount: (n: number) => (n === 1 ? '1 home' : `${n} homes`),
    noSavedShort: 'Tap the heart on a home to keep it here.',
    listingsCount: (n: number) => (n === 1 ? '1 listing' : `${n} listings`),
    noListingsShort: 'List your home free. We photograph it in 360° and verify it.',
    seeAll: 'See all',
    inReview: 'In review',
    listingStatus: {
      available: 'Available',
      sold: 'Sold',
      rented: 'Rented',
      under_offer: 'Under offer',
      maintenance: 'Paused',
    } as Record<string, string>,
    views: (n: number) => (n === 1 ? '1 view' : `${n} views`),
    saves: (n: number) => (n === 1 ? '1 save' : `${n} saves`),
    addPhotos: 'Add photos',
    noPhoto: 'No photo yet',
    directions: 'Get directions',
    addCal: 'Add to calendar',
    pickLabel: 'Compare',
    pickHint: `Tick 2 to ${COMPARE_MAX} homes to compare them side by side.`,
    picked: (n: number) => `${n} of ${COMPARE_MAX} picked.`,
    pickFull: `That is the most you can compare at once.`,
    compareN: (n: number) => (n === 0 ? 'Compare homes' : n === 1 ? 'Compare 1 home' : `Compare ${n} homes`),
    newTab: '(opens in a new tab)',
    manager: (n: string) => `Your relationship manager: ${n}`,
    call: 'Call',
    agentHead: 'Your relationship manager',
    agentNone: 'No relationship manager is assigned to you yet.',
    agentFail: 'We could not load your relationship manager. Try again later.',
    agentLangs: (l: string) => `Speaks ${l}`,
    stillMissing: 'To finish your profile, add:',
    profileDone: 'Your profile has every detail we ask for.',
    photoNone: 'No profile photo yet.',
    detailsHead: 'Your details',
    passwordHead: 'Password',
    sessionHead: 'This device',
    sessionBody: 'Sign out here when you use a shared phone or computer.',
    deleteHead: 'Delete account',
    deleteBody: 'This removes your profile, saved homes, visits and listings.',
  },
  hi: {
    title: 'आपका अकाउंट',
    hello: (n: string) => `नमस्ते, ${n}`,
    tabs: {
      overview: 'सारांश',
      favorites: 'सेव किए घर',
      visits: 'विज़िट',
      listings: 'मेरी लिस्टिंग',
      profile: 'प्रोफ़ाइल',
      preferences: 'पसंद',
      notifications: 'नोटिफ़िकेशन',
      alerts: 'नीलामी अलर्ट',
      security: 'सुरक्षा',
    },
    signInTitle: 'अकाउंट देखने के लिए साइन इन करें',
    signInBody: 'साइन इन के बाद आपके सेव किए घर, विज़िट और लिस्टिंग यहाँ दिखेंगे।',
    signIn: 'साइन इन',
    saved: 'सेव किए घर',
    upcoming: 'आने वाली विज़िट',
    listings: 'आपकी लिस्टिंग',
    missing: 'आपकी प्रोफ़ाइल में यह नहीं है:',
    fields: {
      full_name: 'पूरा नाम',
      date_of_birth: 'जन्मतिथि',
      phone: 'मोबाइल नंबर',
      email: 'ईमेल',
    } as Record<string, string>,
    complete: 'प्रोफ़ाइल पूरी करें',
    noSaved: 'अभी कोई घर सेव नहीं है',
    noSavedBody: 'किसी भी घर पर दिल का निशान दबाएँ, वह यहाँ आ जाएगा।',
    browse: 'घर देखें',
    upcomingTab: 'आने वाली',
    pastTab: 'पुरानी',
    noVisits: 'यहाँ कोई विज़िट नहीं',
    noVisitsBody: 'किसी भी घर के पेज से विज़िट बुक करें। वह यहाँ दिखेगी।',
    cancel: 'विज़िट रद्द करें',
    reschedule: 'समय बदलें',
    cancelTitle: 'यह विज़िट रद्द करें?',
    reason: 'वजह',
    reasons: ['मेरी योजना बदल गई', 'मुझे दूसरा घर मिल गया', 'समय ठीक नहीं है', 'अन्य'],
    keep: 'विज़िट रखें',
    confirmCancel: 'विज़िट रद्द करें',
    cancelled: 'विज़िट रद्द हो गई।',
    newTime: 'नई तारीख और समय',
    save: 'सेव करें',
    saving: 'सेव हो रहा है…',
    rescheduled: 'विज़िट का समय बदल गया।',
    status: {
      requested: 'अनुरोध भेजा',
      confirmed: 'पक्की',
      completed: 'हो गई',
      cancelled: 'रद्द',
      reschedule_suggested: 'नया समय सुझाया गया',
    } as Record<string, string>,
    noListings: 'आपने अभी कोई घर लिस्ट नहीं किया',
    noListingsBody: 'अपना घर मुफ़्त लिस्ट करें। हम उसकी 360° फ़ोटो लेते हैं और वेरिफाई करते हैं।',
    post: 'प्रॉपर्टी पोस्ट करें',
    edit: 'बदलें',
    remove: 'हटाएँ',
    removeTitle: 'यह लिस्टिंग हटाएँ?',
    removeBody: 'यह अभी ऑफ़लाइन हो जाएगी। आप इसे बाद में फिर पोस्ट कर सकते हैं।',
    keepIt: 'रहने दें',
    removed: 'लिस्टिंग हटा दी गई।',
    fullName: 'पूरा नाम',
    dob: 'जन्मतिथि',
    email: 'ईमेल',
    phone: 'मोबाइल नंबर',
    verified: 'वेरिफाइड',
    notVerified: 'वेरिफाइड नहीं',
    addPhone: 'मोबाइल नंबर जोड़ें',
    contactChange: `ईमेल या नंबर बदलने के लिए ${COMPANY_EMAIL} पर लिखें।`,
    photo: 'प्रोफ़ाइल फ़ोटो',
    upload: 'फ़ोटो अपलोड करें',
    uploaded: 'फ़ोटो अपडेट हो गई।',
    profileSaved: 'प्रोफ़ाइल सेव हो गई।',
    current: 'मौजूदा पासवर्ड',
    newPw: 'नया पासवर्ड',
    confirm: 'नया पासवर्ड दोबारा',
    pwRule: 'कम से कम 8 अक्षर, एक बड़ा अक्षर और एक अंक।',
    mismatch: 'दोनों पासवर्ड एक जैसे नहीं हैं।',
    wrong: 'मौजूदा पासवर्ड गलत है।',
    pwSaved: 'पासवर्ड बदल गया।',
    noPassword: 'कोड या Google से साइन अप किया? रीसेट से पासवर्ड सेट करें।',
    setViaReset: 'पासवर्ड सेट करें',
    signOut: 'साइन आउट',
    deleteAccount: 'मेरा अकाउंट डिलीट करें',
    loadMore: 'और दिखाएँ',
    young: 'आपकी उम्र 18 साल या ज़्यादा होनी चाहिए।',
    old: 'साल जाँचें।',
    required: 'अपनी जन्मतिथि डालें।',
    nameRule: 'अपना पूरा नाम डालें (कम से कम 2 अक्षर)।',
    create: 'अकाउंट बनाएँ',
    nextVisit: 'अगली विज़िट',
    visitsBooked: (n: number) => `${n} बुक`,
    noNextVisit: 'कोई विज़िट बुक नहीं',
    noNextVisitBody: 'घर खुद जाकर देखें। उसके पेज से विज़िट बुक करें।',
    findHome: 'देखने के लिए घर खोजें',
    savedCount: (n: number) => `${n} घर`,
    noSavedShort: 'किसी घर पर दिल का निशान दबाएँ, वह यहाँ आ जाएगा।',
    listingsCount: (n: number) => `${n} लिस्टिंग`,
    noListingsShort: 'अपना घर मुफ़्त लिस्ट करें। हम उसकी 360° फ़ोटो लेते हैं और वेरिफाई करते हैं।',
    seeAll: 'सब देखें',
    inReview: 'समीक्षा में',
    listingStatus: {
      available: 'उपलब्ध',
      sold: 'बिक गई',
      rented: 'किराये पर दी गई',
      under_offer: 'बातचीत चल रही है',
      maintenance: 'रुकी हुई',
    } as Record<string, string>,
    views: (n: number) => `${n} बार देखी गई`,
    saves: (n: number) => `${n} सेव`,
    addPhotos: 'फ़ोटो जोड़ें',
    noPhoto: 'अभी कोई फ़ोटो नहीं',
    directions: 'रास्ता देखें',
    addCal: 'कैलेंडर में जोड़ें',
    pickLabel: 'तुलना',
    pickHint: `साथ-साथ तुलना के लिए 2 से ${COMPARE_MAX} घर चुनें।`,
    picked: (n: number) => `${COMPARE_MAX} में से ${n} चुने।`,
    pickFull: 'एक बार में इतने ही घरों की तुलना हो सकती है।',
    compareN: (n: number) => (n === 0 ? 'घरों की तुलना करें' : `${n} घरों की तुलना करें`),
    newTab: '(नए टैब में खुलेगा)',
    manager: (n: string) => `आपके रिलेशनशिप मैनेजर: ${n}`,
    call: 'कॉल करें',
    agentHead: 'आपके रिलेशनशिप मैनेजर',
    agentNone: 'अभी आपके लिए कोई रिलेशनशिप मैनेजर तय नहीं है।',
    agentFail: 'आपके रिलेशनशिप मैनेजर की जानकारी नहीं मिल पाई। कुछ देर बाद कोशिश करें।',
    agentLangs: (l: string) => `भाषाएँ: ${l}`,
    stillMissing: 'प्रोफ़ाइल पूरी करने के लिए जोड़ें:',
    profileDone: 'आपकी प्रोफ़ाइल में हमारी माँगी हर जानकारी है।',
    photoNone: 'अभी कोई प्रोफ़ाइल फ़ोटो नहीं।',
    detailsHead: 'आपकी जानकारी',
    passwordHead: 'पासवर्ड',
    sessionHead: 'यह डिवाइस',
    sessionBody: 'शेयर किए गए फ़ोन या कंप्यूटर पर यहाँ से साइन आउट करें।',
    deleteHead: 'अकाउंट डिलीट करें',
    deleteBody: 'इससे आपकी प्रोफ़ाइल, सेव किए घर, विज़िट और लिस्टिंग हट जाएँगी।',
  },
};
type Strings = (typeof T)['en'];

function when(iso: string, locale: Locale) {
  return formatDate(iso, locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** "Tomorrow", "In 3 days", "2 days ago". The island is client only, so "now" is safe here. */
function relDay(iso: string, locale: Locale) {
  const day = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.round((day(new Date(iso)) - day(new Date())) / 86_400_000);
  const s = new Intl.RelativeTimeFormat(intlLocale(locale), {
    numeric: 'auto',
  }).format(diff, 'day');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** The overview cards read a one-row page: the rows, and the total (`include_total`), or the row count when the total is missing. */
const rowsAndTotal = <P extends PageShape>(page: P): { items: ItemOf<P>[]; total: number } => ({ items: page.items as ItemOf<P>[], total: page.total ?? page.items.length });

/** A tear-off calendar leaf: month, day and weekday. The full date is in the text beside it. */
function DateLeaf({ iso, locale, past }: { iso: string; locale: Locale; past?: boolean }) {
  return (
    <span className="acct-leaf soft-lift is-clip" data-depth="1" data-past={past || undefined} aria-hidden="true">
      <span>
        <span className="acct-leaf-m">{formatDate(iso, locale, { month: 'short' })}</span>
        <span className="acct-leaf-d tabular">{formatDate(iso, locale, { day: 'numeric' })}</span>
        <span className="acct-leaf-w">{formatDate(iso, locale, { weekday: 'short' })}</span>
      </span>
    </span>
  );
}

const STATUS_ICON: Partial<Record<Visit['status'], { icon: 'check' | 'clock' | 'calendar' | 'close'; tone: string }>> = {
  confirmed: { icon: 'check', tone: 'text-leaf-700' },
  requested: { icon: 'clock', tone: 'text-haldi-700' },
  reschedule_suggested: { icon: 'calendar', tone: 'text-haldi-700' },
  completed: { icon: 'check', tone: 'text-ink-600' },
  cancelled: { icon: 'close', tone: 'text-ink-600' },
};

/** The visit status. A value this build does not know shows nothing: it is never read as a known one. */
function VisitStatus({ v, t }: { v: Visit; t: Strings }) {
  const m = STATUS_ICON[v.status];
  const label = t.status[v.status];
  if (!m || !label) return null;
  return (
    <p className={`flex items-center gap-1.5 text-sm font-semibold ${m.tone}`}>
      <Icon name={m.icon} size={16} />
      {label}
    </p>
  );
}

/** A real listing photo, or a plain paper placeholder when there is none. */
function Thumb({ p, w, h, className = '' }: { p: Pick<Property, 'id' | 'main_image_url'> | null | undefined; w: number; h: number; className?: string }) {
  if (p?.main_image_url)
    return (
      <img
        className={`acct-thumb ${className}`}
        src={imageUrl(p.main_image_url, w * 2)}
        srcSet={srcSet(p.main_image_url, [w, w * 2])}
        sizes={`${w}px`}
        alt=""
        width={w}
        height={h}
        loading="lazy"
        decoding="async"
      />
    );
  // Same box as the photo, so nothing moves when a photo arrives.
  return <NoPhoto seed={String(p?.id ?? 0)} className={`acct-thumb ${className}`} />;
}

/** "3 BHK Builder floor · 1,650 sq ft · ₹32,000/month", from the listing's own fields. */
function facts(p: Property, locale: Locale): string {
  const price = listingPrice(p, locale);
  const kind = homeKind(p, locale);
  return [kind, areaSqft(p.area_sqft, locale), `${price.amount}${price.period}`].filter(Boolean).join(' · ');
}

/** Google Maps directions to the home. Only when the listing has coordinates. */
function Directions({ p, t }: { p: Property | null | undefined; t: Strings }) {
  if (typeof p?.latitude !== 'number' || typeof p?.longitude !== 'number') return null;
  return (
    <a className="link" href={`https://www.google.com/maps/dir/?api=1&destination=${p.latitude},${p.longitude}`} target="_blank" rel="noopener">
      {t.directions}
      <span className="sr-only"> {t.newTab}</span>
      <Icon name="arrow-up-right" size={16} className="arrow" />
    </a>
  );
}

/**
 * Downloads the visit as a calendar file. The Blob URL is made on click, so
 * nothing is held in memory for rows the user never uses.
 */
function AddToCalendar({ v, t, locale }: { v: Visit; t: Strings; locale: Locale }) {
  const p = v.property;
  return (
    <a
      className="link"
      href="#calendar"
      download={`360ghar-visit-${v.id}.ics`}
      onClick={(e) => {
        const text = visitIcs({
          id: v.id,
          start: v.scheduled_date,
          booked: v.created_at,
          title: p?.title ?? '360Ghar',
          address: p?.full_address || (p ? placeLine(p) : null),
          url: `${window.location.origin}${localizePath(`/property/${v.property_id}`, locale)}`,
        });
        const url = URL.createObjectURL(new Blob([text], { type: 'text/calendar;charset=utf-8' }));
        e.currentTarget.href = url;
        window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      }}
    >
      <Icon name="calendar" size={16} />
      {t.addCal}
    </a>
  );
}

/** The relationship manager on the visit, when the API sends one. */
function Manager({ v, t }: { v: Visit; t: Strings }) {
  const a = v.agents;
  if (!a?.name) return null;
  return (
    <p className="flex flex-wrap items-center gap-x-3 text-sm text-ink-800">
      <span className="inline-flex items-center gap-1.5">
        <Icon name="user" size={16} className="text-kesar-700" />
        {t.manager(a.name)}
      </span>
      {a.phone ? (
        <a className="link" href={`tel:${a.phone}`}>
          <Icon name="phone" size={16} />
          {t.call}
        </a>
      ) : null}
    </p>
  );
}

function Loading() {
  return (
    <Delayed>
      <div className="skeleton-gate grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <PropertyCardSkeleton />
        <PropertyCardSkeleton />
        <PropertyCardSkeleton />
      </div>
    </Delayed>
  );
}

function ErrorView({ error, locale, retry }: { error: unknown; locale: Locale; retry: () => void }) {
  const d = describeError(error, locale);
  return (
    <StateBlock
      compact
      scene={d.kind === 'network' ? 'offline' : 'error'}
      title={d.title}
      body={d.body}
      action={{
        label: locale === 'hi' ? 'दोबारा कोशिश करें' : 'Try again',
        onClick: retry,
      }}
    />
  );
}

function usePaged<P extends PageShape>(key: unknown[], fetcher: (cursor: string | null) => Promise<P>) {
  return useCursorQuery({ key, fetch: fetcher });
}

function MoreButton({
  q,
  t,
}: {
  q: {
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => unknown;
  };
  t: Strings;
}) {
  if (!q.hasNextPage) return null;
  return (
    <div className="mt-6 flex justify-center">
      <button type="button" className="btn" disabled={q.isFetchingNextPage} onClick={() => void q.fetchNextPage()}>
        {t.loadMore}
      </button>
    </div>
  );
}

/* ------------------------------ Tabs ------------------------------ */

function Favourites({ locale, t }: { locale: Locale; t: Strings }) {
  const q = usePaged(
    ['my-favourites'],
    (cursor) =>
      call(
        api.GET('/api/v1/swipes', {
          params: {
            query: { is_liked: true, limit: 12, ...(cursor ? { cursor } : {}) },
          },
        }),
      ),
  );
  const liked = useFavourites((s) => s.liked);
  // Homes ticked for comparison, in the order they were ticked. Shared with search and the property page.
  const compare = useCompareStore();
  if (q.isPending) return <Loading />;
  if (q.isError) return <ErrorView error={q.error} locale={locale} retry={() => void q.refetch()} />;
  // Hide homes the user just unsaved (optimistic), without refetching.
  const items = q.data.pages.flatMap((p) => p.items).filter((p) => liked.has(p.id) || !useFavourites.getState().loaded);
  if (!items.length) return <AcctState name="saved" title={t.noSaved} body={t.noSavedBody} action={{ label: t.browse, href: localizePath('/properties', locale) }} />;
  const ids = compare.ids;
  const full = ids.length >= COMPARE_MAX;
  return (
    <>
      <div className="acct-compare-bar">
        <p className="text-sm text-ink-800" role="status">
          {ids.length ? t.picked(ids.length) : t.pickHint}
          {full ? ` ${t.pickFull}` : ''}
        </p>
        {ids.length >= 2 ? (
          <a className="btn btn-ink" href={compareHref(ids, locale)}>
            <Icon name="compare" size={18} />
            {t.compareN(ids.length)}
          </a>
        ) : (
          <button type="button" className="btn btn-ink" disabled>
            <Icon name="compare" size={18} />
            {t.compareN(ids.length)}
          </button>
        )}
      </div>
      <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => {
          const on = ids.includes(p.id);
          return (
            <li key={p.id}>
              <PropertyCardView
                property={p}
                locale={locale}
                favourite={<FavouriteButton propertyId={p.id} locale={locale} initial />}
                compare={
                  <Check
                    label={
                      <>
                        {t.pickLabel}
                        <span className="sr-only">: {p.title}</span>
                      </>
                    }
                    checked={on}
                    disabled={!on && full}
                    onChange={() => toggleCompare(compare, p.id, { full: t.pickFull })}
                  />
                }
              />
            </li>
          );
        })}
      </ul>
      <MoreButton q={q} t={t} />
    </>
  );
}

function VisitRow({ v, locale, t, onCancel, onMove }: { v: Visit; locale: Locale; t: Strings; onCancel: () => void; onMove: () => void }) {
  const p = v.property;
  const active = v.status === 'requested' || v.status === 'confirmed' || v.status === 'reschedule_suggested';
  return (
    <li className="acct-visit" data-past={active ? undefined : ''}>
      <DateLeaf iso={v.scheduled_date} locale={locale} past={!active} />
      <div className="acct-visit-text grid min-w-0 content-start gap-1">
        <p className="font-bold">
          <span className="sr-only">{when(v.scheduled_date, locale)}. </span>
          <span aria-hidden="true">
            <span className="tabular">
              {formatDate(v.scheduled_date, locale, {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </span>
            <span className="font-normal text-ink-600"> · {relDay(v.scheduled_date, locale)}</span>
          </span>
        </p>
        {p ? (
          <a className="acct-title-link" href={localizePath(`/property/${p.id}`, locale)}>
            {p.title}
          </a>
        ) : null}
        {p ? <p className="truncate text-sm text-ink-600">{placeLine(p)}</p> : null}
        <VisitStatus v={v} t={t} />
        {active ? <Manager v={v} t={t} /> : null}
        {v.special_requirements ? <p className="text-sm text-ink-600">{v.special_requirements}</p> : null}
      </div>
      {p ? <Thumb p={p} w={144} h={108} className="acct-visit-photo" /> : null}
      {active ? (
        // Phone: buttons, then links (two rows). Tablet: one row. Desktop: the links
        // sit in the text column, the buttons in their own column on the right.
        <div className="acct-visit-actions">
          <div className="acct-visit-btns">
            <button type="button" className="btn" onClick={onMove}>
              <Icon name="calendar" size={16} />
              {t.reschedule}
            </button>
            <button type="button" className="btn btn-quiet" onClick={onCancel}>
              {t.cancel}
            </button>
          </div>
          <div className="acct-visit-links">
            <Directions p={p} t={t} />
            <AddToCalendar v={v} t={t} locale={locale} />
          </div>
        </div>
      ) : null}
    </li>
  );
}

/** Visits grouped under a month heading, in the order the API sends them. */
function byMonth(items: Visit[], locale: Locale): [string, Visit[]][] {
  const out = new Map<string, Visit[]>();
  for (const v of items) {
    const k = formatDate(v.scheduled_date, locale, { month: 'long', year: 'numeric' });
    out.set(k, [...(out.get(k) ?? []), v]);
  }
  return [...out];
}

function Visits({ locale, t }: { locale: Locale; t: Strings }) {
  const [which, setWhich] = useState<'upcoming' | 'past'>('upcoming');
  const [cancelling, setCancelling] = useState<Visit | null>(null);
  const [moving, setMoving] = useState<Visit | null>(null);
  const [reason, setReason] = useState(t.reasons[0]!);
  const [newDate, setNewDate] = useState('');
  const qc = useQueryClient();
  const q = usePaged(
    ['my-visits', which],
    (cursor) =>
      call(
        which === 'upcoming'
          ? api.GET('/api/v1/visits/upcoming', {
              params: { query: { limit: 20, ...(cursor ? { cursor } : {}) } },
            })
          : api.GET('/api/v1/visits/past', {
              params: { query: { limit: 20, ...(cursor ? { cursor } : {}) } },
            }),
      ),
  );
  const cancel = useMutation({
    mutationFn: (v: Visit) =>
      call(
        api.POST('/api/v1/visits/{visit_id}/cancel', {
          params: { path: { visit_id: v.id } },
          body: { reason },
        }),
      ),
    onSuccess: () => {
      toast(t.cancelled, 'success');
      setCancelling(null);
      void qc.invalidateQueries({ queryKey: ['my-visits'] });
    },
    onError: (e) => toast(describeError(e, locale).body, 'error'),
  });
  const move = useMutation({
    mutationFn: (v: Visit) =>
      call(
        api.POST('/api/v1/visits/{visit_id}/reschedule', {
          params: { path: { visit_id: v.id } },
          body: { new_date: new Date(newDate).toISOString() },
        }),
      ),
    onSuccess: () => {
      toast(t.rescheduled, 'success');
      setMoving(null);
      void qc.invalidateQueries({ queryKey: ['my-visits'] });
    },
    onError: (e) => toast(describeError(e, locale).body, 'error'),
  });

  const items = q.data?.pages.flatMap((p) => p.items) ?? [];
  return (
    <div className="grid gap-5">
      <div>
        <Segmented
          label={t.tabs.visits}
          value={which}
          onChange={setWhich}
          options={[
            ['upcoming', t.upcomingTab],
            ['past', t.pastTab],
          ]}
        />
      </div>
      {q.isPending ? (
        <Delayed>
          <div className="skeleton-gate grid gap-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        </Delayed>
      ) : q.isError ? (
        <ErrorView error={q.error} locale={locale} retry={() => void q.refetch()} />
      ) : items.length === 0 ? (
        <AcctState
          name="visits"
          title={t.noVisits}
          body={t.noVisitsBody}
          action={{
            label: t.browse,
            href: localizePath('/properties', locale),
          }}
        />
      ) : (
        <>
          {byMonth(items, locale).map(([month, list]) => (
            <section key={month} className="grid gap-3">
              <h2 className="acct-month">{month}</h2>
              <ul className="grid gap-3">
                {list.map((v) => (
                  <VisitRow key={v.id} v={v} locale={locale} t={t} onCancel={() => setCancelling(v)} onMove={() => setMoving(v)} />
                ))}
              </ul>
            </section>
          ))}
          <MoreButton q={q} t={t} />
        </>
      )}

      <Sheet open={Boolean(cancelling)} onClose={() => setCancelling(null)} title={t.cancelTitle} variant="dialog">
        <div className="grid gap-4">
          <SelectField label={t.reason} value={reason} onChange={(e) => setReason(e.target.value)}>
            {t.reasons.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </SelectField>
          <div className="flex flex-wrap justify-end gap-3">
            <button type="button" className="btn btn-quiet" onClick={() => setCancelling(null)}>
              {t.keep}
            </button>
            <button type="button" className="btn btn-ink" disabled={cancel.isPending} onClick={() => cancelling && cancel.mutate(cancelling)}>
              {t.confirmCancel}
            </button>
          </div>
        </div>
      </Sheet>

      <Sheet open={Boolean(moving)} onClose={() => setMoving(null)} title={t.reschedule} variant="dialog">
        <div className="grid gap-4">
          <TextField label={t.newTime} type="datetime-local" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
          <div className="flex justify-end">
            <button type="button" className="btn btn-primary" disabled={!newDate || move.isPending} onClick={() => moving && move.mutate(moving)}>
              {move.isPending ? t.saving : t.save}
            </button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}

/** Status and the listing's own counts from the API, plus a nudge when it has no photo. */
function ListingFacts({ p, t, locale }: { p: Property; t: Strings; locale: Locale }) {
  // A new or edited PG or flatmate listing waits for review before it shows on the site (listing_preferences.moderation_status).
  const review = p.listing_preferences?.moderation_status === 'pending_review';
  const live = !review && p.status === 'available' && p.is_available !== false;
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-0 text-sm">
      <span className={`inline-flex items-center gap-1 font-semibold ${live ? 'text-leaf-700' : 'text-ink-600'}`}>
        <Icon name={live ? 'check' : 'info'} size={14} />
        {review ? t.inReview : (t.listingStatus[p.status] ?? p.status)}
      </span>
      <span className="tabular text-ink-600">{t.views(p.view_count ?? 0)}</span>
      <span className="tabular text-ink-600">{t.saves(p.like_count ?? 0)}</span>
      {!p.main_image_url ? (
        <a className="link" href={`${localizePath('/post-property', locale)}?edit=${p.id}&step=photos`}>
          {t.addPhotos}
        </a>
      ) : null}
    </p>
  );
}

function Listings({ locale, t }: { locale: Locale; t: Strings }) {
  const qc = useQueryClient();
  const [removing, setRemoving] = useState<Property | null>(null);
  const q = usePaged(
    ['my-listings'],
    (cursor) =>
      call(
        api.GET('/api/v1/properties/me', {
          params: { query: { limit: 20, ...(cursor ? { cursor } : {}) } },
        }),
      ),
  );
  const remove = useMutation({
    mutationFn: (p: Property) =>
      call(
        api.DELETE('/api/v1/properties/{property_id}', {
          params: { path: { property_id: p.id } },
        }),
      ),
    onMutate: async (p) => {
      // Optimistic: drop the row now, put it back if the server says no.
      await qc.cancelQueries({ queryKey: ['my-listings'] });
      const prev = qc.getQueryData(['my-listings']);
      qc.setQueryData(['my-listings'], (old: { pages: PropertyPage[]; pageParams: unknown[] } | undefined) =>
        old
          ? {
              ...old,
              pages: old.pages.map((pg) => ({
                ...pg,
                items: pg.items.filter((x) => x.id !== p.id),
              })),
            }
          : old,
      );
      setRemoving(null);
      return { prev };
    },
    onError: (e, _p, ctx) => {
      if (ctx?.prev) qc.setQueryData(['my-listings'], ctx.prev);
      toast(describeError(e, locale).body, 'error');
    },
    onSuccess: () => toast(t.removed, 'success'),
  });
  if (q.isPending) return <Loading />;
  if (q.isError) return <ErrorView error={q.error} locale={locale} retry={() => void q.refetch()} />;
  const items = q.data.pages.flatMap((p) => p.items);
  if (!items.length) return <AcctState name="listings" title={t.noListings} body={t.noListingsBody} action={{ label: t.post, href: localizePath('/post-property', locale) }} />;
  return (
    <>
      <ul className="acct-table" aria-label={t.tabs.listings}>
        {items.map((p) => {
          const price = listingPrice(p, locale);
          return (
            <li key={p.id} className="acct-row">
              <Thumb p={p} w={96} h={72} />
              <div className="grid min-w-0 gap-0.5">
                <a className="acct-title-link" href={localizePath(`/property/${p.id}`, locale)}>
                  {p.title}
                </a>
                <p className="text-sm text-ink-600">
                  {typeLabel(p.property_type, locale)} · {[p.locality, p.city].filter(Boolean).join(', ')} ·{' '}
                  <span className="tabular">
                    {price.amount}
                    {price.period}
                  </span>
                </p>
                <ListingFacts p={p} t={t} locale={locale} />
              </div>
              <div className="acct-row-actions">
                <a className="btn btn-quiet" href={`${localizePath('/post-property', locale)}?edit=${p.id}`}>
                  <Icon name="edit" size={16} />
                  {t.edit}
                </a>
                <button type="button" className="btn btn-quiet" onClick={() => setRemoving(p)}>
                  <Icon name="trash" size={16} />
                  {t.remove}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      <MoreButton q={q} t={t} />
      <Sheet open={Boolean(removing)} onClose={() => setRemoving(null)} title={t.removeTitle} variant="dialog">
        <p className="text-ink-800">{t.removeBody}</p>
        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <button type="button" className="btn btn-quiet" onClick={() => setRemoving(null)}>
            {t.keepIt}
          </button>
          <button type="button" className="btn btn-ink" onClick={() => removing && remove.mutate(removing)}>
            <Icon name="trash" size={16} />
            {t.remove}
          </button>
        </div>
      </Sheet>
    </>
  );
}

/**
 * The relationship manager assigned to the user. v1 only said "Agent assigned"
 * when the profile had an agent id; here the details come from GET /agents/assigned,
 * and the card falls back to that one line if they do not load.
 */
function AssignedAgent({ t }: { t: Strings }) {
  const q = useQuery({ queryKey: ['assigned-agent'], queryFn: () => call(api.GET('/api/v1/agents/assigned')), retry: false });
  const a = q.data;
  const langs = (a?.languages ?? []).map((l) => l.charAt(0).toUpperCase() + l.slice(1)).join(', ');
  return (
    <section className="acct-card sheet content-start" aria-labelledby="acct-agent-h">
      <CardHead title={t.agentHead} id="acct-agent-h" />
      {q.isPending ? (
        <CardSkeleton />
      ) : a ? (
        <div className="flex items-center gap-4">
          {a.avatar_url ? <img src={a.avatar_url} alt="" width={64} height={64} className="h-16 w-16 shrink-0 rounded-full object-cover" loading="lazy" /> : null}
          <div className="grid min-w-0 gap-1">
            <p className="font-bold">{a.name}</p>
            {langs ? <p className="text-sm text-ink-600">{t.agentLangs(langs)}</p> : null}
            {a.contact_number ? (
              <a className="link justify-self-start" href={`tel:${a.contact_number}`}>
                <Icon name="phone" size={16} />
                {t.call} {a.contact_number}
              </a>
            ) : null}
          </div>
        </div>
      ) : (
        // GET /agents/assigned never assigns an agent: a 404 means none is assigned yet.
        <p className="text-sm text-ink-800">{q.error instanceof ApiError && q.error.kind === 'not_found' ? t.agentNone : t.agentFail}</p>
      )}
    </section>
  );
}

function Profile({ locale, t }: { locale: Locale; t: Strings }) {
  const profile = useAuthStore((s) => s.profile);
  const schema = z.object({
    name: z.string().trim().min(2, t.nameRule),
    dob: z.string().superRefine((v, ctx) => {
      if (!v) return;
      const p = dobProblem(v);
      if (p)
        ctx.addIssue({
          code: 'custom',
          message: p === 'young' ? t.young : p === 'old' ? t.old : t.required,
        });
    }),
  });
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    values: {
      name: profile?.full_name ?? '',
      dob: profile?.date_of_birth ?? '',
    },
  });
  const [uploading, setUploading] = useState(false);
  const stage = useAuthStore((s) => s.stage);
  const profileError = useAuthStore((s) => s.profileError);
  // The profile did not load (a 403 USER_INACTIVE, a 5xx): say why, and let the person try again. Not a skeleton for ever.
  if (!profile && profileError) return <ErrorView error={profileError} locale={locale} retry={() => void refreshProfile()} />;
  if (!profile) return <Loading />;
  // What the backend asks for, plus the empty fields it can take here. Plain words, no chips.
  const missing = [
    ...new Set([...(stage?.missing_fields ?? []), ...(!profile.full_name ? ['full_name'] : []), ...(!profile.date_of_birth ? ['date_of_birth'] : []), ...(!profile.phone ? ['phone'] : [])]),
  ].map((f) => t.fields[f] ?? f);
  return (
    <div className="acct-tab-grid">
      {missing.length ? (
        <p className="acct-tab-note acct-tab-note-todo">
          <Icon name="info" size={18} />
          <span>
            {t.stillMissing} {missing.join(', ')}.
          </span>
        </p>
      ) : (
        <p className="acct-tab-note">
          <Icon name="check" size={18} />
          {t.profileDone}
        </p>
      )}
      <section className="acct-card sheet" aria-labelledby="acct-details-h">
        <CardHead title={t.detailsHead} id="acct-details-h" />
        <form
          className="grid max-w-lg gap-4"
          noValidate
          onSubmit={form.handleSubmit(async (v) => {
            // Only send what changed; empty strings are rejected by the backend.
            const body: { full_name?: string; date_of_birth?: string } = {};
            if (v.name.trim() !== (profile.full_name ?? '')) body.full_name = v.name.trim();
            if (v.dob && v.dob !== profile.date_of_birth) body.date_of_birth = v.dob;
            if (!Object.keys(body).length) return;
            try {
              await call(api.PUT('/api/v1/users/profile', { body }));
              await refreshProfile();
              toast(t.profileSaved, 'success');
            } catch (e) {
              if (e instanceof ApiError && e.fields.date_of_birth)
                return form.setError('dob', {
                  message: e.fields.date_of_birth,
                });
              form.setError('root', { message: describeError(e, locale).body });
            }
          })}
        >
          <TextField label={t.fullName} autoComplete="name" error={form.formState.errors.name?.message} {...form.register('name')} />
          <TextField label={t.dob} type="date" autoComplete="bday" error={form.formState.errors.dob?.message} {...form.register('dob')} />
          <div className="field">
            <span className="field-label">{t.email}</span>
            <p className="flex flex-wrap items-center gap-2">
              {profile.email ?? '–'}
              {profile.email ? <span className="text-sm text-ink-600">({profile.email_verified ? t.verified : t.notVerified})</span> : null}
            </p>
          </div>
          <div className="field">
            <span className="field-label">{t.phone}</span>
            <p className="flex flex-wrap items-center gap-2">
              {profile.phone ?? '–'}
              {profile.phone ? <span className="text-sm text-ink-600">({profile.phone_verified ? t.verified : t.notVerified})</span> : null}
              {!profile.phone ? (
                <a className="link" href={`${localizePath('/add-phone', locale)}?next=${encodeURIComponent(localizePath('/account?tab=profile', locale))}`}>
                  {t.addPhone}
                </a>
              ) : null}
            </p>
            <p className="field-hint">{t.contactChange}</p>
          </div>
          {form.formState.errors.root ? (
            <p className="field-error" role="alert">
              <Icon name="alert" size={16} />
              {form.formState.errors.root.message}
            </p>
          ) : null}
          <button type="submit" className="btn btn-primary justify-self-start" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? t.saving : t.save}
          </button>
        </form>
      </section>
      <div className="grid content-start gap-5">
        <section className="acct-card sheet content-start" aria-labelledby="acct-photo-h">
          <CardHead title={t.photo} id="acct-photo-h" />
          {profile.profile_image_url ? (
            <img src={profile.profile_image_url} alt="" width={120} height={120} className="h-30 w-30 rounded-[var(--radius-lg)] object-cover" />
          ) : (
            <p className="text-sm text-ink-600">{t.photoNone}</p>
          )}
          <label className="btn justify-self-start">
            <Icon name="upload" size={16} />
            {uploading ? t.saving : t.upload}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="visually-hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploading(true);
                try {
                  const fd = new FormData();
                  fd.append('file', file);
                  await call(api.POST('/api/v1/users/me/avatar', { ...multipart(fd), ...timeoutMs(UPLOAD_TIMEOUT_MS) }));
                  await refreshProfile();
                  toast(t.uploaded, 'success');
                } catch (err) {
                  toast(describeError(err, locale).body, 'error');
                } finally {
                  setUploading(false);
                  e.target.value = '';
                }
              }}
            />
          </label>
        </section>
        {profile.agent_id ? <AssignedAgent t={t} /> : null}
      </div>
    </div>
  );
}

function Security({ locale, t }: { locale: Locale; t: Strings }) {
  const profile = useAuthStore((s) => s.profile);
  const schema = z
    .object({
      current: z.string().min(1, t.wrong),
      pw: z.string().refine((v) => passwordProblems(v).length === 0, t.pwRule),
      confirm: z.string(),
    })
    .refine((v) => v.pw === v.confirm, {
      path: ['confirm'],
      message: t.mismatch,
    });
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { current: '', pw: '', confirm: '' },
  });
  return (
    <div className="acct-tab-grid">
      <section className="acct-card sheet" aria-labelledby="acct-pw-h">
        <CardHead title={t.passwordHead} id="acct-pw-h" />
        <form
          className="grid max-w-md gap-4"
          noValidate
          onSubmit={form.handleSubmit(async (v) => {
            const sb = await supabase();
            if (!sb) return;
            const email = profile?.email;
            const phone = profile?.phone;
            const check = email
              ? await sb.auth.signInWithPassword({ email, password: v.current })
              : phone
                ? await sb.auth.signInWithPassword({
                    phone,
                    password: v.current,
                  })
                : null;
            if (!check || check.error) return form.setError('current', { message: t.wrong });
            const { error } = await sb.auth.updateUser({ password: v.pw });
            if (error) return form.setError('root', { message: error.message });
            form.reset();
            toast(t.pwSaved, 'success');
          })}
        >
          <TextField label={t.current} type="password" autoComplete="current-password" error={form.formState.errors.current?.message} {...form.register('current')} />
          <TextField label={t.newPw} type="password" autoComplete="new-password" hint={t.pwRule} error={form.formState.errors.pw?.message} {...form.register('pw')} />
          <TextField label={t.confirm} type="password" autoComplete="new-password" error={form.formState.errors.confirm?.message} {...form.register('confirm')} />
          {form.formState.errors.root ? (
            <p className="field-error" role="alert">
              <Icon name="alert" size={16} />
              {form.formState.errors.root.message}
            </p>
          ) : null}
          <button type="submit" className="btn btn-primary justify-self-start" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? t.saving : t.save}
          </button>
          <p className="text-sm text-ink-600">
            {t.noPassword}{' '}
            <a className="link min-h-0" href={localizePath('/forgot-password', locale)}>
              {t.setViaReset}
            </a>
          </p>
        </form>
      </section>
      <div className="grid content-start gap-5">
        <section className="acct-card sheet" aria-labelledby="acct-session-h">
          <CardHead title={t.sessionHead} id="acct-session-h" />
          <p className="text-sm text-ink-600">{t.sessionBody}</p>
          <button
            type="button"
            className="btn justify-self-start"
            onClick={async () => {
              await signOut();
              window.location.assign(localizePath('/', locale));
            }}
          >
            <Icon name="logout" size={18} />
            {t.signOut}
          </button>
        </section>
        <section className="acct-card sheet" aria-labelledby="acct-del-h">
          <CardHead title={t.deleteHead} id="acct-del-h" />
          <p className="text-sm text-ink-600">{t.deleteBody}</p>
          <a className="link justify-self-start" href={localizePath('/delete-account', locale)}>
            {t.deleteAccount}
          </a>
        </section>
      </div>
    </div>
  );
}

function CardHead({ title, count, action, id }: { title: string; count?: string; action?: ReactNode; id?: string }) {
  return (
    <div className="acct-card-head">
      <h2 id={id}>
        {title}
        {count ? <span className="acct-count tabular"> · {count}</span> : null}
      </h2>
      {action}
    </div>
  );
}

function EmptyCard({ name, title, body, href, label }: { name: 'saved' | 'visits' | 'listings'; title: string; body: string; href: string; label: string }) {
  return (
    <div className="acct-empty">
      <div className="acct-empty-art">
        <Vignette name={name} />
      </div>
      <div className="grid content-center justify-items-start gap-1">
        <p className="font-bold">{title}</p>
        <p className="text-sm text-ink-600">{body}</p>
        <a className="link" href={href}>
          {label}
          <Icon name="arrow-up-right" size={16} className="arrow" />
        </a>
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <Delayed>
      <div className="skeleton-gate grid gap-3">
        <Skeleton className="h-28" />
        <Skeleton className="h-5 w-2/3" />
      </div>
    </Delayed>
  );
}

function Overview({ locale, t, go }: { locale: Locale; t: Strings; go: (tab: TabId) => void }) {
  const stage = useAuthStore((s) => s.stage);
  const saved = useQuery({
    queryKey: ['acct-ov', 'saved'],
    queryFn: async () =>
      rowsAndTotal(
        await call(
          api.GET('/api/v1/swipes', {
            params: {
              query: { is_liked: true, limit: 4, include_total: true },
            },
          }),
        ),
      ),
  });
  const visit = useQuery({
    queryKey: ['acct-ov', 'visit'],
    queryFn: async () =>
      rowsAndTotal(
        await call(
          api.GET('/api/v1/visits/upcoming', {
            params: { query: { limit: 1, include_total: true } },
          }),
        ),
      ),
  });
  const mine = useQuery({
    queryKey: ['acct-ov', 'mine'],
    queryFn: async () =>
      rowsAndTotal(
        await call(
          api.GET('/api/v1/properties/me', {
            params: { query: { limit: 3, include_total: true } },
          }),
        ),
      ),
  });
  const missing = stage?.missing_fields ?? [];
  const retry = (q: { refetch: () => unknown }) => () => void q.refetch();
  const seeAll = (tab: TabId) => (
    <button type="button" className="link acct-see" onClick={() => go(tab)}>
      {t.seeAll}
    </button>
  );
  const next = visit.data?.items[0];
  const np = next?.property;

  return (
    <div className="grid gap-6">
      {missing.length ? (
        <div className="acct-missing">
          <p>
            {t.missing} {missing.map((f) => t.fields[f] ?? f).join(', ')}.
          </p>
          <a className="btn btn-primary" href={localizePath('/profile-completion', locale)}>
            {t.complete}
          </a>
        </div>
      ) : null}

      <div className="acct-ov">
        <section className="acct-card sheet acct-ov-visit" aria-label={t.nextVisit}>
          <CardHead title={t.nextVisit} count={(visit.data?.total ?? 0) > 1 ? t.visitsBooked(visit.data!.total) : undefined} action={next ? seeAll('visits') : null} />
          {visit.isPending ? (
            <CardSkeleton />
          ) : visit.isError ? (
            <ErrorView error={visit.error} locale={locale} retry={retry(visit)} />
          ) : next ? (
            <div className="acct-next">
              {np ? <Thumb p={np} w={320} h={240} className="acct-next-photo" /> : null}
              <DateLeaf iso={next.scheduled_date} locale={locale} />
              <div className="acct-next-text grid min-w-0 content-start gap-1">
                <p className="font-bold">
                  <span className="sr-only">{when(next.scheduled_date, locale)}. </span>
                  <span aria-hidden="true">
                    <span className="tabular">
                      {formatDate(next.scheduled_date, locale, {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="font-normal text-ink-600"> · {relDay(next.scheduled_date, locale)}</span>
                  </span>
                </p>
                {np ? (
                  <a className="acct-title-link" href={localizePath(`/property/${np.id}`, locale)}>
                    {np.title}
                  </a>
                ) : null}
                {np ? <p className="truncate text-sm text-ink-600">{placeLine(np)}</p> : null}
                <VisitStatus v={next} t={t} />
                {np ? <p className="text-sm text-ink-800">{facts(np, locale)}</p> : null}
                <Manager v={next} t={t} />
              </div>
              {/* Under the text on wide cards; across the card on phones, so the two links keep one row. */}
              <div className="acct-next-links">
                <Directions p={np} t={t} />
                <AddToCalendar v={next} t={t} locale={locale} />
              </div>
            </div>
          ) : (
            <EmptyCard name="visits" title={t.noNextVisit} body={t.noNextVisitBody} href={localizePath('/properties', locale)} label={t.findHome} />
          )}
        </section>

        <section className="acct-card sheet acct-ov-mine" aria-label={t.listings}>
          <CardHead title={t.listings} count={mine.data?.total ? t.listingsCount(mine.data.total) : undefined} action={mine.data?.total ? seeAll('listings') : null} />
          {mine.isPending ? (
            <CardSkeleton />
          ) : mine.isError ? (
            <ErrorView error={mine.error} locale={locale} retry={retry(mine)} />
          ) : mine.data.items.length ? (
            <>
              <ul className="acct-table">
                {mine.data.items.map((p) => (
                  <li key={p.id} className="acct-row acct-row-sm">
                    <Thumb p={p} w={72} h={54} />
                    <div className="grid min-w-0 gap-0.5">
                      <a className="acct-title-link" href={localizePath(`/property/${p.id}`, locale)}>
                        {p.title}
                      </a>
                      <ListingFacts p={p} t={t} locale={locale} />
                    </div>
                  </li>
                ))}
              </ul>
              <a className="link mt-2" href={localizePath('/post-property', locale)}>
                <Icon name="plus" size={16} />
                {t.post}
              </a>
            </>
          ) : (
            <EmptyCard name="listings" title={t.noListings} body={t.noListingsShort} href={localizePath('/post-property', locale)} label={t.post} />
          )}
        </section>
        <section className="acct-card sheet acct-ov-saved" aria-label={t.saved}>
          <CardHead title={t.saved} count={saved.data?.total ? t.savedCount(saved.data.total) : undefined} action={saved.data?.total ? seeAll('favorites') : null} />
          {saved.isPending ? (
            <CardSkeleton />
          ) : saved.isError ? (
            <ErrorView error={saved.error} locale={locale} retry={retry(saved)} />
          ) : saved.data.items.length ? (
            <ul className="acct-saved">
              {saved.data.items.map((p) => {
                const price = listingPrice(p, locale);
                return (
                  <li key={p.id}>
                    <a href={localizePath(`/property/${p.id}`, locale)} className="acct-saved-link">
                      <Thumb p={p} w={240} h={180} />
                      <span className="tabular font-bold">
                        {price.amount}
                        <span className="text-sm font-semibold text-ink-600">{price.period}</span>
                      </span>
                      <span className="truncate text-sm text-ink-600">{[bhkLabel(p.bedrooms, p.property_type), p.locality].filter(Boolean).join(' · ')}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyCard name="saved" title={t.noSaved} body={t.noSavedShort} href={localizePath('/properties', locale)} label={t.browse} />
          )}
        </section>
      </div>
    </div>
  );
}

/* ------------------------------ Shell ------------------------------ */

function AccountInner({ locale }: { locale: Locale }) {
  const t = T[locale];
  const status = useAuth((s) => s.status);
  const profile = useAuthStore((s) => s.profile);
  const [tab, setTab] = useState<TabId>(() => ALIASES[new URLSearchParams(window.location.search).get('tab') ?? ''] ?? 'overview');

  useEffect(() => {
    const url = new URL(window.location.href);
    if (tab === 'overview') url.searchParams.delete('tab');
    else url.searchParams.set('tab', tab);
    history.replaceState(history.state, '', url);
  }, [tab]);

  if (status === 'unknown')
    return (
      <div className="grid gap-4" aria-busy="true">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  if (status === 'anon')
    return (
      <AcctState
        name="door"
        title={t.signInTitle}
        body={t.signInBody}
        action={{
          label: t.signIn,
          href: loginHref(locale),
        }}
        secondary={{ label: t.create, href: localizePath('/register', locale) }}
      />
    );

  const name = profile?.full_name?.split(' ')[0] ?? '';
  const panels: Record<TabId, ReactNode> = {
    overview: <Overview locale={locale} t={t} go={setTab} />,
    favorites: <Favourites locale={locale} t={t} />,
    visits: <Visits locale={locale} t={t} />,
    listings: <Listings locale={locale} t={t} />,
    profile: <Profile locale={locale} t={t} />,
    preferences: <Preferences locale={locale} />,
    notifications: <Notifications locale={locale} />,
    alerts: <SavedAlerts locale={locale} />,
    security: <Security locale={locale} t={t} />,
  };
  return (
    <div className="grid gap-6">
      <h1 className="text-3xl md:text-4xl">{name ? t.hello(name) : t.title}</h1>
      <Tabs
        label={t.title}
        value={tab}
        onChange={(id) => setTab(id as TabId)}
        tabs={(Object.keys(panels) as TabId[]).map((id) => ({
          id,
          label: t.tabs[id],
          panel: tab === id ? panels[id] : null,
        }))}
      />
      <Toaster />
    </div>
  );
}

export default function Account({ locale = 'en' }: { locale?: Locale }) {
  return (
    <QueryProvider>
      <IslandBoundary locale={locale}>
        <AccountInner locale={locale} />
      </IslandBoundary>
    </QueryProvider>
  );
}
