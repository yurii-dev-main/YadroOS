import { useEffect, useMemo, useState } from 'react';
import { emailService } from '../services/email.service';
import { chatService } from '../services/chat.service';
import { AutoResponder, EmailTemplate, TemplateCategory } from '../types/communication.types';

export const TemplateLibrary = () => {
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [autoResponders, setAutoResponders] = useState<AutoResponder[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    emailService.fetchTemplateCategories().then(setCategories);
    emailService.fetchTemplates().then(setTemplates);
    chatService.fetchAutoResponders().then(setAutoResponders);
  }, []);

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
                activeCategory === category.id ? 'bg-emerald-500/30 text-emerald-200' : 'bg-slate-800/60 text-slate-300'
              }`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
        <button className="rounded border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:border-emerald-500 hover:text-emerald-300">
          Add template
        </button>
      </header>
      <div className="grid gap-4 p-4 md:grid-cols-2">
        {filteredTemplates.map((template) => (
          <article key={template.id} className="rounded border border-slate-800 bg-slate-900/80 p-3 text-sm text-slate-200">
            <h4 className="text-base font-semibold text-emerald-200">{template.name}</h4>
            <p className="mt-1 text-xs text-slate-400">Subject: {template.subject}</p>
            <div className="mt-2 rounded border border-slate-800 bg-slate-950/50 p-2 text-xs text-slate-300">
              <div dangerouslySetInnerHTML={{ __html: template.body }} />
            </div>
            <div className="mt-2 text-xs text-slate-500">Variables: {template.variables.join(', ') || 'None'}</div>
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
            <article key={responder.id} className="rounded border border-slate-800 bg-slate-900/80 p-3 text-xs text-slate-200">
              <div className="flex items-center justify-between">
                <span className="uppercase tracking-wide text-slate-400">{responder.type.replace('_', ' ')}</span>
                <span className={`text-[10px] ${responder.active ? 'text-emerald-300' : 'text-slate-500'}`}>
                  {responder.active ? 'Active' : 'Disabled'}
                </span>
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
    </section>
  );
};
