import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit2, Check, X, ArrowLeft, Paperclip, FileText, Target, Activity } from 'lucide-react';
import clsx from 'clsx';
import { v4 as uuid } from 'uuid';

import { Input } from '../../../components/ui/input';
import { CRMErrorBoundary } from '../components/CRMErrorBoundary';
import { ClientSidebar } from '../components/ClientSidebar';
import { ActivityLog } from '../components/ActivityLog';
import { ActivityModal } from '../components/ActivityModal';
import { useActivities } from '../hooks/useActivities';
import { crmService } from '../services/crm.service';
import { CRMClient, CRMDeal, CRMNote } from '../types/crm.types';
import { formatCurrency, formatNumber } from '../utils/crm.utils';

const tabs = [
  { id: 'overview', label: 'Overview', icon: Edit2 },
  { id: 'deals', label: 'Deals', icon: Target },
  { id: 'activity', label: 'Activities', icon: Activity },
  { id: 'files', label: 'Files', icon: Paperclip },
  { id: 'notes', label: 'Notes', icon: FileText }
] as const;

type TabId = typeof tabs[number]['id'];

export const ClientDetailPage = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<CRMClient | null>(null);
  const [originalClient, setOriginalClient] = useState<CRMClient | null>(null);
  const [deals, setDeals] = useState<CRMDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState<CRMNote[]>([]);
  const [showActivityModal, setShowActivityModal] = useState(false);

  const { activities, filter, setFilter, addActivity, loading: loadingActivities } = useActivities(clientId);

  useEffect(() => {
    if (!clientId) return;
    const load = async () => {
      try {
        setLoading(true);
        const [clientData, dealsData] = await Promise.all([
          crmService.getClient(clientId),
          crmService.getDeals({})
        ]);
        setClient(clientData);
        setDeals(dealsData.filter((deal) => deal.clientId === clientId));
        setNotes(clientData.notes);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [clientId]);

  const handleUpdate = async (updates: Partial<CRMClient>) => {
    if (!client) return;
    const updated = await crmService.updateClient(client.id, updates);
    setClient(updated);
  };

  const handleAddTag = async (label: string) => {
    if (!client) return;
    const updated = await crmService.updateClient(client.id, {
      tags: [...client.tags, { id: uuid(), label, color: '#38bdf8' }]
    });
    setClient(updated);
  };

  const handleRemoveTag = async (tagId: string) => {
    if (!client) return;
    const updated = await crmService.updateClient(client.id, {
      tags: client.tags.filter((tag) => tag.id !== tagId)
    });
    setClient(updated);
  };

  const handleAddNote = async (content: string) => {
    if (!client) return;
    const note: CRMNote = {
      id: uuid(),
      author: 'You',
      content,
      createdAt: new Date().toISOString()
    };
    const updated = await crmService.updateClient(client.id, {
      notes: [note, ...client.notes]
    });
    setClient(updated);
    setNotes(updated.notes);
  };

  const overviewMetrics = useMemo(() => ({
    lifetimeValue: client ? formatCurrency(client.revenue * 4) : '—',
    averageDeal: deals.length ? formatCurrency(deals.reduce((acc, deal) => acc + deal.value, 0) / deals.length) : '—',
    dealsCount: formatNumber(deals.length)
  }), [client, deals]);

  if (!clientId) {
    return <p className="text-sm text-slate-400">Client not found.</p>;
  }

  return (
    <CRMErrorBoundary>
      <div className="flex flex-col gap-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to list
        </button>

        {loading && <p className="text-sm text-slate-400">Loading client data...</p>}
        {!loading && client && (
          <div className="flex flex-col gap-6 xl:flex-row">
            <div className="flex-1 space-y-6">
              <div className="rounded-3xl border border-slate-700/60 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-semibold text-white">{client.name}</h1>
                    <p className="text-sm text-slate-400">{client.company}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false);
                            if (originalClient) {
                              setClient(originalClient);
                              setOriginalClient(null);
                            }
                          }}
                          className="rounded-lg border border-slate-600/60 px-3 py-1 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!client) return;
                            await handleUpdate({
                              name: client.name,
                              email: client.email,
                              phone: client.phone,
                              website: client.website,
                              industry: client.industry
                            });
                            setIsEditing(false);
                            setOriginalClient(null);
                          }}
                          className="rounded-lg bg-emerald-500 px-3 py-1 text-sm text-white transition hover:bg-emerald-400"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setOriginalClient(client);
                          setIsEditing(true);
                        }}
                        className="flex items-center gap-2 rounded-lg border border-slate-600/60 px-3 py-1 text-sm text-slate-300 transition hover:border-blue-500 hover:text-blue-300"
                      >
                        <Edit2 className="h-4 w-4" /> Edit
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="flex flex-col text-xs uppercase tracking-wide text-slate-500">
                    Email
                    <Input
                      value={client.email}
                      onChange={(event) => setClient({ ...client, email: event.target.value })}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </label>
                  <label className="flex flex-col text-xs uppercase tracking-wide text-slate-500">
                    Phone
                    <Input
                      value={client.phone}
                      onChange={(event) => setClient({ ...client, phone: event.target.value })}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </label>
                  <label className="flex flex-col text-xs uppercase tracking-wide text-slate-500">
                    Website
                    <Input
                      value={client.website ?? ''}
                      onChange={(event) => setClient({ ...client, website: event.target.value })}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </label>
                  <label className="flex flex-col text-xs uppercase tracking-wide text-slate-500">
                    Industry
                    <Input
                      value={client.industry}
                      onChange={(event) => setClient({ ...client, industry: event.target.value })}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </label>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-4 rounded-2xl border border-slate-700/40 bg-slate-900/60 p-4 text-sm text-slate-200">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">LTV</p>
                    <p className="text-lg font-semibold text-emerald-400">{overviewMetrics.lifetimeValue}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Average Deal</p>
                    <p className="text-lg font-semibold text-blue-300">{overviewMetrics.averageDeal}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Deals Count</p>
                    <p className="text-lg font-semibold text-slate-200">{overviewMetrics.dealsCount}</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={clsx(
                        'flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition',
                        activeTab === tab.id
                          ? 'bg-blue-600 text-white shadow shadow-blue-500/30'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
                      )}
                    >
                      <tab.icon className="h-4 w-4" /> {tab.label}
                    </button>
                  ))}
                </div>

                <div className="mt-6">
                  {activeTab === 'overview' && client && (
                    <div className="space-y-4 text-sm text-slate-200">
                      <p>Created Date: {new Date(client.createdAt).toLocaleDateString()}</p>
                      <p>Updated: {new Date(client.updatedAt).toLocaleDateString()}</p>
                      <div>
                        <h4 className="text-sm font-semibold text-white">Custom Fields</h4>
                        <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2">
                          {client.customFields.map((field) => (
                            <div key={field.id} className="rounded-xl border border-slate-700/40 bg-slate-900/60 p-3">
                              <p className="text-xs uppercase tracking-wide text-slate-500">{field.label}</p>
                              <p className="text-sm text-slate-200">{field.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'deals' && (
                    <div className="space-y-4">
                      {deals.map((deal) => (
                        <div key={deal.id} className="rounded-2xl border border-slate-700/40 bg-slate-900/60 p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-lg font-semibold text-white">{deal.title}</h4>
                              <p className="text-xs text-slate-400">Stage: {deal.stage}</p>
                            </div>
                            <span className="text-sm font-semibold text-emerald-400">{formatCurrency(deal.value)}</span>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-6 text-xs text-slate-400">
                            <span>Probability: {deal.probability}%</span>
                            {deal.closeDate && <span>Close: {new Date(deal.closeDate).toLocaleDateString()}</span>}
                            <span>Owner: {deal.owner}</span>
                          </div>
                        </div>
                      ))}
                      {deals.length === 0 && <p className="text-sm text-slate-400">This client has no deals yet.</p>}
                    </div>
                  )}

                  {activeTab === 'activity' && (
                    <div className="space-y-4">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setShowActivityModal(true)}
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
                        >
                          Add Activity
                        </button>
                      </div>
                      {loadingActivities ? (
                        <p className="text-sm text-slate-400">Loading activities...</p>
                      ) : (
                        <ActivityLog activities={activities} filter={filter} onFilterChange={setFilter} />
                      )}
                    </div>
                  )}

                  {activeTab === 'files' && (
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-slate-700/40 bg-slate-900/60 p-4 text-sm text-slate-200">
                        <p>Files: {client.files.length}</p>
                        <button
                          type="button"
                          onClick={() => alert('File upload function in demo mode')}
                          className="mt-3 rounded-lg border border-slate-600/60 px-3 py-1 text-xs text-slate-300 transition hover:border-blue-500 hover:text-blue-300"
                        >
                          Upload file
                        </button>
                      </div>
                      {client.files.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-slate-700/50 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
                          No files yet.
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'notes' && (
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-slate-700/40 bg-slate-900/60 p-4">
                        <textarea
                          placeholder="New note..."
                          className="min-h-[120px] w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200"
                          onKeyDown={async (event) => {
                            if (event.key === 'Enter' && event.metaKey) {
                              event.preventDefault();
                              const target = event.target as HTMLTextAreaElement;
                              await handleAddNote(target.value);
                              target.value = '';
                            }
                          }}
                        />
                        <p className="mt-2 text-xs text-slate-500">Press ⌘ + Enter to save.</p>
                      </div>
                      <div className="space-y-3">
                        {notes.map((note) => (
                          <div key={note.id} className="rounded-2xl border border-slate-700/40 bg-slate-900/50 p-4">
                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <span>{note.author}</span>
                              <span>{new Date(note.createdAt).toLocaleString()}</span>
                            </div>
                            <p className="mt-2 text-sm text-slate-200">{note.content}</p>
                          </div>
                        ))}
                        {notes.length === 0 && <p className="text-sm text-slate-400">No notes yet.</p>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <ClientSidebar client={client} activities={activities} onAddTag={handleAddTag} onRemoveTag={handleRemoveTag} />
          </div>
        )}

        <ActivityModal
          open={showActivityModal}
          onClose={() => setShowActivityModal(false)}
          onSubmit={async (activity) => {
            await addActivity(activity);
          }}
          clientId={clientId}
          creator={client?.assignedTo ?? 'Manager'}
        />
      </div>
    </CRMErrorBoundary>
  );
};
