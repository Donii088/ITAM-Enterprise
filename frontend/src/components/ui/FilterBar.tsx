import * as React from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from './Button';
import { Drawer, DrawerContent, DrawerCloseButton } from './Drawer';

export function FilterBar({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`hidden flex-wrap items-center gap-2 lg:flex ${className ?? ''}`}>{children}</div>
  );
}

export interface MobileFilterDrawerProps {
  children: React.ReactNode;
  activeCount?: number;
  onReset?: () => void;
}

export function MobileFilterDrawer({ children, activeCount = 0, onReset }: MobileFilterDrawerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="lg:hidden">
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} leftIcon={<SlidersHorizontal className="h-4 w-4" />}>
        Filters
        {activeCount > 0 && (
          <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs text-white">
            {activeCount}
          </span>
        )}
      </Button>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent side="right" className="w-80">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="text-sm font-semibold">Filters</h2>
            <div className="flex items-center gap-2">
              {onReset && activeCount > 0 && (
                <Button variant="ghost" size="sm" onClick={onReset} leftIcon={<X className="h-3.5 w-3.5" />}>
                  Reset
                </Button>
              )}
              <DrawerCloseButton />
            </div>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto p-4">{children}</div>
          <div className="border-t border-border p-4">
            <Button className="w-full" onClick={() => setOpen(false)}>
              Apply filters
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
