import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { DesktopSidebar } from './Sidebar';
import { MobileSidebar } from './MobileSidebar';
import { Topbar } from './Topbar';
import { PageLoader } from '@/components/ui/PageLoader';

export function DashboardLayout() {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <DesktopSidebar />
      <MobileSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main id="main-content" className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
