import { useChatStore } from '../../store';

const BotIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="10" rx="2"></rect>
    <circle cx="12" cy="5" r="2"></circle>
    <path d="M12 7v4"></path>
    <line x1="8" y1="16" x2="8" y2="16"></line>
    <line x1="16" y1="16" x2="16" y2="16"></line>
  </svg>
);

const RefreshIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="23 4 23 10 17 10"></polyline>
    <polyline points="1 20 1 14 7 14"></polyline>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
  </svg>
);

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
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

function ChatHeader() {
  const isStreaming = useChatStore((state) => state.isStreaming);
  const toggleChat = useChatStore((state) => state.toggleChat);
  const resetChat = useChatStore((state) => state.resetChat);

  return (
    <div className="chatbot-header">
      <div className="chatbot-header__left">
        <div className="chatbot-header__avatar">
          <BotIcon />
        </div>
        <span className="chatbot-header__title">360Ghar AI Assistant</span>
      </div>

      <div className="chatbot-header__center">
        {isStreaming ? (
          <>
            <span className="chatbot-header__status-dot chatbot-header__status-dot--streaming"></span>
            <span>Thinking...</span>
          </>
        ) : (
          <>
            <span className="chatbot-header__status-dot"></span>
            <span>Online</span>
          </>
        )}
      </div>

      <div className="chatbot-header__right">
        <button
          className="chatbot-header__btn chatbot-header__btn--reset"
          onClick={resetChat}
          title="Start new conversation"
          aria-label="Start new conversation"
        >
          <RefreshIcon />
        </button>
        <button
          className="chatbot-header__btn chatbot-header__btn--close"
          onClick={toggleChat}
          aria-label="Close chat"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}

export default ChatHeader;
