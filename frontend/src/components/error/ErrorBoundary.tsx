import * as React from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('Unhandled application error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-500/10">
            <AlertTriangle className="h-7 w-7 text-danger" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-bold text-foreground">Something went wrong</h1>
            <p className="max-w-md text-sm text-muted-foreground">
              An unexpected error occurred while rendering this page. Try reloading — if the problem persists,
              contact your IT administrator.
            </p>
          </div>
          <Button onClick={() => window.location.reload()} leftIcon={<RotateCw className="h-4 w-4" />}>
            Reload page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
