import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { userService } from '@/services/userService';
import { queryKeys } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api-client';
import type { CreateUserRequest, GetUsersQuery, UpdateUserRequest } from '@/types';

export function useUsersList(query: GetUsersQuery) {
  return useQuery({
    queryKey: queryKeys.users.list(query),
    queryFn: () => userService.getPaged(query),
    placeholderData: keepPreviousData,
  });
}

function invalidateUsers(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserRequest) => userService.create(payload),
    onSuccess: () => {
      invalidateUsers(queryClient);
      toast.success('User created successfully.');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Could not create the user.')),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserRequest }) => userService.update(id, payload),
    onSuccess: () => {
      invalidateUsers(queryClient);
      toast.success('User updated successfully.');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Could not update the user.')),
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userService.deactivate(id),
    onSuccess: () => {
      invalidateUsers(queryClient);
      toast.success('User deactivated. Assigned assets released.');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Could not deactivate the user.')),
  });
}

export function useActivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userService.activate(id),
    onSuccess: () => {
      invalidateUsers(queryClient);
      toast.success('User activated.');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Could not activate the user.')),
  });
}

export function useHardDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userService.hardDelete(id),
    onSuccess: () => {
      invalidateUsers(queryClient);
      toast.success('User deleted permanently.');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Could not delete the user.')),
  });
}
