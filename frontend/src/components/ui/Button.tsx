import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-soft hover:shadow-glow-primary',
  secondary: 'bg-muted text-foreground hover:bg-muted/70',
  outline: 'border border-border bg-surface hover:bg-muted text-foreground shadow-xs',
  ghost: 'bg-transparent hover:bg-muted text-foreground',
  danger: 'bg-danger text-white hover:bg-rose-700 shadow-soft',
  link: 'bg-transparent text-primary-600 hover:text-primary-700 hover:underline underline-offset-4 p-0 h-auto',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-6 text-base gap-2',
  icon: 'h-10 w-10 p-0 justify-center',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, disabled, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          'focus-ring inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 ease-out disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap active:scale-[0.98]',
          variantClasses[variant],
          variant !== 'link' && sizeClasses[size],
          className,
        )}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : leftIcon}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  },
);
Button.displayName = 'Button';
