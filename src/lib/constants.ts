export type CrqState = 
  | 'draft' | 'impact_analysis' | 'approval_pending' | 'cab_review'
  | 'scheduled' | 'pre_validation' | 'implemented' | 'closed' | 'rejected';

export type AppRole = 'engineer' | 'cfm' | 'domain_head' | 'cab' | 'change_manager' | 'noc';

export type ChangeType = 'standard' | 'normal' | 'emergency' | 'latent';

export const STATE_LABELS: Record<CrqState, string> = {
  draft: 'Draft',
  impact_analysis: 'Impact Analysis',
  approval_pending: 'Approval Pending',
  cab_review: 'CAB Review',
  scheduled: 'Scheduled',
  pre_validation: 'Pre-Validation',
  implemented: 'Implemented',
  closed: 'Closed',
  rejected: 'Rejected',
};

export const STATE_BADGE_CLASS: Record<CrqState, string> = {
  draft: 'state-badge-draft',
  impact_analysis: 'state-badge-impact',
  approval_pending: 'state-badge-pending',
  cab_review: 'state-badge-cab',
  scheduled: 'state-badge-scheduled',
  pre_validation: 'state-badge-pending',
  implemented: 'state-badge-implemented',
  closed: 'state-badge-closed',
  rejected: 'state-badge-rejected',
};

export const ALLOWED_TRANSITIONS: Record<string, CrqState[]> = {
  draft: ['impact_analysis'],
  impact_analysis: ['approval_pending'],
  approval_pending: ['cab_review', 'scheduled', 'rejected'],
  cab_review: ['scheduled', 'rejected'],
  scheduled: ['pre_validation'],
  pre_validation: ['implemented', 'rejected'],
  implemented: ['closed'],
};

export const ROLE_LABELS: Record<AppRole, string> = {
  engineer: 'Engineer',
  cfm: 'CFM',
  domain_head: 'Domain Head',
  cab: 'CAB Member',
  change_manager: 'Change Manager',
  noc: 'NOC',
};

export const APPROVAL_MAP: Record<string, { role: AppRole; action: string }> = {
  impact_analysis: { role: 'cfm', action: 'Review' },
  approval_pending: { role: 'domain_head', action: 'Approve / Reject' },
  cab_review: { role: 'cab', action: 'Approve / Reject' },
  scheduled: { role: 'change_manager', action: 'Confirm' },
  pre_validation: { role: 'noc', action: 'Execution Visibility' },
  closed: { role: 'change_manager', action: 'Final Close' },
};

export const DOMAINS = [
  'Network', 'Security', 'Infrastructure', 'Application', 
  'Database', 'Cloud', 'Telecom', 'Storage'
];
