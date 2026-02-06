import { Badge } from '@/components/ui/badge';
import { TaskPriority } from '@/types';

interface PriorityBadgeProps {
  priority: TaskPriority;
}

const priorityConfig: Record<TaskPriority, { label: string; variant: 'low' | 'medium' | 'high' }> = {
  low: { label: 'Low', variant: 'low' },
  medium: { label: 'Medium', variant: 'medium' },
  high: { label: 'High', variant: 'high' },
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = priorityConfig[priority];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
