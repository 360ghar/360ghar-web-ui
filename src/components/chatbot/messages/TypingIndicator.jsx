import { useTranslation } from 'react-i18next';

export default function TypingIndicator() {
  const { t } = useTranslation('common');
  return (
    <div className="chatbot-typing" role="status" aria-label={t('chatbot.typingAriaLabel')}>
      <span className="chatbot-typing__dot" />
      <span className="chatbot-typing__dot" />
      <span className="chatbot-typing__dot" />
    </div>
  );
}
