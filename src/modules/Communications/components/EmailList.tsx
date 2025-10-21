import { EmailMessage } from '../types/communication.types';
import { formatAttachmentSize } from '../utils/email.utils';

interface EmailListProps {
  emails: EmailMessage[];
  selectedIds: string[];
  onSelect: (id: string) => void;
  onOpen: (email: EmailMessage) => void;
}

export const EmailList = ({ emails, selectedIds, onSelect, onOpen }: EmailListProps) => {
  return (
    <div className="h-full overflow-y-auto">
      {emails.map((email) => (
        <article
          key={email.id}
          className={`border-b border-slate-800/80 px-4 py-3 transition hover:bg-slate-800/40 ${
            email.unread ? 'bg-slate-900/50' : ''
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(email.id)}
                  onChange={() => onSelect(email.id)}
                  className="rounded border-slate-700 bg-slate-900"
                />
                <button
                  className="text-left text-sm font-semibold text-slate-200 hover:text-emerald-300"
                  onClick={() => onOpen(email)}
                >
                  {email.subject}
                </button>
                {email.starred && <span className="text-xs text-amber-400">★</span>}
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-slate-400">{email.preview}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>{new Date(email.date).toLocaleString()}</span>
                <span>•</span>
                <span>{email.from}</span>
                {email.attachments?.map((attachment) => (
                  <span key={attachment.id} className="rounded bg-slate-800 px-2 py-0.5 text-slate-400">
                    {attachment.name} ({formatAttachmentSize(attachment.size)})
                  </span>
                ))}
                {email.tags?.map((tag) => (
                  <span key={tag.id} className={`rounded-full px-2 py-0.5 text-[10px] ${tag.color} text-white`}>
                    {tag.label}
                  </span>
                ))}
              </div>
            </div>
            <span className="text-xs text-slate-500">{email.to.join(', ')}</span>
          </div>
        </article>
      ))}
      {!emails.length && <p className="p-6 text-center text-sm text-slate-500">Немає листів за обраними критеріями.</p>}
    </div>
  );
};
