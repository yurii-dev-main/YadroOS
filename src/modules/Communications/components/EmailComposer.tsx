import { useState } from 'react';
import { emailService } from '../services/email.service';
import { EmailDraft, EmailTemplate } from '../types/communication.types';

interface EmailComposerProps {
  onSent?: () => void;
  templates?: EmailTemplate[];
}

const defaultDraft: EmailDraft = {
  id: 'composer',
  subject: '',
  body: '',
  to: [],
};

export const EmailComposer = ({ onSent, templates = [] }: EmailComposerProps) => {
  const [draft, setDraft] = useState<EmailDraft>(defaultDraft);
  const [isSending, setIsSending] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const handleChange = (field: keyof EmailDraft, value: string | string[]) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const applyTemplate = (templateId: string) => {
    const template = templates.find((item) => item.id === templateId);
    if (!template) return;
    setSelectedTemplate(templateId);
    setDraft((prev) => ({
      ...prev,
      subject: template.subject,
      body: template.body,
    }));
  };

  const handleSubmit = async () => {
    if (!draft.to.length || !draft.subject) return;
    setIsSending(true);
    await emailService.sendEmail(draft);
    setIsSending(false);
    setDraft(defaultDraft);
    setSelectedTemplate('');
    onSent?.();
  };

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input
          className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
          placeholder="Кому"
          value={draft.to.join(', ')}
          onChange={(event) => handleChange('to', event.target.value.split(',').map((item) => item.trim()))}
        />
        <select
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200"
          value={selectedTemplate}
          onChange={(event) => applyTemplate(event.target.value)}
        >
          <option value="">Шаблон</option>
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
      </div>

      <input
        className="mb-3 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
        placeholder="Тема"
        value={draft.subject}
        onChange={(event) => handleChange('subject', event.target.value)}
      />

      <textarea
        className="mb-3 h-40 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
        placeholder="Повідомлення..."
        value={draft.body}
        onChange={(event) => handleChange('body', event.target.value)}
      />

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <button className="rounded-md border border-slate-700 px-3 py-2 hover:border-emerald-500 hover:text-emerald-400">
            Прикріпити файл
          </button>
          <button className="rounded-md border border-slate-700 px-3 py-2 hover:border-sky-500 hover:text-sky-400">
            Додати підпис
          </button>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSending}
          className="rounded-md border border-emerald-500 bg-emerald-600/20 px-4 py-2 text-emerald-300 transition hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSending ? 'Відправка...' : 'Відправити'}
        </button>
      </div>
    </div>
  );
};
