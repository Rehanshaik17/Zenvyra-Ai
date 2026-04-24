import { IConversationRepository } from '../../../core/interfaces/IConversationRepository';
import { Conversation } from '../../../core/entities/Conversation';
import { Message } from '../../../core/entities/Message';
import { ConversationModel } from '../models/ConversationModel';

export class MongoConversationRepository implements IConversationRepository {
  
  private mapToEntity(doc: any): Conversation {
    return {
      _id: doc._id.toString(),
      title: doc.title,
      messages: doc.messages.map((m: any) => ({
        _id: m._id?.toString(),
        role: m.role,
        content: m.content,
        createdAt: m.createdAt
      })),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }

  async create(title: string, userId?: string): Promise<Conversation> {
    const doc = await ConversationModel.create({ title, userId });
    return this.mapToEntity(doc);
  }

  async findById(id: string): Promise<Conversation | null> {
    const doc = await ConversationModel.findById(id);
    if (!doc) return null;
    return this.mapToEntity(doc);
  }

  async findAllByUser(userId: string): Promise<Conversation[]> {
    const docs = await ConversationModel.find({ userId }).sort({ updatedAt: -1 });
    return docs.map(this.mapToEntity);
  }

  async findAll(): Promise<Conversation[]> {
    const docs = await ConversationModel.find().sort({ updatedAt: -1 });
    return docs.map(this.mapToEntity);
  }

  async delete(id: string): Promise<void> {
    await ConversationModel.findByIdAndDelete(id);
  }

  async addMessage(conversationId: string, message: Message): Promise<Conversation> {
    const doc = await ConversationModel.findByIdAndUpdate(
      conversationId,
      { $push: { messages: message } },
      { returnDocument: 'after' }
    );
    if (!doc) throw new Error('Conversation not found');
    return this.mapToEntity(doc);
  }

  async updateTitle(conversationId: string, title: string): Promise<Conversation> {
    const doc = await ConversationModel.findByIdAndUpdate(
      conversationId,
      { title },
      { returnDocument: 'after' }
    );
    if (!doc) throw new Error('Conversation not found');
    return this.mapToEntity(doc);
  }
}
