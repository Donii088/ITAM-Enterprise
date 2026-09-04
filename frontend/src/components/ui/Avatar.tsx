import { cn } from '@/lib/utils';

export interface AvatarProps {
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-12 w-12 text-base',
};

export function Avatar({ name, className, size = 'md' }: AvatarProps) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-primary-100 font-semibold tracking-tight text-primary-700 ring-1 ring-inset ring-primary-600/10 dark:bg-primary-500/15 dark:text-primary-300 dark:ring-primary-400/15',
        sizeClasses[size],
        className,
      )}
      aria-hidden="true"
    >
      {initials || '?'}
    </div>
  );
}
