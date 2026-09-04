import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import App from './App';
import { queryClient } from '@/lib/query-client';
import { AppErrorBoundary } from '@/components/error/ErrorBoundary';
import { TooltipProvider } from '@/components/ui/Tooltip';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={200}>
          <AppErrorBoundary>
            <App />
          </AppErrorBoundary>
          {/*
            bottom-right (not top-right): page headers across the app put action buttons
            (e.g. "Export CSV", "Add asset") in the top-right corner, which a top-right toast
            would sit on top of. Bottom-right never collides with in-page content.
          */}
          <Toaster
            richColors
            closeButton
            position="bottom-right"
            toastOptions={{
              classNames: {
                toast: 'rounded-xl border shadow-elevated font-sans',
                title: 'font-semibold tracking-tight',
                description: 'text-sm opacity-90',
              },
            }}
          />
        </TooltipProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
