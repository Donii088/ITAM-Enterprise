import { Outlet } from 'react-router-dom';
import { Boxes, ShieldCheck, Wrench } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

const APP_NAME = import.meta.env.VITE_APP_NAME || 'ITAM Enterprise';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <a href="#auth-main" className="skip-link">
        Skip to content
      </a>

      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-950 p-10 text-white lg:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-700 via-primary-800 to-slate-950" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
          aria-hidden="true"
        />
        <div
          className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary-400/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-primary-300/10 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative flex items-center gap-2.5 text-lg font-bold tracking-tight">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 ring-1 ring-inset ring-white/15 backdrop-blur">
            <Boxes className="h-5 w-5" />
          </div>
          {APP_NAME}
        </div>

        <div className="relative max-w-md space-y-6">
          <h1 className="text-3xl font-bold leading-tight tracking-tight">Track every asset. Resolve every ticket.</h1>
          <p className="text-primary-100/90">
            One workspace to manage laptops, desktops, monitors, and peripherals — assignments, repairs and
            support tickets, all in sync.
          </p>
          <ul className="space-y-3 text-sm text-primary-50">
            <li className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-inset ring-white/15">
                <ShieldCheck className="h-3.5 w-3.5" />
              </span>
              Role-based access for admins and employees
            </li>
            <li className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-inset ring-white/15">
                <Wrench className="h-3.5 w-3.5" />
              </span>
              Full repair &amp; ticket history per asset
            </li>
          </ul>
        </div>

        <p className="relative text-xs text-primary-200/80">© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
      </div>

      <div className="flex w-full flex-col lg:w-1/2">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-2 text-base font-bold tracking-tight text-foreground lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white shadow-soft">
              <Boxes className="h-4.5 w-4.5" />
            </div>
            {APP_NAME}
          </div>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
        <main id="auth-main" className="flex flex-1 items-center justify-center px-6 pb-16">
          <div className="w-full max-w-sm animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
