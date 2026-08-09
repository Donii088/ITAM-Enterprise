import { Link } from 'react-router-dom';
import { Laptop, Ticket, PlusCircle, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/Button';
import { AssetStatusBadge, TicketStatusBadge } from '@/components/ui/StatusBadge';
import { useMyDashboard } from '@/features/dashboard/useDashboard';
import { formatNumber, formatDate } from '@/lib/formatters';
import { ASSET_TYPE_LABELS } from '@/types';
import { routes } from '@/routes/routes';

export function EmployeeDashboard() {
  const { data, isLoading, isError, error, refetch } = useMyDashboard();

  return (
    <div className="space-y-6">
      <PageHeader
        title="My dashboard"
        description="Your assigned assets and support tickets at a glance."
        actions={
          <Link to={routes.tickets.mine}>
            <Button size="sm" leftIcon={<PlusCircle className="h-4 w-4" />}>
              Report an issue
            </Button>
          </Link>
        }
      />

      {isError && !isLoading ? (
        <Card>
          <ErrorState error={error} onRetry={() => refetch()} />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatCard label="Assigned assets" value={formatNumber(data?.assignedAssetsCount)} icon={Laptop} accent="primary" isLoading={isLoading} />
            <StatCard label="Open tickets" value={formatNumber(data?.openTicketsCount)} icon={Ticket} accent="warning" isLoading={isLoading} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>My assigned assets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 p-0">
                {isLoading ? null : data?.assignedAssets.length === 0 ? (
                  <div className="p-5">
                    <EmptyState icon={Laptop} title="No assets assigned" description="Your IT administrator hasn't assigned you any assets yet." />
                  </div>
                ) : (
                  <ul className="divide-y divide-border">
                    {data?.assignedAssets.map((asset) => (
                      <li key={asset.id} className="flex items-center justify-between gap-3 px-5 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {asset.brand ?? ''} {asset.model ?? asset.serialNumber ?? ASSET_TYPE_LABELS[asset.assetType]}
                          </p>
                          <p className="text-xs text-muted-foreground">{ASSET_TYPE_LABELS[asset.assetType]}</p>
                        </div>
                        <AssetStatusBadge status={asset.status} />
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
              <CardFooter>
                <Link to={routes.myAssets} className="ml-auto">
                  <Button variant="link" size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                    View all my assets
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent tickets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 p-0">
                {isLoading ? null : data?.recentTickets.length === 0 ? (
                  <div className="p-5">
                    <EmptyState icon={Ticket} title="No tickets yet" description="Report an issue with one of your assets to get started." />
                  </div>
                ) : (
                  <ul className="divide-y divide-border">
                    {data?.recentTickets.map((ticket) => (
                      <li key={ticket.id}>
                        <Link
                          to={routes.tickets.detail(ticket.id)}
                          className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-muted/50"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">{ticket.title}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(ticket.createdAt)}</p>
                          </div>
                          <TicketStatusBadge status={ticket.status} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
              <CardFooter>
                <Link to={routes.tickets.mine} className="ml-auto">
                  <Button variant="link" size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                    View all my tickets
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
