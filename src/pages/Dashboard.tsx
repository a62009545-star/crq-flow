import { useCrqs } from '@/hooks/useCrqs';
import { useAuth } from '@/hooks/useAuth';
import StatCard from '@/components/StatCard';
import CrqTable from '@/components/CrqTable';
import { ROLE_LABELS, STATE_LABELS, type CrqState } from '@/lib/constants';
import { FileText, Clock, CheckCircle, XCircle, AlertTriangle, Shield } from 'lucide-react';

export default function Dashboard() {
  const { profile, roles } = useAuth();
  const { data: crqs, isLoading } = useCrqs();

  const allCrqs = crqs || [];
  const stateCounts = allCrqs.reduce((acc, crq) => {
    acc[crq.state] = (acc[crq.state] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome back, {profile?.name || 'User'} · {roles.map((r) => ROLE_LABELS[r]).join(', ')}
          {profile?.domain && ` · ${profile.domain}`}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total CRQs" value={allCrqs.length} icon={FileText} />
        <StatCard title="Draft" value={stateCounts.draft || 0} icon={Clock} />
        <StatCard title="Scheduled" value={stateCounts.scheduled || 0} icon={AlertTriangle} />
        <StatCard title="Closed" value={stateCounts.closed || 0} icon={CheckCircle} />
      </div>

      {/* State Distribution */}
      <div className="bg-card border rounded-xl p-6">
        <h3 className="text-sm font-semibold mb-4">State Distribution</h3>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {(Object.keys(STATE_LABELS) as CrqState[]).map((state) => (
            <div key={state} className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{stateCounts[state] || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">{STATE_LABELS[state]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent CRQs */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Recent CRQs</h3>
        {isLoading ? (
          <div className="bg-card border rounded-xl p-12 text-center animate-pulse">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <CrqTable crqs={allCrqs.slice(0, 10)} />
        )}
      </div>
    </div>
  );
}
