/**
 * Glossary search and A-Z filter. Server-rendered with every term, so the
 * content is in the HTML before (and without) JavaScript.
 */
import { useId, useMemo, useState } from 'react';
import type { Locale } from '@/lib/i18n/locale';
import { Icon } from '@/ui/icons/Icon';
import { IslandBoundary } from '@/ui/react/IslandBoundary';
import type { GlossaryEntry } from './data';
import { ALL, filterGlossary, lettersOf } from './filter';

type Strings = { search: string; placeholder: string; letters: string; all: string; none: string; showing: string; clear: string };
type Props = { locale: Locale; entries: GlossaryEntry[]; s: Strings };

function List({ entries, s }: Props) {
  const id = useId();
  const [query, setQuery] = useState('');
  const [letter, setLetter] = useState(ALL);
  const letters = useMemo(() => [ALL, ...lettersOf(entries)], [entries]);
  const shown = useMemo(() => filterGlossary(entries, query, letter), [entries, query, letter]);

  return (
    <div className="gl">
      <div className="gl-tools">
        <div className="field gl-search">
          <label htmlFor={`${id}-q`} className="field-label">
            {s.search}
          </label>
          <div className="gl-search-box">
            <Icon name="search" size={20} className="gl-search-icon" />
            <input
              id={`${id}-q`}
              type="search"
              className="input"
              placeholder={s.placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
              aria-controls={`${id}-list`}
            />
          </div>
        </div>
        <div className="gl-letters" role="group" aria-label={s.letters}>
          {letters.map((l) => (
            <button key={l} type="button" className="toggle" aria-pressed={letter === l} aria-controls={`${id}-list`} onClick={() => setLetter(l)}>
              {l === ALL ? s.all : l}
            </button>
          ))}
        </div>
        <p className="gl-count" role="status">
          {s.showing.replace('{shown}', String(shown.length)).replace('{total}', String(entries.length))}
        </p>
      </div>

      <div id={`${id}-list`} className="faq-list gl-list" lang="en">
        {shown.map((e) => (
          <details key={e.term} className="faq-item">
            <summary>
              <span className="gl-q">
                <span className="gl-term">{e.term}</span>
                <span className="gl-question">{e.question}</span>
              </span>
              <Icon name="plus" size={18} className="faq-icon" />
            </summary>
            <p>{e.answer}</p>
          </details>
        ))}
      </div>
      {shown.length === 0 ? (
        <div className="gl-empty">
          <p>{s.none}</p>
          <button
            type="button"
            className="btn btn-quiet"
            onClick={() => {
              setQuery('');
              setLetter(ALL);
            }}
          >
            {s.clear}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function Glossary(props: Props) {
  return (
    <IslandBoundary locale={props.locale} compact>
      <List {...props} />
    </IslandBoundary>
  );
}
