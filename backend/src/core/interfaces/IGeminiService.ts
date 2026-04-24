import { Message } from '../entities/Message';

export interface IGeminiService {
  generateResponseStream(
    history: Message[],
    newMessage: string,
    onChunk: (chunk: string) => void
  ): Promise<string>;
}
