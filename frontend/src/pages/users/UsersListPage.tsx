import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Edit, MoreHorizontal, Plus, Trash2, UserCheck, UserX, Users2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar, MobileFilterDrawer } from '@/components/ui/FilterBar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { TableContainer, TableHead, TableBody, TableRow, TableTh, TableTd } from '@/components/ui/Table';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Pagination } from '@/components/ui/Pagination';
import { Avatar } from '@/components/ui/Avatar';
import { ActiveBadge } from '@/components/ui/StatusBadge';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { FormSwitch } from '@/components/shared/form/FormSwitch';
import { useForm } from 'react-hook-form';
import { useActivateUser, useDeactivateUser, useHardDeleteUser, useUsersList } from '@/features/users/useUsers';
import { UserFormDialog } from './components/UserFormDialog';
import { useAuth } from '@/features/auth/useAuth';
import { formatDate } from '@/lib/formatters';
import { ROLE, ROLE_LABELS, type Role, type User } from '@/types';

const DEFAULT_PAGE_SIZE = Number(import.meta.env.VITE_DEFAULT_PAGE_SIZE) || 10;

export default function UsersListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>();
  const [deactivateTarget, setDeactivateTarget] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const { user: currentUser } = useAuth();

  const { control, watch } = useForm({ defaultValues: { includeInactive: searchParams.get('inactive') === 'true' } });
  const includeInactive = watch('includeInactive');

  useEffect(() => {
    document.title = 'Users — ITAM Enterprise';
  }, []);

  const query = useMemo(
    () => ({
      pageNumber: Number(searchParams.get('page')) || 1,
      pageSize: Number(searchParams.get('size')) || DEFAULT_PAGE_SIZE,
      searchTerm: searchParams.get('q') ?? undefined,
      role: (searchParams.get('role') as Role) || undefined,
      includeInactive,
    }),
    [searchParams, includeInactive],
  );

  const { data, isLoading, isError, error, refetch } = useUsersList(query);
  const deactivateUser = useDeactivateUser();
  const activateUser = useActivateUser();
  const hardDeleteUser = useHardDeleteUser();

  function updateParams(patch: Record<string, string | undefined>) {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    if (!('page' in patch)) next.set('page', '1');
    setSearchParams(next);
  }

  const activeFilterCount = [query.searchTerm, query.role].filter(Boolean).length;

  const filters = (
    <>
      <Select value={query.role ?? 'all'} onValueChange={(v) => updateParams({ role: v === 'all' ? undefined : v })}>
        <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Role" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All roles</SelectItem>
          {Object.values(ROLE).map((r) => (
            <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormSwitch control={control} name="includeInactive" label="Include inactive users" />
    </>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage employee and administrator accounts."
        actions={
          <Button
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => {
              setEditingUser(undefined);
              setFormOpen(true);
            }}
          >
            Add user
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={query.searchTerm ?? ''} onChange={(v) => updateParams({ q: v || undefined })} placeholder="Search by name or email…" className="sm:max-w-xs" />
        <div className="flex flex-wrap items-center gap-2">
          <FilterBar>{filters}</FilterBar>
          <MobileFilterDrawer activeCount={activeFilterCount}>{filters}</MobileFilterDrawer>
        </div>
      </div>

      <Card>
        {isLoading ? (
          <TableSkeleton rows={8} cols={5} />
        ) : isError ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : data && data.items.length === 0 ? (
          <EmptyState
            icon={Users2}
            title="No users found"
            description={activeFilterCount > 0 ? 'Try adjusting your filters.' : 'Add your first user to get started.'}
            actionLabel={activeFilterCount === 0 ? 'Add user' : undefined}
            onAction={activeFilterCount === 0 ? () => setFormOpen(true) : undefined}
          />
        ) : (
          <>
            <TableContainer>
              <TableHead>
                <TableRow>
                  <TableTh>Name</TableTh>
                  <TableTh>Email</TableTh>
                  <TableTh>Role</TableTh>
                  <TableTh>Status</TableTh>
                  <TableTh>Created</TableTh>
                  <TableTh className="text-right">Actions</TableTh>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.items.map((user) => (
                  <TableRow key={user.id}>
                    <TableTd>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={`${user.firstName} ${user.lastName}`} size="sm" />
                        <div>
                          <p className="font-medium text-foreground">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-muted-foreground">{user.jobTitle}</p>
                        </div>
                      </div>
                    </TableTd>
                    <TableTd className="text-muted-foreground">{user.email}</TableTd>
                    <TableTd><Badge variant={user.role === ROLE.ItAdmin ? 'primary' : 'default'}>{ROLE_LABELS[user.role]}</Badge></TableTd>
                    <TableTd><ActiveBadge isActive={user.isActive} /></TableTd>
                    <TableTd className="text-muted-foreground">{formatDate(user.createdAt)}</TableTd>
                    <TableTd className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Actions for ${user.firstName} ${user.lastName}`}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingUser(user);
                              setFormOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          {user.isActive ? (
                            <DropdownMenuItem
                              onClick={() => setDeactivateTarget(user)}
                              disabled={user.id === currentUser?.id}
                            >
                              <UserX className="h-4 w-4" /> Deactivate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => activateUser.mutate(user.id)}>
                              <UserCheck className="h-4 w-4" /> Activate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            destructive
                            onClick={() => setDeleteTarget(user)}
                            disabled={user.id === currentUser?.id}
                          >
                            <Trash2 className="h-4 w-4" /> Delete permanently
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

      <UserFormDialog open={formOpen} onOpenChange={setFormOpen} user={editingUser} />

      <ConfirmDialog
        open={Boolean(deactivateTarget)}
        onOpenChange={(open) => !open && setDeactivateTarget(null)}
        title="Deactivate user"
        description={`Deactivate ${deactivateTarget?.firstName} ${deactivateTarget?.lastName}? Their assigned assets will be released and they will no longer be able to sign in.`}
        confirmLabel="Deactivate"
        isLoading={deactivateUser.isPending}
        onConfirm={() => {
          if (deactivateTarget) deactivateUser.mutate(deactivateTarget.id, { onSuccess: () => setDeactivateTarget(null) });
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete user permanently"
        description={`This will permanently delete ${deleteTarget?.firstName} ${deleteTarget?.lastName} and all related records. This action cannot be undone.`}
        confirmLabel="Delete permanently"
        isLoading={hardDeleteUser.isPending}
        onConfirm={() => {
          if (deleteTarget) hardDeleteUser.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
        }}
      />
    </div>
  );
}
