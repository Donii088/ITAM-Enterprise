import { useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Wrench } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { SearchInput } from '@/components/ui/SearchInput';
import { TableContainer, TableHead, TableBody, TableRow, TableTh, TableTd } from '@/components/ui/Table';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Pagination } from '@/components/ui/Pagination';
import { useRepairsList } from '@/features/repairs/useRepairs';
import { formatDate } from '@/lib/formatters';
import { routes } from '@/routes/routes';
import { ASSET_TYPE_LABELS } from '@/types';

const DEFAULT_PAGE_SIZE = Number(import.meta.env.VITE_DEFAULT_PAGE_SIZE) || 10;

export default function RepairsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    document.title = 'Repairs — ITAM Enterprise';
  }, []);

  const query = useMemo(
    () => ({
      pageNumber: Number(searchParams.get('page')) || 1,
      pageSize: Number(searchParams.get('size')) || DEFAULT_PAGE_SIZE,
      searchTerm: searchParams.get('q') ?? undefined,
    }),
    [searchParams],
  );

  const { data, isLoading, isError, error, refetch } = useRepairsList(query);

  function updateParams(patch: Record<string, string | undefined>) {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    if (!('page' in patch)) next.set('page', '1');
    setSearchParams(next);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Repairs" description="Full repair history recorded when tickets are resolved." />

      <SearchInput
        value={query.searchTerm ?? ''}
        onChange={(v) => updateParams({ q: v || undefined })}
        placeholder="Search by asset, admin, or description…"
        className="sm:max-w-xs"
      />

      <Card>
        {isLoading ? (
          <TableSkeleton rows={8} cols={5} />
        ) : isError ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : data && data.items.length === 0 ? (
          <EmptyState icon={Wrench} title="No repairs recorded" description="Repairs appear here once tickets are resolved." />
        ) : (
          <>
            <TableContainer>
              <TableHead>
                <TableRow>
                  <TableTh>Ticket</TableTh>
                  <TableTh>Asset</TableTh>
                  <TableTh>Admin</TableTh>
                  <TableTh>Description</TableTh>
                  <TableTh>Repair date</TableTh>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.items.map((repair) => (
                  <TableRow key={repair.id}>
                    <TableTd className="font-medium">{repair.ticketTitle}</TableTd>
                    <TableTd>
                      <Link to={routes.assets.detail(repair.assetId)} className="transition-colors hover:text-primary-600 hover:underline">
                        {repair.assetBrand ?? ''} {repair.assetModel ?? repair.assetSerial ?? ASSET_TYPE_LABELS[repair.assetType]}
                      </Link>
                    </TableTd>
                    <TableTd>{repair.adminName}</TableTd>
                    <TableTd className="max-w-xs truncate text-muted-foreground" title={repair.repairDescription}>
                      {repair.repairDescription}
                    </TableTd>
                    <TableTd className="text-muted-foreground">{formatDate(repair.repairDate)}</TableTd>
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
    </div>
  );
}
