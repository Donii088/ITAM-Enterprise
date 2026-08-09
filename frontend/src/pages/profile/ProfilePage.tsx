import { useEffect } from 'react';
import { Mail, Briefcase, ShieldCheck, LogOut } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { useAuth, useLogout } from '@/features/auth/useAuth';
import { ROLE_LABELS } from '@/types';

export default function ProfilePage() {
  const { user } = useAuth();
  const logout = useLogout();

  useEffect(() => {
    document.title = 'Profile — ITAM Enterprise';
  }, []);

  if (!user) return null;

  const fullName = `${user.firstName} ${user.lastName}`;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Profile" description="Your account details as registered in ITAM Enterprise." />

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

      <Alert variant="info" title="Profile editing & password changes">
        Updating your personal details or password isn't available yet — the API doesn't expose a self-service
        profile endpoint. Contact your IT administrator to update this information.
      </Alert>

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
    </div>
  );
}
