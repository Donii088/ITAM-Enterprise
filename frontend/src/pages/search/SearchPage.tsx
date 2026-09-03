import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Laptop, SearchIcon, Ticket, Users2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { useSearch } from '@/features/search/useSearch';
import { useAuth } from '@/features/auth/useAuth';
import { isItAdmin } from '@/lib/permissions';
import { formatDate } from '@/lib/formatters';
import { routes } from '@/routes/routes';
import { TICKET_PRIORITY_BADGE, type SearchItem, type TicketPriority } from '@/types';

function ResultGroup({
  title,
  icon: Icon,
  items,
  linkFor,
}: {
  title: string;
  icon: typeof Laptop;
  items: SearchItem[];
  linkFor?: (item: SearchItem) => string | undefined;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Icon className="h-4 w-4 text-muted-foreground" /> {title}
          <Badge variant="default">{items.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {items.length === 0 ? (
          <p className="px-5 py-4 text-sm text-muted-foreground">No matches.</p>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item) => {
              const to = linkFor?.(item);
              const inner = (
                <div className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                    {item.subtitle && <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>}
                    <p className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {item.status && <Badge variant="default">{item.status}</Badge>}
                    {item.priority && (
                      <Badge variant={TICKET_PRIORITY_BADGE[item.priority as TicketPriority] ?? 'default'}>
                        {item.priority}
                      </Badge>
                    )}
                  </div>
                </div>
              );
              return (
                <li key={item.id}>
                  {to ? (
                    <Link to={to} className="block hover:bg-muted/50">
                      {inner}
                    </Link>
                  ) : (
                    inner
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [term, setTerm] = useState(searchParams.get('q') ?? '');
  const { user } = useAuth();
  const admin = isItAdmin(user?.role);

  useEffect(() => {
    document.title = 'Search — ITAM Enterprise';
  }, []);

  const { data, isLoading, isError, error, refetch } = useSearch(term, 25);

  function handleChange(value: string) {
    setTerm(value);
    setSearchParams(value ? { q: value } : {}, { replace: true });
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Search" description="Find assets, users, and tickets across the organization." />

      <SearchInput value={term} onChange={handleChange} placeholder="Search by name, serial number, ticket title…" className="max-w-xl" />

      {term.trim().length > 0 && term.trim().length < 2 && (
        <Alert variant="info">Type at least 2 characters to search.</Alert>
      )}

      {term.trim().length >= 2 && (
        <>
          {isLoading && (
            <Card>
              <TableSkeleton rows={4} cols={1} />
            </Card>
          )}

          {isError && !isLoading && (
            <Card>
              <ErrorState error={error} onRetry={() => refetch()} />
            </Card>
          )}

          {data && !isLoading && (
            <>
              {data.totalMatches === 0 ? (
                <Card>
                  <EmptyState icon={SearchIcon} title="No results found" description={`Nothing matched "${term}". Try a different search term.`} />
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <ResultGroup
                    title="Assets"
                    icon={Laptop}
                    items={data.assets}
                    linkFor={admin ? (item) => routes.assets.detail(item.id) : undefined}
                  />
                  <ResultGroup
                    title="Users"
                    icon={Users2}
                    items={data.users}
                    // /users/:id is IT-Admin-only. Non-admins only ever get themselves back as a
                    // user match (enforced server-side in SearchService), so their own profile
                    // page is always the correct — and always permitted — destination.
                    linkFor={(item) => (admin ? routes.users.detail(item.id) : routes.profile)}
                  />
                  <ResultGroup title="Tickets" icon={Ticket} items={data.tickets} linkFor={(item) => routes.tickets.detail(item.id)} />
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
