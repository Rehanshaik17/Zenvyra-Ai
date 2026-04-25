/**
 * AgentPage — Zenyvra AI Voice Agent Interface
 *
 * Features:
 * - Central animated orb that responds to agent state
 * - Voice input via microphone button
 * - Text input fallback
 * - Live transcript display
 * - Scrollable conversation history
 * - Capability chips showing what the agent can do
 */

import React, { useState, useRef, useEffect } from 'react';
import { useVoiceAgent } from './hooks/useVoiceAgent';
import type { AgentState } from './hooks/useVoiceAgent';

const CAPABILITIES = [
  { icon: 'calendar_month', label: 'Schedule' },
  { icon: 'notifications', label: 'Remind' },
  { icon: 'chat', label: 'Message' },
  { icon: 'call', label: 'Call' },
  { icon: 'search', label: 'Search' },
  { icon: 'book_online', label: 'Book' },
  { icon: 'shopping_cart', label: 'Order' },
  { icon: 'analytics', label: 'Analyze' },
  { icon: 'auto_awesome', label: 'Generate' },
  { icon: 'translate', label: 'Translate' },
  { icon: 'summarize', label: 'Summarize' },
  { icon: 'smart_toy', label: 'Automate' },
  { icon: 'monitor_heart', label: 'Monitor' },
  { icon: 'thumb_up', label: 'Recommend' },
  { icon: 'navigation', label: 'Navigate' },
  { icon: 'package_2', label: 'Track' },
  { icon: 'task_alt', label: 'Manage' },
  { icon: 'school', label: 'Learn' },
  { icon: 'event_note', label: 'Plan' },
  { icon: 'bolt', label: 'Execute' },
];

function getStateLabel(state: AgentState): string {
  switch (state) {
    case 'listening':
      return 'Listening...';
    case 'thinking':
      return 'Processing...';
    case 'speaking':
      return 'Speaking...';
    default:
      return 'Tap the mic to start';
  }
}

function getStateIcon(state: AgentState): string {
  switch (state) {
    case 'listening':
      return 'graphic_eq';
    case 'thinking':
      return 'neurology';
    case 'speaking':
      return 'volume_up';
    default:
      return 'auto_awesome';
  }
}

interface AgentPageProps {
  onBack: () => void;
}

