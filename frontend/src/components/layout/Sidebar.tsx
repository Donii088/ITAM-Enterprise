import { NavLink } from 'react-router-dom';
import { Boxes, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { navSections } from './nav-config';
import { useAuth } from '@/features/auth/useAuth';
import { hasRole } from '@/lib/permissions';
import { useUiStore } from '@/stores/ui-store';
import { cn } from '@/lib/utils';
import { SimpleTooltip } from '@/components/ui/Tooltip';

const APP_NAME = import.meta.env.VITE_APP_NAME || 'ITAM Enterprise';

export function SidebarContent({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const { user } = useAuth();

  return (
    <div className="flex h-full flex-col">
      <div className={cn('flex h-16 items-center gap-2.5 px-4', collapsed && 'justify-center px-2')}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-white shadow-soft">
          <Boxes className="h-4.5 w-4.5" />
        </div>
        {!collapsed && <span className="truncate text-sm font-bold tracking-tight text-foreground">{APP_NAME}</span>}
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4 scrollbar-thin" aria-label="Primary">
        {navSections.map((section, idx) => {
          const visibleItems = section.items.filter((item) => hasRole(user?.role, item.roles));
          if (visibleItems.length === 0) return null;

          return (
            <div key={idx}>
              {section.title && !collapsed && (
                <p className="mb-1.5 px-2.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground/80">
                  {section.title}
                </p>
              )}
              <ul className="space-y-0.5">
                {visibleItems.map((item) => {
                  const link = (
                    <NavLink
                      to={item.to}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        cn(
                          'focus-ring group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
                          collapsed && 'justify-center px-2',
                          isActive
                            ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        )
                      }
                      aria-current={undefined}
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary-600 dark:bg-primary-400" aria-hidden="true" />
                          )}
                          <item.icon className={cn('h-4.5 w-4.5 shrink-0', isActive && 'text-primary-600 dark:text-primary-400')} />
                          {!collapsed && <span className="truncate">{item.label}</span>}
                        </>
                      )}
                    </NavLink>
                  );

                  return (
                    <li key={item.to}>
                      {collapsed ? <SimpleTooltip label={item.label}>{link}</SimpleTooltip> : link}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
    </div>
  );
}

export function DesktopSidebar() {
  const { sidebarCollapsed, toggleSidebarCollapsed } = useUiStore();

  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-screen shrink-0 border-r border-border bg-surface transition-[width] duration-200 ease-premium lg:flex lg:flex-col',
        sidebarCollapsed ? 'w-[72px]' : 'w-64',
      )}
    >
      <div className="flex-1 overflow-hidden">
        <SidebarContent collapsed={sidebarCollapsed} />
      </div>
      <button
        onClick={toggleSidebarCollapsed}
        className="focus-ring flex h-11 items-center justify-center gap-2 border-t border-border text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {sidebarCollapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
      </button>
    </aside>
  );
}
