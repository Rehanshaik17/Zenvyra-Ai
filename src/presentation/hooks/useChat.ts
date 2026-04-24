import { useState, useCallback, useRef } from 'react';
import type { Message, Conversation } from '../../infrastructure/api/chatApi';
import {
  fetchConversations,
  fetchConversation,
  createConversation,
  deleteConversation,
  sendMessage,
} from '../../infrastructure/api/chatApi';

export const useChat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamingMessageRef = useRef('');

  // ── Load all conversations ─────────────────────────────────
  const loadConversations = useCallback(async () => {
    try {
      const data = await fetchConversations();
      setConversations(data);
    } catch (err) {
      setError('Failed to load conversations');
    }
  }, []);

  // ── Select / load a conversation ──────────────────────────
  const selectConversation = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      const conv = await fetchConversation(id);
      setActiveConversation(conv);
      setMessages(conv.messages);
    } catch {
      setError('Failed to load conversation');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Start a new conversation ───────────────────────────────
  const startNewConversation = useCallback(async () => {
    try {
      const conv = await createConversation('New Chat');
      setConversations((prev) => [conv, ...prev]);
      setActiveConversation(conv);
      setMessages([]);
      return conv;
    } catch {
      setError('Failed to create conversation');
      return null;
    }
  }, []);

  // ── Delete a conversation ──────────────────────────────────
  const removeConversation = useCallback(async (id: string) => {
    try {
      await deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c._id !== id));
      if (activeConversation?._id === id) {
        setActiveConversation(null);
        setMessages([]);
      }
    } catch {
      setError('Failed to delete conversation');
    }
  }, [activeConversation]);

  // ── Send a message ─────────────────────────────────────────
  const send = useCallback(async (content: string) => {
    if (!content.trim() || isStreaming) return;

    let convId = activeConversation?._id;

    // Auto-create conversation if none selected
    if (!convId) {
      const conv = await startNewConversation();
      if (!conv) return;
      convId = conv._id;
    }

    // Optimistically add user message
    const userMsg: Message = { role: 'user', content, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);

    // Placeholder for assistant streaming
    const assistantPlaceholder: Message = { role: 'assistant', content: '', createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, assistantPlaceholder]);
    streamingMessageRef.current = '';
    setIsStreaming(true);
    setError(null);

    await sendMessage(
      convId,
      content,
      (chunk) => {
        streamingMessageRef.current += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: streamingMessageRef.current,
          };
          return updated;
        });
      },
      () => {
        setIsStreaming(false);
        // Update conversation title from first message
        if (!activeConversation?.title || activeConversation.title === 'New Chat') {
          const title = content.slice(0, 40) + (content.length > 40 ? '...' : '');
          setConversations((prev) =>
            prev.map((c) => (c._id === convId ? { ...c, title } : c))
          );
        }
      },
      (err) => {
        setIsStreaming(false);
        setError(err.message);
        setMessages((prev) => prev.slice(0, -1)); // remove placeholder
      }
    );
  }, [activeConversation, isStreaming, startNewConversation]);

  return {
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
  };
};
