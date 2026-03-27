import { useEffect, useRef } from 'react';
import { useChatStore, useAuthStore } from '../../store';
import UserMessage from './messages/UserMessage';
import BotMessage from './messages/BotMessage';
import ChatWidget from './messages/ChatWidget';

function WelcomeState({ onQuickAction }) {
  const quickActions = [
    { label: 'Search Properties', prompt: 'Help me search for verified properties in Gurugram' },
    { label: 'Schedule a Visit', prompt: 'I want to schedule a property visit' },
    { label: 'Check Rent Status', prompt: 'Show me my rent payment status' },
    { label: 'Maintenance Request', prompt: 'I need to create a maintenance request' },
  ];

  return (
    <div className="chatbot-welcome">
      <div className="chatbot-welcome__icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
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
      </div>
      <h3 className="chatbot-welcome__title">360Ghar AI Assistant</h3>
      <p className="chatbot-welcome__subtitle">
        Your expert property guide. Search verified properties, schedule guided walkthroughs, check rent status, and more.
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

export default function ChatMessages() {
  const messages = useChatStore((state) => state.messages);
  const isStreaming = useChatStore((state) => state.isStreaming);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

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
    if (!isAuthenticated) return;
    sendMessage(prompt);
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
      aria-label="Chat messages"
    >
      {showWelcome ? (
        <WelcomeState onQuickAction={handleQuickAction} />
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
