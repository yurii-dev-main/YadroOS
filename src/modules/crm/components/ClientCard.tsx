import { CRMClient } from '../types/crm.types';
import { formatCurrency, statusBadgeStyles, statusLabels } from '../utils/crm.utils';

interface ClientCardProps {
  client: CRMClient;
  onOpen: (id: string) => void;
}

export const ClientCard = ({ client, onOpen }: ClientCardProps) => (
  <button
    type="button"
    onClick={() => onOpen(client.id)}
    className="group flex w-full flex-col rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6 text-left shadow-lg shadow-black/30 transition hover:-translate-y-1 hover:border-blue-500/60 hover:bg-slate-900/80 hover:shadow-blue-500/20"
  >
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold text-slate-100 group-hover:text-white">
          {client.name}
        </h3>
        <p className="text-sm text-slate-400">{client.company}</p>
      </div>
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeStyles[client.status]}`}
      >
        {statusLabels[client.status]}
      </span>
    </div>

    <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-slate-300">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">Manager</p>
        <p>{client.assignedTo}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">Revenue</p>
        <p className="font-semibold text-emerald-400">{formatCurrency(client.revenue)}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">Email</p>
        <p>{client.email}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">Phone</p>
        <p>{client.phone}</p>
      </div>
    </div>

    <div className="mt-6 flex flex-wrap gap-2">
      {client.tags.map((tag) => (
        <span
          key={tag.id}
          className="rounded-full border border-slate-600/60 bg-slate-800/80 px-2 py-1 text-xs text-slate-200"
        >
          {tag.label}
        </span>
      ))}
    </div>
  </button>
);
