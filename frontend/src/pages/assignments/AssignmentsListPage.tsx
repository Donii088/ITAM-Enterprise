import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeftRight, Download, Plus, Unlink } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FilterBar, MobileFilterDrawer } from '@/components/ui/FilterBar';
import { TableContainer, TableHead, TableBody, TableRow, TableTh, TableTd } from '@/components/ui/Table';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Pagination } from '@/components/ui/Pagination';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FormSwitch } from '@/components/shared/form/FormSwitch';
import { useForm } from 'react-hook-form';
import { useAssignmentsList, useUnassignAsset, useExportAssignments } from '@/features/assignments/useAssignments';
import { AssignAssetDialog } from './components/AssignAssetDialog';
import { formatDateTime } from '@/lib/formatters';
import { routes } from '@/routes/routes';
import { ASSET_TYPE_LABELS } from '@/types';
import type { Assignment } from '@/types';

const DEFAULT_PAGE_SIZE = Number(import.meta.env.VITE_DEFAULT_PAGE_SIZE) || 10;

export default function AssignmentsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [assignOpen, setAssignOpen] = useState(false);
  const [unassignTarget, setUnassignTarget] = useState<Assignment | null>(null);
  const { control, watch } = useForm({ defaultValues: { activeOnly: searchParams.get('active') !== 'false' } });
  const activeOnly = watch('activeOnly');

  useEffect(() => {
    document.title = 'Assignments — ITAM Enterprise';
  }, []);

  const query = useMemo(
    () => ({
      pageNumber: Number(searchParams.get('page')) || 1,
      pageSize: Number(searchParams.get('size')) || DEFAULT_PAGE_SIZE,
      activeOnly,
    }),
    [searchParams, activeOnly],
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

  const filters = <FormSwitch control={control} name="activeOnly" label="Active assignments only" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assignments"
        description="Track which employees currently hold which assets."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="h-4 w-4" />}
              isLoading={exportAssignments.isPending}
              onClick={() => exportAssignments.mutate(query)}
            >
              Export CSV
            </Button>
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setAssignOpen(true)}>
              Assign asset
            </Button>
          </>
        }
      />

      <div className="flex items-center gap-2">
        <FilterBar>{filters}</FilterBar>
        <MobileFilterDrawer>{filters}</MobileFilterDrawer>
      </div>

      <Card>
        {isLoading ? (
          <TableSkeleton rows={8} cols={6} />
        ) : isError ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : data && data.items.length === 0 ? (
          <EmptyState
            icon={ArrowLeftRight}
            title="No assignments found"
            description="Assign an asset to an employee to see it here."
            actionLabel="Assign asset"
            onAction={() => setAssignOpen(true)}
          />
        ) : (
          <>
            <TableContainer>
              <TableHead>
                <TableRow>
                  <TableTh>Asset</TableTh>
                  <TableTh>Employee</TableTh>
                  <TableTh>Assigned</TableTh>
                  <TableTh>Unassigned</TableTh>
                  <TableTh>Status</TableTh>
                  <TableTh className="text-right">Actions</TableTh>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.items.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableTd className="font-medium">
                      <Link to={routes.assets.detail(assignment.assetId)} className="transition-colors hover:text-primary-600 hover:underline">
                        {assignment.assetBrand ?? ''} {assignment.assetModel ?? assignment.assetSerial ?? ASSET_TYPE_LABELS[assignment.assetType]}
                      </Link>
                    </TableTd>
                    <TableTd>{assignment.employeeName}</TableTd>
                    <TableTd className="text-muted-foreground">{formatDateTime(assignment.assignedAt)}</TableTd>
                    <TableTd className="text-muted-foreground">
                      {assignment.unassignedAt ? formatDateTime(assignment.unassignedAt) : '—'}
                    </TableTd>
                    <TableTd>
                      <Badge variant={assignment.isActive ? 'success' : 'default'} dot>
                        {assignment.isActive ? 'Active' : 'Ended'}
                      </Badge>
                    </TableTd>
                    <TableTd className="text-right">
                      {assignment.isActive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Unlink className="h-3.5 w-3.5" />}
                          onClick={() => setUnassignTarget(assignment)}
                        >
                          Unassign
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

      <AssignAssetDialog open={assignOpen} onOpenChange={setAssignOpen} />

      <ConfirmDialog
        open={Boolean(unassignTarget)}
        onOpenChange={(open) => !open && setUnassignTarget(null)}
        title="Unassign asset"
        description={`Unassign this asset from ${unassignTarget?.employeeName}? The asset will become available again.`}
        confirmLabel="Unassign"
        confirmVariant="danger"
        isLoading={unassignAsset.isPending}
        onConfirm={() => {
          if (unassignTarget) unassignAsset.mutate(unassignTarget.id, { onSuccess: () => setUnassignTarget(null) });
        }}
      />
    </div>
  );
}
