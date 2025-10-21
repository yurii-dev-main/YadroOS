import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';

import { Button } from '../../components/ui/button';
import { FormField } from '../../components/forms/FormField';
import { authService } from '../../services/authService';

const resetSchema = z
  .object({
    password: z.string().min(6, 'Мінімум 6 символів'),
    confirmPassword: z.string().min(6, 'Підтвердіть пароль')
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Паролі не співпадають'
  });

type ResetFormValues = z.infer<typeof resetSchema>;

export const ResetPasswordPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const methods = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirmPassword: '' }
  });

  useEffect(() => {
    const validate = async () => {
      if (!token) {
        setIsTokenValid(false);
        return;
      }
      const valid = await authService.verifyResetToken(token);
      setIsTokenValid(valid);
      if (!valid) {
        methods.setError('password', { message: 'Токен недійсний або прострочений' });
      }
    };

    void validate();
  }, [token, methods]);

  const onSubmit = async ({ password }: ResetFormValues) => {
    if (!token) {
      return;
    }
    await authService.applyResetToken(token, password);
    navigate('/login');
  };

  if (isTokenValid === null) {
    return <p className="text-sm text-slate-400">Перевірка токена...</p>;
  }

  if (!isTokenValid) {
    return (
      <div className="space-y-4 text-center">
        <h2 className="text-xl font-semibold text-slate-50">Посилання недійсне</h2>
        <p className="text-sm text-slate-400">Запросіть нове посилання для відновлення.</p>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <div>
          <h2 className="text-xl font-semibold text-slate-50">Створення нового паролю</h2>
          <p className="text-sm text-slate-400">Вигадайте надійний пароль для доступу</p>
        </div>
        <FormField<ResetFormValues>
          name="password"
          label="Новий пароль"
          type="password"
          autoComplete="new-password"
        />
        <FormField<ResetFormValues>
          name="confirmPassword"
          label="Підтвердження паролю"
          type="password"
          autoComplete="new-password"
        />
        <Button type="submit" className="w-full">
          Оновити пароль
        </Button>
      </form>
    </FormProvider>
  );
};
