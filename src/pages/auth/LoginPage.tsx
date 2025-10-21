import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';
import { useAuthStore } from '../../store/authStore';
import { FormField } from '../../components/forms/FormField';

const loginSchema = z.object({
  email: z.string().email('Введіть коректний email'),
  password: z.string().min(6, 'Мінімум 6 символів'),
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
      methods.setError('email', { message: error instanceof Error ? error.message : 'Помилка входу' });
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <div>
          <h2 className="text-xl font-semibold text-slate-50">Вхід</h2>
          <p className="text-sm text-slate-400">Повернення до керування організацією</p>
        </div>
        <FormField<LoginFormValues> name="email" label="Email" type="email" autoComplete="email" />
        <FormField<LoginFormValues>
          name="password"
          label="Пароль"
          type="password"
          autoComplete="current-password"
        />
        <div className="flex items-center justify-between">
          <Switch
            checked={methods.watch('rememberMe')}
            onCheckedChange={(checked) => methods.setValue('rememberMe', Boolean(checked))}
            label="Запам'ятати мене"
            aria-label="Запам'ятати мене"
          />
          <Link to="/forgot-password" className="text-sm text-primary hover:underline">
            Забули пароль?
          </Link>
        </div>
        <Button type="submit" className="w-full">
          Увійти
        </Button>
        <p className="text-center text-sm text-slate-400">
          Немає акаунта?{' '}
          <Link to="/register" className="text-primary hover:underline">
            Зареєструватися
          </Link>
        </p>
      </form>
    </FormProvider>
  );
};
