import env from '../config/env';
import { authHeaders } from './authApi';

export interface Message {
  _id?: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
}

export interface Conversation {
  _id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

// ── Conversations ──────────────────────────────────────────────
export const fetchConversations = async (): Promise<Conversation[]> => {
  const res = await fetch(`${env.API_BASE_URL}/conversations`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch conversations');
  return res.json();
};

export const fetchConversation = async (id: string): Promise<Conversation> => {
  const res = await fetch(`${env.API_BASE_URL}/conversations/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch conversation');
  return res.json();
};

export const createConversation = async (title?: string): Promise<Conversation> => {
  const res = await fetch(`${env.API_BASE_URL}/conversations`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ title: title || 'New Chat' }),
  });
  if (!res.ok) throw new Error('Failed to create conversation');
  return res.json();
};

export const deleteConversation = async (id: string): Promise<void> => {
  const res = await fetch(`${env.API_BASE_URL}/conversations/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete conversation');
};

// ── Messages (Streaming) ───────────────────────────────────────
export const sendMessage = async (
  conversationId: string,
  content: string,
  onChunk: (chunk: string) => void,
  onDone: () => void,
  onError: (err: Error) => void
): Promise<void> => {
  try {
    const res = await fetch(`${env.API_BASE_URL}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ content }),
    });

    if (!res.ok) throw new Error('Failed to send message');
    if (!res.body) throw new Error('No response body');

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const raw = line.slice(6).trim();
          if (raw === '[DONE]') { onDone(); return; }
          try {
            const parsed = JSON.parse(raw);
            if (parsed.content) onChunk(parsed.content);
          } catch {
            if (raw) onChunk(raw);
          }
        }
      }
    }
    onDone();
  } catch (err) {
    onError(err instanceof Error ? err : new Error('Unknown error'));
  }
};
