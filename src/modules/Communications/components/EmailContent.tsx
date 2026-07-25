import { EmailMessage, EmailTag } from '../types/communication.types';

interface EmailContentProps {
  email?: EmailMessage;
  onReply: (type: 'reply' | 'replyAll' | 'forward') => void;
  onAssignClient?: () => void;
  availableTags?: EmailTag[];
}

export const EmailContent = ({
  email,
  onReply,
  onAssignClient,
  availableTags = []
}: EmailContentProps) => {
  if (!email) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-500">
        Select an email from the list
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-slate-800 p-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">{email.subject}</h2>
            <p className="text-xs text-slate-500">From: {email.from}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{new Date(email.date).toLocaleString()}</span>
            {email.relatedClientId ? (
              <span className="rounded bg-emerald-500/20 px-2 py-1 text-emerald-300">
                Linked to client
              </span>
            ) : (
              <button
                className="rounded border border-slate-700 px-2 py-1 hover:border-emerald-500 hover:text-emerald-400"
                onClick={onAssignClient}
              >
                Link to client
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span>To: {email.to.join(', ')}</span>
          {email.cc?.length ? <span>CC: {email.cc.join(', ')}</span> : null}
          {email.bcc?.length ? <span>BCC: {email.bcc.join(', ')}</span> : null}
          {email.tags?.map((tag) => (
            <span
              key={tag.id}
              className={`rounded-full px-2 py-0.5 text-[10px] ${tag.color} text-white`}
            >
              {tag.label}
            </span>
          ))}
          <select className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-slate-200">
            <option>Add tag</option>
            {availableTags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.label}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 text-sm leading-6 text-slate-200">
        <p>{email.body}</p>
      </div>

      <footer className="border-t border-slate-800 p-4">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <button
            className="rounded border border-slate-700 px-3 py-2 hover:border-emerald-500 hover:text-emerald-400"
            onClick={() => onReply('reply')}
          >
            Reply
          </button>
          <button
            className="rounded border border-slate-700 px-3 py-2 hover:border-emerald-500 hover:text-emerald-400"
            onClick={() => onReply('replyAll')}
          >
            Reply all
          </button>
          <button
            className="rounded border border-slate-700 px-3 py-2 hover:border-emerald-500 hover:text-emerald-400"
            onClick={() => onReply('forward')}
          >
            Forward
          </button>
        </div>
      </footer>
    </div>
  );
};
