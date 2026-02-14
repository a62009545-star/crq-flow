import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { ALLOWED_TRANSITIONS, type CrqState, type ChangeType } from '@/lib/constants';
import { toast } from 'sonner';

export interface Crq {
  id: string;
  title: string;
  description: string;
  domain: string;
  change_type: ChangeType;
  state: CrqState;
  created_by: string;
  scheduled_date: string | null;
  created_at: string;
  updated_at: string;
}

export function useCrqs() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['crqs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crqs')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Crq[];
    },
    enabled: !!user,
  });
}

export function useCrq(id: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['crq', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crqs')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data as Crq | null;
    },
    enabled: !!user && !!id,
  });
}

export function useCreateCrq() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: { title: string; description: string; domain: string; change_type: ChangeType; scheduled_date?: string }) => {
      const { error } = await supabase.from('crqs').insert({
        ...data,
        created_by: user!.id,
        state: 'draft' as any,
        change_type: data.change_type as any,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crqs'] });
      toast.success('CRQ created successfully');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useTransitionCrq() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, currentState, newState }: { id: string; currentState: CrqState; newState: CrqState }) => {
      const allowed = ALLOWED_TRANSITIONS[currentState];
      if (!allowed || !allowed.includes(newState)) {
        throw new Error(`Transition from ${currentState} to ${newState} is not allowed`);
      }

      const { error: updateError } = await supabase
        .from('crqs')
        .update({ state: newState as any })
        .eq('id', id);
      if (updateError) throw updateError;

      // Create audit log
      await supabase.from('audit_log').insert({
        crq_id: id,
        action: 'STATE_CHANGE',
        previous_state: currentState,
        new_state: newState,
        performed_by: user!.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crqs'] });
      queryClient.invalidateQueries({ queryKey: ['crq'] });
      queryClient.invalidateQueries({ queryKey: ['audit_log'] });
      toast.success('State updated successfully');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAuditLog(crqId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['audit_log', crqId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_log')
        .select('*')
        .eq('crq_id', crqId)
        .order('timestamp', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!crqId,
  });
}
