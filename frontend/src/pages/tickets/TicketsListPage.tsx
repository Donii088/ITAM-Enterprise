import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MoreHorizontal, RefreshCcw, Ticket as TicketIcon, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar, MobileFilterDrawer } from '@/components/ui/FilterBar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { TableContainer, TableHead, TableBody, TableRow, TableTh, TableTd } from '@/components/ui/Table';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Pagination } from '@/components/ui/Pagination';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { TicketPriorityBadge, TicketStatusBadge } from '@/components/ui/StatusBadge';
import { useDeleteTicket, useTicketsList } from '@/features/tickets/useTickets';
import { TicketStatusDialog } from './components/TicketStatusDialog';
import { formatDate } from '@/lib/formatters';
import { routes } from '@/routes/routes';
import { TICKET_PRIORITY, TICKET_STATUS, TICKET_STATUS_LABELS, type Ticket, type TicketPriority, type TicketStatus } from '@/types';

const DEFAULT_PAGE_SIZE = Number(import.meta.env.VITE_DEFAULT_PAGE_SIZE) || 10;

export default function TicketsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [statusTarget, setStatusTarget] = useState<Ticket | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Ticket | null>(null);
  const deleteTicket = useDeleteTicket();

  useEffect(() => {
    document.title = 'All Tickets — ITAM Enterprise';
  }, []);

  const query = useMemo(
    () => ({
      pageNumber: Number(searchParams.get('page')) || 1,
      pageSize: Number(searchParams.get('size')) || DEFAULT_PAGE_SIZE,
      searchTerm: searchParams.get('q') ?? undefined,
      status: (searchParams.get('status') as TicketStatus) || undefined,
      priority: (searchParams.get('priority') as TicketPriority) || undefined,
    }),
    [searchParams],
  );

  const { data, isLoading, isError, error, refetch } = useTicketsList(query);

  function updateParams(patch: Record<string, string | undefined>) {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    if (!('page' in patch)) next.set('page', '1');
    setSearchParams(next);
  }

  const activeFilterCount = [query.searchTerm, query.status, query.priority].filter(Boolean).length;

  const filters = (
    <>
      <Select value={query.status ?? 'all'} onValueChange={(v) => updateParams({ status: v === 'all' ? undefined : v })}>
        <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {Object.values(TICKET_STATUS).map((s) => (
            <SelectItem key={s} value={s}>{TICKET_STATUS_LABELS[s]}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={query.priority ?? 'all'} onValueChange={(v) => updateParams({ priority: v === 'all' ? undefined : v })}>
        <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Priority" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All priorities</SelectItem>
          {Object.values(TICKET_PRIORITY).map((p) => (
            <SelectItem key={p} value={p}>{p}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {activeFilterCount > 0 && (
        <Button variant="ghost" size="sm" onClick={() => setSearchParams({})}>
          Reset
        </Button>
      )}
    </>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="All Tickets" description="Support tickets across the organization." />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={query.searchTerm ?? ''} onChange={(v) => updateParams({ q: v || undefined })} placeholder="Search tickets…" className="sm:max-w-xs" />
        <div className="flex items-center gap-2">
          <FilterBar>{filters}</FilterBar>
          <MobileFilterDrawer activeCount={activeFilterCount} onReset={() => setSearchParams({})}>
            {filters}
          </MobileFilterDrawer>
        </div>
      </div>

      <Card>
        {isLoading ? (
          <TableSkeleton rows={8} cols={7} />
        ) : isError ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : data && data.items.length === 0 ? (
          <EmptyState icon={TicketIcon} title="No tickets found" description={activeFilterCount > 0 ? 'Try adjusting your filters.' : 'No tickets have been submitted yet.'} />
        ) : (
          <>
            <TableContainer>
              <TableHead>
                <TableRow>
                  <TableTh>Title</TableTh>
                  <TableTh>Employee</TableTh>
                  <TableTh>Asset</TableTh>
                  <TableTh>Priority</TableTh>
                  <TableTh>Status</TableTh>
                  <TableTh>Created</TableTh>
                  <TableTh className="text-right">Actions</TableTh>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.items.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableTd className="font-medium">
                      <Link to={routes.tickets.detail(ticket.id)} className="hover:text-primary-600 hover:underline">
                        {ticket.title}
                      </Link>
                    </TableTd>
                    <TableTd>{ticket.employeeName}</TableTd>
                    <TableTd className="text-muted-foreground">{ticket.assetBrand ?? ''} {ticket.assetModel ?? ticket.assetSerial ?? ''}</TableTd>
                    <TableTd><TicketPriorityBadge priority={ticket.priority} /></TableTd>
                    <TableTd><TicketStatusBadge status={ticket.status} /></TableTd>
                    <TableTd className="text-muted-foreground">{formatDate(ticket.createdAt)}</TableTd>
                    <TableTd className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Actions for ${ticket.title}`}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => setStatusTarget(ticket)}
                            disabled={ticket.status === TICKET_STATUS.Done || ticket.status === TICKET_STATUS.Cancelled}
                          >
                            <RefreshCcw className="h-4 w-4" /> Update status
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem destructive onClick={() => setDeleteTarget(ticket)}>
                            <Trash2 className="h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableTd>
                  </TableRow>
                ))}
              </TableBody>
            </TableContainer>
            {data && (
              <Pagination
                pageNumber={data.pageNumber}
                pageSize={data.pageSize}
                totalCount={data.totalCount}
                totalPages={data.totalPages}
                hasPrevious={data.hasPrevious}
                hasNext={data.hasNext}
                onPageChange={(page) => updateParams({ page: String(page) })}
                onPageSizeChange={(size) => updateParams({ size: String(size), page: '1' })}
              />
            )}
          </>
        )}
      </Card>

      {statusTarget && (
        <TicketStatusDialog
          open={Boolean(statusTarget)}
          onOpenChange={(open) => !open && setStatusTarget(null)}
          ticketId={statusTarget.id}
          currentStatus={statusTarget.status}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete ticket"
        description={`This will permanently delete the ticket "${deleteTarget?.title}", along with its repair history and photo attachments. This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={deleteTicket.isPending}
        onConfirm={() => {
          if (deleteTarget) deleteTicket.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
        }}
      />
    </div>
  );
}
