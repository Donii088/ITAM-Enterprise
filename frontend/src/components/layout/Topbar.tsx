import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';
import { GlobalSearchBox } from './GlobalSearchBox';
import { useUiStore } from '@/stores/ui-store';

export function Topbar({ title }: { title?: string }) {
  const setMobileSidebarOpen = useUiStore((s) => s.setMobileSidebarOpen);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-surface/80 sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setMobileSidebarOpen(true)}
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {title && <h2 className="truncate text-sm font-semibold text-foreground lg:hidden">{title}</h2>}

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <GlobalSearchBox />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
