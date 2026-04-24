import { Message } from './Message';

export interface Conversation {
  _id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}
