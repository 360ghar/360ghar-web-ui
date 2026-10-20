import { useRef, useState } from 'react';
import type { Locale } from '@/lib/i18n/locale';
import { Icon } from '@/ui/icons/Icon';
import { locationCopy } from './copy';
import { useLocationStore } from './store';

/**
 * Inline notice after the browser could not give a location and the search
 * fell back to central Gurugram. A polite status, closed with one button;
 * nothing pops up and nothing moves.
 */
export function LocationNotice({ locale, className = '' }: { locale: Locale; className?: string }) {
  const c = locationCopy(locale);
  const reason = useLocationStore((s) => (s.status === 'fallback' && !s.dismissed ? s.reason : null));
  const dismiss = useLocationStore((s) => s.dismiss);
  if (!reason) return null;
  return (
    <div role="status" className={`flex items-start gap-2 rounded-[var(--radius-sm)] bg-mist-50 py-1 pl-3 pr-1 text-sm text-ink-800 ${className}`}>
      <Icon name="info" size={18} className="mt-3 shrink-0 text-ink-600" />
      <p className="grow py-2.5">
        {c.reason[reason]} {c.how}
      </p>
      <button type="button" className="btn btn-quiet btn-icon shrink-0" aria-label={c.dismiss} onClick={dismiss}>
        <Icon name="close" size={16} />
      </button>
    </div>
  );
}

/**
 * The control to forget the saved location. It shows only while one is saved.
 * After a click it says so, and keeps focus on that message.
 */
export function ForgetLocation({ locale, className = 'btn btn-quiet' }: { locale: Locale; className?: string }) {
  const c = locationCopy(locale);
  const saved = useLocationStore((s) => s.fix !== null);
  const clear = useLocationStore((s) => s.clear);
  const [done, setDone] = useState(false);
  const note = useRef<HTMLParagraphElement>(null);
  if (done && !saved)
    return (
      <p ref={note} tabIndex={-1} role="status" className="px-2 text-sm text-ink-600">
        {c.forgotten}
      </p>
    );
  if (!saved) return null;
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        clear();
        setDone(true);
        window.setTimeout(() => note.current?.focus(), 0);
      }}
    >
      <Icon name="close" size={16} />
      {c.forget}
    </button>
  );
}
