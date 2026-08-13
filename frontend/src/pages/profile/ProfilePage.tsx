import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Briefcase, ShieldCheck, LogOut, KeyRound, Edit } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { FormPasswordInput } from '@/components/shared/form/FormPasswordInput';
import { UserFormDialog } from '@/pages/users/components/UserFormDialog';
import { useAuth, useChangePassword, useLogout } from '@/features/auth/useAuth';
import { useUser } from '@/features/users/useUsers';
import { getErrorMessage } from '@/lib/api-client';
import { passwordSchema } from '@/lib/validation';
import { isItAdmin } from '@/lib/permissions';
import { ROLE_LABELS } from '@/types';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'New password must be different from your current password',
    path: ['newPassword'],
  });
type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

function ChangePasswordCard() {
  const changePassword = useChangePassword();
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  function onSubmit(values: ChangePasswordFormValues) {
    changePassword.mutate(
      { currentPassword: values.currentPassword, newPassword: values.newPassword },
      {
        onSuccess: () => reset(),
        onError: (error) => {
          const message = getErrorMessage(error, 'Could not change your password.');
          if (message.toLowerCase().includes('current password')) {
            setError('currentPassword', { message });
          } else {
            setError('root', { message });
          }
        },
      },
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-muted-foreground" /> Change password
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {errors.root && (
          <Alert variant="danger" title="Could not change your password">
            {errors.root.message}
          </Alert>
        )}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <FormPasswordInput
            control={control}
            name="currentPassword"
            label="Current password"
            required
            autoComplete="current-password"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormPasswordInput
              control={control}
              name="newPassword"
              label="New password"
              required
              hint="At least 8 characters, with uppercase, lowercase, and a digit."
            />
            <FormPasswordInput control={control} name="confirmPassword" label="Confirm new password" required />
          </div>
          <div className="flex justify-end">
            <Button type="submit" isLoading={isSubmitting || changePassword.isPending}>
              Update password
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const logout = useLogout();
  const admin = isItAdmin(user?.role);
  const { data: fullUser } = useUser(admin ? user?.id : undefined);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    document.title = 'Profile — ITAM Enterprise';
  }, []);

  if (!user) return null;

  const fullName = `${user.firstName} ${user.lastName}`;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Profile"
        description="Your account details as registered in ITAM Enterprise."
        actions={
          admin ? (
            <Button size="sm" leftIcon={<Edit className="h-4 w-4" />} onClick={() => setEditOpen(true)} disabled={!fullUser}>
              Edit profile
            </Button>
          ) : undefined
        }
      />

      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-8 text-center sm:flex-row sm:text-left">
          <Avatar name={fullName} size="lg" />
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-foreground">{fullName}</p>
            <p className="truncate text-sm text-muted-foreground">{user.jobTitle}</p>
            <Badge variant="primary" className="mt-1.5">
              {ROLE_LABELS[user.role]}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              <Mail className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium text-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Job title</p>
              <p className="text-sm font-medium text-foreground">{user.jobTitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Role</p>
              <p className="text-sm font-medium text-foreground">{ROLE_LABELS[user.role]}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {!admin && (
        <Alert variant="info" title="Editing profile information">
          Your name, email, job title, and role can only be changed by an IT administrator. You can update your
          password below.
        </Alert>
      )}

      <ChangePasswordCard />

      <Card>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Sign out</p>
            <p className="text-xs text-muted-foreground">End your session on this device.</p>
          </div>
          <Button variant="danger" size="sm" onClick={() => logout.mutate()} isLoading={logout.isPending} leftIcon={<LogOut className="h-4 w-4" />}>
            Log out
          </Button>
        </CardContent>
      </Card>

      {admin && fullUser && <UserFormDialog open={editOpen} onOpenChange={setEditOpen} user={fullUser} />}
    </div>
  );
}
