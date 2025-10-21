import { useEffect, useRef, useState } from 'react';
import { chatService } from '../services/chat.service';
import { ChatMessage, ChatParticipant, CannedResponse } from '../types/communication.types';
import { MessageBubble } from './MessageBubble';

interface ChatWindowProps {
  messages: ChatMessage[];
  activeUser: ChatParticipant;
  typingUsers: string[];
  onSend: (content: string) => Promise<void>;
  onTyping: () => void;
}

export const ChatWindow = ({ messages, activeUser, typingUsers, onSend, onTyping }: ChatWindowProps) => {
  const [inputValue, setInputValue] = useState('');
  const [responses, setResponses] = useState<CannedResponse[]>([]);
  const [showResponses, setShowResponses] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatService.fetchCannedResponses().then(setResponses);
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    await onSend(inputValue.trim());
    setInputValue('');
    setShowResponses(false);
    containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
  };

  const applyResponse = (content: string) => {
    setInputValue((prev) => `${prev} ${content}`.trim());
    setShowResponses(false);
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (value.startsWith('/')) {
      setShowResponses(true);
    } else {
      setShowResponses(false);
    }
    onTyping();
  };

  return (
    <div className="flex h-full flex-col">
      <div ref={containerRef} className="flex-1 overflow-y-auto bg-slate-950/30 p-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} isOwn={message.author.id === activeUser.id} />
        ))}
        {typingUsers.length > 0 && (
          <div className="mt-2 text-xs text-slate-400">{typingUsers.length} користувач(і) друкують...</div>
        )}
      </div>
      <div className="border-t border-slate-800 bg-slate-900/40 p-4">
        <textarea
          className="h-24 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
          placeholder="Напишіть повідомлення, використовуйте / для швидких відповідей"
          value={inputValue}
          onChange={(event) => handleInputChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              handleSend();
            }
          }}
        />
        {showResponses && responses.length > 0 && (
          <div className="mt-2 space-y-1 rounded-md border border-slate-800 bg-slate-900 p-2 text-xs text-slate-200">
            {responses.map((response) => (
              <button
                key={response.id}
                className="flex w-full items-center justify-between rounded px-2 py-1 hover:bg-slate-800/80"
                onClick={() => applyResponse(response.content)}
              >
                <span className="font-semibold text-emerald-300">{response.shortcut}</span>
                <span>{response.title}</span>
              </button>
            ))}
          </div>
        )}
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span>Підтримується drag-and-drop файлів, emoji, згадки @</span>
          <button
            className="rounded border border-emerald-500 px-4 py-2 text-emerald-300 hover:bg-emerald-500/20"
            onClick={handleSend}
          >
            Надіслати
          </button>
        </div>
      </div>
    </div>
  );
};
