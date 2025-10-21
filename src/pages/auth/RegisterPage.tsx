import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { Button } from '../../components/ui/button';
import { FormField } from '../../components/forms/FormField';
import { useAuthStore } from '../../store/authStore';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Мінімум 2 символи'),
    company: z.string().min(2, 'Вкажіть компанію'),
    email: z.string().email('Введіть коректний email'),
    password: z.string().min(6, 'Мінімум 6 символів'),
    confirmPassword: z.string().min(6, 'Підтвердіть пароль')
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Паролі не співпадають'
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
  const methods = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      company: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });
  const registerUser = useAuthStore((state) => state.register);
  const navigate = useNavigate();

  const onSubmit = async ({ confirmPassword, ...payload }: RegisterFormValues) => {
    try {
      await registerUser(payload);
      navigate('/dashboard');
    } catch (error) {
      methods.setError('email', { message: error instanceof Error ? error.message : 'Помилка реєстрації' });
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <div>
          <h2 className="text-xl font-semibold text-slate-50">Реєстрація</h2>
          <p className="text-sm text-slate-400">Створіть командний обліковий запис</p>
        </div>
        <FormField<RegisterFormValues> name="name" label="Ім'я" autoComplete="name" />
        <FormField<RegisterFormValues> name="company" label="Компанія" autoComplete="organization" />
        <FormField<RegisterFormValues> name="email" label="Email" type="email" autoComplete="email" />
        <FormField<RegisterFormValues>
          name="password"
          label="Пароль"
          type="password"
          autoComplete="new-password"
        />
        <FormField<RegisterFormValues>
          name="confirmPassword"
          label="Підтвердження паролю"
          type="password"
          autoComplete="new-password"
        />
        <Button type="submit" className="w-full">
          Створити акаунт
        </Button>
        <p className="text-center text-sm text-slate-400">
          Вже маєте акаунт?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Увійдіть
          </Link>
        </p>
      </form>
    </FormProvider>
  );
};
