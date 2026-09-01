import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Paperclip, RefreshCcw, Trash2, Wrench, XCircle } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/PageLoader';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { TicketPriorityBadge, TicketStatusBadge } from '@/components/ui/StatusBadge';
import { AttachmentPanel } from '@/components/shared/AttachmentPanel';
import { useTicket, useCancelTicket, useDeleteTicket } from '@/features/tickets/useTickets';
import { useTicketAttachments, useDeleteAttachment, useDownloadAttachment, useUploadTicketAttachment } from '@/features/attachments/useAttachments';
import { useTicketRepairs } from '@/features/repairs/useRepairs';
import { useAuth } from '@/features/auth/useAuth';
import { isItAdmin } from '@/lib/permissions';
import { TicketStatusDialog } from './components/TicketStatusDialog';
import { ResolveTicketDialog } from './components/ResolveTicketDialog';
import { formatDate, formatDateTime } from '@/lib/formatters';
import { queryKeys } from '@/lib/query-keys';
import { routes } from '@/routes/routes';
import { ASSET_TYPE_LABELS, TICKET_STATUS } from '@/types';

function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value ?? '—'}</p>
    </div>
  );
}

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const admin = isItAdmin(user?.role);

  const [statusOpen, setStatusOpen] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: ticket, isLoading, isError, error, refetch } = useTicket(id);
  const { data: attachments, isLoading: attachmentsLoading } = useTicketAttachments(id);
  const { data: repairs, isLoading: repairsLoading } = useTicketRepairs(id);

  const uploadAttachment = useUploadTicketAttachment();
  const downloadAttachment = useDownloadAttachment();
  const deleteAttachment = useDeleteAttachment(queryKeys.attachments.byTicket(id ?? ''));
  const cancelTicket = useCancelTicket();
  const deleteTicket = useDeleteTicket();

  useEffect(() => {
    document.title = ticket ? `${ticket.title} — ITAM Enterprise` : 'Ticket — ITAM Enterprise';
  }, [ticket]);

  if (isLoading) return <PageLoader />;
  if (isError || !ticket) {
    return (
      <Card>
        <ErrorState error={error} onRetry={() => refetch()} />
      </Card>
    );
  }

  const isOwner = ticket.employeeId === user?.id;
  const isTerminal = ticket.status === TICKET_STATUS.Done || ticket.status === TICKET_STATUS.Cancelled;
  // Owner-only, no admin override — admins manage a ticket's lifecycle via Update status /
  // Resolve / Delete instead. Matches TicketService.CancelAsync on the backend.
  const cancellable = (ticket.status === TICKET_STATUS.Open || ticket.status === TICKET_STATUS.OnReview) && isOwner;
  const resolvable = admin && !isTerminal;
  // Status can only move between the non-terminal states from here — Done is reached solely via
  // Resolve, and once a ticket is Done or Cancelled the backend refuses any further status change.
  const statusEditable = admin && !isTerminal;

  return (
    <div className="space-y-6">
      <PageHeader
        title={ticket.title}
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: admin ? 'All Tickets' : 'My Tickets', to: admin ? routes.tickets.list : routes.tickets.mine },
              { label: ticket.title },
            ]}
          />
        }
        actions={
          <>
            {statusEditable && (
              <Button variant="outline" size="sm" leftIcon={<RefreshCcw className="h-4 w-4" />} onClick={() => setStatusOpen(true)}>
                Update status
              </Button>
            )}
            {resolvable && (
              <Button variant="primary" size="sm" leftIcon={<CheckCircle2 className="h-4 w-4" />} onClick={() => setResolveOpen(true)}>
                Resolve ticket
              </Button>
            )}
            {cancellable && (
              <Button variant="danger" size="sm" leftIcon={<XCircle className="h-4 w-4" />} onClick={() => setCancelOpen(true)}>
                Cancel
              </Button>
            )}
            {admin && (
              <Button variant="danger" size="sm" leftIcon={<Trash2 className="h-4 w-4" />} onClick={() => setDeleteOpen(true)}>
                Delete
              </Button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Ticket details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <DetailField label="Status" value={<TicketStatusBadge status={ticket.status} />} />
              <DetailField label="Priority" value={<TicketPriorityBadge priority={ticket.priority} />} />
              <DetailField label="Reported by" value={ticket.employeeName} />
              <DetailField
                label="Asset"
                value={`${ticket.assetBrand ?? ''} ${ticket.assetModel ?? ticket.assetSerial ?? ASSET_TYPE_LABELS[ticket.assetType]}`.trim()}
              />
              <DetailField label="Created" value={formatDateTime(ticket.createdAt)} />
              <DetailField label="Last updated" value={ticket.updatedAt ? formatDateTime(ticket.updatedAt) : 'Never'} />
            </div>
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Description</p>
              <p className="whitespace-pre-wrap text-sm text-foreground">{ticket.description}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-muted-foreground" /> Attachments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AttachmentPanel
              attachments={attachments}
              isLoading={attachmentsLoading}
              canUpload
              canDelete
              isUploading={uploadAttachment.isPending}
              isDeleting={deleteAttachment.isPending}
              onUpload={(file) => uploadAttachment.mutate({ entityId: id as string, file })}
              onDownload={(attachment) => downloadAttachment.mutate(attachment)}
              onDelete={(attachment) => deleteAttachment.mutate(attachment.id)}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-muted-foreground" /> Repair history
          </CardTitle>
        </CardHeader>
        <CardContent>
          {repairsLoading ? null : !repairs || repairs.length === 0 ? (
            <EmptyState icon={Wrench} title="Not resolved yet" description="A repair entry will appear here once this ticket is resolved." />
          ) : (
            <ul className="divide-y divide-border">
              {repairs.map((repair) => (
                <li key={repair.id} className="py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">Resolved by {repair.adminName}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(repair.repairDate)}</p>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{repair.repairDescription}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <TicketStatusDialog open={statusOpen} onOpenChange={setStatusOpen} ticketId={ticket.id} currentStatus={ticket.status} />
      <ResolveTicketDialog open={resolveOpen} onOpenChange={setResolveOpen} ticketId={ticket.id} />

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel ticket"
        description={`Cancel the ticket "${ticket.title}"? This cannot be undone.`}
        confirmLabel="Cancel ticket"
        isLoading={cancelTicket.isPending}
        onConfirm={() => cancelTicket.mutate(ticket.id, { onSuccess: () => setCancelOpen(false) })}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete ticket"
        description={`This will permanently delete the ticket "${ticket.title}", along with its repair history and photo attachments. This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={deleteTicket.isPending}
        onConfirm={() =>
          deleteTicket.mutate(ticket.id, {
            onSuccess: () => navigate(admin ? routes.tickets.list : routes.tickets.mine),
          })
        }
      />
    </div>
  );
}
