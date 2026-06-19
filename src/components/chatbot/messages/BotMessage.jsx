import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTranslation } from 'react-i18next';
import ToolChip from './ToolChip';
import TypingIndicator from './TypingIndicator';

export default function BotMessage({ message }) {
  const { t } = useTranslation('common');
  const hasContent = message.content && message.content.length > 0;
  const hasToolCalls = message.toolCalls && message.toolCalls.length > 0;

  return (
    <div className={`chatbot-msg chatbot-msg--bot${message.isError ? ' chatbot-msg--error' : ''}`}>
      <div className="chatbot-msg__avatar">
        {/* Simple bot icon */}
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="10" rx="2"></rect>
          <circle cx="12" cy="5" r="2"></circle>
          <path d="M12 7v4"></path>
          <line x1="8" y1="16" x2="8" y2="16"></line>
          <line x1="16" y1="16" x2="16" y2="16"></line>
        </svg>
      </div>
      <div className="chatbot-msg__content">
        {/* Tool chips appear above the text */}
        {hasToolCalls && (
          <div className="chatbot-msg__tool-calls">
            {message.toolCalls.map((tc) => (
              <ToolChip key={tc.callId} toolCall={tc} />
            ))}
          </div>
        )}

        {/* Show typing indicator if no content yet */}
        {!hasContent && message.isStreaming && <TypingIndicator />}

        {/* Markdown content */}
        {hasContent && (
          <div className={`chatbot-msg__markdown${message.isStreaming ? ' chatbot-msg__markdown--streaming' : ''}`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
            {message.isStreaming && <span className="chatbot-cursor" aria-hidden="true">▋</span>}
          </div>
        )}

        {/* Error state */}
        {message.isError && !hasContent && (
          <p className="chatbot-msg__error-text">
            {t('chatbot.errorMessage')}
          </p>
        )}
      </div>
    </div>
  );
}
