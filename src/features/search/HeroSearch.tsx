import { useEffect, useState, type SyntheticEvent } from 'react';
import type { Place } from '@/lib/maps';
import type { Locale } from '@/lib/i18n/locale';
import { localizePath } from '@/lib/i18n/locale';
import { Icon } from '@/ui/icons/Icon';
import { PlacesInput } from './PlacesInput';
import { exactArea, type AreaSuggestion } from './areaSearch';
import { searchHref, type Purpose } from './href';
import { PostLink } from './PostLink';
import { isSentence, sentenceHref } from './nl';
import { IslandBoundary } from '@/ui/react/IslandBoundary';
import { ForgetLocation, LocationNotice } from '@/features/location/LocationNotice';
import { locationCopy } from '@/features/location/copy';
import { FALLBACK_CENTER } from '@/features/location/logic';
import { useLocationMemory, useLocationStore } from '@/features/location/store';

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
  },
};

/**
 * The home search. Server-rendered as a GET form, so it works before the
 * island loads; with JavaScript it adds place suggestions and "Near me".
 * `postLink="none"` drops the owner link from the foot: the home page renders
 * it in its own line below the card, where the search is one line.
 */
function Search({ locale = 'en', postLink = 'foot' }: { locale?: Locale; postLink?: 'foot' | 'none' }) {
  const t = T[locale];
  const [purpose, setPurpose] = useState<Purpose>('rent');
  const [text, setText] = useState('');
  const [place, setPlace] = useState<Place | null>(null);
  const [area, setArea] = useState<AreaSuggestion | null>(null);
  const busy = useLocationStore((s) => s.status === 'busy');
  useLocationMemory();

  const go = (p: Place | null, picked: AreaSuggestion | null = area) => window.location.assign(searchHref(locale, purpose, text, p, picked));

  const [thinking, setThinking] = useState(false);
  // Back from the results (the page comes from the back-forward cache): search again.
  useEffect(() => {
    const reset = () => setThinking(false);
    window.addEventListener('pageshow', reset);
    return () => window.removeEventListener('pageshow', reset);
  }, []);
  const onSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Typing "sec 56" and pressing Search should land on the sector, not on a keyword FTS cannot match.
    const picked = area ?? exactArea(text, locale);
    // A typed sentence ("2 BHK for rent in Sector 57 under 50k") is read by the backend; any failure searches the words.
    if (!place && !picked && isSentence(text)) {
      setThinking(true);
      window.location.assign((await sentenceHref(text, locale, purpose === 'pg' ? { purpose: 'rent', property_type: 'pg' } : { purpose })).href);
      return;
    }
    go(place, picked);
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
      <div className="hero-search-rows">
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
        <PlacesInput
          name="q"
          label={t.whereLabel}
          placeholder={t.where}
          locale={locale}
          areas
          onPlace={setPlace}
          onText={setText}
          onArea={setArea}
          className="hero-search-field"
          inputClassName="hero-search-input"
        />
        <button type="submit" className="btn btn-ink btn-lg hero-search-go" aria-label={t.search} disabled={thinking}>
          <Icon name="search" size={20} />
          <span>{t.search}</span>
        </button>
        <div className="hero-search-foot">
          <button type="button" className="btn" onClick={() => void nearMe()} disabled={busy}>
            <Icon name="locate" size={18} />
            {busy ? t.locating : t.near}
          </button>
          <ForgetLocation locale={locale} className="btn btn-quiet hero-forget" />
          {postLink === 'foot' ? <PostLink locale={locale} /> : null}
        </div>
        <LocationNotice locale={locale} className="hero-search-notice" />
      </div>
    </form>
  );
}

/** A crash leaves a plain link to the search page. */
export default function HeroSearch({ locale = 'en', postLink = 'foot' }: { locale?: Locale; postLink?: 'foot' | 'none' }) {
  return (
    <IslandBoundary
      locale={locale}
      fallback={
        <a className="btn btn-ink btn-lg" href={localizePath('/properties', locale)}>
          {T[locale].search}
        </a>
      }
    >
      <Search locale={locale} postLink={postLink} />
    </IslandBoundary>
  );
}
