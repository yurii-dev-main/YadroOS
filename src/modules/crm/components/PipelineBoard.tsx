import { DndContext, DragEndEvent, DragOverlay, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useMemo, useState } from 'react';

import { CRMDeal, DealStage } from '../types/crm.types';
import { formatCurrency, stageLabels } from '../utils/crm.utils';
import { DealCard } from './DealCard';

interface PipelineBoardProps {
  groupedDeals: Record<DealStage, CRMDeal[]>;
  onMoveDeal: (dealId: string, stage: DealStage) => void;
  onQuickEdit: (deal: CRMDeal) => void;
}

const Column = ({
  stage,
  deals,
  onQuickEdit
}: {
  stage: DealStage;
  deals: CRMDeal[];
  onQuickEdit: (deal: CRMDeal) => void;
}) => {
  const { setNodeRef } = useDroppable({ id: stage, data: { stage } });

  return (
    <div
      ref={setNodeRef}
      className="flex h-full flex-col gap-4 rounded-3xl border border-slate-700/40 bg-slate-900/50 p-4 shadow-lg shadow-black/20"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">{stage}</h3>
        <span className="rounded-full bg-slate-800/80 px-2 py-1 text-xs text-slate-400">
          {deals.length}
        </span>
      </div>
      <SortableContext
        id={stage}
        items={deals.map((deal) => deal.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-1 flex-col gap-3">
          {deals.map((deal) => (
            <div key={deal.id} data-stage={stage}>
              <DealCard deal={deal} stage={stage} onQuickEdit={onQuickEdit} />
            </div>
          ))}
          {deals.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-700/60 bg-slate-900/40 p-6 text-center text-xs text-slate-500">
              Drag deals here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};

export const PipelineBoard = ({ groupedDeals, onMoveDeal, onQuickEdit }: PipelineBoardProps) => {
  const [activeDeal, setActiveDeal] = useState<CRMDeal | null>(null);

  const columns = useMemo(
    () =>
      stageLabels.map((stage) => ({
        id: stage,
        title: stage,
        deals: groupedDeals[stage]
      })),
    [groupedDeals]
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDeal(null);
    if (active && over) {
      const newStage = (over.data?.current?.stage ?? over.id) as DealStage;
      if (newStage) {
        onMoveDeal(active.id as string, newStage);
      }
    }
  };

  return (
    <DndContext
      onDragStart={(event) => {
        const { active } = event;
        const deal = columns
          .flatMap((column) => column.deals)
          .find((item) => item.id === active.id);
        if (deal) setActiveDeal(deal);
      }}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveDeal(null)}
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4 xl:grid-cols-7">
        {columns.map((column) => (
          <Column
            key={column.id}
            stage={column.id}
            deals={column.deals}
            onQuickEdit={onQuickEdit}
          />
        ))}
      </div>

      <DragOverlay>
        {activeDeal && (
          <div className="w-64 rounded-2xl border border-slate-700/60 bg-slate-900/80 p-4 text-left shadow-xl shadow-black/30">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white">{activeDeal.title}</h4>
              <span className="text-xs text-slate-400">{activeDeal.stage}</span>
            </div>
            <div className="mt-2 text-xs text-slate-400">{activeDeal.clientName}</div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="font-semibold text-emerald-400">
                {formatCurrency(activeDeal.value)}
              </span>
              <span className="text-slate-400">{activeDeal.probability}%</span>
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};
