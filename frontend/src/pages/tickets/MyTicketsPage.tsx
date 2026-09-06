import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Ticket as TicketIcon, XCircle } from 'lucide-react';
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
import { Pagination } from '@/components/ui/Pagination';
import { TicketPriorityBadge, TicketStatusBadge } from '@/components/ui/StatusBadge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useMyTickets, useCancelTicket } from '@/features/tickets/useTickets';
import { CreateTicketDialog } from './components/CreateTicketDialog';
import { formatDate } from '@/lib/formatters';
import { routes } from '@/routes/routes';
import { TICKET_STATUS, TICKET_STATUS_LABELS, type Ticket, type TicketStatus } from '@/types';

const DEFAULT_PAGE_SIZE = Number(import.meta.env.VITE_DEFAULT_PAGE_SIZE) || 10;

export default function MyTicketsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [createOpen, setCreateOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Ticket | null>(null);

  useEffect(() => {
    document.title = 'My Tickets — ITAM Enterprise';
  }, []);

  const query = useMemo(
    () => ({
      pageNumber: Number(searchParams.get('page')) || 1,
      pageSize: Number(searchParams.get('size')) || DEFAULT_PAGE_SIZE,
      searchTerm: searchParams.get('q') ?? undefined,
      status: (searchParams.get('status') as TicketStatus) || undefined,
    }),
    [searchParams],
  );

  const { data, isLoading, isError, error, refetch } = useMyTickets(query);
  const cancelTicket = useCancelTicket();

  function updateParams(patch: Record<string, string | undefined>) {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    if (!('page' in patch)) next.set('page', '1');
    setSearchParams(next);
  }

  const cancellable = (status: TicketStatus) => status === TICKET_STATUS.Open || status === TICKET_STATUS.OnReview;

  const filters = (
    <Select value={query.status ?? 'all'} onValueChange={(v) => updateParams({ status: v === 'all' ? undefined : v })}>
      <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Status" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All statuses</SelectItem>
        {Object.values(TICKET_STATUS).map((s) => (
          <SelectItem key={s} value={s}>{TICKET_STATUS_LABELS[s]}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Tickets"
        description="Issues you've reported for your assigned assets."
        actions={
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
            Report an issue
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={query.searchTerm ?? ''} onChange={(v) => updateParams({ q: v || undefined })} placeholder="Search tickets…" className="sm:max-w-xs" />
        <div className="flex items-center gap-2">
          <FilterBar>{filters}</FilterBar>
          <MobileFilterDrawer>{filters}</MobileFilterDrawer>
        </div>
      </div>

      <Card>
        {isLoading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : isError ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : data && data.items.length === 0 ? (
          <EmptyState
            icon={TicketIcon}
            title="No tickets yet"
            description="Report an issue with one of your assigned assets to get started."
            actionLabel="Report an issue"
            onAction={() => setCreateOpen(true)}
          />
        ) : (
          <>
            <TableContainer>
              <TableHead>
                <TableRow>
                  <TableTh>Title</TableTh>
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
                      <Link to={routes.tickets.detail(ticket.id)} className="transition-colors hover:text-primary-600 hover:underline">
                        {ticket.title}
                      </Link>
                    </TableTd>
                    <TableTd className="text-muted-foreground">{ticket.assetBrand ?? ''} {ticket.assetModel ?? ticket.assetSerial ?? ''}</TableTd>
                    <TableTd><TicketPriorityBadge priority={ticket.priority} /></TableTd>
                    <TableTd><TicketStatusBadge status={ticket.status} /></TableTd>
                    <TableTd className="text-muted-foreground">{formatDate(ticket.createdAt)}</TableTd>
                    <TableTd className="text-right">
                      {cancellable(ticket.status) && (
                        <Button variant="ghost" size="sm" leftIcon={<XCircle className="h-3.5 w-3.5" />} onClick={() => setCancelTarget(ticket)}>
                          Cancel
                        </Button>
                      )}
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

      <CreateTicketDialog open={createOpen} onOpenChange={setCreateOpen} />

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        title="Cancel ticket"
        description={`Cancel the ticket "${cancelTarget?.title}"? This cannot be undone.`}
        confirmLabel="Cancel ticket"
        isLoading={cancelTicket.isPending}
        onConfirm={() => {
          if (cancelTarget) cancelTicket.mutate(cancelTarget.id, { onSuccess: () => setCancelTarget(null) });
        }}
      />
    </div>
  );
}
