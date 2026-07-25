import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';
import { useAuthStore } from '../../store/authStore';
import { FormField } from '../../components/forms/FormField';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Minimum 6 characters'),
  rememberMe: z.boolean()
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const methods = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true
    }
  });
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data);
      navigate('/dashboard');
    } catch (error) {
      methods.setError('email', {
        message: error instanceof Error ? error.message : 'Login error'
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <div>
          <h2 className="text-xl font-semibold text-slate-50">Log In</h2>
          <p className="text-sm text-slate-400">Return to organization management</p>
        </div>
        <FormField<LoginFormValues> name="email" label="Email" type="email" autoComplete="email" />
        <FormField<LoginFormValues>
          name="password"
          label="Password"
          type="password"
          autoComplete="current-password"
        />
        <div className="flex items-center justify-between">
          <Switch
            checked={methods.watch('rememberMe')}
            onCheckedChange={(checked) => methods.setValue('rememberMe', Boolean(checked))}
            label="Remember me"
            aria-label="Remember me"
          />
          <Link to="/forgot-password" className="text-sm text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full">
          Log In
        </Button>
        <p className="text-center text-sm text-slate-400">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-primary hover:underline">
            Register
          </Link>
        </p>
      </form>
    </FormProvider>
  );
};
