import { useMemo, useState } from 'react';
import { UploadCloud, Download, Plus, Mail, Trash2, Columns, Table2 } from 'lucide-react';

import { Input } from '../../../components/ui/input';
import { ClientFormModal, ClientFormValues } from '../components/ClientFormModal';
import { ClientFilters } from '../components/ClientFilters';
import { ClientTable } from '../components/ClientTable';
import { ClientCard } from '../components/ClientCard';
import { useClients } from '../hooks/useClients';
import { crmService } from '../services/crm.service';
import { ClientStatus } from '../types/crm.types';
import { downloadBlob } from '../utils/crm.utils';

const pageSizes = [10, 20, 50];

export const ClientsPage = ({ onOpenClient }: { onOpenClient: (id: string) => void }) => {
  const {
    clients,
    loading,
    error,
    search,
    setSearch,
    filters,
    setFilters,
    sort,
    setSort,
    viewMode,
    setViewMode,
    selectedIds,
    toggleSelection,
    toggleSelectAll,
    addClient,
    bulkUpdate,
    bulkDelete,
    pagination
  } = useClients();

  const [openForm, setOpenForm] = useState(false);
  const [importing, setImporting] = useState(false);

  const managers = useMemo(() => Array.from(new Set(clients.map((client) => client.assignedTo))), [clients]);
  const industries = useMemo(() => Array.from(new Set(clients.map((client) => client.industry))), [clients]);

  const handleCreate = async (values: ClientFormValues) => {
    await addClient({
      ...values,
      tags: [],
      files: [],
      notes: [],
      customFields: []
    });
  };

  const handleExport = async () => {
    const csv = await crmService.exportClientsCSV();
    downloadBlob(csv, 'clients.csv');
  };

  const handleImport = async (file: File) => {
    const content = await file.text();
    setImporting(true);
    try {
      await crmService.importClientsCSV(content);
    } finally {
      setImporting(false);
    }
  };

  const handleBulkStatus = async (status: ClientStatus) => {
    await bulkUpdate(selectedIds, { status });
  };

  const handleBulkDelete = async () => {
    if (confirm('Видалити вибраних клієнтів?')) {
      await bulkDelete(selectedIds);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">База клієнтів</h1>
          <p className="text-sm text-slate-400">Повний контроль над всіма клієнтами, угодами та взаємодіями.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setOpenForm(true)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-500"
          >
            <Plus className="h-4 w-4" /> Новий клієнт
          </button>
          <label className="flex items-center gap-2 rounded-xl border border-slate-600/60 px-4 py-2 text-sm text-slate-200 transition hover:border-blue-500 hover:text-blue-300">
            <UploadCloud className="h-4 w-4" /> Імпорт
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) handleImport(file);
              }}
            />
          </label>
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-2 rounded-xl border border-slate-600/60 px-4 py-2 text-sm text-slate-200 transition hover:border-blue-500 hover:text-blue-300"
          >
            <Download className="h-4 w-4" /> Експорт
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-700/50 bg-slate-900/60 p-4">
        <div className="flex items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-900/70 px-3 py-2">
          <Table2
            className={`h-4 w-4 cursor-pointer ${viewMode === 'table' ? 'text-blue-400' : 'text-slate-500'}`}
            onClick={() => setViewMode('table')}
          />
          <Columns
            className={`h-4 w-4 cursor-pointer ${viewMode === 'cards' ? 'text-blue-400' : 'text-slate-500'}`}
            onClick={() => setViewMode('cards')}
          />
        </div>
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Пошук клієнтів..."
          className="w-full max-w-sm"
        />
        <div className="ml-auto flex items-center gap-2 text-xs text-slate-400">
          <span>Показувати:</span>
          <select
            value={pagination.pageSize}
            onChange={(event) => pagination.setPageSize(Number(event.target.value))}
            className="rounded-lg border border-slate-700/60 bg-slate-900/70 px-2 py-1"
          >
            {pageSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ClientFilters
        filters={filters}
        managers={managers}
        industries={industries}
        onChange={setFilters}
        onReset={() => setFilters({ status: 'all', industry: 'all', assignedTo: 'all', tagIds: [], dateRange: undefined })}
      />

      {error && <p className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">{error}</p>}

      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-blue-500/40 bg-blue-500/10 p-4 text-sm text-blue-100">
          <span>{selectedIds.length} вибрано</span>
          <button
            type="button"
            onClick={() => handleBulkStatus('active')}
            className="rounded-lg border border-blue-400/60 px-3 py-1 text-xs uppercase tracking-wide text-blue-200 transition hover:border-blue-300 hover:text-white"
          >
            Позначити як активні
          </button>
          <button
            type="button"
            onClick={() => handleBulkStatus('inactive')}
            className="rounded-lg border border-blue-400/60 px-3 py-1 text-xs uppercase tracking-wide text-blue-200 transition hover:border-blue-300 hover:text-white"
          >
            Неактивні
          </button>
          <button
            type="button"
            onClick={handleBulkDelete}
            className="flex items-center gap-2 rounded-lg border border-red-400/60 px-3 py-1 text-xs uppercase tracking-wide text-red-200 transition hover:border-red-300 hover:text-white"
          >
            <Trash2 className="h-3 w-3" /> Видалити
          </button>
          <button
            type="button"
            onClick={() => alert('Масова розсилка запущена (демо)')}
            className="ml-auto flex items-center gap-2 rounded-lg border border-emerald-400/60 px-3 py-1 text-xs uppercase tracking-wide text-emerald-200 transition hover:border-emerald-300 hover:text-white"
          >
            <Mail className="h-3 w-3" /> Масова розсилка
          </button>
        </div>
      )}

      {viewMode === 'table' ? (
        <ClientTable
          clients={clients}
          loading={loading}
          selectedIds={selectedIds}
          onToggleSelection={toggleSelection}
          onToggleSelectAll={toggleSelectAll}
          sort={sort}
          onSort={setSort}
          onOpenClient={onOpenClient}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {clients.map((client) => (
            <ClientCard key={client.id} client={client} onOpen={onOpenClient} />
          ))}
          {clients.length === 0 && !loading && (
            <div className="rounded-2xl border border-dashed border-slate-700/60 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
              Немає клієнтів для відображення.
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-slate-400">
        <div>
          {pagination.total > 0 ? (
            <>
              Показано {(pagination.page - 1) * pagination.pageSize + 1}–
              {Math.min(pagination.page * pagination.pageSize, pagination.total)} з {pagination.total}
            </>
          ) : (
            'Немає результатів'
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={pagination.page === 1}
            onClick={() => pagination.setPage(Math.max(1, pagination.page - 1))}
            className="rounded-lg border border-slate-600/60 px-3 py-1 text-xs text-slate-200 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Попередня
          </button>
          <span>Сторінка {pagination.page}</span>
          <button
            type="button"
            disabled={pagination.page * pagination.pageSize >= pagination.total}
            onClick={() => pagination.setPage(pagination.page + 1)}
            className="rounded-lg border border-slate-600/60 px-3 py-1 text-xs text-slate-200 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Наступна
          </button>
        </div>
      </div>

      <ClientFormModal
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleCreate}
      />

      {importing && <p className="text-xs text-slate-500">Імпорт клієнтів...</p>}
    </div>
  );
};
