import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeftRight, Download, Eye, History, MoreHorizontal, Plus, RefreshCcw, Unlink, UserCircle } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { TableContainer, TableHead, TableBody, TableRow, TableTh, TableTd } from '@/components/ui/Table';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Pagination } from '@/components/ui/Pagination';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { useAssignmentsList, useUnassignAsset, useExportAssignments } from '@/features/assignments/useAssignments';
import { AssignAssetDialog } from './components/AssignAssetDialog';
import { formatDateTime } from '@/lib/formatters';
import { routes } from '@/routes/routes';
import { ASSET_TYPE_LABELS } from '@/types';
import type { Assignment, GetAssignmentsQuery } from '@/types';

const DEFAULT_PAGE_SIZE = Number(import.meta.env.VITE_DEFAULT_PAGE_SIZE) || 10;

function assetLabel(assignment: Assignment) {
  return `${assignment.assetBrand ?? ''} ${assignment.assetModel ?? assignment.assetSerial ?? ASSET_TYPE_LABELS[assignment.assetType]}`.trim();
}

function EmployeeLink({ assignment }: { assignment: Assignment }) {
  if (!assignment.employeeId) return <>{assignment.employeeName}</>;
  return (
    <Link to={routes.users.detail(assignment.employeeId)} className="transition-colors hover:text-primary-600 hover:underline">
      {assignment.employeeName}
    </Link>
  );
}

