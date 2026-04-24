import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Message } from '../../infrastructure/api/chatApi';

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

const CodeBlock = ({ language, children }: { language: string; children: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-block-lang">{language || 'code'}</span>
        <button className="code-copy-btn" onClick={handleCopy}>
          <span className="material-symbols-outlined">
            {copied ? 'check' : 'content_copy'}
          </span>
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language || 'text'}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: '0 0 10px 10px',
          fontSize: '13px',
          lineHeight: '1.6',
          background: '#0d0d19',
        }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isStreaming }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`message-row ${isUser ? 'user-row' : 'assistant-row'} message-animate`}>
      {!isUser && (
        <div className="assistant-avatar">
          <span className="material-symbols-outlined">smart_toy</span>
        </div>
      )}
      <div className={`message-bubble ${isUser ? 'user-bubble' : 'assistant-bubble'}`}>
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <div className="markdown-body">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const codeString = String(children).replace(/\n$/, '');

                  // Check if it's an inline code or block code
                  if (match) {
                    return <CodeBlock language={match[1]} children={codeString} />;
                  }

                  // Inline code
                  return (
                    <code className="inline-code" {...props}>
                      {children}
                    </code>
                  );
                },
                pre({ children }) {
                  return <>{children}</>;
                },
                a({ href, children }) {
                  return (
                    <a href={href} target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
        {isStreaming && !isUser && (
          <span className="streaming-cursor">▋</span>
        )}
      </div>
      {isUser && (
        <div className="user-avatar">
          <span className="material-symbols-outlined">account_circle</span>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
