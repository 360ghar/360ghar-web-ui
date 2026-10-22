import { useState, type SyntheticEvent } from 'react';
import type { Place } from '@/lib/maps';
import type { Locale } from '@/lib/i18n/locale';
import { localizePath } from '@/lib/i18n/locale';
import { Icon } from '@/ui/icons/Icon';
import { PlacesInput } from './PlacesInput';
import { isSentence, sentenceHref } from './nl';
import { IslandBoundary } from '@/ui/react/IslandBoundary';
import { ForgetLocation, LocationNotice } from '@/features/location/LocationNotice';
import { locationCopy } from '@/features/location/copy';
import { FALLBACK_CENTER } from '@/features/location/logic';
import { useLocationMemory, useLocationStore } from '@/features/location/store';

type Purpose = 'rent' | 'buy' | 'pg';

const T = {
  en: {
    label: 'Find a home',
    rent: 'Rent',
    buy: 'Buy',
    pg: 'PG',
    where: 'Sector or society',
    whereLabel: 'Where do you want to live?',
    search: 'Search',
    near: 'Near me',
    locating: 'Finding you…',
    post: 'Own a home? List it free',
  },
  hi: {
    label: 'घर खोजें',
    rent: 'किराया',
    buy: 'खरीदें',
    pg: 'पीजी',
    where: 'सेक्टर या सोसाइटी',
    whereLabel: 'कहाँ रहना चाहते हैं?',
    search: 'खोजें',
    near: 'मेरे पास',
    locating: 'आपकी लोकेशन ढूँढ रहे हैं…',
    post: 'घर के मालिक हैं? मुफ़्त लिस्ट करें',
  },
};

/** Builds the listing URL for a search. PG is rent with property_type=pg. */
export function searchHref(locale: Locale, purpose: Purpose, text: string, place: Place | null): string {
  const q = new URLSearchParams();
  q.set('purpose', purpose === 'pg' ? 'rent' : purpose);
  if (purpose === 'pg') q.set('property_type', 'pg');
  if (place) {
    q.set('lat', place.lat.toFixed(5));
    q.set('lng', place.lng.toFixed(5));
    q.set('radius', '10');
    q.set('place', place.name);
    q.set('sort_by', 'distance');
  } else if (text.trim()) {
    q.set('q', text.trim());
  }
  return `${localizePath('/properties', locale)}?${q}`;
}

/**
 * The home search. Server-rendered as a GET form, so it works before the
 * island loads; with JavaScript it adds place suggestions and "Near me".
 */
function Search({ locale = 'en' }: { locale?: Locale }) {
  const t = T[locale];
  const [purpose, setPurpose] = useState<Purpose>('rent');
  const [text, setText] = useState('');
  const [place, setPlace] = useState<Place | null>(null);
  const busy = useLocationStore((s) => s.status === 'busy');
  useLocationMemory();

  const go = (p: Place | null) => window.location.assign(searchHref(locale, purpose, text, p));

  const [thinking, setThinking] = useState(false);
  const onSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    // A typed sentence ("2 BHK for rent in Sector 57 under 50k") is read by the backend; any failure searches the words.
    if (!place && isSentence(text)) {
      setThinking(true);
      window.location.assign((await sentenceHref(text, locale)).href);
      return;
    }
    go(place);
  };

  // A saved fresh fix is used at once. Without one the browser is asked. If that
  // fails, the notice below explains, and Search uses central Gurugram (as v1 did).
  const nearMe = async () => {
    const fix = await useLocationStore.getState().locate();
    if (fix) go({ lat: fix.lat, lng: fix.lng, name: t.near });
    else setPlace({ ...FALLBACK_CENTER, name: locationCopy(locale).approxPlace });
  };

  return (
    <form className="hero-search" role="search" action={localizePath('/properties', locale)} method="get" onSubmit={onSubmit} aria-label={t.label}>
      <fieldset className="hero-purpose">
        <legend className="visually-hidden">{t.label}</legend>
        {(['rent', 'buy', 'pg'] as const).map((p) => (
          <label key={p} className="hero-purpose-opt">
            <input type="radio" name="purpose" value={p === 'pg' ? 'rent' : p} checked={purpose === p} onChange={() => setPurpose(p)} />
            <span>{t[p]}</span>
          </label>
        ))}
        {purpose === 'pg' ? <input type="hidden" name="property_type" value="pg" /> : null}
      </fieldset>
      <div className="hero-search-row">
        <PlacesInput
          name="q"
          label={t.whereLabel}
          placeholder={t.where}
          onPlace={setPlace}
          onText={setText}
          className="grow"
          inputClassName="hero-search-input"
        />
        <button type="submit" className="btn btn-ink btn-lg hero-search-go" aria-label={t.search} disabled={thinking}>
          <Icon name="search" size={20} />
          <span>{t.search}</span>
        </button>
      </div>
      <div className="hero-search-foot">
        <button type="button" className="btn btn-quiet" onClick={() => void nearMe()} disabled={busy}>
          <Icon name="locate" size={18} />
          {busy ? t.locating : t.near}
        </button>
        <ForgetLocation locale={locale} />
        <a className="link" href={localizePath('/post-property', locale)}>
          {t.post}
          <Icon name="arrow-up-right" size={16} className="arrow" />
        </a>
      </div>
      <LocationNotice locale={locale} />
    </form>
  );
}

/** A crash leaves a plain link to the search page. */
export default function HeroSearch({ locale = 'en' }: { locale?: Locale }) {
  return (
    <IslandBoundary
      locale={locale}
      fallback={
        <a className="btn btn-ink btn-lg" href={localizePath('/properties', locale)}>
          {T[locale].search}
        </a>
      }
    >
      <Search locale={locale} />
    </IslandBoundary>
  );
}
