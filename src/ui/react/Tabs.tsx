import { useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

type Tab = { id: string; label: ReactNode; panel: ReactNode };

/**
 * Tabs with the ARIA tabs pattern (arrow keys, Home, End). The active tab is
 * marked by a paper strip that slides under it.
 */
export function Tabs({ tabs, value, onChange, label }: { tabs: Tab[]; value: string; onChange: (id: string) => void; label: string }) {
  const base = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const [bar, setBar] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-tab="${value}"]`);
    if (el) setBar({ left: el.offsetLeft, width: el.offsetWidth });
    listRef.current?.setAttribute('data-live', '');
  }, [value, tabs.length]);

  const onKey = (e: KeyboardEvent) => {
    const i = tabs.findIndex((t) => t.id === value);
    let n = i;
    if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') n = 0;
    else if (e.key === 'End') n = tabs.length - 1;
    else return;
    e.preventDefault();
    const id = tabs[n]!.id;
    onChange(id);
    listRef.current?.querySelector<HTMLElement>(`[data-tab="${id}"]`)?.focus();
  };

  return (
    <div>
      <div ref={listRef} role="tablist" aria-label={label} className="tabs-list">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            data-tab={t.id}
            id={`${base}-t-${t.id}`}
            aria-controls={`${base}-p-${t.id}`}
            aria-selected={t.id === value}
            tabIndex={t.id === value ? 0 : -1}
            className="tabs-tab"
            onClick={() => onChange(t.id)}
            onKeyDown={onKey}
          >
            {t.label}
          </button>
        ))}
        <span className="tabs-bar" aria-hidden="true" style={{ transform: `translateX(${bar.left}px)`, width: bar.width }} />
      </div>
      {tabs.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`${base}-p-${t.id}`}
          aria-labelledby={`${base}-t-${t.id}`}
          hidden={t.id !== value}
          tabIndex={0}
          className="pt-5 focus-visible:outline-offset-4"
        >
          {t.panel}
        </div>
      ))}
    </div>
  );
}
