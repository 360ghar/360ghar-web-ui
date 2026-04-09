import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useChatStore } from '../../store';

const MAX_LENGTH = 4000;
const WARN_LENGTH = 3500;

function SendIcon() {
  return (
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
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  );
}

function StopIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    </svg>
  );
}

export default function ChatInput() {
  const { t } = useTranslation('common');
  const [text, setText] = useState('');
  const isStreaming = useChatStore((state) => state.isStreaming);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const cancelStream = useChatStore((state) => state.cancelStream);
  const textareaRef = useRef(null);

  // Auto-resize textarea up to 4 lines
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    const maxHeight = 4 * 24 + 32; // 4 lines × line-height + padding
    textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + 'px';
  }, [text]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;
    sendMessage(trimmed);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const showCharCount = text.length > WARN_LENGTH;
  const isAtLimit = text.length >= MAX_LENGTH;

  return (
    <div className="chatbot-input-area">
      <div className="chatbot-input-wrapper">
        <textarea
          ref={textareaRef}
          className="chatbot-input__textarea"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_LENGTH))}
          onKeyDown={handleKeyDown}
          placeholder={t('chatbot.placeholder')}
          rows={1}
          aria-label={t('chatbot.typeMessage')}
          aria-multiline="true"
          maxLength={MAX_LENGTH}
        />
        <button
          className={`chatbot-input__send${isStreaming ? ' chatbot-input__send--stop' : ''}`}
          onClick={isStreaming ? cancelStream : handleSend}
          disabled={!isStreaming && !text.trim()}
          aria-label={isStreaming ? t('chatbot.stopGenerating') : t('chatbot.sendMessage')}
          title={isStreaming ? t('chatbot.stopGenerating') : t('chatbot.sendMessage')}
        >
          {isStreaming ? <StopIcon /> : <SendIcon />}
        </button>
      </div>
      {showCharCount && (
        <div
          className={`chatbot-input__char-count${isAtLimit ? ' chatbot-input__char-count--limit' : ''}`}
        >
          {text.length}/{MAX_LENGTH}
        </div>
      )}
    </div>
  );
}
