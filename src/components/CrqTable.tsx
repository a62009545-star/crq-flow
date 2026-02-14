import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import StateBadge from './StateBadge';
import type { Crq } from '@/hooks/useCrqs';
import { format } from 'date-fns';

interface CrqTableProps {
  crqs: Crq[];
}

export default function CrqTable({ crqs }: CrqTableProps) {
  const navigate = useNavigate();

  if (crqs.length === 0) {
    return (
      <div className="bg-card border rounded-xl p-12 text-center">
        <p className="text-muted-foreground">No CRQs found</p>
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border">
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">ID</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Domain</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">State</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {crqs.map((crq) => (
            <TableRow
              key={crq.id}
              onClick={() => navigate(`/crqs/${crq.id}`)}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <TableCell className="font-mono text-xs text-muted-foreground">{crq.id.slice(0, 8)}</TableCell>
              <TableCell className="font-medium">{crq.title}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{crq.domain}</TableCell>
              <TableCell className="text-sm capitalize text-muted-foreground">{crq.change_type}</TableCell>
              <TableCell><StateBadge state={crq.state} /></TableCell>
              <TableCell className="text-sm text-muted-foreground">{format(new Date(crq.created_at), 'MMM d, yyyy')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
