import { ChatMessage } from '../types/communication.types';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn?: boolean;
}

export const MessageBubble = ({ message, isOwn = false }: MessageBubbleProps) => {
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} py-1`}>
      <div
        className={`max-w-[70%] rounded-lg border px-3 py-2 text-sm shadow-sm transition ${
          isOwn
            ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-50'
            : 'border-slate-800 bg-slate-900/80 text-slate-200'
        }`}
      >
        <div className="flex items-center gap-2 text-xs text-slate-400">
          {!isOwn && <span className="font-semibold text-slate-200">{message.author.name}</span>}
          <span>{time}</span>
          {message.status && <span className="capitalize">{message.status}</span>}
        </div>
        <p className="mt-1 whitespace-pre-line text-sm">{message.content}</p>
        {message.attachments?.length ? (
          <div className="mt-2 space-y-1 text-xs text-slate-300">
            {message.attachments.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-2 rounded border border-slate-700/60 px-2 py-1"
              >
                <span>{file.name}</span>
                <span className="text-slate-500">{file.type}</span>
              </div>
            ))}
          </div>
        ) : null}
        {message.mentions?.length ? (
          <div className="mt-2 text-xs text-emerald-300">
            Mentioned: {message.mentions.join(', ')}
          </div>
        ) : null}
      </div>
    </div>
  );
};
