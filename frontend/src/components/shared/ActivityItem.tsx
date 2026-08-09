import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatRelativeTime } from '@/lib/formatters';
import { cn } from '@/lib/utils';

export interface ActivityItemProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  timestamp?: string;
  to?: string;
  accent?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

const accentClasses = {
  primary: 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400',
  success: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  warning: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  danger: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
  info: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
};

export function ActivityItem({ icon: Icon, title, subtitle, timestamp, to, accent = 'primary' }: ActivityItemProps) {
  const content = (
    <div className="flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/60">
      <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', accentClasses[accent])}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{title}</p>
        {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {timestamp && <span className="shrink-0 text-xs text-muted-foreground">{formatRelativeTime(timestamp)}</span>}
    </div>
  );

  return to ? (
    <Link to={to} className="focus-ring block rounded-lg">
      {content}
    </Link>
  ) : (
    content
  );
}
