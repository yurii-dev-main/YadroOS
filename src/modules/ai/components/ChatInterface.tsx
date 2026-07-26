import { FormEvent, useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';

import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import type { ChatMessage } from '../types/ai.types';
import { askAssistant } from '../services/ai.service';

const initialMessage: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Hello! I am YadroOS AI Advisor. Ask about clients, employees, or finances — and I will generate the needed insight.',
  timestamp: Date.now()
};

export const ChatInterface = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [pending, setPending] = useState(false);
  const [input, setInput] = useState('');
  const [streamingMessage, setStreamingMessage] = useState<ChatMessage | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage?.content]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!input.trim() || pending) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now()
    };

    setMessages((current) => [...current, userMessage]);
    setInput('');
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

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex-1 overflow-hidden rounded-xl border border-slate-800/60 bg-slate-950/40">
        <div ref={scrollRef} className="flex h-full flex-col gap-4 overflow-y-auto p-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-2xl rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg ${message.role === 'assistant' ? 'self-start bg-slate-900/80 text-slate-100' : 'self-end bg-sky-500/20 text-sky-100'}`}
            >
              {message.content}
              {message.actions && message.actions.length > 0 && (
                <div className="mt-3 flex flex-col gap-2 border-t border-slate-700 pt-3">
                  <div className="text-xs font-semibold text-slate-400">EXECUTED ACTIONS:</div>
                  {message.actions.map((action, idx) => (
                    <div
                      key={idx}
                      className="rounded bg-slate-800/80 p-2 text-xs font-mono text-emerald-400"
                    >
                      ✓ {action.type}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {streamingMessage && (
            <div className="max-w-2xl self-start rounded-2xl bg-slate-900/80 px-4 py-3 text-sm text-slate-100 shadow-lg">
              {streamingMessage.content}
              <span className="ml-1 animate-pulse">▍</span>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask a question, for example: 'Show top clients by revenue'"
          className="flex-1"
        />
        <Button type="submit" disabled={pending} className="gap-2">
          <Send className="h-4 w-4" /> Send
        </Button>
      </form>
    </div>
  );
};
