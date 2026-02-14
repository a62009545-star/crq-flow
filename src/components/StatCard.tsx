import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  accent?: string;
}

export default function StatCard({ title, value, icon: Icon, accent }: StatCardProps) {
  return (
    <div className="bg-card border rounded-xl p-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold mt-1 tracking-tight">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accent || 'bg-primary/10'}`}>
          <Icon className={`w-5 h-5 ${accent ? 'text-primary-foreground' : 'text-primary'}`} />
        </div>
      </div>
    </div>
  );
}
