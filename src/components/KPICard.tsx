import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function KPICard({ title, value, change, changeLabel, icon, trend, className }: KPICardProps) {
  return (
    <Card className={cn("shadow-card hover:shadow-card-hover transition-all duration-300", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {change !== undefined && (
              <div className="flex items-center gap-1">
                {trend === 'up' && <TrendingUp className="h-4 w-4 text-success" />}
                {trend === 'down' && <TrendingDown className="h-4 w-4 text-destructive" />}
                {trend === 'neutral' && <Minus className="h-4 w-4 text-muted-foreground" />}
                <span className={cn(
                  "text-sm font-medium",
                  trend === 'up' && "text-success",
                  trend === 'down' && "text-destructive",
                  trend === 'neutral' && "text-muted-foreground"
                )}>
                  {change > 0 ? '+' : ''}{change}%
                </span>
                {changeLabel && (
                  <span className="text-sm text-muted-foreground">{changeLabel}</span>
                )}
              </div>
            )}
          </div>
          <div className="rounded-xl bg-primary/10 p-3">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
