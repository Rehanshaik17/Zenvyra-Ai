import React, { useState, useRef, useCallback, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (content: string) => void;
  isStreaming: boolean;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, isStreaming, disabled }) => {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || isStreaming || disabled) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [value, isStreaming, disabled, onSend]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 200) + 'px';
    }
  };

  return (
    <div className="input-bar-wrap">
      <div className="input-bar-gradient" />
      <div className="input-bar-inner">
        <div className="input-container">
          {/* Left Actions */}
          <div className="input-left-actions">
            <button
              className="icon-btn"
              title="Attach file"
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="material-symbols-outlined">attach_file</span>
            </button>
            <input ref={fileInputRef} type="file" hidden multiple accept="image/*,.pdf,.txt,.csv" />
            <button className="icon-btn" title="Upload image">
              <span className="material-symbols-outlined">image</span>
            </button>
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            placeholder="Initialize command sequence..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            rows={1}
            disabled={disabled}
          />

          {/* Send Button */}
          <button
            className={`send-btn ${isStreaming ? 'streaming' : ''}`}
            onClick={isStreaming ? undefined : handleSend}
            title={isStreaming ? 'Generating...' : 'Send'}
            disabled={(!value.trim() && !isStreaming) || disabled}
          >
            {isStreaming ? (
              <span className="material-symbols-outlined">stop_circle</span>
            ) : (
              <span className="material-symbols-outlined">send</span>
            )}
          </button>
        </div>

        <p className="input-disclaimer">
          Zenyvra AI may hallucinate data protocols. Verify critical outputs.
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
