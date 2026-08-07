import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Label } from '@/components/ui/Label';
import { FormField } from '@/components/ui/FormField';
import { Alert } from '@/components/ui/Alert';
import { useLogin } from '@/features/auth/useAuth';
import { getErrorMessage } from '@/lib/api-client';
import { getRememberMe, setRememberMe } from '@/lib/remember-me';
import { routes } from '@/routes/routes';

const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [remember, setRemember] = React.useState(getRememberMe());
  const navigate = useNavigate();
  const location = useLocation();
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const from = (location.state as { from?: string } | null)?.from || routes.dashboard;

  function onSubmit(values: LoginFormValues) {
    setRememberMe(remember);
    loginMutation.mutate(values, {
      onSuccess: () => navigate(from, { replace: true }),
      onError: (error) => {
        setError('root', { message: getErrorMessage(error, 'Invalid email or password.') });
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Sign in to your account</h1>
        <p className="text-sm text-muted-foreground">Enter your credentials to access the ITAM workspace.</p>
      </div>

      {errors.root && (
        <Alert variant="danger" title="Unable to sign in">
          {errors.root.message}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormField label="Email address" htmlFor="email" required error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            invalid={Boolean(errors.email)}
            {...register('email')}
          />
        </FormField>

        <FormField label="Password" htmlFor="password" required error={errors.password?.message}>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            invalid={Boolean(errors.password)}
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
            {...register('password')}
          />
        </FormField>

        <div className="flex items-center gap-2">
          <Checkbox id="remember" checked={remember} onCheckedChange={(v) => setRemember(v === true)} />
          <Label htmlFor="remember" className="cursor-pointer font-normal text-muted-foreground">
            Keep me signed in on this device
          </Label>
        </div>

        <Button type="submit" className="w-full" isLoading={isSubmitting || loginMutation.isPending} leftIcon={<LogIn className="h-4 w-4" />}>
          Sign in
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        Don't have an account? New employee accounts are created by your IT administrator from the User
        Management area — there is no self-service sign-up.
      </p>
    </div>
  );
}
