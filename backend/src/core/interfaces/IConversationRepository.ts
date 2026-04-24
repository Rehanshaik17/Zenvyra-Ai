import { Conversation } from '../entities/Conversation';
import { Message } from '../entities/Message';

export interface IConversationRepository {
  create(title: string, userId?: string): Promise<Conversation>;
  findById(id: string): Promise<Conversation | null>;
  findAll(): Promise<Conversation[]>;
  findAllByUser(userId: string): Promise<Conversation[]>;
  delete(id: string): Promise<void>;
  addMessage(conversationId: string, message: Message): Promise<Conversation>;
  updateTitle(conversationId: string, title: string): Promise<Conversation>;
}
