import { useEffect, useMemo, useState } from 'react';
import { emailService } from '../services/email.service';
import { chatService } from '../services/chat.service';
import { AutoResponder, EmailTemplate, TemplateCategory } from '../types/communication.types';

export const TemplateLibrary = () => {
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [autoResponders, setAutoResponders] = useState<AutoResponder[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isAddingTemplate, setIsAddingTemplate] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    body: '',
    categoryId: ''
  });

  useEffect(() => {
    emailService.fetchTemplateCategories().then(setCategories);
    emailService.fetchTemplates().then(setTemplates);
    chatService.fetchAutoResponders().then(setAutoResponders);
  }, []);

  const handleToggleAutoResponder = async (responder: AutoResponder) => {
    await emailService.updateAutoResponder(responder.id, {
      active: !responder.active,
      message: responder.message,
      type: responder.type
    });
    setAutoResponders((prev) =>
      prev.map((r) => (r.id === responder.id ? { ...r, active: !responder.active } : r))
    );
  };

  const handleAddTemplate = async () => {
    if (!newTemplate.name || !newTemplate.subject) return;
    const created = await emailService.createTemplate(newTemplate);
    setTemplates((prev) => [created, ...prev]);
    setIsAddingTemplate(false);
    setNewTemplate({ name: '', subject: '', body: '', categoryId: '' });
  };

  const filteredTemplates = useMemo(() => {
    if (activeCategory === 'all') return templates;
    return templates.filter((template) => template.categoryId === activeCategory);
  }, [templates, activeCategory]);

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/60">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            className={`rounded-full px-3 py-1 ${activeCategory === 'all' ? 'bg-emerald-500/30 text-emerald-200' : 'bg-slate-800/60 text-slate-300'}`}
            onClick={() => setActiveCategory('all')}
          >
            All templates
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              className={`rounded-full px-3 py-1 ${
                activeCategory === category.id
                  ? 'bg-emerald-500/30 text-emerald-200'
                  : 'bg-slate-800/60 text-slate-300'
              }`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
        <button
          onClick={() => setIsAddingTemplate(true)}
          className="rounded border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:border-emerald-500 hover:text-emerald-300"
        >
          Add template
        </button>
      </header>
      <div className="grid gap-4 p-4 md:grid-cols-2">
        {filteredTemplates.map((template) => (
          <article
            key={template.id}
            className="rounded border border-slate-800 bg-slate-900/80 p-3 text-sm text-slate-200"
          >
            <h4 className="text-base font-semibold text-emerald-200">{template.name}</h4>
            <p className="mt-1 text-xs text-slate-400">Subject: {template.subject}</p>
            <div className="mt-2 rounded border border-slate-800 bg-slate-950/50 p-2 text-xs text-slate-300">
              <div dangerouslySetInnerHTML={{ __html: template.body }} />
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Variables: {(template.variables || []).join(', ') || 'None'}
            </div>
          </article>
        ))}
        {!filteredTemplates.length && (
          <p className="col-span-full text-center text-sm text-slate-500">No templates available</p>
        )}
      </div>
      <div className="border-t border-slate-800 bg-slate-950/40 p-4">
        <h4 className="text-sm font-semibold text-slate-200">Auto-responders</h4>
        <div className="mt-2 grid gap-3 md:grid-cols-3">
          {autoResponders.map((responder) => (
            <article
              key={responder.id}
              className="rounded border border-slate-800 bg-slate-900/80 p-3 text-xs text-slate-200"
            >
              <div className="flex items-center justify-between">
                <span className="uppercase tracking-wide text-slate-400">
                  {responder.type.replace('_', ' ')}
                </span>
                <button
                  onClick={() => handleToggleAutoResponder(responder)}
                  className={`rounded px-2 py-1 text-[10px] ${responder.active ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}
                >
                  {responder.active ? 'Active' : 'Disabled'}
                </button>
              </div>
              <p className="mt-2 text-slate-300">{responder.message}</p>
              {responder.schedule && (
                <p className="mt-2 text-slate-500">
                  Schedule: {responder.schedule.start} — {responder.schedule.end}
                </p>
              )}
            </article>
          ))}
        </div>
      </div>

      {isAddingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-slate-100">Add New Template</h3>
            <div className="space-y-4">
              <input
                className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
                placeholder="Template Name"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
              />
              <input
                className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
                placeholder="Subject Line"
                value={newTemplate.subject}
                onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
              />
              <textarea
                className="h-24 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
                placeholder="Email Body (HTML supported)"
                value={newTemplate.body}
                onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })}
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="rounded px-4 py-2 text-sm text-slate-400 hover:text-slate-200"
                onClick={() => setIsAddingTemplate(false)}
              >
                Cancel
              </button>
              <button
                className="rounded bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-500"
                onClick={handleAddTemplate}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
