import { useState } from 'react';
import { useCrqs } from '@/hooks/useCrqs';
import CrqTable from '@/components/CrqTable';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { STATE_LABELS, type CrqState } from '@/lib/constants';

export default function CrqList() {
  const { data: crqs, isLoading } = useCrqs();
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const navigate = useNavigate();

  const filtered = (crqs || []).filter((crq) => {
    const matchSearch = crq.title.toLowerCase().includes(search.toLowerCase()) ||
      crq.domain.toLowerCase().includes(search.toLowerCase());
    const matchState = stateFilter === 'all' || crq.state === stateFilter;
    return matchSearch && matchState;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Change Requests</h1>
          <p className="text-muted-foreground text-sm mt-1">{filtered.length} CRQs</p>
        </div>
        <Button onClick={() => navigate('/crqs/new')}>
          <Plus className="w-4 h-4 mr-2" /> New CRQ
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or domain..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={stateFilter} onValueChange={setStateFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All States" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            {(Object.keys(STATE_LABELS) as CrqState[]).map((state) => (
              <SelectItem key={state} value={state}>{STATE_LABELS[state]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="bg-card border rounded-xl p-12 text-center animate-pulse">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      ) : (
        <CrqTable crqs={filtered} />
      )}
    </div>
  );
}
