import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Edit, HardDrive, History, Paperclip, RefreshCcw, Trash2, User, Wrench } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { PageLoader } from '@/components/ui/PageLoader';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { AssetStatusBadge } from '@/components/ui/StatusBadge';
import { AttachmentPanel } from '@/components/shared/AttachmentPanel';
import { useAsset, useHardDeleteAsset } from '@/features/assets/useAssets';
import { useAssetAttachments, useDeleteAttachment, useDownloadAttachment, useUploadAssetAttachment } from '@/features/attachments/useAttachments';
import { useAssetRepairs } from '@/features/repairs/useRepairs';
import { useAssetAssignmentHistory } from '@/features/assignments/useAssignments';
import { AssetFormDialog } from './components/AssetFormDialog';
import { AssetStatusDialog } from './components/AssetStatusDialog';
import { formatDate, formatDateTime, formatStorageCapacity } from '@/lib/formatters';
import { queryKeys } from '@/lib/query-keys';
import { routes } from '@/routes/routes';
import { ASSET_TYPE, ASSET_TYPE_LABELS } from '@/types';

function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value ?? '—'}</p>
    </div>
  );
}

export default function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: asset, isLoading, isError, error, refetch } = useAsset(id);
  const { data: attachments, isLoading: attachmentsLoading } = useAssetAttachments(id);
  const { data: repairs, isLoading: repairsLoading } = useAssetRepairs(id);
  const { data: history, isLoading: historyLoading } = useAssetAssignmentHistory(id);

  const uploadAttachment = useUploadAssetAttachment();
  const downloadAttachment = useDownloadAttachment();
  const deleteAttachment = useDeleteAttachment(queryKeys.attachments.byAsset(id ?? ''));
  const hardDelete = useHardDeleteAsset();

  useEffect(() => {
    document.title = asset ? `${asset.brand ?? ''} ${asset.model ?? ''} — ITAM Enterprise` : 'Asset — ITAM Enterprise';
  }, [asset]);

  if (isLoading) return <PageLoader />;
  if (isError || !asset) {
    return (
      <Card>
        <ErrorState error={error} onRetry={() => refetch()} />
      </Card>
    );
  }

  const isLaptopOrDesktop = asset.assetType === ASSET_TYPE.Laptop || asset.assetType === ASSET_TYPE.DesktopPc;
  const title = `${asset.brand ?? ''} ${asset.model ?? asset.serialNumber ?? ASSET_TYPE_LABELS[asset.assetType]}`.trim();

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        breadcrumbs={<Breadcrumbs items={[{ label: 'Assets', to: routes.assets.list }, { label: title }]} />}
        description={ASSET_TYPE_LABELS[asset.assetType]}
        actions={
          <>
            <Button variant="outline" size="sm" leftIcon={<RefreshCcw className="h-4 w-4" />} onClick={() => setStatusOpen(true)}>
              Change status
            </Button>
            <Button variant="outline" size="sm" leftIcon={<Edit className="h-4 w-4" />} onClick={() => setEditOpen(true)}>
              Edit
            </Button>
            <Button variant="danger" size="sm" leftIcon={<Trash2 className="h-4 w-4" />} onClick={() => setDeleteOpen(true)}>
              Delete
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Asset details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <DetailField label="Status" value={<AssetStatusBadge status={asset.status} />} />
            <DetailField label="Type" value={ASSET_TYPE_LABELS[asset.assetType]} />
            <DetailField label="Serial number" value={asset.serialNumber} />
            <DetailField label="Brand" value={asset.brand} />
            <DetailField label="Model" value={asset.model} />
            {isLaptopOrDesktop && (
              <>
                <DetailField label="CPU" value={asset.cpu} />
                <DetailField label="GPU" value={asset.gpu} />
                <DetailField label="RAM" value={asset.ram ? `${asset.ram} GB` : undefined} />
              </>
            )}
            {asset.assetType === ASSET_TYPE.Monitor && (
              <>
                <DetailField label="Resolution" value={asset.resolution} />
                <DetailField label="Refresh rate" value={asset.refreshRate ? `${asset.refreshRate} Hz` : undefined} />
                <DetailField label="Size" value={asset.size ? `${asset.size}"` : undefined} />
              </>
            )}
            {asset.assetType === ASSET_TYPE.KeyboardMouseSet && (
              <DetailField label="Connection" value={asset.connectionType} />
            )}
            <DetailField label="Created" value={formatDate(asset.createdAt)} />
            <DetailField label="Last updated" value={asset.updatedAt ? formatDate(asset.updatedAt) : 'Never'} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" /> Current assignment
            </CardTitle>
          </CardHeader>
          <CardContent>
            {asset.currentAssignment ? (
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">{asset.currentAssignment.employeeName}</p>
                <p className="text-xs text-muted-foreground">Assigned {formatDate(asset.currentAssignment.assignedAt)}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Not currently assigned to anyone.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {isLaptopOrDesktop && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-muted-foreground" /> Storage devices
            </CardTitle>
          </CardHeader>
          <CardContent>
            {asset.storageDevices.length === 0 ? (
              <EmptyState icon={HardDrive} title="No storage devices attached" />
            ) : (
              <ul className="divide-y divide-border">
                {asset.storageDevices.map((storage) => (
                  <li key={storage.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-sm font-medium text-foreground">{storage.serialNumber}</p>
                      <p className="text-xs text-muted-foreground">{storage.storageType}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{formatStorageCapacity(storage.capacity, storage.storageUnit)}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <Tabs defaultValue="attachments">
          <CardHeader className="border-b-0 pb-0">
            <TabsList>
              <TabsTrigger value="attachments">
                <Paperclip className="mr-1.5 h-3.5 w-3.5" /> Attachments
              </TabsTrigger>
              <TabsTrigger value="repairs">
                <Wrench className="mr-1.5 h-3.5 w-3.5" /> Repair history
              </TabsTrigger>
              <TabsTrigger value="history">
                <History className="mr-1.5 h-3.5 w-3.5" /> Assignment history
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent>
            <TabsContent value="attachments">
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
            </TabsContent>

            <TabsContent value="repairs">
              {repairsLoading ? null : repairs && repairs.length === 0 ? (
                <EmptyState icon={Wrench} title="No repairs recorded" description="This asset has no repair history yet." />
              ) : (
                <ul className="divide-y divide-border">
                  {repairs?.map((repair) => (
                    <li key={repair.id} className="py-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-foreground">{repair.ticketTitle}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(repair.repairDate)}</p>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{repair.repairDescription}</p>
                      <p className="mt-1 text-xs text-muted-foreground">by {repair.adminName}</p>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>

            <TabsContent value="history">
              {historyLoading ? null : history && history.length === 0 ? (
                <EmptyState icon={History} title="No assignment history" description="This asset has never been assigned." />
              ) : (
                <ul className="divide-y divide-border">
                  {history?.map((entry) => (
                    <li key={entry.id} className="flex items-center justify-between gap-3 py-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{entry.employeeName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(entry.assignedAt)} — {entry.unassignedAt ? formatDateTime(entry.unassignedAt) : 'Present'}
                        </p>
                      </div>
                      {entry.isActive && <AssetStatusBadge status="Assigned" />}
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      <AssetFormDialog open={editOpen} onOpenChange={setEditOpen} asset={asset} fixedType={asset.assetType} />
      <AssetStatusDialog open={statusOpen} onOpenChange={setStatusOpen} assetId={asset.id} currentStatus={asset.status} />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete asset permanently"
        description="This will permanently delete this asset and all related assignments, tickets, repairs, and attachments. This action cannot be undone."
        confirmLabel="Delete permanently"
        isLoading={hardDelete.isPending}
        onConfirm={() => hardDelete.mutate(asset.id, { onSuccess: () => navigate(routes.assets.list) })}
      />
    </div>
  );
}
