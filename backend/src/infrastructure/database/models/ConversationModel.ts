import mongoose, { Schema, Document } from 'mongoose';
import { Conversation } from '../../../core/entities/Conversation';

export interface ConversationDocument extends Omit<Conversation, '_id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const MessageSchema = new Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const ConversationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, default: 'New Chat' },
  messages: [MessageSchema]
}, { timestamps: true });

export const ConversationModel = mongoose.model<ConversationDocument>('Conversation', ConversationSchema);
