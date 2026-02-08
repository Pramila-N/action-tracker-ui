import { Badge } from '@/components/ui/badge';
import { TaskStatus } from '@/types';

interface StatusBadgeProps {
  status: TaskStatus;
}

const statusConfig: Record<TaskStatus, { label: string; variant: 'pending' | 'inProgress' | 'completed' | 'overdue' }> = {
  pending: { label: 'Pending', variant: 'pending' },
  in_progress: { label: 'In Progress', variant: 'inProgress' },
  completed: { label: 'Completed', variant: 'completed' },
  overdue: { label: 'Overdue', variant: 'overdue' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
