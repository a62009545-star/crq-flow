import { useParams, useNavigate } from 'react-router-dom';
import { useCrq, useTransitionCrq } from '@/hooks/useCrqs';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import StateBadge from '@/components/StateBadge';
import StateTimeline from '@/components/StateTimeline';
import AuditTimeline from '@/components/AuditTimeline';
import { ALLOWED_TRANSITIONS, STATE_LABELS, APPROVAL_MAP, ROLE_LABELS, type CrqState } from '@/lib/constants';
import { ArrowLeft, Calendar, Layers, Tag } from 'lucide-react';
import { format } from 'date-fns';

export default function CrqDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: crq, isLoading } = useCrq(id!);
  const { roles } = useAuth();
  const transition = useTransitionCrq();

  if (isLoading) {
    return <div className="animate-pulse space-y-4"><div className="h-8 bg-muted rounded w-1/3" /><div className="h-64 bg-muted rounded-xl" /></div>;
  }

  if (!crq) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">CRQ not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/crqs')}>Back to List</Button>
      </div>
    );
  }

  const allowedNext = ALLOWED_TRANSITIONS[crq.state] || [];
  const approvalInfo = APPROVAL_MAP[crq.state];

  const handleTransition = (newState: CrqState) => {
    transition.mutate({ id: crq.id, currentState: crq.state, newState });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/crqs')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight">{crq.title}</h1>
            <StateBadge state={crq.state} />
          </div>
          <p className="text-sm text-muted-foreground mt-1 font-mono">{crq.id.slice(0, 8)}</p>
        </div>
      </div>

      {/* State Timeline */}
      <StateTimeline currentState={crq.state} />

      {/* Details Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-card border rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold">Details</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Layers className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Domain:</span>
              <span className="font-medium">{crq.domain}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Type:</span>
              <span className="font-medium capitalize">{crq.change_type}</span>
            </div>
            {crq.scheduled_date && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Scheduled:</span>
                <span className="font-medium">{format(new Date(crq.scheduled_date), 'MMM d, yyyy HH:mm')}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Created:</span>
              <span className="font-medium">{format(new Date(crq.created_at), 'MMM d, yyyy HH:mm')}</span>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-2">Description</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{crq.description}</p>
        </div>
      </div>

      {/* Approval Info & Actions */}
      {(allowedNext.length > 0 || approvalInfo) && (
        <div className="bg-card border rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-3">Actions</h3>
          {approvalInfo && (
            <p className="text-sm text-muted-foreground mb-3">
              Stage responsibility: <span className="font-medium text-foreground">{ROLE_LABELS[approvalInfo.role]}</span> — {approvalInfo.action}
            </p>
          )}
          <div className="flex gap-2 flex-wrap">
            {allowedNext.map((nextState) => (
              <Button
                key={nextState}
                variant={nextState === 'rejected' ? 'destructive' : 'default'}
                size="sm"
                onClick={() => handleTransition(nextState)}
                disabled={transition.isPending}
              >
                → {STATE_LABELS[nextState]}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Audit */}
      <AuditTimeline crqId={crq.id} />
    </div>
  );
}
