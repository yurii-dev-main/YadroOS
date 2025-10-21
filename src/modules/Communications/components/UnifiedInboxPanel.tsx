import { useMemo, useState } from 'react';
import { UnifiedInboxItem, CommunicationChannel } from '../types/communication.types';

interface UnifiedInboxPanelProps {
  items: UnifiedInboxItem[];
}

const channelLabels: Record<'all' | CommunicationChannel, string> = {
  all: 'Усі канали',
  email: 'Email',
  internal: 'Внутрішні чати',
  telegram: 'Telegram',
};

export const UnifiedInboxPanel = ({ items }: UnifiedInboxPanelProps) => {
  const [channel, setChannel] = useState<'all' | CommunicationChannel>('all');
  const [showOnlyImportant, setShowOnlyImportant] = useState(false);

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => (channel === 'all' ? true : item.channel === channel))
      .filter((item) => (showOnlyImportant ? item.priority === 'high' : true))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [items, channel, showOnlyImportant]);

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/50">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          {(Object.keys(channelLabels) as Array<'all' | CommunicationChannel>).map((key) => (
            <button
              key={key}
              className={`rounded-full px-3 py-1 text-xs transition ${
                channel === key ? 'bg-emerald-500/30 text-emerald-200' : 'bg-slate-800/60 text-slate-300'
              }`}
              onClick={() => setChannel(key)}
            >
              {channelLabels[key]}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs text-slate-400">
          <input
            type="checkbox"
            className="rounded border-slate-700 bg-slate-900"
            checked={showOnlyImportant}
            onChange={(event) => setShowOnlyImportant(event.target.checked)}
          />
          Важливі спочатку
        </label>
      </header>
      <div className="divide-y divide-slate-800">
        {filteredItems.map((item) => (
          <article key={item.id} className="px-4 py-3 hover:bg-slate-800/50">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-sm text-slate-200">
                  <span>{item.title}</span>
                  <span className="text-xs capitalize text-slate-500">{item.channel}</span>
                  {item.priority === 'high' && <span className="rounded bg-rose-500/30 px-2 py-0.5 text-[10px] text-rose-200">Urgent</span>}
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-slate-400">{item.preview}</p>
                {item.relatedClient && (
                  <p className="mt-1 text-xs text-emerald-300">Клієнт: {item.relatedClient.name}</p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                  <button className="rounded border border-slate-700 px-2 py-1 hover:border-emerald-500 hover:text-emerald-300">
                    Призначити
                  </button>
                  <button className="rounded border border-slate-700 px-2 py-1 hover:border-sky-500 hover:text-sky-300">
                    Відкласти
                  </button>
                  <button className="rounded border border-slate-700 px-2 py-1 hover:border-slate-500 hover:text-slate-200">
                    Швидка відповідь
                  </button>
                </div>
              </div>
              <span className="text-xs text-slate-500">{new Date(item.timestamp).toLocaleString()}</span>
            </div>
          </article>
        ))}
        {!filteredItems.length && <p className="p-6 text-center text-xs text-slate-500">Немає повідомлень</p>}
      </div>
    </section>
  );
};
