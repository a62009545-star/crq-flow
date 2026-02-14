import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateCrq } from '@/hooks/useCrqs';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DOMAINS, type ChangeType } from '@/lib/constants';
import { ArrowLeft } from 'lucide-react';

export default function CrqCreate() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const createCrq = useCreateCrq();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [domain, setDomain] = useState(profile?.domain || '');
  const [changeType, setChangeType] = useState<ChangeType>('standard');
  const [scheduledDate, setScheduledDate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createCrq.mutateAsync({
      title,
      description,
      domain,
      change_type: changeType,
      scheduled_date: scheduledDate || undefined,
    });
    navigate('/crqs');
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create CRQ</h1>
          <p className="text-muted-foreground text-sm mt-1">Submit a new change request</p>
        </div>
      </div>

      <div className="bg-card border rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Brief description of the change" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detailed description of the change request..." rows={5} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Domain *</Label>
              <Select value={domain} onValueChange={setDomain} required>
                <SelectTrigger><SelectValue placeholder="Select domain" /></SelectTrigger>
                <SelectContent>
                  {DOMAINS.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Change Type *</Label>
              <Select value={changeType} onValueChange={(v) => setChangeType(v as ChangeType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="latent">Latent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduled">Scheduled Date (optional)</Label>
            <Input id="scheduled" type="datetime-local" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={createCrq.isPending}>
              {createCrq.isPending ? 'Creating...' : 'Create CRQ'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
