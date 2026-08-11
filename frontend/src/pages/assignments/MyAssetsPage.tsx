import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Laptop } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { TableContainer, TableHead, TableBody, TableRow, TableTh, TableTd } from '@/components/ui/Table';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { AssetStatusBadge } from '@/components/ui/StatusBadge';
import { useMyAssets } from '@/features/assignments/useAssignments';
import { formatDate } from '@/lib/formatters';
import { routes } from '@/routes/routes';
import { ASSET_TYPE_LABELS } from '@/types';

export default function MyAssetsPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useMyAssets();

  useEffect(() => {
    document.title = 'My Assets — ITAM Enterprise';
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="My Assets" description="Equipment currently assigned to you." />

      <Card>
        {isLoading ? (
          <TableSkeleton rows={4} cols={4} />
        ) : isError ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : data && data.length === 0 ? (
          <EmptyState icon={Laptop} title="No assets assigned" description="Your IT administrator hasn't assigned you any assets yet." />
        ) : (
          <TableContainer>
            <TableHead>
              <TableRow>
                <TableTh>Asset</TableTh>
                <TableTh>Type</TableTh>
                <TableTh>Serial</TableTh>
                <TableTh>Assigned since</TableTh>
                <TableTh>Status</TableTh>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.map((assignment) => (
                <TableRow
                  key={assignment.id}
                  className="cursor-pointer"
                  onClick={() => navigate(routes.assets.detail(assignment.assetId))}
                >
                  <TableTd className="font-medium">
                    {assignment.assetBrand ?? ''} {assignment.assetModel ?? assignment.assetSerial ?? ASSET_TYPE_LABELS[assignment.assetType]}
                  </TableTd>
                  <TableTd>{ASSET_TYPE_LABELS[assignment.assetType]}</TableTd>
                  <TableTd className="text-muted-foreground">{assignment.assetSerial ?? '—'}</TableTd>
                  <TableTd className="text-muted-foreground">{formatDate(assignment.assignedAt)}</TableTd>
                  <TableTd><AssetStatusBadge status="Assigned" /></TableTd>
                </TableRow>
              ))}
            </TableBody>
          </TableContainer>
        )}
      </Card>
    </div>
  );
}
