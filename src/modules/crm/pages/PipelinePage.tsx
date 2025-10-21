import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { CRMErrorBoundary } from '../components/CRMErrorBoundary';
import { PipelineBoard } from '../components/PipelineBoard';
import { useDeals } from '../hooks/useDeals';
import { crmService } from '../services/crm.service';
import { CRMDeal, DealStage } from '../types/crm.types';
import { stageLabels } from '../utils/crm.utils';

interface NewDealForm {
  title: string;
  value: number;
  clientId: string;
  stage: DealStage;
  probability: number;
  owner: string;
}

export const PipelinePage = () => {
  const { grouped, moveDeal, deals, filters, setFilters, loading, addDeal } = useDeals();
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset } = useForm<NewDealForm>({
    defaultValues: {
      stage: 'Lead',
      probability: 30
    }
  });

  return (
    <CRMErrorBoundary>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white">Воронка продажів</h1>
            <p className="text-sm text-slate-400">Контролюйте кожну стадію угод та конверсію.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-500"
          >
            <PlusCircle className="h-4 w-4" /> Нова угода
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-700/50 bg-slate-900/60 p-4 text-sm text-slate-300">
          <div className="flex items-center gap-2">
            <span>Менеджер:</span>
            <select
              value={filters.owner ?? 'all'}
              onChange={(event) => setFilters({ ...filters, owner: event.target.value as string })}
              className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1"
            >
              <option value="all">Всі</option>
              {Array.from(new Set(deals.map((deal) => deal.owner))).map((owner) => (
                <option key={owner} value={owner}>
                  {owner}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span>Мін. сума:</span>
            <input
              type="number"
              className="w-24 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1"
              onChange={(event) => {
                const value = event.target.value;
                setFilters({ ...filters, minValue: value ? Number(value) : undefined });
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <span>Макс. сума:</span>
            <input
              type="number"
              className="w-24 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1"
              onChange={(event) => {
                const value = event.target.value;
                setFilters({ ...filters, maxValue: value ? Number(value) : undefined });
              }}
            />
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400">Завантаження угод...</p>
        ) : (
          <PipelineBoard
            groupedDeals={grouped}
            onMoveDeal={moveDeal}
            onQuickEdit={async (deal: CRMDeal) => {
              const newProbability = prompt('Нова ймовірність', String(deal.probability));
              if (newProbability) {
                await crmService.updateDeal(deal.id, { probability: Number(newProbability) });
              }
            }}
          />
        )}

        {showForm && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur">
            <div className="w-full max-w-lg rounded-2xl border border-slate-700/60 bg-slate-900/90 p-6 shadow-2xl shadow-black/30">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Нова угода</h3>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-slate-600/60 px-3 py-1 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
                >
                  Закрити
                </button>
              </div>

              <form
                className="flex flex-col gap-3"
                onSubmit={handleSubmit(async (values) => {
                  await addDeal({
                    ...values,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  });
                  reset();
                  setShowForm(false);
                })}
              >
                <label className="flex flex-col text-xs uppercase tracking-wide text-slate-400">
                  Назва угоди
                  <input {...register('title', { required: true })} className="mt-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" />
                </label>
                <label className="flex flex-col text-xs uppercase tracking-wide text-slate-400">
                  Клієнт
                  <input {...register('clientId', { required: true })} placeholder="ID клієнта" className="mt-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" />
                </label>
                <label className="flex flex-col text-xs uppercase tracking-wide text-slate-400">
                  Вартість
                  <input type="number" {...register('value', { valueAsNumber: true })} className="mt-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" />
                </label>
                <label className="flex flex-col text-xs uppercase tracking-wide text-slate-400">
                  Ймовірність
                  <input type="number" {...register('probability', { valueAsNumber: true })} className="mt-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" />
                </label>
                <label className="flex flex-col text-xs uppercase tracking-wide text-slate-400">
                  Власник
                  <input {...register('owner', { required: true })} className="mt-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" />
                </label>
                <label className="flex flex-col text-xs uppercase tracking-wide text-slate-400">
                  Стадія
                  <select {...register('stage')} className="mt-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2">
                    {stageLabels.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="submit"
                  className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                  Створити
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </CRMErrorBoundary>
  );
};
