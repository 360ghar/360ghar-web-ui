import { useChatStore } from '../../store';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import GuestLoginBanner from './messages/GuestLoginBanner';

function ChatPanel({ isAuthenticated }) {
  const isOpen = useChatStore((state) => state.isOpen);

  return (
    <div
      className={`chatbot-panel${isOpen ? ' chatbot-panel--open' : ''}`}
      role="dialog"
      aria-label="Chat with 360Ghar AI assistant"
      aria-modal="true"
      aria-hidden={!isOpen}
      style={{ zIndex: 9998 }}
    >
      <ChatHeader />
      <ChatMessages />
      {!isAuthenticated && <GuestLoginBanner />}
      <ChatInput />
    </div>
  );
}

export default ChatPanel;
