import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  invalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', leftIcon, rightElement, invalid, ...props }, ref) => {
    if (leftIcon || rightElement) {
      return (
        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            type={type}
            aria-invalid={invalid}
            className={cn(
              'focus-ring flex h-10 w-full min-w-0 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-xs transition-colors placeholder:text-muted-foreground hover:border-muted-foreground/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border',
              leftIcon && 'pl-9',
              rightElement && 'pr-9',
              invalid && 'border-danger hover:border-danger focus-visible:ring-danger',
              className,
            )}
            {...props}
          />
          {rightElement && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2">{rightElement}</span>
          )}
        </div>
      );
    }

    return (
      <input
        ref={ref}
        type={type}
        aria-invalid={invalid}
        className={cn(
          'focus-ring flex h-10 w-full min-w-0 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-xs transition-colors placeholder:text-muted-foreground hover:border-muted-foreground/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border',
          invalid && 'border-danger hover:border-danger focus-visible:ring-danger',
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';
