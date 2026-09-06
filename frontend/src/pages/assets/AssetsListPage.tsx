import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Boxes,
  Download,
  Edit,
  Eye,
  MoreHorizontal,
  Plus,
  RefreshCcw,
  Trash2,
  UserX,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar, MobileFilterDrawer } from '@/components/ui/FilterBar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { TableContainer, TableHead, TableBody, TableRow, TableTh, TableTd } from '@/components/ui/Table';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Pagination } from '@/components/ui/Pagination';
import { AssetStatusBadge } from '@/components/ui/StatusBadge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { useAsset, useAssetsList, useHardDeleteAsset, useExportAssets, useStorageList, useDeleteStorage } from '@/features/assets/useAssets';
import { useUnassignAssetByAssetId } from '@/features/assignments/useAssignments';
import { AssetFormDialog } from './components/AssetFormDialog';
import { AssetStatusDialog } from './components/AssetStatusDialog';
import { StorageFormDialog } from './components/StorageFormDialog';
import { routes } from '@/routes/routes';
import { formatDate, formatStorageCapacity } from '@/lib/formatters';
import {
  ASSET_STATUS,
  ASSET_STATUS_LABELS,
  ASSET_TYPE,
  ASSET_TYPE_LABELS,
  type AssetListItem,
  type AssetStatus,
  type AssetType,
  type StorageDevice,
} from '@/types';

const DEFAULT_PAGE_SIZE = Number(import.meta.env.VITE_DEFAULT_PAGE_SIZE) || 10;

