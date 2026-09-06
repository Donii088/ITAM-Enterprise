import { Outlet } from 'react-router-dom';
import { Boxes } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

const APP_NAME = import.meta.env.VITE_APP_NAME || 'ITAM Enterprise';

export function AuthLayout() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background">
      <a href="#auth-main" className="skip-link">
        Skip to content
      </a>

      {/* Ambient backdrop — restrained gradient glows + a fine grid, consistent with the app's
          design tokens (primary color, shadows) but atmospheric rather than a flat panel. */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-[0.05] dark:opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgb(var(--color-foreground)) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--color-foreground)) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute -left-24 -top-24 h-[26rem] w-[26rem] rounded-full bg-primary-400/20 blur-3xl dark:bg-primary-500/10" />
        <div className="absolute -right-32 top-1/3 h-[28rem] w-[28rem] rounded-full bg-primary-300/15 blur-3xl dark:bg-primary-400/10" />
        <div className="absolute bottom-0 left-1/3 h-[22rem] w-[22rem] rounded-full bg-primary-200/20 blur-3xl dark:bg-primary-600/10" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10">
        <div className="flex items-center gap-2.5 text-base font-bold tracking-tight text-foreground">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white shadow-soft">
            <Boxes className="h-4.5 w-4.5" />
          </div>
          {APP_NAME}
        </div>
        <ThemeToggle />
      </header>

      <main id="auth-main" className="relative z-10 flex flex-1 items-center justify-center px-4 pb-16 pt-4 sm:px-6">
        <div className="w-full max-w-[26rem] animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
