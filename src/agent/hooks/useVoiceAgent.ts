/**
 * useVoiceAgent — Custom hook for the Zenyvra AI Voice Agent
 *
 * Manages:
 * - Speech Recognition (STT) via Web Speech API
 * - Speech Synthesis (TTS) via Web Speech API
 * - Conversation history & API communication
 * - Agent state machine (idle, listening, thinking, speaking)
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import env from '../../infrastructure/config/env';
import { getToken } from '../../infrastructure/api/authApi';

export type AgentState = 'idle' | 'listening' | 'thinking' | 'speaking';

export interface AgentMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolsUsed?: string[];
}

// ─── SpeechRecognition type shim ──────────────────────────────────
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export function useVoiceAgent() {
  const [agentState, setAgentState] = useState<AgentState>('idle');
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const historyRef = useRef<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const isListeningRef = useRef(false);

  // Check browser support
  useEffect(() => {
    const SpeechRecognitionCtor =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      setIsSpeechSupported(false);
      setError('Speech recognition is not supported in this browser. Please use Chrome.');
    }
  }, []);

  // ── Send message to backend agent ───────────────────────────────
  const sendToAgent = useCallback(async (text: string): Promise<string> => {
    const token = getToken();
    const res = await fetch(`${env.API_BASE_URL}/agent/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        message: text,
        history: historyRef.current,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Agent request failed');
    }

    const data = await res.json();
    return data.reply;
  }, []);

  // ── Text-to-Speech ────────────────────────────────────────────
  const speak = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Try to use a natural-sounding voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) =>
          v.name.includes('Google') ||
          v.name.includes('Samantha') ||
          v.name.includes('Alex') ||
          v.name.includes('Natural')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => {
        synthRef.current = null;
        resolve();
      };

      utterance.onerror = () => {
        synthRef.current = null;
        resolve();
      };

      synthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    });
  }, []);

  // ── Process a user message (text or voice) ──────────────────────
  const processUserMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      // Add user message
      const userMsg: AgentMessage = {
        role: 'user',
        content: text.trim(),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      historyRef.current.push({ role: 'user', content: text.trim() });

      // Think
      setAgentState('thinking');
      setError(null);

      try {
        const reply = await sendToAgent(text.trim());

        // Add assistant reply
        const assistantMsg: AgentMessage = {
          role: 'assistant',
          content: reply,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        historyRef.current.push({ role: 'assistant', content: reply });

        // Speak the reply
        setAgentState('speaking');
        await speak(reply);
        setAgentState('idle');
      } catch (err: any) {
        console.error('[Agent] Error:', err);
        setError(err.message || 'Something went wrong');
        setAgentState('idle');
      }
    },
    [sendToAgent, speak]
  );

  // ── Start Listening ────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (!isSpeechSupported) return;
    if (isListeningRef.current) return;

    const SpeechRecognitionCtor =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      isListeningRef.current = true;
      setAgentState('listening');
      setCurrentTranscript('');
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      setCurrentTranscript(finalTranscript || interimTranscript);

      if (finalTranscript) {
        processUserMessage(finalTranscript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('[Speech] Error:', event.error);
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setError(`Speech error: ${event.error}`);
      }
      isListeningRef.current = false;
      setAgentState('idle');
    };

    recognition.onend = () => {
      isListeningRef.current = false;
      if (agentState === 'listening') {
        setAgentState('idle');
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSpeechSupported, agentState, processUserMessage]);

  // ── Stop Listening ─────────────────────────────────────────────
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    isListeningRef.current = false;
  }, []);

  // ── Stop Speaking ──────────────────────────────────────────────
  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    synthRef.current = null;
    setAgentState('idle');
  }, []);

  // ── Send text message (for keyboard input) ─────────────────────
  const sendTextMessage = useCallback(
    (text: string) => {
      processUserMessage(text);
    },
    [processUserMessage]
  );

  // ── Clear conversation ─────────────────────────────────────────
  const clearConversation = useCallback(() => {
    setMessages([]);
    historyRef.current = [];
    setError(null);
    setCurrentTranscript('');
    stopSpeaking();
    stopListening();
    setAgentState('idle');
  }, [stopSpeaking, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
      stopSpeaking();
    };
  }, [stopListening, stopSpeaking]);

  return {
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
  };
}
