import { useState } from 'react';
import { ChatPage } from './pages/ChatPage';
import { InboxPage } from './pages/InboxPage';
import { UnifiedInboxPage } from './pages/UnifiedInboxPage';

const tabs = [
  { id: 'inbox', label: 'Email Inbox' },
  { id: 'messenger', label: 'Internal Messenger' },
  { id: 'unified', label: 'Unified Inbox' },
];

export const CommunicationsCenter = () => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'messenger' | 'unified'>('inbox');

  return (
    <div className="flex h-full flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Комунікаційний центр</h1>
          <p className="text-sm text-slate-400">
            Єдиний хаб для email, внутрішніх чатів, Telegram та нотифікацій
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`rounded-full px-4 py-2 transition ${
                activeTab === tab.id ? 'bg-emerald-500/30 text-emerald-200' : 'bg-slate-800/60 text-slate-300'
              }`}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        {activeTab === 'inbox' && <InboxPage />}
        {activeTab === 'messenger' && <ChatPage />}
        {activeTab === 'unified' && <UnifiedInboxPage />}
      </main>
    </div>
  );
};
