import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { CRMDeal, DealStage } from '../types/crm.types';
import { formatCurrency } from '../utils/crm.utils';

interface DealCardProps {
  deal: CRMDeal;
  stage: DealStage;
  onQuickEdit: (deal: CRMDeal) => void;
}

interface DealCardViewProps {
  deal: CRMDeal;
  onQuickEdit?: (deal: CRMDeal) => void;
  isDragging?: boolean;
}

export const DealCardView = ({ deal, onQuickEdit, isDragging }: DealCardViewProps) => {
  return (
    <div
      className={`group flex flex-col gap-3 rounded-2xl border border-slate-700/60 bg-slate-900/80 p-4 text-left shadow-lg shadow-black/30 hover:border-primary/60 hover:bg-slate-900 ${isDragging ? 'opacity-60' : 'opacity-100'}`}
    >
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-white">{deal.title}</h4>
        {onQuickEdit && (
          <button
            type="button"
            onClick={() => onQuickEdit(deal)}
            className="rounded-lg border border-slate-600/60 px-2 py-1 text-xs text-slate-300 opacity-0 transition group-hover:opacity-100"
          >
            Edit
          </button>
        )}
      </div>
      <div className="text-xs text-slate-400">{deal.clientName}</div>
      <div className="flex flex-wrap items-center justify-between gap-1 text-sm">
        <span className="font-semibold text-emerald-400" title={formatCurrency(deal.value)}>
          {formatCurrency(deal.value)}
        </span>
        <span className="shrink-0 text-xs text-slate-400">Prob: {deal.probability}%</span>
      </div>
      {deal.closeDate && (
        <div className="text-xs text-slate-500">
          Closing: {new Date(deal.closeDate).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};

export const DealCard = ({ deal, stage, onQuickEdit }: DealCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: deal.id,
    data: { stage }
  });
  
  // When using DragOverlay, we want the original element to stay in place as a placeholder
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1, // Make the placeholder more transparent
  };
  
  if (isDragging) {
    style.transform = undefined; // Don't move the placeholder with the cursor!
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-grab">
      <DealCardView deal={deal} onQuickEdit={onQuickEdit} isDragging={isDragging} />
    </div>
  );
};
