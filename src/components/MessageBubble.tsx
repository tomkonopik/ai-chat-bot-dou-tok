export type Role = 'user' | 'ai';

interface MessageBubbleProps {
  role: Role;
  text: string;
  isTyping?: boolean;
}

export function MessageBubble({ role, text, isTyping }: MessageBubbleProps) {
  return (
    <div className={`message-wrapper ${role} animate-fade-in`}>
      <div className="message">
        {isTyping ? (
          <div className="typing-indicator" aria-label="AI is typing">
            <span className="typing-dot"></span>
            <span className="typing-dot"></span>
            <span className="typing-dot"></span>
          </div>
        ) : (
          <p style={{ whiteSpace: 'pre-wrap' }}>{text}</p>
        )}
      </div>
    </div>
  );
}
