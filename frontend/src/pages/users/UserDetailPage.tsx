import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeftRight,
  Briefcase,
  Calendar,
  Clock,
  Edit,
  History,
  Laptop,
  Mail,
  ShieldCheck,
  Ticket as TicketIcon,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { ActiveBadge, TicketPriorityBadge, TicketStatusBadge } from '@/components/ui/StatusBadge';
import { PageLoader } from '@/components/ui/PageLoader';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { TableContainer, TableHead, TableBody, TableRow, TableTh, TableTd } from '@/components/ui/Table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { UserFormDialog } from './components/UserFormDialog';
import { useUser } from '@/features/users/useUsers';
import { useAssignmentsList } from '@/features/assignments/useAssignments';
import { useTicketsList } from '@/features/tickets/useTickets';
import { useAuth } from '@/features/auth/useAuth';
import { isItAdmin } from '@/lib/permissions';
import { formatDate, formatDateTime } from '@/lib/formatters';
import { routes } from '@/routes/routes';
import { ASSET_TYPE_LABELS, ROLE, ROLE_LABELS, TICKET_STATUS } from '@/types';

function DetailField({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium text-foreground">{value ?? '—'}</p>
      </div>
    </div>
  );
}

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const canEdit = isItAdmin(currentUser?.role);
  const [editOpen, setEditOpen] = useState(false);
  const { data: user, isLoading, isError, error, refetch } = useUser(id);

  useEffect(() => {
    document.title = user ? `${user.firstName} ${user.lastName} — ITAM Enterprise` : 'User — ITAM Enterprise';
  }, [user]);

  if (isLoading) return <PageLoader />;
  if (isError || !user) {
    return (
      <Card>
        <ErrorState error={error} onRetry={() => refetch()} />
      </Card>
    );
  }

  const fullName = `${user.firstName} ${user.lastName}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title={fullName}
        description={user.jobTitle}
        breadcrumbs={<Breadcrumbs items={[{ label: 'Users', to: routes.users.list }, { label: fullName }]} />}
        actions={
          canEdit ? (
            <Button size="sm" leftIcon={<Edit className="h-4 w-4" />} onClick={() => setEditOpen(true)}>
              Edit
            </Button>
          ) : undefined
        }
      />

      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-6 text-center sm:flex-row sm:text-left">
          <Avatar name={fullName} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-semibold text-foreground">{fullName}</p>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <Badge variant={user.role === ROLE.ItAdmin ? 'primary' : 'default'}>{ROLE_LABELS[user.role]}</Badge>
              <ActiveBadge isActive={user.isActive} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Contact & account details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailField icon={Mail} label="Email" value={user.email} />
              <DetailField icon={Briefcase} label="Job title" value={user.jobTitle} />
              <DetailField icon={ShieldCheck} label="Role" value={ROLE_LABELS[user.role]} />
              <DetailField icon={Calendar} label="Created" value={formatDate(user.createdAt)} />
              <DetailField icon={Clock} label="Last login" value={user.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'Never signed in'} />
              <DetailField icon={Calendar} label="Last updated" value={user.updatedAt ? formatDate(user.updatedAt) : 'Never'} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets">
          <AssetsTab employeeId={user.id} />
        </TabsContent>

        <TabsContent value="tickets">
          <TicketsTab employeeId={user.id} />
        </TabsContent>

        <TabsContent value="history">
          <HistoryTab employeeId={user.id} />
        </TabsContent>
      </Tabs>

      {canEdit && <UserFormDialog open={editOpen} onOpenChange={setEditOpen} user={user} />}
    </div>
  );
}

function AssetsTab({ employeeId }: { employeeId: string }) {
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useAssignmentsList({
    employeeId,
    activeOnly: true,
    pageSize: 100,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Laptop className="h-4 w-4 text-muted-foreground" /> Currently assigned assets
        </CardTitle>
      </CardHeader>
      {isLoading ? (
        <TableSkeleton rows={3} cols={4} />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState icon={Laptop} title="No assets assigned" description="This user doesn't currently hold any assets." />
      ) : (
        <TableContainer>
          <TableHead>
            <TableRow>
              <TableTh>Asset</TableTh>
              <TableTh>Type</TableTh>
              <TableTh>Assigned since</TableTh>
              <TableTh className="text-right">Actions</TableTh>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.items.map((assignment) => (
              <TableRow
                key={assignment.id}
                className="cursor-pointer"
                onClick={() => navigate(routes.assets.detail(assignment.assetId))}
              >
                <TableTd className="font-medium">
                  {assignment.assetBrand ?? ''} {assignment.assetModel ?? assignment.assetSerial ?? ASSET_TYPE_LABELS[assignment.assetType]}
                </TableTd>
                <TableTd>{ASSET_TYPE_LABELS[assignment.assetType]}</TableTd>
                <TableTd className="text-muted-foreground">{formatDate(assignment.assignedAt)}</TableTd>
                <TableTd className="text-right" onClick={(e) => e.stopPropagation()}>
                  <Link to={routes.assets.detail(assignment.assetId)} className="text-sm font-medium text-primary-600 hover:underline">
                    View asset
                  </Link>
                </TableTd>
              </TableRow>
            ))}
          </TableBody>
        </TableContainer>
      )}
    </Card>
  );
}

function TicketsTab({ employeeId }: { employeeId: string }) {
  const { data, isLoading, isError, error, refetch } = useTicketsList({ employeeId, pageSize: 100 });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TicketIcon className="h-4 w-4 text-muted-foreground" /> Tickets
        </CardTitle>
      </CardHeader>
      {isLoading ? (
        <TableSkeleton rows={3} cols={5} />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState icon={TicketIcon} title="No tickets" description="This user hasn't reported any issues yet." />
      ) : (
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
            {data.items.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableTd className="font-medium">{ticket.title}</TableTd>
                <TableTd className="text-muted-foreground">{ticket.assetBrand ?? ''} {ticket.assetModel ?? ticket.assetSerial ?? ''}</TableTd>
                <TableTd><TicketPriorityBadge priority={ticket.priority} /></TableTd>
                <TableTd><TicketStatusBadge status={ticket.status} /></TableTd>
                <TableTd className="text-muted-foreground">{formatDate(ticket.createdAt)}</TableTd>
                <TableTd className="text-right">
                  <Link to={routes.tickets.detail(ticket.id)} className="text-sm font-medium text-primary-600 hover:underline">
                    View ticket
                  </Link>
                </TableTd>
              </TableRow>
            ))}
          </TableBody>
        </TableContainer>
      )}
    </Card>
  );
}

function HistoryTab({ employeeId }: { employeeId: string }) {
  const assignments = useAssignmentsList({ employeeId, pageSize: 100 });
  const tickets = useTicketsList({ employeeId, pageSize: 100 });

  const closedTickets = tickets.data?.items.filter(
    (t) => t.status === TICKET_STATUS.Done || t.status === TICKET_STATUS.Cancelled,
  ) ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4 text-muted-foreground" /> Assignment history
          </CardTitle>
        </CardHeader>
        {assignments.isLoading ? (
          <TableSkeleton rows={3} cols={4} />
        ) : assignments.isError ? (
          <ErrorState error={assignments.error} onRetry={() => assignments.refetch()} />
        ) : !assignments.data || assignments.data.items.length === 0 ? (
          <EmptyState icon={History} title="No assignment history" description="This user has never been assigned an asset." />
        ) : (
          <TableContainer>
            <TableHead>
              <TableRow>
                <TableTh>Asset</TableTh>
                <TableTh>Assigned</TableTh>
                <TableTh>Returned</TableTh>
                <TableTh>Status</TableTh>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignments.data.items.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableTd className="font-medium">
                    {assignment.assetBrand ?? ''} {assignment.assetModel ?? assignment.assetSerial ?? ASSET_TYPE_LABELS[assignment.assetType]}
                  </TableTd>
                  <TableTd className="text-muted-foreground">{formatDateTime(assignment.assignedAt)}</TableTd>
                  <TableTd className="text-muted-foreground">{assignment.unassignedAt ? formatDateTime(assignment.unassignedAt) : '—'}</TableTd>
                  <TableTd>
                    <Badge variant={assignment.isActive ? 'success' : 'default'} dot>
                      {assignment.isActive ? 'Active' : 'Returned'}
                    </Badge>
                  </TableTd>
                </TableRow>
              ))}
            </TableBody>
          </TableContainer>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TicketIcon className="h-4 w-4 text-muted-foreground" /> Closed tickets
          </CardTitle>
        </CardHeader>
        {tickets.isLoading ? (
          <TableSkeleton rows={3} cols={3} />
        ) : tickets.isError ? (
          <ErrorState error={tickets.error} onRetry={() => tickets.refetch()} />
        ) : closedTickets.length === 0 ? (
          <EmptyState icon={TicketIcon} title="No closed tickets" description="Resolved or cancelled tickets will appear here." />
        ) : (
          <TableContainer>
            <TableHead>
              <TableRow>
                <TableTh>Title</TableTh>
                <TableTh>Status</TableTh>
                <TableTh>Last updated</TableTh>
              </TableRow>
            </TableHead>
            <TableBody>
              {closedTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableTd className="font-medium">
                    <Link to={routes.tickets.detail(ticket.id)} className="transition-colors hover:text-primary-600 hover:underline">
                      {ticket.title}
                    </Link>
                  </TableTd>
                  <TableTd><TicketStatusBadge status={ticket.status} /></TableTd>
                  <TableTd className="text-muted-foreground">
                    {formatDateTime(ticket.updatedAt ?? ticket.createdAt)}
                  </TableTd>
                </TableRow>
              ))}
            </TableBody>
          </TableContainer>
        )}
      </Card>
    </div>
  );
}
