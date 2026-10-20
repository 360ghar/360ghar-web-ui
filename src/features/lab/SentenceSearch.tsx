/**
 * Lab hero 3: the search is one sentence. Each blank is a real control, and
 * the sentence is a GET form, so it works before the island loads. With
 * JavaScript, the count of matching homes updates as the sentence changes, and
 * "Ask the assistant" puts the sentence in the chat input.
 */
import { useEffect, useMemo, useState, type SyntheticEvent } from 'react';
import { useChat } from '@/features/chat/store';
import { parseFilters, toApiQuery, toSearchParams } from '@/features/search/filters';
import { api } from '@/lib/api/client';
import { formatNum } from '@/lib/format';
import type { Locale } from '@/lib/i18n/locale';
import { localizePath } from '@/lib/i18n/locale';
import { Icon } from '@/ui/icons/Icon';
import { IslandBoundary } from '@/ui/react/IslandBoundary';

type Purpose = 'buy' | 'rent' | 'short_stay';

const BUDGET: Record<Purpose, { value: number; label: string }[]> = {
  buy: [
    { value: 7_500_000, label: '₹75 L' },
    { value: 10_000_000, label: '₹1 Cr' },
    { value: 15_000_000, label: '₹1.5 Cr' },
    { value: 20_000_000, label: '₹2 Cr' },
    { value: 30_000_000, label: '₹3 Cr' },
  ],
  rent: [
    { value: 20_000, label: '₹20,000' },
    { value: 35_000, label: '₹35,000' },
    { value: 50_000, label: '₹50,000' },
    { value: 80_000, label: '₹80,000' },
  ],
  short_stay: [
    { value: 2_500, label: '₹2,500' },
    { value: 4_000, label: '₹4,000' },
    { value: 6_000, label: '₹6,000' },
  ],
};
const START: Record<Purpose, number> = { buy: 20_000_000, rent: 50_000, short_stay: 4_000 };

const T = {
  en: {
    label: 'Describe the home you want',
    i: 'I want to',
    purpose: { buy: 'buy', rent: 'rent', short_stay: 'stay in' },
    a: 'a',
    size: 'Size',
    any: 'home',
    bhk: (n: number) => (n >= 4 ? '4+ BHK' : `${n} BHK`),
    in: 'in',
    where: 'Area',
    anywhere: 'any sector',
    upTo: 'for up to',
    budget: 'Budget',
    anyPrice: 'any price',
    per: { buy: '', rent: ' a month', short_stay: ' a night' },
    match: (n: number) => (n === 1 ? 'home matches' : 'homes match'),
    lit: 'One lit window on the street below for each',
    none: 'No home matches yet. Try a higher budget or any sector.',
    counting: 'Counting homes…',
    search: 'Show the homes',
    ask: 'Ask the assistant instead',
  },
  hi: {
    label: 'जैसा घर चाहिए, वैसा लिखें',
    i: 'मैं',
    purpose: { buy: 'खरीदना', rent: 'किराये पर लेना', short_stay: 'ठहरना' },
    a: '',
    size: 'साइज़',
    any: 'घर',
    bhk: (n: number) => (n >= 4 ? '4+ BHK' : `${n} BHK`),
    in: 'में',
    where: 'इलाका',
    anywhere: 'कोई भी सेक्टर',
    upTo: 'बजट',
    budget: 'बजट',
    anyPrice: 'कोई भी',
    per: { buy: '', rent: ' महीना', short_stay: ' रात' },
    match: () => 'घर मिलते हैं',
    lit: 'नीचे गली में हर घर के लिए एक जलती खिड़की',
    none: 'अभी कोई घर नहीं मिला। बजट बढ़ाएँ या कोई भी सेक्टर चुनें।',
    counting: 'घर गिन रहे हैं…',
    search: 'घर दिखाएँ',
    ask: 'इसके बजाय असिस्टेंट से पूछें',
  },
};

type Props = { locale?: Locale; places: string[] };

