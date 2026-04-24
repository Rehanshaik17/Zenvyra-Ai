import React, { useEffect, useRef, useCallback } from 'react';
import type { AuthUser } from '../../infrastructure/api/authApi';
import Sidebar from '../components/Sidebar';
import WelcomeScreen from '../components/WelcomeScreen';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import { useChat } from '../hooks/useChat';

interface ChatPageProps {
  user: AuthUser;
  onLogout: () => void;
}

const ChatPage: React.FC<ChatPageProps> = ({ user, onLogout }) => {
  const {
    conversations,
    activeConversation,
    messages,
    isLoading,
    isStreaming,
    error,
    loadConversations,
    selectConversation,
    startNewConversation,
    removeConversation,
    send,
    setError,
  } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback((content: string) => {
    send(content);
  }, [send]);

  const handleNew = useCallback(async () => {
    await startNewConversation();
  }, [startNewConversation]);

  return (
    <div className="app-shell">
      {/* Ambient FX */}
      <div className="ambient-glow" />
      <div className="scanlines" />

      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeId={activeConversation?._id}
        onNew={handleNew}
        onSelect={selectConversation}
        onDelete={removeConversation}
        userName={user.name}
        userEmail={user.email}
        onLogout={onLogout}
      />

      {/* Main Canvas */}
      <main className="main-canvas">
        {/* Error Banner */}
        {error && (
          <div className="error-banner">
            <span className="material-symbols-outlined">error</span>
            <span>{error}</span>
            <button onClick={() => setError(null)}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="content-area">
          {isLoading ? (
            <div className="loading-state">
              <div className="loading-orb" />
              <p>Loading conversation...</p>
            </div>
          ) : messages.length === 0 ? (
            <WelcomeScreen onPromptClick={handleSend} />
          ) : (
            <div className="messages-list">
              {messages.map((msg, i) => (
                <ChatMessage
                  key={msg._id || `msg-${i}`}
                  message={msg}
                  isStreaming={isStreaming && i === messages.length - 1}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <ChatInput
          onSend={handleSend}
          isStreaming={isStreaming}
          disabled={isLoading}
        />
      </main>
    </div>
  );
};

export default ChatPage;
