import { STATE_LABELS, STATE_BADGE_CLASS, type CrqState } from '@/lib/constants';

export default function StateBadge({ state }: { state: CrqState }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${STATE_BADGE_CLASS[state]}`}>
      {STATE_LABELS[state]}
    </span>
  );
}
