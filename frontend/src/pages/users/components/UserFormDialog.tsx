import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/shared/form/FormInput';
import { FormSelect } from '@/components/shared/form/FormSelect';
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
  const [showPassword, setShowPassword] = React.useState(false);
  const createUser = useCreateUser();
  const { control, handleSubmit, formState } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { firstName: '', lastName: '', email: '', jobTitle: '', role: ROLE.Employee, password: '' },
  });

  function onSubmit(values: CreateUserFormValues) {
    createUser.mutateAsync(values).then(onDone).catch(() => undefined);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormInput control={control} name="firstName" label="First name" required />
        <FormInput control={control} name="lastName" label="Last name" required />
        <FormInput control={control} name="email" label="Email" type="email" required className="sm:col-span-2" />
        <FormInput control={control} name="jobTitle" label="Job title" required className="sm:col-span-2" />
        <FormSelect control={control} name="role" label="Role" options={ROLE_OPTIONS} required />
        <FormInput
          control={control}
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          required
          hint="At least 8 characters, with uppercase, lowercase, and a digit."
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="focus-ring rounded p-1 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />
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
    },
  });

  function onSubmit(values: UpdateUserFormValues) {
    updateUser.mutateAsync({ id: user.id, payload: values }).then(onDone).catch(() => undefined);
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
