import { GoogleGenAI } from '@google/genai';
import { IGeminiService } from '../../core/interfaces/IGeminiService';
import { Message } from '../../core/entities/Message';

export class GeminiService implements IGeminiService {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateResponseStream(
    history: Message[],
    newMessage: string,
    onChunk: (chunk: string) => void
  ): Promise<string> {

    // Convert our history to Gemini's format
    const contents = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Add new message
    contents.push({ role: 'user', parts: [{ text: newMessage }] });

    const response = await this.ai.models.generateContentStream({
      model: 'gemini-2.0-flash',
      contents,
    });

    let fullText = '';
    for await (const chunk of response) {
      const chunkText = chunk.text || '';
      if (chunkText) {
        fullText += chunkText;
        onChunk(chunkText);
      }
    }

    return fullText;
  }
}