function AssignmentRow({
  assignment,
  active,
  onReturn,
  onReassign,
}: {
  assignment: Assignment;
  active: boolean;
  onReturn: (assignment: Assignment) => void;
  onReassign: (assignment: Assignment) => void;
}) {
  const returnedText = assignment.unassignedAt ? formatDateTime(assignment.unassignedAt) : '—';

  return (
    <TableRow>
      <TableTd className="whitespace-normal break-words">
        <Link
          to={routes.assets.detail(assignment.assetId)}
          className="font-medium text-foreground transition-colors hover:text-primary-600 hover:underline"
        >
          {assetLabel(assignment)}
        </Link>
        <p className="text-xs text-muted-foreground">
          {ASSET_TYPE_LABELS[assignment.assetType]}
          {assignment.assetSerial ? ` · ${assignment.assetSerial}` : ''}
        </p>
        {/* Employee and status/returned info relocate here on narrower screens, where they don't
            get their own column — still fully visible, just relocated (never hidden). */}
        <p className="text-xs text-muted-foreground sm:hidden">
          <EmployeeLink assignment={assignment} /> · {active ? 'Active' : `Returned ${returnedText}`}
        </p>
        <p className="text-xs text-muted-foreground max-sm:hidden md:hidden">
          {active ? 'Active' : `Returned ${returnedText}`}
        </p>
      </TableTd>
      <TableTd className="hidden text-muted-foreground sm:table-cell">
        <EmployeeLink assignment={assignment} />
      </TableTd>
      <TableTd className="text-muted-foreground">{formatDateTime(assignment.assignedAt)}</TableTd>
      <TableTd className="hidden md:table-cell">
        {active ? (
          <Badge variant="success" dot>Active</Badge>
        ) : (
          <span className="text-muted-foreground">{returnedText}</span>
        )}
      </TableTd>
      <TableTd className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Actions for ${assetLabel(assignment)}`}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <Link to={routes.assets.detail(assignment.assetId)}>
                <Eye className="h-4 w-4" /> View asset
              </Link>
            </DropdownMenuItem>
            {assignment.employeeId && (
              <DropdownMenuItem asChild>
                <Link to={routes.users.detail(assignment.employeeId)}>
                  <UserCircle className="h-4 w-4" /> View user
                </Link>
              </DropdownMenuItem>
            )}
            {active ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem destructive onClick={() => onReturn(assignment)}>
                  <Unlink className="h-4 w-4" /> Return asset
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem onClick={() => onReassign(assignment)}>
                <RefreshCcw className="h-4 w-4" /> Re-assign
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableTd>
    </TableRow>
  );
}

function AssignmentsTab({
  active,
  paramPrefix,
  onReassign,
  onAssign,
}: {
  active: boolean;
  paramPrefix: string;
  onReassign: (assignment: Assignment) => void;
  onAssign: () => void;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageKey = `${paramPrefix}page`;
  const sizeKey = `${paramPrefix}size`;
  const qKey = `${paramPrefix}q`;
  const searchTerm = searchParams.get(qKey) ?? '';
  const [returnTarget, setReturnTarget] = useState<Assignment | null>(null);

  const query: GetAssignmentsQuery = useMemo(
    () => ({
      pageNumber: Number(searchParams.get(pageKey)) || 1,
      pageSize: Number(searchParams.get(sizeKey)) || DEFAULT_PAGE_SIZE,
      searchTerm: searchTerm || undefined,
      activeOnly: active,
    }),
    [searchParams, pageKey, sizeKey, searchTerm, active],
  );

  const { data, isLoading, isError, error, refetch } = useAssignmentsList(query);
  const unassignAsset = useUnassignAsset();
  const exportAssignments = useExportAssignments();

  function updateParams(patch: Record<string, string | undefined>) {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    setSearchParams(next);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={searchTerm}
          onChange={(v) => updateParams({ [qKey]: v || undefined, [pageKey]: undefined })}
          placeholder="Search by employee, brand, model, or serial…"
          className="sm:max-w-sm"
        />
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Download className="h-4 w-4" />}
          isLoading={exportAssignments.isPending}
          onClick={() => exportAssignments.mutate(query)}
          className="self-start sm:self-auto"
        >
          Export CSV
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : isError ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : data && data.items.length === 0 ? (
          <EmptyState
            icon={active ? ArrowLeftRight : History}
            title={active ? 'No active assignments' : 'No assignment history'}
            description={
              searchTerm
                ? 'No assignments match your search.'
                : active
                  ? 'Assign an asset to an employee to see it here.'
                  : 'Returned assignments will show up here once an asset is unassigned.'
            }
            actionLabel={active && !searchTerm ? 'Assign asset' : undefined}
            onAction={active && !searchTerm ? onAssign : undefined}
          />
        ) : (
          <>
            <TableContainer minWidthClassName="min-w-0" className="[&_td]:px-2.5 [&_th]:px-2.5 sm:[&_td]:px-4 sm:[&_th]:px-4">
              <TableHead>
                <TableRow>
                  <TableTh>Asset</TableTh>
                  <TableTh className="hidden sm:table-cell">Employee</TableTh>
                  <TableTh>Assigned</TableTh>
                  <TableTh className="hidden md:table-cell">{active ? 'Status' : 'Returned'}</TableTh>
                  <TableTh className="text-right">Actions</TableTh>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.items.map((assignment) => (
                  <AssignmentRow
                    key={assignment.id}
                    assignment={assignment}
                    active={active}
                    onReturn={setReturnTarget}
                    onReassign={onReassign}
                  />
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
                onPageChange={(page) => updateParams({ [pageKey]: String(page) })}
                onPageSizeChange={(size) => updateParams({ [sizeKey]: String(size), [pageKey]: '1' })}
              />
            )}
          </>
        )}
      </Card>

      <ConfirmDialog
        open={Boolean(returnTarget)}
        onOpenChange={(open) => !open && setReturnTarget(null)}
        title="Return asset"
        description={`Mark this asset as returned from ${returnTarget?.employeeName}? It will become available again.`}
        confirmLabel="Return asset"
        confirmVariant="danger"
        isLoading={unassignAsset.isPending}
        onConfirm={() => {
          if (returnTarget) unassignAsset.mutate(returnTarget.id, { onSuccess: () => setReturnTarget(null) });
        }}
      />
    </div>
  );
}

export default function AssignmentsListPage() {
  const [assignOpen, setAssignOpen] = useState(false);
  const [reassignTarget, setReassignTarget] = useState<Assignment | null>(null);

  useEffect(() => {
    document.title = 'Assignments — ITAM Enterprise';
  }, []);

  function openAssign() {
    setReassignTarget(null);
    setAssignOpen(true);
  }

  function openReassign(assignment: Assignment) {
    setReassignTarget(assignment);
    setAssignOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assignments"
        description="Track which employees currently hold which assets."
        actions={
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={openAssign}>
            Assign asset
          </Button>
        }
      />

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active assignments</TabsTrigger>
          <TabsTrigger value="history">Assignment history</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <AssignmentsTab active paramPrefix="" onReassign={openReassign} onAssign={openAssign} />
        </TabsContent>
        <TabsContent value="history">
          <AssignmentsTab active={false} paramPrefix="h" onReassign={openReassign} onAssign={openAssign} />
        </TabsContent>
      </Tabs>

      <AssignAssetDialog
        open={assignOpen}
        onOpenChange={(open) => {
          setAssignOpen(open);
          if (!open) setReassignTarget(null);
        }}
        initialEmployeeId={reassignTarget?.employeeId ?? undefined}
        initialAssetSearchTerm={reassignTarget?.assetSerial ?? reassignTarget?.assetBrand ?? undefined}
      />
    </div>
  );
}
