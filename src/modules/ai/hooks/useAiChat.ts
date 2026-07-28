import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import type { ChatMessage } from '../types/ai.types';
import { askAssistant } from '../services/ai.service';

const initialMessage: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: 'Hello! I am YadroOS AI Advisor. Ask about clients, employees, or finances — and I will generate the needed insight.',
  timestamp: Date.now()
};

export const useAiChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [pending, setPending] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<ChatMessage | null>(null);

  const sendMessage = async (content: string) => {
    if (!content.trim() || pending) return;

    const userMessage: ChatMessage = {
      id: uuid(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now()
    };

    setMessages((current) => [...current, userMessage]);
    setPending(true);

    try {
      const response = await askAssistant([...messages, userMessage]);
      setStreamingMessage({ ...response, content: '' });
      const fullContent = response.content;
      let index = 0;

      const stream = () => {
        index += 1;
        setStreamingMessage((current) =>
          current ? { ...current, content: fullContent.slice(0, index) } : null
        );
        if (index < fullContent.length) {
          window.setTimeout(stream, 16);
        } else {
          setMessages((current) => [...current, { ...response }]);
          setStreamingMessage(null);
        }
      };

      stream();
    } finally {
      setPending(false);
    }
  };

  return { messages, pending, streamingMessage, sendMessage };
};
