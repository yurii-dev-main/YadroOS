import { useState } from 'react';
import { createPortal } from 'react-dom';
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
  assignedTo: string;
}

export const PipelinePage = () => {
  const { grouped, moveDeal, deals, filters, setFilters, loading, addDeal } = useDeals();
  const [showForm, setShowForm] = useState(false);
  const [quickEditDeal, setQuickEditDeal] = useState<CRMDeal | null>(null);
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
            <h1 className="text-2xl font-semibold text-white">Sales Pipeline</h1>
            <p className="text-sm text-slate-400">Control every stage of deals and conversion.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:bg-primary"
          >
            <PlusCircle className="h-4 w-4" /> New Deal
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-700/50 bg-slate-900/60 p-4 text-sm text-slate-300">
          <div className="flex items-center gap-2">
            <span>Manager:</span>
            <select
              value={filters.assignedTo ?? 'all'}
              onChange={(event) => setFilters({ ...filters, assignedTo: event.target.value as string })}
              className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1"
            >
              <option value="all">All</option>
              {Array.from(new Set(deals.map((deal) => deal.assignedTo))).map((assignedTo) => (
                <option key={assignedTo} value={assignedTo}>
                  {assignedTo}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span>Min amount:</span>
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
            <span>Max amount:</span>
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
          <p className="text-sm text-slate-400">Loading deals...</p>
        ) : (
          <PipelineBoard
            groupedDeals={grouped}
            onMoveDeal={moveDeal}
            onQuickEdit={(deal: CRMDeal) => setQuickEditDeal(deal)}
          />
        )}

        {showForm && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur">
            <div className="w-full max-w-lg rounded-2xl border border-slate-700/60 bg-slate-900/90 p-6 shadow-2xl shadow-black/30">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">New Deal</h3>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-slate-600/60 px-3 py-1 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
                >
                  Close
                </button>
              </div>

              <form
                className="flex flex-col gap-3"
                onSubmit={handleSubmit(async (values) => {
                  await addDeal({
                    ...values
                  });
                  reset();
                  setShowForm(false);
                })}
              >
                <label className="flex flex-col text-xs uppercase tracking-wide text-slate-400">
                  Deal Title
                  <input
                    {...register('title', { required: true })}
                    className="mt-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
                  />
                </label>
                <label className="flex flex-col text-xs uppercase tracking-wide text-slate-400">
                  Client
                  <input
                    {...register('clientId', { required: true })}
                    placeholder="Client ID"
                    className="mt-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
                  />
                </label>
                <label className="flex flex-col text-xs uppercase tracking-wide text-slate-400">
                  Value
                  <input
                    type="number"
                    {...register('value', { valueAsNumber: true })}
                    className="mt-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
                  />
                </label>
                <label className="flex flex-col text-xs uppercase tracking-wide text-slate-400">
                  Probability
                  <input
                    type="number"
                    {...register('probability', { valueAsNumber: true })}
                    className="mt-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
                  />
                </label>
                <label className="flex flex-col text-xs uppercase tracking-wide text-slate-400">
                  Assigned To
                  <input
                    {...register('assignedTo', { required: true })}
                    className="mt-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
                  />
                </label>
                <label className="flex flex-col text-xs uppercase tracking-wide text-slate-400">
                  Stage
                  <select
                    {...register('stage')}
                    className="mt-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
                  >
                    {stageLabels.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="submit"
                  className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary"
                >
                  Create
                </button>
              </form>
            </div>
          </div>,
          document.body
        )}

        {quickEditDeal && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur">
            <div className="w-full max-w-sm rounded-2xl border border-slate-700/60 bg-slate-900/90 p-6 shadow-2xl shadow-black/30">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Update Probability</h3>
                <button
                  type="button"
                  onClick={() => setQuickEditDeal(null)}
                  className="rounded-lg border border-slate-600/60 px-3 py-1 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
                >
                  Close
                </button>
              </div>
              
              <div className="mb-2 text-sm text-slate-400">
                Select the current probability for <strong className="text-white">{quickEditDeal.title}</strong>:
              </div>
              
              <div className="mt-6 grid grid-cols-5 gap-2">
                {[0, 25, 50, 75, 100].map((prob) => (
                  <button
                    key={prob}
                    onClick={async () => {
                      await crmService.updateDeal(quickEditDeal.id, { probability: prob });
                      setQuickEditDeal(null);
                    }}
                    className={`rounded-lg border py-3 text-center text-sm font-semibold transition ${
                      quickEditDeal.probability === prob
                        ? 'border-primary bg-primary/20 text-primary'
                        : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-500 hover:bg-slate-700'
                    }`}
                  >
                    {prob}%
                  </button>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </CRMErrorBoundary>
  );
};
