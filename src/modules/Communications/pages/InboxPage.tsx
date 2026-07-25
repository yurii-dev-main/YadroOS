import { useEffect, useState } from 'react';
import { EmailBulkActions } from '../components/EmailBulkActions';
import { EmailComposer } from '../components/EmailComposer';
import { EmailContent } from '../components/EmailContent';
import { EmailList } from '../components/EmailList';
import { EmailSidebar } from '../components/EmailSidebar';
import { useEmails } from '../hooks/useEmails';
import { emailService } from '../services/email.service';
import { EmailMessage, EmailTemplate } from '../types/communication.types';

export const InboxPage = () => {
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | undefined>(undefined);
  const [showComposer, setShowComposer] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const {
    emails,
    tags,
    searchParams,
    setSearchParams,
    selectedIds,
    toggleSelect,
    clearSelection,
    bulkMarkRead,
    moveToFolder,
    attachToClient,
    createClientFromEmail,
  } = useEmails({ folder: 'inbox' });

  useEffect(() => {
    emailService.fetchTemplates().then(setTemplates);
  }, []);

  const handleOpenEmail = (email: EmailMessage) => {
    setSelectedEmail(email);
  };

  const handleAssignClient = async () => {
    if (!selectedEmail) return;
    if (selectedEmail.relatedClientId) return;
    const client = await createClientFromEmail(selectedEmail.id);
    attachToClient(selectedEmail.id, client.id);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 overflow-hidden">
        <EmailSidebar
          searchParams={searchParams}
          onChange={setSearchParams}
          onCompose={() => setShowComposer(true)}
        />
        <div className="flex w-[28rem] flex-col border-r border-slate-800">
          <EmailBulkActions
            hasSelection={selectedIds.length > 0}
            onMarkRead={bulkMarkRead}
            onMoveTo={(folder) => moveToFolder(folder)}
            onDelete={() => moveToFolder('trash')}
          />
          <EmailList emails={emails} selectedIds={selectedIds} onSelect={toggleSelect} onOpen={handleOpenEmail} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <EmailContent
            email={selectedEmail}
            onReply={() => setShowComposer(true)}
            onAssignClient={handleAssignClient}
            availableTags={tags}
          />
        </div>
      </div>

      {showComposer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-6">
          <div className="w-full max-w-3xl rounded-lg border border-slate-800 bg-slate-950 p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-100">Compose Email</h3>
              <button className="text-sm text-slate-400 hover:text-emerald-300" onClick={() => setShowComposer(false)}>
                Close
              </button>
            </div>
            <EmailComposer
              templates={templates}
              onSent={() => {
                setShowComposer(false);
                clearSelection();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
