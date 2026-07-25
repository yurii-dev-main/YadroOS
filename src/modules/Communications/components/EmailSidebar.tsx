import { EmailSearchParams } from '../types/communication.types';

interface EmailSidebarProps {
  searchParams: EmailSearchParams;
  onChange: (params: EmailSearchParams) => void;
  onCompose: () => void;
}

const folders = [
  { id: 'inbox', label: 'Inbox' },
  { id: 'sent', label: 'Sent' },
  { id: 'drafts', label: 'Drafts' },
  { id: 'trash', label: 'Trash' }
];

export const EmailSidebar = ({ searchParams, onChange, onCompose }: EmailSidebarProps) => {
  const changeFolder = (folder: EmailSearchParams['folder']) => {
    onChange({ ...searchParams, folder });
  };

  return (
    <aside className="flex h-full flex-col border-r border-slate-800 bg-slate-900/60">
      <div className="border-b border-slate-800 p-4">
        <button
          className="w-full rounded-md border border-emerald-500 bg-emerald-600/20 px-3 py-2 text-sm text-emerald-300 hover:bg-emerald-500/30"
          onClick={onCompose}
        >
          New Email
        </button>
      </div>
      <div className="p-4">
        <input
          className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100"
          placeholder="Search..."
          value={searchParams.query ?? ''}
          onChange={(event) => onChange({ ...searchParams, query: event.target.value })}
        />
        <div className="mt-4 space-y-2 text-sm text-slate-300">
          {folders.map((folder) => (
            <button
              key={folder.id}
              className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left transition hover:bg-slate-800/60 ${
                searchParams.folder === folder.id ? 'bg-slate-800 text-emerald-300' : ''
              }`}
              onClick={() => changeFolder(folder.id as EmailSearchParams['folder'])}
            >
              <span>{folder.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="mt-auto space-y-2 border-t border-slate-800 p-4 text-xs text-slate-400">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="rounded border-slate-700 bg-slate-900"
            checked={Boolean(searchParams.unreadOnly)}
            onChange={(event) => onChange({ ...searchParams, unreadOnly: event.target.checked })}
          />
          Unread
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="rounded border-slate-700 bg-slate-900"
            checked={Boolean(searchParams.starredOnly)}
            onChange={(event) => onChange({ ...searchParams, starredOnly: event.target.checked })}
          />
          Starred
        </label>
      </div>
    </aside>
  );
};
