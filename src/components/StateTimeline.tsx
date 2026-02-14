import { STATE_LABELS, type CrqState } from '@/lib/constants';
import { Check, Circle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const ORDERED_STATES: CrqState[] = [
  'draft', 'impact_analysis', 'approval_pending', 'cab_review',
  'scheduled', 'pre_validation', 'implemented', 'closed',
];

interface StateTimelineProps {
  currentState: CrqState;
}

export default function StateTimeline({ currentState }: StateTimelineProps) {
  const isRejected = currentState === 'rejected';
  const currentIndex = ORDERED_STATES.indexOf(currentState);

  return (
    <div className="bg-card border rounded-xl p-6">
      <h3 className="text-sm font-semibold mb-4">Lifecycle Progress</h3>
      <div className="relative">
        <div className="flex items-center justify-between">
          {ORDERED_STATES.map((state, i) => {
            const isPast = i < currentIndex;
            const isCurrent = state === currentState;
            return (
              <div key={state} className="flex flex-col items-center relative z-10">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                  isPast && 'bg-primary text-primary-foreground',
                  isCurrent && !isRejected && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                  !isPast && !isCurrent && 'bg-muted text-muted-foreground',
                )}>
                  {isPast ? <Check className="w-4 h-4" /> : isCurrent ? <Circle className="w-3 h-3 fill-current" /> : i + 1}
                </div>
                <span className={cn(
                  'text-[10px] mt-2 text-center max-w-[60px] leading-tight',
                  (isPast || isCurrent) ? 'text-foreground font-medium' : 'text-muted-foreground'
                )}>
                  {STATE_LABELS[state]}
                </span>
              </div>
            );
          })}
        </div>
        {/* Connecting line */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-muted -z-0" />
        <div
          className="absolute top-4 left-4 h-0.5 bg-primary -z-0 transition-all"
          style={{ width: `${Math.max(0, (currentIndex / (ORDERED_STATES.length - 1)) * 100)}%` }}
        />
      </div>

      {isRejected && (
        <div className="mt-4 flex items-center gap-2 text-destructive text-sm">
          <X className="w-4 h-4" />
          <span className="font-medium">This CRQ has been rejected</span>
        </div>
      )}
    </div>
  );
}
