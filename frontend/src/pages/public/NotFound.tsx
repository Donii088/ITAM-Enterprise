import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';
import { routes } from '@/routes/routes';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-500/10">
        <Compass className="h-7 w-7 text-primary-600" />
      </div>
      <div className="space-y-1.5">
        <p className="text-sm font-semibold text-primary-600">404</p>
        <h1 className="text-2xl font-bold text-foreground">Page not found</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          The page you're looking for doesn't exist or may have been moved.
        </p>
      </div>
      <Link
        to={routes.dashboard}
        className="focus-ring inline-flex h-10 items-center gap-2 rounded-lg bg-primary-600 px-4 text-sm font-medium text-white shadow-soft hover:bg-primary-700"
      >
        <Home className="h-4 w-4" /> Back to dashboard
      </Link>
    </div>
  );
}
