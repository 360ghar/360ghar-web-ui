import { useEffect, useId, useRef, useState } from 'react';
import { resolvePlace, suggestPlaces, type Place, type PlaceHit } from '@/lib/maps';
import { Icon } from '@/ui/icons/Icon';

type Props = {
  name: string;
  label: string;
  placeholder: string;
  defaultValue?: string;
  onPlace: (place: Place | null) => void;
  /** Text changes when no place is picked (used as a keyword search). */
  onText?: (text: string) => void;
  className?: string;
  inputClassName?: string;
};

/**
 * Place search with the ARIA 1.2 combobox pattern. Without JavaScript, or
 * without a Maps key, it is a plain text field and the form still submits.
 */
export function PlacesInput({ name, label, placeholder, defaultValue = '', onPlace, onText, className = '', inputClassName = '' }: Props) {
  const id = useId();
  const [value, setValue] = useState(defaultValue);
  const [hits, setHits] = useState<PlaceHit[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [failed, setFailed] = useState(false);
  const timer = useRef<number>(0);
  const seq = useRef(0);
  const pickSeq = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // The parent reset its filters: show the new default, but never while the user is typing.
  useEffect(() => {
    if (document.activeElement !== inputRef.current) setValue(defaultValue);
  }, [defaultValue]);

  const search = (text: string) => {
    window.clearTimeout(timer.current);
    seq.current++; // Drop any suggestion request for the previous text.
    setHits([]);
    if (failed || text.trim().length < 2) {
      setHits([]);
      setOpen(false);
      return;
    }
    timer.current = window.setTimeout(async () => {
      const n = ++seq.current;
      try {
        const res = await suggestPlaces(text);
        if (n !== seq.current) return;
        setHits(res);
        setOpen(res.length > 0);
        setActive(-1);
      } catch {
        setFailed(true); // No key or network: stay a plain text field.
      }
    }, 250);
  };

  const pick = async (hit: PlaceHit) => {
    setValue(hit.main);
    setOpen(false);
    const n = ++pickSeq.current;
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
        onChange={(e) => {
          pickSeq.current++;
          setValue(e.target.value);
          onText?.(e.target.value);
          onPlace(null);
          search(e.target.value);
        }}
        onKeyDown={(e) => {
          if (!open) return;
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive((a) => Math.min(hits.length - 1, a + 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((a) => Math.max(0, a - 1));
          } else if (e.key === 'Enter' && active >= 0) {
            e.preventDefault();
            void pick(hits[active]!);
          } else if (e.key === 'Escape') {
            setOpen(false);
          }
        }}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
      />
      {open ? (
        <ul id={`${id}-list`} role="listbox" aria-label={label} className="places-list">
          {hits.map((h, i) => (
            <li
              key={h.id}
              id={`${id}-o${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault();
                void pick(h);
              }}
            >
              <Icon name="pin" size={16} />
              <span className="grid min-w-0">
                <span className="truncate font-semibold">{h.main}</span>
                {h.secondary ? <span className="truncate text-sm text-ink-600">{h.secondary}</span> : null}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
