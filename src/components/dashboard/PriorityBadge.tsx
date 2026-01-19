import { cn } from '@/lib/utils';

interface PriorityBadgeProps {
  priority: 'Critical' | 'Medium' | 'Low';
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const styles = {
    Critical: 'bg-destructive text-destructive-foreground',
    Medium: 'bg-warning text-warning-foreground',
    Low: 'bg-muted text-muted-foreground',
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      styles[priority]
    )}>
      {priority}
    </span>
  );
}
