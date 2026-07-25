import { useCallback, useEffect, useMemo, useState } from 'react';
import { chatService } from '../services/chat.service';
import { ChatMessage, ChatParticipant, ChatThread } from '../types/communication.types';
import { useWebSocket } from './useWebSocket';

export const useMessages = () => {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeChatId, setActiveChatId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const loadThreads = useCallback(async () => {
    const data = await chatService.fetchThreads();
    setThreads(data);
    if (!activeChatId && data.length) {
      setActiveChatId(data[0].id);
    }
  }, [activeChatId]);

  const loadMessages = useCallback(async (chatId: string) => {
    const data = await chatService.fetchMessages(chatId);
    setMessages(data);
  }, []);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    if (activeChatId) {
      loadMessages(activeChatId);
    }
  }, [activeChatId, loadMessages]);

  useWebSocket({
    channel: 'internal-messenger',
    events: {
      message: (payload) => {
        const message = payload as ChatMessage;
        if (message.chatId === activeChatId) {
          setMessages((prev) => [...prev, message]);
        }
      },
      typing: (payload) => {
        const { chatId, userId } = payload as { chatId: string; userId: string };
        if (chatId === activeChatId) {
          setTypingUsers((prev) => Array.from(new Set([...prev, userId])));
          setTimeout(() => setTypingUsers((prev) => prev.filter((id) => id !== userId)), 1500);
        }
      }
    }
  });

  const sendMessage = useCallback(
    async (content: string, author: ChatParticipant) => {
      if (!activeChatId) return null;
      const newMessage = await chatService.sendMessage(activeChatId, author, content);
      setMessages((prev) => [...prev, newMessage]);
      setTypingUsers((prev) => prev.filter((id) => id !== author.id));
      return newMessage;
    },
    [activeChatId]
  );

  const markTyping = useCallback(
    async (authorId: string) => {
      if (!activeChatId) return;
      setTypingUsers((prev) => Array.from(new Set([...prev, authorId])));
      await chatService.updateTypingStatus();
      setTimeout(() => setTypingUsers((prev) => prev.filter((id) => id !== authorId)), 1000);
    },
    [activeChatId]
  );

  const activeThread = useMemo(
    () => threads.find((thread) => thread.id === activeChatId),
    [threads, activeChatId]
  );

  return {
    threads,
    activeThread,
    setActiveChatId,
    activeChatId,
    messages,
    typingUsers,
    sendMessage,
    markTyping,
    refreshThreads: loadThreads
  };
};