function DevicesTab() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [formOpen, setFormOpen] = useState(false);
  const [createType, setCreateType] = useState<AssetType | undefined>();
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [statusTarget, setStatusTarget] = useState<AssetListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AssetListItem | null>(null);
  const [unassignTarget, setUnassignTarget] = useState<AssetListItem | null>(null);
  const unassignAsset = useUnassignAssetByAssetId();

  const query = useMemo(
    () => ({
      pageNumber: Number(searchParams.get('page')) || 1,
      pageSize: Number(searchParams.get('size')) || DEFAULT_PAGE_SIZE,
      searchTerm: searchParams.get('q') ?? undefined,
      assetType: (searchParams.get('type') as AssetType) || undefined,
      status: (searchParams.get('status') as AssetStatus) || undefined,
    }),
    [searchParams],
  );

  const { data, isLoading, isError, error, refetch } = useAssetsList(query);
  const deleteAsset = useHardDeleteAsset();
  const exportAssets = useExportAssets();

  function updateParams(patch: Record<string, string | undefined>) {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    if (!('page' in patch)) next.set('page', '1');
    setSearchParams(next);
  }

  const activeFilterCount = [query.searchTerm, query.assetType, query.status].filter(Boolean).length;

  const filters = (
    <>
      <Select value={query.assetType ?? 'all'} onValueChange={(v) => updateParams({ type: v === 'all' ? undefined : v })}>
        <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Type" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          {Object.values(ASSET_TYPE).map((t) => (
            <SelectItem key={t} value={t}>{ASSET_TYPE_LABELS[t]}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={query.status ?? 'all'} onValueChange={(v) => updateParams({ status: v === 'all' ? undefined : v })}>
        <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {Object.values(ASSET_STATUS).map((s) => (
            <SelectItem key={s} value={s}>{ASSET_STATUS_LABELS[s]}</SelectItem>
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
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={query.searchTerm ?? ''} onChange={(v) => updateParams({ q: v || undefined })} placeholder="Search brand, model, serial…" className="sm:max-w-xs" />
        <div className="flex flex-wrap items-center gap-2">
          <FilterBar>{filters}</FilterBar>
          <MobileFilterDrawer activeCount={activeFilterCount} onReset={() => setSearchParams({})}>
            {filters}
          </MobileFilterDrawer>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="h-4 w-4" />}
            isLoading={exportAssets.isPending}
            onClick={() => exportAssets.mutate(query)}
          >
            Export CSV
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
                Add asset
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Choose asset type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.values(ASSET_TYPE).map((t) => (
                <DropdownMenuItem
                  key={t}
                  onClick={() => {
                    setCreateType(t);
                    setEditingAssetId(null);
                    setFormOpen(true);
                  }}
                >
                  {ASSET_TYPE_LABELS[t]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card>
        {isLoading ? (
          <TableSkeleton rows={8} cols={5} />
        ) : isError ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : data && data.items.length === 0 ? (
          <EmptyState
            icon={Boxes}
            title="No assets found"
            description={activeFilterCount > 0 ? 'Try adjusting your filters.' : 'Add your first asset to get started.'}
            actionLabel={activeFilterCount === 0 ? 'Add asset' : undefined}
            onAction={activeFilterCount === 0 ? () => setFormOpen(true) : undefined}
          />
        ) : (
          <>
            <TableContainer minWidthClassName="min-w-0" className="[&_td]:px-2.5 [&_th]:px-2.5 sm:[&_td]:px-4 sm:[&_th]:px-4">
              <TableHead>
                <TableRow>
                  <TableTh>Asset</TableTh>
                  <TableTh>Status</TableTh>
                  <TableTh className="hidden sm:table-cell">Assigned to</TableTh>
                  <TableTh className="hidden md:table-cell">Created</TableTh>
                  <TableTh className="text-right">Actions</TableTh>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.items.map((asset) => {
                  const isAssigned = asset.status === ASSET_STATUS.Assigned && Boolean(asset.assignedEmployeeName);
                  return (
                    <TableRow
                      key={asset.id}
                      className="cursor-pointer"
                      onClick={() => navigate(routes.assets.detail(asset.id))}
                    >
                      <TableTd className="whitespace-normal break-words">
                        <span className="font-medium text-foreground transition-colors hover:text-primary-600 hover:underline">
                          {asset.brand ?? ''} {asset.model ?? ''}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {ASSET_TYPE_LABELS[asset.assetType]}
                          {asset.serialNumber ? ` · ${asset.serialNumber}` : ''}
                        </p>
                        {/* Assigned-to and created-date move here on narrow screens, where they
                            don't get their own column — still fully visible, just relocated. */}
                        <p className="text-xs text-muted-foreground sm:hidden">
                          {asset.assignedEmployeeName ?? 'Unassigned'} · {formatDate(asset.createdAt)}
                        </p>
                        <p className="text-xs text-muted-foreground max-sm:hidden md:hidden">
                          Created {formatDate(asset.createdAt)}
                        </p>
                      </TableTd>
                      <TableTd><AssetStatusBadge status={asset.status} /></TableTd>
                      <TableTd className="hidden text-muted-foreground sm:table-cell">{asset.assignedEmployeeName ?? '—'}</TableTd>
                      <TableTd className="hidden text-muted-foreground md:table-cell">{formatDate(asset.createdAt)}</TableTd>
                      <TableTd className="text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Actions for ${asset.brand ?? 'asset'}`}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem asChild>
                              <Link to={routes.assets.detail(asset.id)}>
                                <Eye className="h-4 w-4" /> View details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setCreateType(asset.assetType);
                                setEditingAssetId(asset.id);
                                setFormOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatusTarget(asset)}>
                              <RefreshCcw className="h-4 w-4" /> Change status
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled={!isAssigned} onClick={() => setUnassignTarget(asset)}>
                              <UserX className="h-4 w-4" /> Unassign
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem destructive onClick={() => setDeleteTarget(asset)}>
                              <Trash2 className="h-4 w-4" /> Delete permanently
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableTd>
                    </TableRow>
                  );
                })}
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

      <AssetEditLoader
        assetId={editingAssetId}
        formOpen={formOpen}
        setFormOpen={setFormOpen}
        createType={createType}
      />

      {statusTarget && (
        <AssetStatusDialog
          open={Boolean(statusTarget)}
          onOpenChange={(open) => !open && setStatusTarget(null)}
          assetId={statusTarget.id}
          currentStatus={statusTarget.status}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete asset permanently"
        description={`This will permanently delete "${deleteTarget?.brand ?? ''} ${deleteTarget?.model ?? deleteTarget?.serialNumber ?? ''}" and all related assignments, tickets, and attachments. This action cannot be undone.`}
        confirmLabel="Delete permanently"
        isLoading={deleteAsset.isPending}
        onConfirm={() => {
          if (deleteTarget) deleteAsset.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
        }}
      />

      <ConfirmDialog
        open={Boolean(unassignTarget)}
        onOpenChange={(open) => !open && setUnassignTarget(null)}
        title="Unassign asset"
        description={`Unassign "${unassignTarget?.brand ?? ''} ${unassignTarget?.model ?? unassignTarget?.serialNumber ?? ''}" from ${unassignTarget?.assignedEmployeeName ?? 'its current holder'}? The asset will become available again.`}
        confirmLabel="Unassign"
        isLoading={unassignAsset.isPending}
        onConfirm={() => {
          if (unassignTarget) unassignAsset.mutate(unassignTarget.id, { onSuccess: () => setUnassignTarget(null) });
        }}
      />
    </div>
  );
}

function AssetEditLoader({
  assetId,
  formOpen,
  setFormOpen,
  createType,
}: {
  assetId: string | null;
  formOpen: boolean;
  setFormOpen: (v: boolean) => void;
  createType: AssetType | undefined;
}) {
  const { data: asset } = useAsset(assetId ?? undefined);

  if (assetId && !asset) return null;

  return (
    <AssetFormDialog
      open={formOpen}
      onOpenChange={setFormOpen}
      fixedType={createType}
      asset={assetId ? asset : undefined}
    />
  );
}

function StorageTab() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [formOpen, setFormOpen] = useState(false);
  const [editingStorage, setEditingStorage] = useState<StorageDevice | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<StorageDevice | null>(null);

  const query = useMemo(
    () => ({
      pageNumber: Number(searchParams.get('spage')) || 1,
      pageSize: Number(searchParams.get('ssize')) || DEFAULT_PAGE_SIZE,
      searchTerm: searchParams.get('sq') ?? undefined,
      unassignedOnly: searchParams.get('unassigned') === 'true',
    }),
    [searchParams],
  );

  const { data, isLoading, isError, error, refetch } = useStorageList(query);
  const deleteStorage = useDeleteStorage();

  function updateParams(patch: Record<string, string | undefined>) {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    if (!('spage' in patch)) next.set('spage', '1');
    setSearchParams(next);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={query.searchTerm ?? ''} onChange={(v) => updateParams({ sq: v || undefined })} placeholder="Search serial number…" className="sm:max-w-xs" />
        <div className="flex items-center gap-2">
          <Button
            variant={query.unassignedOnly ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => updateParams({ unassigned: query.unassignedOnly ? undefined : 'true' })}
          >
            Unassigned only
          </Button>
          <Button
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => {
              setEditingStorage(undefined);
              setFormOpen(true);
            }}
          >
            Add storage
          </Button>
        </div>
      </div>

      <Card>
        {isLoading ? (
          <TableSkeleton rows={6} cols={3} />
        ) : isError ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : data && data.items.length === 0 ? (
          <EmptyState icon={Boxes} title="No storage devices found" />
        ) : (
          <>
            <TableContainer minWidthClassName="min-w-0" className="[&_td]:px-2.5 [&_th]:px-2.5 sm:[&_td]:px-4 sm:[&_th]:px-4">
              <TableHead>
                <TableRow>
                  <TableTh>Storage device</TableTh>
                  <TableTh className="hidden sm:table-cell">Attached to</TableTh>
                  <TableTh className="text-right">Actions</TableTh>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.items.map((storage) => {
                  const attachedTo = storage.laptopId ? (
                    <Link to={routes.assets.detail(storage.laptopId)} className="transition-colors hover:text-primary-600 hover:underline">
                      Laptop
                    </Link>
                  ) : storage.desktopPcId ? (
                    <Link to={routes.assets.detail(storage.desktopPcId)} className="transition-colors hover:text-primary-600 hover:underline">
                      Desktop PC
                    </Link>
                  ) : (
                    'Unassigned'
                  );

                  return (
                    <TableRow key={storage.id}>
                      <TableTd className="whitespace-normal break-words">
                        <span className="font-medium text-foreground">{storage.serialNumber}</span>
                        <p className="text-xs text-muted-foreground">
                          {storage.storageType} · {formatStorageCapacity(storage.capacity, storage.storageUnit)}
                        </p>
                        <p className="text-xs text-muted-foreground sm:hidden">{attachedTo}</p>
                      </TableTd>
                      <TableTd className="hidden text-muted-foreground sm:table-cell">{attachedTo}</TableTd>
                      <TableTd className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setEditingStorage(storage);
                              setFormOpen(true);
                            }}
                            aria-label="Edit storage device"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-danger hover:bg-danger/10"
                            onClick={() => setDeleteTarget(storage)}
                            aria-label="Delete storage device"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableTd>
                    </TableRow>
                  );
                })}
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
                onPageChange={(page) => updateParams({ spage: String(page) })}
                onPageSizeChange={(size) => updateParams({ ssize: String(size), spage: '1' })}
              />
            )}
          </>
        )}
      </Card>

      <StorageFormDialog open={formOpen} onOpenChange={setFormOpen} storage={editingStorage} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete storage device"
        description={`Delete storage device "${deleteTarget?.serialNumber}"? This cannot be undone.`}
        confirmLabel="Delete"
        isLoading={deleteStorage.isPending}
        onConfirm={() => {
          if (deleteTarget) deleteStorage.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
        }}
      />
    </div>
  );
}

export default function AssetsListPage() {
  useEffect(() => {
    document.title = 'Assets — ITAM Enterprise';
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Assets" description="Manage laptops, desktops, monitors, docks, peripherals, and storage devices." />
      <Tabs defaultValue="devices">
        <TabsList>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
        </TabsList>
        <TabsContent value="devices">
          <DevicesTab />
        </TabsContent>
        <TabsContent value="storage">
          <StorageTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
