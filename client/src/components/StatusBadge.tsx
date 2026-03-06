import { Badge } from '@/components/ui/badge';
import { TaskStatus } from '@/types';

interface StatusBadgeProps {
  status: TaskStatus;
}

const statusConfig: Record<TaskStatus, { label: string; variant: 'pending' | 'inProgress' | 'secondary' | 'completed' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pending', variant: 'pending' },
  in_progress: { label: 'In Progress', variant: 'inProgress' },
  submitted: { label: 'Submitted', variant: 'secondary' },
  rework_required: { label: 'Rework Required', variant: 'destructive' },
  late_rework_required: { label: 'Late Rework Required', variant: 'destructive' },
  completed: { label: 'Completed', variant: 'completed' },
  completed_late_rework: { label: 'Completed (Late)', variant: 'completed' },
  overdue: { label: 'Overdue', variant: 'destructive' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return <Badge variant={config.variant as any}>{config.label}</Badge>;
}
