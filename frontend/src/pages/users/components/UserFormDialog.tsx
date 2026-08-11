import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/shared/form/FormInput';
import { FormSelect } from '@/components/shared/form/FormSelect';
import { FormPasswordInput } from '@/components/shared/form/FormPasswordInput';
import { createUserSchema, updateUserSchema, type CreateUserFormValues, type UpdateUserFormValues } from '@/features/users/schemas';
import { useCreateUser, useUpdateUser } from '@/features/users/useUsers';
import { ROLE, ROLE_LABELS, type User } from '@/types';

const ROLE_OPTIONS = Object.values(ROLE).map((v) => ({ value: v, label: ROLE_LABELS[v] }));

export interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User;
}

function CreateForm({ onDone }: { onDone: () => void }) {
  const createUser = useCreateUser();
  const { control, handleSubmit, formState } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { firstName: '', lastName: '', email: '', jobTitle: '', role: ROLE.Employee, password: '', confirmPassword: '' },
  });

  function onSubmit(values: CreateUserFormValues) {
    const { confirmPassword: _confirmPassword, ...payload } = values;
    createUser.mutateAsync(payload).then(onDone).catch(() => undefined);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormInput control={control} name="firstName" label="First name" required />
        <FormInput control={control} name="lastName" label="Last name" required />
        <FormInput control={control} name="email" label="Email" type="email" required className="sm:col-span-2" />
        <FormInput control={control} name="jobTitle" label="Job title" required className="sm:col-span-2" />
        <FormSelect control={control} name="role" label="Role" options={ROLE_OPTIONS} required />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormPasswordInput
          control={control}
          name="password"
          label="Password"
          required
          hint="At least 8 characters, with uppercase, lowercase, and a digit."
        />
        <FormPasswordInput control={control} name="confirmPassword" label="Confirm password" required />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} disabled={formState.isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" isLoading={formState.isSubmitting || createUser.isPending}>
          Create user
        </Button>
      </DialogFooter>
    </form>
  );
}

function EditForm({ user, onDone }: { user: User; onDone: () => void }) {
  const updateUser = useUpdateUser();
  const { control, handleSubmit, formState } = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      jobTitle: user.jobTitle,
      role: user.role,
      newPassword: '',
      confirmPassword: '',
    },
  });

  function onSubmit(values: UpdateUserFormValues) {
    const { confirmPassword: _confirmPassword, newPassword, ...rest } = values;
    updateUser
      .mutateAsync({ id: user.id, payload: { ...rest, newPassword: newPassword || undefined } })
      .then(onDone)
      .catch(() => undefined);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormInput control={control} name="firstName" label="First name" required />
        <FormInput control={control} name="lastName" label="Last name" required />
        <FormInput control={control} name="email" label="Email" type="email" required className="sm:col-span-2" />
        <FormInput control={control} name="jobTitle" label="Job title" required className="sm:col-span-2" />
        <FormSelect control={control} name="role" label="Role" options={ROLE_OPTIONS} required />
      </div>

      <div className="space-y-4 rounded-lg border border-border p-3">
        <p className="text-sm font-medium text-foreground">Reset password (optional)</p>
        <p className="-mt-2 text-xs text-muted-foreground">
          Leave both fields blank to keep the user's current password.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormPasswordInput
            control={control}
            name="newPassword"
            label="New password"
            hint="At least 8 characters, with uppercase, lowercase, and a digit."
          />
          <FormPasswordInput control={control} name="confirmPassword" label="Confirm new password" />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} disabled={formState.isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" isLoading={formState.isSubmitting || updateUser.isPending}>
          Save changes
        </Button>
      </DialogFooter>
    </form>
  );
}

export function UserFormDialog({ open, onOpenChange, user }: UserFormDialogProps) {
  function handleDone() {
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{user ? 'Edit user' : 'Add new user'}</DialogTitle>
        </DialogHeader>
        {user ? <EditForm user={user} onDone={handleDone} /> : <CreateForm onDone={handleDone} />}
      </DialogContent>
    </Dialog>
  );
}
