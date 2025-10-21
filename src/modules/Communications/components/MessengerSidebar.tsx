import { ChatThread } from '../types/communication.types';

interface MessengerSidebarProps {
  threads: ChatThread[];
  activeChatId: string;
  onSelect: (id: string) => void;
  onCreateGroup: () => void;
}

export const MessengerSidebar = ({ threads, activeChatId, onSelect, onCreateGroup }: MessengerSidebarProps) => {
  return (
    <aside className="flex h-full w-72 flex-col border-r border-slate-800 bg-slate-900/70">
      <div className="border-b border-slate-800 p-4">
        <button
          className="w-full rounded-md border border-emerald-500 bg-emerald-600/20 px-3 py-2 text-sm text-emerald-300 hover:bg-emerald-500/30"
          onClick={onCreateGroup}
        >
          Нова група
        </button>
        <input
          className="mt-3 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100"
          placeholder="Пошук чатів..."
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {threads.map((thread) => (
          <button
            key={thread.id}
            className={`flex w-full flex-col gap-1 border-b border-slate-800 px-4 py-3 text-left transition hover:bg-slate-800/60 ${
              thread.id === activeChatId ? 'bg-slate-800/80' : ''
            }`}
            onClick={() => onSelect(thread.id)}
          >
            <div className="flex items-center justify-between text-sm text-slate-200">
              <span>{thread.title}</span>
              {thread.unreadCount ? (
                <span className="rounded-full bg-emerald-500/30 px-2 py-0.5 text-xs text-emerald-200">{thread.unreadCount}</span>
              ) : null}
            </div>
            <div className="text-xs text-slate-400">
              {thread.lastMessage ? `${thread.lastMessage.author.name}: ${thread.lastMessage.content}` : 'Немає повідомлень'}
            </div>
          </button>
        ))}
        {!threads.length && <p className="p-4 text-center text-xs text-slate-500">Чати відсутні</p>}
      </div>
    </aside>
  );
};
