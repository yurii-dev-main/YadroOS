import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { CRMDeal, DealStage } from '../types/crm.types';
import { formatCurrency } from '../utils/crm.utils';

interface DealCardProps {
  deal: CRMDeal;
  stage: DealStage;
  onQuickEdit: (deal: CRMDeal) => void;
}

export const DealCard = ({ deal, stage, onQuickEdit }: DealCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: deal.id, data: { stage } });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group flex cursor-grab flex-col gap-3 rounded-2xl border border-slate-700/60 bg-slate-900/80 p-4 text-left shadow-lg shadow-black/30 transition hover:-translate-y-1 hover:border-blue-500/60 hover:bg-slate-900"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-white">{deal.title}</h4>
        <button
          type="button"
          onClick={() => onQuickEdit(deal)}
          className="rounded-lg border border-slate-600/60 px-2 py-1 text-xs text-slate-300 opacity-0 transition group-hover:opacity-100"
        >
          Редагувати
        </button>
      </div>
      <div className="text-xs text-slate-400">{deal.clientName}</div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-emerald-400">{formatCurrency(deal.value)}</span>
        <span className="text-slate-400">Імовірність: {deal.probability}%</span>
      </div>
      {deal.closeDate && <div className="text-xs text-slate-500">Закриття: {new Date(deal.closeDate).toLocaleDateString()}</div>}
    </div>
  );
};
