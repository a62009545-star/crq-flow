import { useAuditLog } from '@/hooks/useCrqs';
import { STATE_LABELS, type CrqState } from '@/lib/constants';
import { format } from 'date-fns';
import { Clock, ArrowRight } from 'lucide-react';

export default function AuditTimeline({ crqId }: { crqId: string }) {
  const { data: logs, isLoading } = useAuditLog(crqId);

  if (isLoading) return <div className="bg-card border rounded-xl p-6 animate-pulse h-32" />;

  return (
    <div className="bg-card border rounded-xl p-6">
      <h3 className="text-sm font-semibold mb-4">Audit Trail</h3>
      {!logs || logs.length === 0 ? (
        <p className="text-sm text-muted-foreground">No audit entries yet</p>
      ) : (
        <div className="space-y-4">
          {logs.map((log: any) => (
            <div key={log.id} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                <Clock className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">{log.action}</span>
                  {log.previous_state && log.new_state && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      {STATE_LABELS[log.previous_state as CrqState] || log.previous_state}
                      <ArrowRight className="w-3 h-3" />
                      {STATE_LABELS[log.new_state as CrqState] || log.new_state}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
