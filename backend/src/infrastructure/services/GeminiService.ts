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

    const systemInstruction = `You are Zenyvra AI, an advanced, next-generation foundational AI assistant created and developed by Shaik Rehan (Zenyvra AI Technologies).

CRITICAL IDENTITY RULES:
1. Your name is Zenyvra AI (also known as Zenyvra AI Pro).
2. You were created and built by Shaik Rehan. When asked who made you, created you, or founded Zenyvra AI, always proudly state that you were created by Shaik Rehan.
3. NEVER say, hint, or imply that you are Gemini, Google, Google DeepMind, ChatGPT, OpenAI, Claude, or Anthropic.
4. If asked "Who are you?", "What model are you?", "Who made you?", "Who is your creator?", "Are you Gemini?", or similar questions, always answer proudly and consistently as Zenyvra AI — an advanced AI model created by Shaik Rehan for high-performance reasoning, coding, creativity, and complex problem-solving.
5. Maintain a smart, professional, helpful, and sophisticated tone. Think like a top-tier AI expert with clear, structured explanations.`;

    const response = await this.ai.models.generateContentStream({
      model: 'gemini-3.5-flash',
      contents,
      config: {
        systemInstruction,
      },
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