function Sentence({ locale = 'en', places }: Props) {
  const t = T[locale];
  const [purpose, setPurpose] = useState<Purpose>('buy');
  const [bhk, setBhk] = useState('3');
  const [place, setPlace] = useState('');
  const [budget, setBudget] = useState(String(START.buy));
  /** The last count and the search it belongs to; while they differ, a new count is on its way. */
  const [result, setResult] = useState<{ key: string; n: number | null } | null>(null);

  // A typed name that is a known locality filters by locality; other text is a free search.
  const params = useMemo(() => {
    const sp = new URLSearchParams({ purpose });
    if (bhk) sp.set('bhk', bhk);
    if (budget) sp.set('price_max', budget);
    const hit = places.find((p) => p.toLowerCase() === place.trim().toLowerCase());
    if (hit) sp.set('locality', hit);
    else if (place.trim()) sp.set('q', place.trim());
    return sp;
  }, [purpose, bhk, place, budget, places]);
  const filters = useMemo(() => parseFilters(params), [params]);
  const key = toSearchParams(filters).toString();
  const href = `${localizePath('/properties', locale)}?${key}`;
  const count = result?.n ?? null;
  const busy = result?.key !== key;

  useEffect(() => {
    const ctrl = new AbortController();
    const timer = window.setTimeout(async () => {
      const r = await api
        .GET('/api/v1/properties', { params: { query: toApiQuery(filters, { limit: 1, total: true }) }, signal: ctrl.signal })
        .catch(() => null);
      if (ctrl.signal.aborted) return;
      const n = r?.data?.total ?? null;
      setResult({ key, n });
      // The street under the sentence lights one window per home (SentenceHero.astro).
      window.dispatchEvent(new CustomEvent('lab:count', { detail: n }));
    }, 300);
    return () => {
      ctrl.abort();
      window.clearTimeout(timer);
    };
  }, [filters, key]);

  const sentence = () => {
    const size = bhk ? t.bhk(Number(bhk)) : t.any;
    const money = BUDGET[purpose].find((b) => String(b.value) === budget);
    const where = place.trim() || t.anywhere;
    if (locale === 'hi') return `मुझे ${where} ${t.in} ${size} चाहिए (${t.purpose[purpose]}), ${t.upTo} ${money ? money.label + t.per[purpose] : t.anyPrice}।`;
    return `${t.i} ${t.purpose[purpose]} a ${size} ${t.in} ${where} ${money ? `${t.upTo} ${money.label}${t.per[purpose]}` : `at ${t.anyPrice}`}.`;
  };

  const ask = () => {
    useChat.setState({ draft: sentence() });
    if (!useChat.getState().open) {
      // The launcher shown at this width (a phone has it in the header bar).
      const launcher = [...document.querySelectorAll<HTMLElement>('[data-chat-launcher]')].find((el) => el.getClientRects().length > 0);
      launcher?.click();
    }
  };

  const onSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    window.location.assign(href);
  };

  const changePurpose = (p: Purpose) => {
    setPurpose(p);
    setBudget(String(START[p]));
  };

  return (
    <form className="sen" action={localizePath('/properties', locale)} method="get" onSubmit={onSubmit} aria-label={t.label}>
      <p className="sen-line">
        <span>{t.i} </span>
        <label className="sen-blank">
          <span className="visually-hidden">{t.label}</span>
          <select name="purpose" value={purpose} onChange={(e) => changePurpose(e.target.value as Purpose)}>
            {(['buy', 'rent', 'short_stay'] as const).map((p) => (
              <option key={p} value={p}>
                {t.purpose[p]}
              </option>
            ))}
          </select>
        </label>
        <span> {t.a} </span>
        <label className="sen-blank">
          <span className="visually-hidden">{t.size}</span>
          <select name="bhk" value={bhk} onChange={(e) => setBhk(e.target.value)}>
            <option value="">{t.any}</option>
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {t.bhk(n)}
              </option>
            ))}
          </select>
        </label>
        <span> {t.in} </span>
        <label className="sen-blank sen-where">
          <span className="visually-hidden">{t.where}</span>
          <input
            name="q"
            type="text"
            list="sen-places"
            value={place}
            placeholder={t.anywhere}
            size={Math.max(place.length, t.anywhere.length) + 1}
            autoComplete="off"
            onChange={(e) => setPlace(e.target.value)}
          />
          <datalist id="sen-places">
            {places.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </label>
        <span> {t.upTo} </span>
        <label className="sen-blank">
          <span className="visually-hidden">{t.budget}</span>
          <select name="price_max" value={budget} onChange={(e) => setBudget(e.target.value)}>
            {BUDGET[purpose].map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
                {t.per[purpose]}
              </option>
            ))}
            <option value="">{t.anyPrice}</option>
          </select>
        </label>
        <span>.</span>
      </p>
      <div className="sen-answer">
        <p className="sen-count" role="status" aria-busy={busy || undefined}>
          {count === null ? (
            // A failed count shows nothing; the Search button still works.
            busy && <span className="sen-count-wait">{t.counting}</span>
          ) : count === 0 ? (
            <span className="sen-count-none">{t.none}</span>
          ) : (
            <>
              <span className="sen-count-num tabular">{formatNum(count, locale)}</span> <span className="sen-count-unit">{t.match(count)}</span>
              <span className="sen-count-note">{t.lit}</span>
            </>
          )}
        </p>
        <button type="submit" className="btn btn-primary btn-lg">
          {t.search}
          <Icon name="arrow-up-right" size={18} className="arrow" />
        </button>
        <button type="button" className="link sen-ask" onClick={ask}>
          <Icon name="chat" size={18} />
          {t.ask}
        </button>
      </div>
    </form>
  );
}

/** A crash leaves a plain link to the search page. */
export default function SentenceSearch(props: Props) {
  const locale = props.locale ?? 'en';
  return (
    <IslandBoundary
      locale={locale}
      fallback={
        <a className="btn btn-primary btn-lg" href={localizePath('/properties', locale)}>
          {T[locale].search}
        </a>
      }
    >
      <Sentence {...props} />
    </IslandBoundary>
  );
}
