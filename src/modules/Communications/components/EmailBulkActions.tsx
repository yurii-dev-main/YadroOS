interface EmailBulkActionsProps {
  hasSelection: boolean;
  onMarkRead: () => void;
  onMoveTo: (folder: 'inbox' | 'sent' | 'drafts' | 'trash') => void;
  onDelete: () => void;
}

export const EmailBulkActions = ({ hasSelection, onMarkRead, onMoveTo, onDelete }: EmailBulkActionsProps) => {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 px-4 py-3 text-xs text-slate-400">
      <span className="text-slate-500">Групові дії:</span>
      <button
        className="rounded border border-slate-700 px-3 py-1.5 hover:border-emerald-500 hover:text-emerald-400 disabled:opacity-40"
        disabled={!hasSelection}
        onClick={onMarkRead}
      >
        Позначити як прочитані
      </button>
      <div className="flex items-center gap-1">
        <button
          className="rounded border border-slate-700 px-3 py-1.5 hover:border-sky-500 hover:text-sky-400 disabled:opacity-40"
          disabled={!hasSelection}
          onClick={() => onMoveTo('inbox')}
        >
          У вхідні
        </button>
        <button
          className="rounded border border-slate-700 px-3 py-1.5 hover:border-sky-500 hover:text-sky-400 disabled:opacity-40"
          disabled={!hasSelection}
          onClick={() => onMoveTo('trash')}
        >
          В кошик
        </button>
      </div>
      <button
        className="rounded border border-rose-500 px-3 py-1.5 text-rose-300 hover:bg-rose-500/20 disabled:opacity-40"
        disabled={!hasSelection}
        onClick={onDelete}
      >
        Видалити
      </button>
    </div>
  );
};