const AgentPage: React.FC<AgentPageProps> = ({ onBack }) => {
  const {
    agentState,
    messages,
    currentTranscript,
    error,
    isSpeechSupported,
    startListening,
    stopListening,
    stopSpeaking,
    sendTextMessage,
    clearConversation,
  } = useVoiceAgent();

  const [textInput, setTextInput] = useState('');
  const [showCapabilities, setShowCapabilities] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Hide capabilities once conversation starts
  useEffect(() => {
    if (messages.length > 0) {
      setShowCapabilities(false);
    }
  }, [messages]);

  const handleMicClick = () => {
    if (agentState === 'listening') {
      stopListening();
    } else if (agentState === 'speaking') {
      stopSpeaking();
    } else if (agentState === 'idle') {
      startListening();
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim() && agentState === 'idle') {
      sendTextMessage(textInput.trim());
      setTextInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit(e);
    }
  };

  return (
    <div className="agent-page">
      {/* Ambient effects */}
      <div className="agent-ambient" />
      <div className="agent-particles" />

      {/* Top Bar */}
      <header className="agent-header">
        <button className="agent-back-btn" onClick={onBack} id="agent-back-btn">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="agent-header-center">
          <span className="agent-header-title">Zenyvra Agent</span>
          <span className={`agent-status-dot ${agentState}`} />
          <span className="agent-status-text">{agentState === 'idle' ? 'Ready' : agentState}</span>
        </div>
        <button
          className="agent-clear-btn"
          onClick={clearConversation}
          title="Clear conversation"
          id="agent-clear-btn"
        >
          <span className="material-symbols-outlined">delete_sweep</span>
        </button>
      </header>

      {/* Main Content */}
      <div className="agent-content">
        {/* Welcome / Capabilities */}
        {showCapabilities && messages.length === 0 && (
          <div className="agent-welcome">
            <div className={`agent-orb ${agentState}`}>
              <div className="agent-orb-ring agent-orb-ring-1" />
              <div className="agent-orb-ring agent-orb-ring-2" />
              <div className="agent-orb-ring agent-orb-ring-3" />
              <div className="agent-orb-glass" />
              <div className="agent-orb-core">
                <span className="material-symbols-outlined agent-orb-icon">
                  {getStateIcon(agentState)}
                </span>
              </div>
            </div>

            <h1 className="agent-headline">
              Hey, I'm <span className="agent-highlight">Zenyvra</span>
            </h1>
            <p className="agent-subtitle">Your intelligent voice assistant. Here's what I can do:</p>

            <div className="agent-capabilities">
              {CAPABILITIES.map((cap) => (
                <button
                  key={cap.label}
                  className="agent-cap-chip"
                  onClick={() => {
                    sendTextMessage(`Help me with ${cap.label.toLowerCase()}`);
                  }}
                  id={`agent-cap-${cap.label.toLowerCase()}`}
                >
                  <span className="material-symbols-outlined">{cap.icon}</span>
                  <span>{cap.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Conversation */}
        {messages.length > 0 && (
          <div className="agent-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`agent-msg agent-msg-${msg.role}`}>
                <div className="agent-msg-avatar">
                  <span className="material-symbols-outlined">
                    {msg.role === 'user' ? 'person' : 'auto_awesome'}
                  </span>
                </div>
                <div className="agent-msg-bubble">
                  <p>{msg.content}</p>
                  <span className="agent-msg-time">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {/* Live transcript while listening */}
            {agentState === 'listening' && currentTranscript && (
              <div className="agent-msg agent-msg-user agent-msg-live">
                <div className="agent-msg-avatar">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <div className="agent-msg-bubble">
                  <p>{currentTranscript}<span className="agent-cursor">|</span></p>
                </div>
              </div>
            )}

            {/* Thinking indicator */}
            {agentState === 'thinking' && (
              <div className="agent-msg agent-msg-assistant">
                <div className="agent-msg-avatar">
                  <span className="material-symbols-outlined">auto_awesome</span>
                </div>
                <div className="agent-msg-bubble agent-thinking-bubble">
                  <div className="agent-thinking-dots">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="agent-error">
          <span className="material-symbols-outlined">warning</span>
          <span>{error}</span>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="agent-controls">
        {/* State label */}
        <div className="agent-state-label">{getStateLabel(agentState)}</div>

        {/* Central Mic Button + Orb (when conversation is active) */}
        {messages.length > 0 && (
          <div className={`agent-mini-orb ${agentState}`}>
            <div className="agent-mini-orb-ring" />
          </div>
        )}

        <div className="agent-controls-row">
          {/* Text input */}
          <form className="agent-text-form" onSubmit={handleTextSubmit}>
            <input
              type="text"
              className="agent-text-input"
              placeholder="Type a message..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={agentState !== 'idle'}
              id="agent-text-input"
            />
          </form>

          {/* Mic button */}
          <button
            className={`agent-mic-btn ${agentState}`}
            onClick={handleMicClick}
            disabled={!isSpeechSupported || agentState === 'thinking'}
            id="agent-mic-btn"
            title={
              agentState === 'listening'
                ? 'Stop listening'
                : agentState === 'speaking'
                ? 'Stop speaking'
                : 'Start listening'
            }
          >
            <div className="agent-mic-ripple" />
            <div className="agent-mic-ripple agent-mic-ripple-2" />
            <span className="material-symbols-outlined">
              {agentState === 'listening'
                ? 'stop'
                : agentState === 'speaking'
                ? 'stop_circle'
                : 'mic'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentPage;
