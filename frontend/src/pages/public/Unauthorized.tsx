import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { routes } from '@/routes/routes';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 ring-1 ring-inset ring-amber-600/10 dark:bg-amber-500/10 dark:ring-amber-400/15">
        <ShieldAlert className="h-7 w-7 text-warning" />
      </div>
      <div className="space-y-1.5">
        <p className="text-sm font-semibold tracking-tight text-warning">403</p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Access denied</h1>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          You don't have permission to view this page. If you think this is a mistake, contact your IT
          administrator.
        </p>
      </div>
      <div className="mt-2 flex gap-2">
        <button
          onClick={() => navigate(-1)}
          className="focus-ring inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-medium text-foreground shadow-xs transition-all duration-150 hover:bg-muted active:scale-[0.98]"
        >
          <ArrowLeft className="h-4 w-4" /> Go back
        </button>
        <Link
          to={routes.dashboard}
          className="focus-ring inline-flex h-10 items-center gap-2 rounded-lg bg-primary-600 px-4 text-sm font-medium text-white shadow-soft transition-all duration-150 hover:bg-primary-700 hover:shadow-glow-primary active:scale-[0.98]"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
