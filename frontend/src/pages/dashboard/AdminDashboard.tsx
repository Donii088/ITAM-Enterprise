import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Boxes, Users2, Ticket, Wrench, HardDrive, PlusCircle, ArrowLeftRight, UserPlus } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { ChartCard } from '@/components/shared/ChartCard';
import { ActivityItem } from '@/components/shared/ActivityItem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/Button';
import { useDashboardOverview } from '@/features/dashboard/useDashboard';
import { formatNumber } from '@/lib/formatters';
import { routes } from '@/routes/routes';
import { ASSET_TYPE_LABELS, type AssetType } from '@/types';

const CHART_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#e11d48', '#3b82f6', '#8b5cf6'];

export function AdminDashboard() {
  const { data, isLoading, isError, error, refetch } = useDashboardOverview();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Organization-wide overview of assets, people, and support activity."
        actions={
          <>
            <Link to={routes.assets.list}>
              <Button size="sm" variant="outline" leftIcon={<PlusCircle className="h-4 w-4" />}>
                Add asset
              </Button>
            </Link>
            <Link to={routes.assignments.list}>
              <Button size="sm" leftIcon={<ArrowLeftRight className="h-4 w-4" />}>
                Assign asset
              </Button>
            </Link>
          </>
        }
      />

      {isError && !isLoading ? (
        <Card>
          <ErrorState error={error} onRetry={() => refetch()} />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total assets" value={formatNumber(data?.assets.total)} icon={Boxes} accent="primary" isLoading={isLoading} />
            <StatCard label="Total people" value={formatNumber(data?.people.total)} icon={Users2} accent="info" isLoading={isLoading} />
            <StatCard label="Open tickets" value={formatNumber(data?.tickets.open)} icon={Ticket} accent="warning" isLoading={isLoading} />
            <StatCard label="Repairs (30d)" value={formatNumber(data?.repairs.last30Days)} icon={Wrench} accent="danger" isLoading={isLoading} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Active people" value={formatNumber(data?.people.active)} icon={Users2} accent="success" isLoading={isLoading} />
            <StatCard label="Inactive people" value={formatNumber(data?.people.inactive)} icon={Users2} accent="warning" isLoading={isLoading} />
            <StatCard label="Unassigned storage" value={formatNumber(data?.storage.unassigned)} icon={HardDrive} accent="info" isLoading={isLoading} />
            <StatCard label="Total repairs" value={formatNumber(data?.repairs.total)} icon={Wrench} accent="primary" isLoading={isLoading} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard title="Assets by type" isLoading={isLoading} isEmpty={data?.assets.byType.length === 0}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data?.assets.byType} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <RechartsTooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid rgb(var(--color-border))', fontSize: 13 }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Assets by status" isLoading={isLoading} isEmpty={data?.assets.byStatus.length === 0}>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={data?.assets.byStatus}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    innerRadius={55}
                    paddingAngle={2}
                  >
                    {data?.assets.byStatus.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <RechartsTooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid rgb(var(--color-border))', fontSize: 13 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Tickets by status" isLoading={isLoading} isEmpty={data?.tickets.byStatus.length === 0}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data?.tickets.byStatus} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <RechartsTooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid rgb(var(--color-border))', fontSize: 13 }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Tickets by priority" isLoading={isLoading} isEmpty={data?.tickets.byPriority.length === 0}>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={data?.tickets.byPriority}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {data?.tickets.byPriority.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <RechartsTooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid rgb(var(--color-border))', fontSize: 13 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Most repaired assets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {data?.mostRepairedAssets.length === 0 ? (
                  <EmptyState icon={Wrench} title="No repairs recorded" />
                ) : (
                  data?.mostRepairedAssets.map((asset) => (
                    <ActivityItem
                      key={asset.assetId}
                      icon={Wrench}
                      accent="danger"
                      title={`${asset.brand ?? ''} ${asset.model ?? asset.serialNumber ?? ''}`.trim() || ASSET_TYPE_LABELS[asset.assetType as AssetType]}
                      subtitle={`${ASSET_TYPE_LABELS[asset.assetType as AssetType]} · ${asset.count} repair${asset.count === 1 ? '' : 's'}`}
                      to={routes.assets.detail(asset.assetId)}
                    />
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Most ticketed assets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {data?.mostTicketedAssets.length === 0 ? (
                  <EmptyState icon={Ticket} title="No tickets recorded" />
                ) : (
                  data?.mostTicketedAssets.map((asset) => (
                    <ActivityItem
                      key={asset.assetId}
                      icon={Ticket}
                      accent="warning"
                      title={`${asset.brand ?? ''} ${asset.model ?? asset.serialNumber ?? ''}`.trim() || ASSET_TYPE_LABELS[asset.assetType as AssetType]}
                      subtitle={`${ASSET_TYPE_LABELS[asset.assetType as AssetType]} · ${asset.count} ticket${asset.count === 1 ? '' : 's'}`}
                      to={routes.assets.detail(asset.assetId)}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Link to={routes.assets.list}>
                <Button variant="outline" size="sm" leftIcon={<PlusCircle className="h-4 w-4" />}>
                  Add asset
                </Button>
              </Link>
              <Link to={routes.assignments.list}>
                <Button variant="outline" size="sm" leftIcon={<ArrowLeftRight className="h-4 w-4" />}>
                  Assign asset
                </Button>
              </Link>
              <Link to={routes.users.list}>
                <Button variant="outline" size="sm" leftIcon={<UserPlus className="h-4 w-4" />}>
                  Add user
                </Button>
              </Link>
              <Link to={routes.tickets.list}>
                <Button variant="outline" size="sm" leftIcon={<Ticket className="h-4 w-4" />}>
                  Review tickets
                </Button>
              </Link>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
