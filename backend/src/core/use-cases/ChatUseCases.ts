import { IConversationRepository } from '../interfaces/IConversationRepository';
import { IGeminiService } from '../interfaces/IGeminiService';
import { Conversation } from '../entities/Conversation';
import { Message } from '../entities/Message';

export class ChatUseCases {
  constructor(
    private conversationRepo: IConversationRepository,
    private geminiService: IGeminiService
  ) {}

  async getConversations(userId: string): Promise<Conversation[]> {
    return this.conversationRepo.findAllByUser(userId);
  }

  async getConversation(id: string): Promise<Conversation | null> {
    return this.conversationRepo.findById(id);
  }

  async createConversation(title: string, userId: string): Promise<Conversation> {
    return this.conversationRepo.create(title, userId);
  }

  async deleteConversation(id: string): Promise<void> {
    return this.conversationRepo.delete(id);
  }

  async processMessage(
    conversationId: string,
    content: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const conversation = await this.conversationRepo.findById(conversationId);
    if (!conversation) throw new Error('Conversation not found');

    // 1. Save User Message
    const userMessage: Message = { role: 'user', content };
    await this.conversationRepo.addMessage(conversationId, userMessage);

    // 2. Call Gemini Service to get streaming response
    const assistantContent = await this.geminiService.generateResponseStream(
      conversation.messages,
      content,
      onChunk
    );

    // 3. Save Assistant Message
    const assistantMessage: Message = { role: 'assistant', content: assistantContent };
    await this.conversationRepo.addMessage(conversationId, assistantMessage);
    
    // Update title if it's the first message
    if (conversation.messages.length === 0 && (conversation.title === 'New Chat' || !conversation.title)) {
        const newTitle = content.slice(0, 40) + (content.length > 40 ? '...' : '');
        await this.conversationRepo.updateTitle(conversationId, newTitle);
    }
  }
}
