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

      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-primary-700 p-10 text-white lg:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900" />
        <div className="relative flex items-center gap-2 text-lg font-bold">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
            <Boxes className="h-5 w-5" />
          </div>
          {APP_NAME}
        </div>

        <div className="relative max-w-md space-y-6">
          <h1 className="text-3xl font-bold leading-tight">Track every asset. Resolve every ticket.</h1>
          <p className="text-primary-100">
            One workspace to manage laptops, desktops, monitors, and peripherals — assignments, repairs and
            support tickets, all in sync.
          </p>
          <ul className="space-y-3 text-sm text-primary-50">
            <li className="flex items-center gap-2.5">
              <ShieldCheck className="h-4.5 w-4.5 shrink-0" /> Role-based access for admins and employees
            </li>
            <li className="flex items-center gap-2.5">
              <Wrench className="h-4.5 w-4.5 shrink-0" /> Full repair &amp; ticket history per asset
            </li>
          </ul>
        </div>

        <p className="relative text-xs text-primary-200">© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
      </div>

      <div className="flex w-full flex-col lg:w-1/2">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-2 text-base font-bold text-foreground lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
              <Boxes className="h-4.5 w-4.5" />
            </div>
            {APP_NAME}
          </div>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
        <main id="auth-main" className="flex flex-1 items-center justify-center px-6 pb-16">
          <div className="w-full max-w-sm">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
