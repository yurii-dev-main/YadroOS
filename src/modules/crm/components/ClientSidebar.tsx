import { CRMActivity, CRMClient } from '../types/crm.types';
import {
  formatCurrency,
  formatNumber,
  getRecentActivities,
  statusBadgeStyles,
  statusLabels
} from '../utils/crm.utils';

interface ClientSidebarProps {
  client: CRMClient;
  activities: CRMActivity[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tagId: string) => void;
}

export const ClientSidebar = ({
  client,
  activities,
  onAddTag,
  onRemoveTag
}: ClientSidebarProps) => {
  const recent = getRecentActivities(activities, 5);

  return (
    <aside className="flex w-full max-w-xs flex-col gap-6 rounded-3xl border border-slate-700/40 bg-slate-900/60 p-6 shadow-xl shadow-black/30">
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Status</h3>
        <span
          className={`w-fit rounded-full px-4 py-1 text-xs font-semibold ${statusBadgeStyles[client.status]}`}
        >
          {statusLabels[client.status]}
        </span>
        <div className="grid grid-cols-2 gap-4 text-sm text-slate-200">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Last Contact</p>
            <p>
              {client.lastContactedAt ? new Date(client.lastContactedAt).toLocaleDateString() : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Deals</p>
            <p>{formatNumber(Math.floor(Math.random() * 5) + 1)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Revenue</p>
            <p className="font-semibold text-emerald-400">{formatCurrency(client.revenue)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Employees</p>
            <p>{formatNumber(client.size)}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Manager</h3>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-700/40 bg-slate-900/60 p-3">
          <img
            src={client.assignedToAvatar ?? 'https://i.pravatar.cc/150?img=5'}
            alt={client.assignedTo}
            className="h-10 w-10 rounded-full border border-slate-700/60 object-cover"
          />
          <div>
            <p className="text-sm font-medium text-white">{client.assignedTo}</p>
            <p className="text-xs text-slate-400">Account Manager</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {client.tags.map((tag) => (
            <button
              type="button"
              key={tag.id}
              onClick={() => onRemoveTag(tag.id)}
              className="group flex items-center gap-1 rounded-full border border-slate-600/60 bg-slate-800/80 px-3 py-1 text-xs text-slate-200 transition hover:border-red-500 hover:text-red-300"
            >
              {tag.label}
              <span className="text-slate-500 transition group-hover:text-red-400">×</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            const label = prompt('Tag label');
            if (label) onAddTag(label);
          }}
          className="rounded-lg border border-dashed border-slate-600/60 px-3 py-1 text-xs text-slate-300 transition hover:border-blue-500 hover:text-blue-300"
        >
          + Add tag
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Recent Activities
        </h3>
        <div className="flex flex-col gap-3">
          {recent.map((activity) => (
            <div
              key={activity.id}
              className="rounded-xl border border-slate-700/40 bg-slate-900/50 p-3"
            >
              <p className="text-xs uppercase tracking-wide text-slate-500">{activity.type}</p>
              <p className="mt-1 text-sm text-slate-200">{activity.notes || '—'}</p>
              <p className="mt-2 text-xs text-slate-500">
                {new Date(activity.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
          {recent.length === 0 && <p className="text-xs text-slate-500">No activities yet.</p>}
        </div>
      </div>
    </aside>
  );
};
