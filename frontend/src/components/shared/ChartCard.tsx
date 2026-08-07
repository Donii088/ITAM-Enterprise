import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ChartSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { BarChart3 } from 'lucide-react';

export interface ChartCardProps {
  title: string;
  description?: string;
  isLoading?: boolean;
  error?: unknown;
  isEmpty?: boolean;
  onRetry?: () => void;
  children: ReactNode;
  actions?: ReactNode;
}

export function ChartCard({ title, description, isLoading, error, isEmpty, onRetry, children, actions }: ChartCardProps) {
  if (isLoading) return <ChartSkeleton />;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        </div>
        {actions}
      </CardHeader>
      <CardContent>
        {error ? (
          <ErrorState error={error} onRetry={onRetry} />
        ) : isEmpty ? (
          <EmptyState icon={BarChart3} title="No data yet" description="Data will appear here once available." />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
