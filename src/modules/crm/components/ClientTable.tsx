import { CRMClient, ClientSortField, CRMClientSort } from '../types/crm.types';
import { formatCurrency, statusBadgeStyles, statusLabels } from '../utils/crm.utils';

interface ClientTableProps {
  clients: CRMClient[];
  loading: boolean;
  selectedIds: string[];
  onToggleSelection: (id: string) => void;
  onToggleSelectAll: () => void;
  onSort: (sort: CRMClientSort) => void;
  sort: CRMClientSort;
  onOpenClient: (id: string) => void;
}

const sortableColumns: Array<{ key: ClientSortField; label: string }> = [
  { key: 'name', label: 'Client' },
  { key: 'createdAt', label: 'Created Date' },
  { key: 'revenue', label: 'Revenue' },
  { key: 'manager', label: 'Manager' },
  { key: 'status', label: 'Status' }
];

export const ClientTable = ({
  clients,
  loading,
  selectedIds,
  onToggleSelection,
  onToggleSelectAll,
  sort,
  onSort,
  onOpenClient
}: ClientTableProps) => {
  const handleSort = (key: ClientSortField) => {
    if (sort.field === key) {
      onSort({ field: key, direction: sort.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      onSort({ field: key, direction: 'asc' });
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/60 shadow-xl shadow-black/20">
      <table className="min-w-full divide-y divide-slate-700/60">
        <thead className="bg-slate-900/70">
          <tr>
            <th className="w-12 px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-600 bg-slate-800"
                onChange={onToggleSelectAll}
                checked={selectedIds.length === clients.length && clients.length > 0}
              />
            </th>
            {sortableColumns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400"
              >
                <button
                  type="button"
                  onClick={() => handleSort(column.key)}
                  className="flex items-center gap-1 text-slate-300 transition hover:text-white"
                >
                  {column.label}
                  {sort.field === column.key && (
                    <span className="text-xs text-slate-400">
                      {sort.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              </th>
            ))}
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
              Tags
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {loading && (
            <tr>
              <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                Loading clients...
              </td>
            </tr>
          )}

          {!loading && clients.length === 0 && (
            <tr>
              <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                No clients found. Add a new client to get started.
              </td>
            </tr>
          )}

          {!loading &&
            clients.map((client) => (
              <tr
                key={client.id}
                className="group cursor-pointer bg-slate-900/50 transition hover:bg-primary/5"
                onClick={() => onOpenClient(client.id)}
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-600 bg-slate-800"
                    onClick={(event) => event.stopPropagation()}
                    onChange={() => onToggleSelection(client.id)}
                    checked={selectedIds.includes(client.id)}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-100 group-hover:text-white">
                      {client.name}
                    </span>
                    <span className="text-xs text-slate-400">{client.company}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-300">
                  {new Date(client.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-emerald-400">
                  {formatCurrency(client.revenue)}
                </td>
                <td className="px-6 py-4 text-sm text-slate-300">{client.assignedTo}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusBadgeStyles[client.status]}`}
                  >
                    {statusLabels[client.status]}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {(client.tags || []).map((tag) => (
                      <span
                        key={tag.id}
                        className="rounded-full bg-slate-800/80 px-2 py-1 text-xs text-slate-200"
                        style={{ border: `1px solid ${tag.color}` }}
                      >
                        {tag.label}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};
