import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useChatStore, useAuthStore } from '../../store';
import UserMessage from './messages/UserMessage';
import BotMessage from './messages/BotMessage';
import ChatWidget from './messages/ChatWidget';

const BOT_ICON = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
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

const LOCK_ICON = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

function WelcomeState({ onQuickAction }) {
  const { t } = useTranslation('common');
  const quickActions = [
    { label: t('chatbot.quickSearch'), prompt: 'Help me search for verified properties in Gurugram' },
    { label: t('chatbot.quickVisit'), prompt: 'I want to schedule a property visit' },
    { label: t('chatbot.quickRent'), prompt: 'Show me my rent payment status' },
    { label: t('chatbot.quickMaintenance'), prompt: 'I need to create a maintenance request' },
  ];

  return (
    <div className="chatbot-welcome">
      <div className="chatbot-welcome__icon">{BOT_ICON}</div>
      <h3 className="chatbot-welcome__title">{t('chatbot.title')}</h3>
      <p className="chatbot-welcome__subtitle">
        {t('chatbot.welcomeSubtitle')}
      </p>
      <div className="chatbot-quick-actions">
        {quickActions.map((action) => (
          <button
            key={action.label}
            className="chatbot-quick-action"
            onClick={() => onQuickAction(action.prompt)}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function GuestWelcomeState({ onQuickAction, onLoginClick }) {
  const { t } = useTranslation('common');
  const lockedActions = [
    t('chatbot.quickVisit'),
    t('chatbot.lockedManageProperties'),
    t('chatbot.lockedCheckRent'),
    t('chatbot.quickMaintenance'),
  ];

  return (
    <div className="chatbot-welcome">
      <div className="chatbot-welcome__icon">{BOT_ICON}</div>
      <h3 className="chatbot-welcome__title">{t('chatbot.title')}</h3>
      <p className="chatbot-welcome__subtitle">
        {t('chatbot.guestSubtitle')}
      </p>

      <div className="chatbot-welcome__section">
        <span className="chatbot-welcome__section-label">{t('chatbot.tryNow')}</span>
        <div className="chatbot-quick-actions">
          <button
            className="chatbot-quick-action"
            onClick={() => onQuickAction('Help me search for verified properties in Gurugram')}
          >
            {t('chatbot.quickSearch')}
          </button>
        </div>
      </div>

      <div className="chatbot-welcome__section chatbot-welcome__section--locked">
        <span className="chatbot-welcome__section-label">{t('chatbot.signInToUnlock')}</span>
        <div className="chatbot-quick-actions">
          {lockedActions.map((label) => (
            <button
              key={label}
              className="chatbot-quick-action chatbot-quick-action--locked"
              onClick={onLoginClick}
            >
              {LOCK_ICON}
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ChatMessages() {
  const { t } = useTranslation('common');
  const messages = useChatStore((state) => state.messages);
  const isStreaming = useChatStore((state) => state.isStreaming);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();

  const scrollContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const userScrolledRef = useRef(false);

  // Auto-scroll to bottom when new messages arrive, unless user has scrolled up
  useEffect(() => {
    if (!userScrolledRef.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, isStreaming]);

  // Track if user has manually scrolled up
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    userScrolledRef.current = distanceFromBottom > 100;
  };

  // Filter out internal system/welcome markers
  const displayMessages = messages.filter(
    (m) => !(m.role === 'system' && m.content === 'welcome')
  );
  const showWelcome = displayMessages.length === 0;

  const handleQuickAction = (prompt) => {
    sendMessage(prompt);
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const renderMessage = (message) => {
    switch (message.role) {
      case 'user':
        return <UserMessage key={message.id} message={message} />;
      case 'bot':
        return <BotMessage key={message.id} message={message} />;
      case 'widget':
        return <ChatWidget key={message.id} message={message} />;
      default:
        return null;
    }
  };

  return (
    <div
      className="chatbot-messages"
      ref={scrollContainerRef}
      onScroll={handleScroll}
      role="log"
      aria-live="polite"
      aria-label={t('chatbot.messagesAriaLabel')}
    >
      {showWelcome ? (
        isAuthenticated ? (
          <WelcomeState onQuickAction={handleQuickAction} />
        ) : (
          <GuestWelcomeState
            onQuickAction={handleQuickAction}
            onLoginClick={handleLoginClick}
          />
        )
      ) : (
        <>
          {displayMessages.map(renderMessage)}
          {isStreaming &&
            displayMessages[displayMessages.length - 1]?.role !== 'bot' && (
              <div className="chatbot-msg chatbot-msg--bot chatbot-typing">
                <span className="chatbot-typing__dot" />
                <span className="chatbot-typing__dot" />
                <span className="chatbot-typing__dot" />
              </div>
            )}
        </>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
