import type { Locale } from '@/lib/i18n/locale';
import { Icon } from '@/ui/icons/Icon';
import { renderMarkdown } from './markdown';
import type { Message } from './store';
import { WidgetView } from './WidgetViews';

/** One message: the person's text, or the assistant's tool steps, reply, widgets and error. */
export function Bubble({ m, locale, t }: { m: Message; locale: Locale; t: (k: string) => string }) {
  if (m.role === 'user') return <p className="chat-user">{m.text}</p>;
  const busy = m.tools.some((x) => !x.done);
  return (
    <div className="chat-bot">
      {m.tools.length ? (
        <ul className="chat-tools">
          {m.tools.map((x) => (
            <li key={x.id} data-done={x.done || undefined}>
              <Icon name={x.done ? (x.ok === false ? 'alert' : 'check') : 'clock'} size={14} />
              {x.tool.replace(/_/g, ' ')}
            </li>
          ))}
        </ul>
      ) : null}
      {m.text ? (
        // Escaped by renderMarkdown before any tag is added.
        <div className="chat-md" dangerouslySetInnerHTML={{ __html: renderMarkdown(m.text) }} />
      ) : !m.error ? (
        <p className="chat-typing" aria-label={t('typingAriaLabel')}>
          <span />
          <span />
          <span />
        </p>
      ) : null}
      {m.widgets.map((w, i) => (
        <WidgetView key={i} widget={w} locale={locale} />
      ))}
      {m.error ? <p className="chat-error">{m.error}</p> : null}
      {busy ? <span className="visually-hidden">{t('thinking')}</span> : null}
    </div>
  );
}
