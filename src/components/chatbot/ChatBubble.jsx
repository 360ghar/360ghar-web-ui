import { useTranslation } from 'react-i18next';
import { useChatStore } from '../../store';

const ChatIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const XIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

function ChatBubble() {
  const { t } = useTranslation('common');
  const isOpen = useChatStore((state) => state.isOpen);
  const toggleChat = useChatStore((state) => state.toggleChat);

  return (
    <button
      id="chatbot-bubble"
      className={`chatbot-bubble${isOpen ? ' chatbot-bubble--open' : ''}`}
      onClick={toggleChat}
      aria-label={isOpen ? t('chatbot.closeAssistant') : t('chatbot.openAssistant')}
      aria-expanded={isOpen}
      aria-haspopup="dialog"
      style={{ zIndex: 9999 }}
    >
      {isOpen ? <XIcon /> : <ChatIcon />}
    </button>
  );
}

export default ChatBubble;
