import { ChatMessage, MessageSearchParams } from '../types/communication.types';

export const filterMessages = (messages: ChatMessage[], params: MessageSearchParams) => {
  return messages.filter((message) => {
    if (params.chatId && message.chatId !== params.chatId) {
      return false;
    }

    if (params.authorId && message.author.id !== params.authorId) {
      return false;
    }

    if (params.query) {
      const query = params.query.toLowerCase();
      if (!message.content.toLowerCase().includes(query)) {
        return false;
      }
    }

    return true;
  });
};

export const groupMessagesByDate = (messages: ChatMessage[]): Record<string, ChatMessage[]> => {
  return messages.reduce<Record<string, ChatMessage[]>>((acc, message) => {
    const date = new Date(message.createdAt).toLocaleDateString();
    acc[date] = acc[date] ? [...acc[date], message] : [message];
    return acc;
  }, {});
};
