import { Drawer, DrawerContent, DrawerCloseButton } from '@/components/ui/Drawer';
import { SidebarContent } from './Sidebar';
import { useUiStore } from '@/stores/ui-store';

export function MobileSidebar() {
  const { mobileSidebarOpen, setMobileSidebarOpen } = useUiStore();

  return (
    <Drawer open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
      <DrawerContent side="left" className="w-72">
        <div className="flex items-center justify-end px-3 pt-3">
          <DrawerCloseButton />
        </div>
        <div className="-mt-3 flex-1 overflow-hidden">
          <SidebarContent onNavigate={() => setMobileSidebarOpen(false)} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
