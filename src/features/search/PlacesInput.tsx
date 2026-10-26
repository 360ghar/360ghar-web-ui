import { useEffect, useId, useRef, useState } from 'react';
import type { Locale } from '@/lib/i18n/locale';
import { resolvePlace, suggestPlaces, type Place, type PlaceHit } from '@/lib/maps';
import { Icon } from '@/ui/icons/Icon';
import { mergeSuggestions, searchAreas, type AreaSuggestion, type Suggestion } from './areaSearch';

type Props = {
  name: string;
  label: string;
  placeholder: string;
  defaultValue?: string;
  onPlace: (place: Place | null) => void;
  /** Text changes when no place is picked (used as a keyword search). */
  onText?: (text: string) => void;
  /** Offer the local Gurugram areas before (and alongside) Google Places. */
  areas?: boolean;
  /** A local area was picked, or null when the text changed or a Google place was picked. */
  onArea?: (area: AreaSuggestion | null) => void;
  locale?: Locale;
  className?: string;
  inputClassName?: string;
};

/**
 * Place search with the ARIA 1.2 combobox pattern. The local area list answers
 * at once; Google Places fills the rest of the list when it can. Without
 * JavaScript, or without a Maps key, it is a plain text field and the form
 * still submits.
 */
export function PlacesInput({
  name,
  label,
  placeholder,
  defaultValue = '',
  onPlace,
  onText,
  areas = false,
  onArea,
  locale = 'en',
  className = '',
  inputClassName = '',
}: Props) {
  const id = useId();
  const [value, setValue] = useState(defaultValue);
  const [local, setLocal] = useState<AreaSuggestion[]>([]);
  const [hits, setHits] = useState<PlaceHit[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [failed, setFailed] = useState(false);
  const localRef = useRef<AreaSuggestion[]>([]);
  const timer = useRef<number>(0);
  const seq = useRef(0);
  const pickSeq = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const options = mergeSuggestions(local, hits);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // The parent reset its filters: show the new default, but never while the user is typing.
  useEffect(() => {
    if (document.activeElement === inputRef.current) return;
    setValue(defaultValue);
    localRef.current = [];
    setLocal([]);
    setHits([]);
    setOpen(false);
  }, [defaultValue]);

  const setLocalAreas = (next: AreaSuggestion[]) => {
    localRef.current = next;
    setLocal(next);
  };

  const search = (text: string) => {
    window.clearTimeout(timer.current);
    seq.current++; // Drop any suggestion request for the previous text.
    setHits([]);
    if (failed || text.trim().length < 2) {
      setOpen(localRef.current.length > 0);
      setActive(-1);
      return;
    }
    timer.current = window.setTimeout(async () => {
      const n = ++seq.current;
      try {
        const res = await suggestPlaces(text);
        if (n !== seq.current) return;
        setHits(res);
        setOpen(res.length > 0 || localRef.current.length > 0);
        setActive(-1);
      } catch {
        if (n !== seq.current) return; // Escape or blur already cancelled this lookup.
        setFailed(true); // No key or network: the local suggestions still work.
        setOpen(localRef.current.length > 0);
      }
    }, 250);
  };

  const pickArea = (area: AreaSuggestion) => {
    pickSeq.current++;
    window.clearTimeout(timer.current);
    seq.current++; // A late Google answer must not reopen the list.
    setValue(area.name);
    setOpen(false);
    setLocalAreas([]);
    setHits([]);
    onArea?.(area);
    onPlace(null);
  };

  const pick = async (hit: PlaceHit) => {
    const n = ++pickSeq.current;
    window.clearTimeout(timer.current);
    seq.current++;
    setValue(hit.main);
    setOpen(false);
    setLocalAreas([]);
    setHits([]);
    onArea?.(null);
    let place: Place | null = null;
    try {
      place = await resolvePlace(hit);
    } catch {
      // Fall through to the plain-text search below.
    }
    if (n !== pickSeq.current) return; // The user edited meanwhile: the old pick is stale.
    onPlace(place);
    if (!place) onText?.(hit.main);
  };

  const choose = (option: Suggestion) => {
    if (option.kind === 'area') pickArea(option.area);
    else void pick(option.place);
  };

  const openFor = (text: string) => {
    const matches = areas ? searchAreas(text, locale) : [];
    setLocalAreas(matches);
    setOpen(matches.length > 0 || hits.length > 0);
    setActive(-1);
  };

  return (
    <div className={`relative ${className}`}>
      <label htmlFor={id} className="visually-hidden">
        {label}
      </label>
      <Icon name="pin" size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-600" />
      <input
        id={id}
        ref={inputRef}
        name={name}
        className={`input pl-10 ${inputClassName}`}
        type="search"
        inputMode="search"
        autoComplete="off"
        enterKeyHint="search"
        placeholder={placeholder}
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-autocomplete="list"
        aria-activedescendant={open && active >= 0 ? `${id}-o${active}` : undefined}
        value={value}
        onFocus={() => openFor(value)}
        onChange={(e) => {
          pickSeq.current++;
          const next = e.target.value;
          setValue(next);
          onText?.(next);
          onPlace(null);
          onArea?.(null);
          const matches = areas ? searchAreas(next, locale) : [];
          setLocalAreas(matches);
          setOpen(matches.length > 0);
          setActive(-1);
          search(next);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            window.clearTimeout(timer.current);
            seq.current++;
            setOpen(false);
            return;
          }
          if (!open || options.length === 0) return;
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive((a) => Math.min(options.length - 1, a + 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((a) => Math.max(0, a - 1));
          } else if (e.key === 'Enter' && active >= 0) {
            e.preventDefault();
            const option = options[active];
            if (option) choose(option);
          }
        }}
        onBlur={() => {
          window.clearTimeout(timer.current);
          seq.current++;
          window.setTimeout(() => setOpen(false), 120);
        }}
      />
      {open && options.length ? (
        <ul id={`${id}-list`} role="listbox" aria-label={label} className="places-list">
          {options.map((option, i) =>
            option.kind === 'area' ? (
              <li
                key={`a-${option.area.name}`}
                id={`${id}-o${i}`}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pickArea(option.area);
                }}
              >
                <Icon name="pin" size={16} />
                <span className="grid min-w-0">
                  <span className="truncate font-semibold">{option.area.name}</span>
                  <span className="truncate text-sm text-ink-600">{option.area.secondary}</span>
                </span>
              </li>
            ) : (
              <li
                key={`p-${option.place.id}`}
                id={`${id}-o${i}`}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => {
                  e.preventDefault();
                  void pick(option.place);
                }}
              >
                <Icon name="pin" size={16} />
                <span className="grid min-w-0">
                  <span className="truncate font-semibold">{option.place.main}</span>
                  {option.place.secondary ? <span className="truncate text-sm text-ink-600">{option.place.secondary}</span> : null}
                </span>
              </li>
            ),
          )}
        </ul>
      ) : null}
    </div>
  );
}
