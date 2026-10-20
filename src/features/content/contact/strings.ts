import { getT } from '@/i18n';
import type { Locale } from '@/lib/i18n/locale';
import type { ContactStrings } from './ContactForm';

/** Contact form labels from the old translations (forms, policies), plus a few new lines. */
export function contactStrings(locale: Locale): ContactStrings {
  const t = getT(locale);
  const hi = locale === 'hi';
  return {
    name: t('forms:name.labelYourName'),
    nameRequired: t('forms:name.required'),
    email: t('forms:email.labelYourEmail'),
    emailRequired: t('forms:email.required'),
    emailInvalid: t('forms:email.invalidFormat'),
    subject: t('policies:contact.subjectPlaceholder'),
    message: t('forms:message.label'),
    messageShort: t('forms:message.minLength'),
    optional: hi ? '(वैकल्पिक)' : '(optional)',
    send: t('forms:message.sendBtn'),
    sentTitle: hi ? 'संदेश भेज दिया गया' : 'Message sent',
    sentBody: hi ? 'धन्यवाद। हम आपको ईमेल पर जवाब देंगे।' : 'Thank you. We will reply to you by email.',
    again: hi ? 'एक और संदेश भेजें' : 'Send another message',
  };
}
