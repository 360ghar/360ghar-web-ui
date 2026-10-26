/**
 * The questions the developer answered in the project filing, as a disclosure
 * list. `<details>` needs no JavaScript, keeps the answers in the HTML for
 * search engines, and opens without animation.
 */
import { Icon } from '@/ui/icons/Icon';
import type { Locale } from '@/lib/i18n/locale';
import { text } from './text';
import type { ProjectFaqItem } from './types';

export type ProjectFaqProps = { locale: Locale; items: ProjectFaqItem[]; headingId?: string };

export function ProjectFaq({ locale, items, headingId = 'pj-faq' }: ProjectFaqProps) {
  const t = text(locale);
  const list = (items ?? []).filter((i) => i && (i.question || i.answer));
  if (list.length === 0) return null;

  return (
    <section className="dh-section pj-faq" aria-labelledby={headingId}>
      <h2 id={headingId} className="dh-h2">
        {t.faq}
      </h2>
      <p className="dh-meta mt-2">{t.faqLead}</p>
      <div className="sheet pj-faq-list mt-4">
        {list.map((item, i) => (
          // The filing has no id per question, and the order is the filing order.
          <details className="pj-faq-item" key={i}>
            <summary>
              <span>{item.question}</span>
              <Icon name="chevron-down" size={20} className="pj-faq-mark" />
            </summary>
            <div className="pj-faq-answer">{item.answer}</div>
          </details>
        ))}
      </div>
    </section>
  );
}

export default ProjectFaq;
