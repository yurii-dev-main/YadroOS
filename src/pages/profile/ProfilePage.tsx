import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';

import { AvatarUploader } from '../../components/forms/AvatarUploader';
import { FormField } from '../../components/forms/FormField';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Switch } from '../../components/ui/switch';
import { useAuthStore } from '../../store/authStore';
import type { User } from '../../types/auth';

const profileSchema = z.object({
  name: z.string().min(2),
  company: z.string().min(2),
  language: z.enum(['uk', 'en']),
  theme: z.enum(['light', 'dark', 'system']),
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean()
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(6),
    confirmPassword: z.string().min(6)
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Паролі не співпадають'
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export const ProfilePage = () => {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const changePassword = useAuthStore((state) => state.changePassword);

  const profileMethods = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: user
      ? {
          name: user.name,
          company: user.company,
          language: user.preferences.language,
          theme: user.preferences.theme,
          emailNotifications: user.preferences.notifications.email,
          pushNotifications: user.preferences.notifications.push
        }
      : {
          name: '',
          company: '',
          language: 'uk',
          theme: 'dark',
          emailNotifications: true,
          pushNotifications: true
        }
  });

  useEffect(() => {
    if (!user) {
      return;
    }
    profileMethods.reset({
      name: user.name,
      company: user.company,
      language: user.preferences.language,
      theme: user.preferences.theme,
      emailNotifications: user.preferences.notifications.email,
      pushNotifications: user.preferences.notifications.push
    });
  }, [user, profileMethods]);

  const passwordMethods = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const onProfileSubmit = async (values: ProfileFormValues) => {
    if (!user) {
      return;
    }
    const updated: Partial<User> = {
      name: values.name,
      company: values.company,
      preferences: {
        ...user.preferences,
        language: values.language,
        theme: values.theme,
        notifications: {
          email: values.emailNotifications,
          push: values.pushNotifications
        }
      }
    };
    await updateUser(updated);
  };

  const onPasswordSubmit = async (values: PasswordFormValues) => {
    await changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword });
    passwordMethods.reset();
  };

  const handleAvatarChange = async (avatar: string) => {
    if (!user) {
      return;
    }
    await updateUser({ avatarUrl: avatar });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Аватар</CardTitle>
        </CardHeader>
        <CardContent>
          <AvatarUploader value={user?.avatarUrl} onChange={handleAvatarChange} />
        </CardContent>
      </Card>
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Особисті дані</CardTitle>
        </CardHeader>
        <CardContent>
          <FormProvider {...profileMethods}>
            <form onSubmit={profileMethods.handleSubmit(onProfileSubmit)} className="space-y-5" noValidate>
              <FormField<ProfileFormValues> name="name" label="Ім'я" />
              <FormField<ProfileFormValues> name="company" label="Компанія" />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200" htmlFor="language">
                    Мова інтерфейсу
                  </label>
                  <select
                    id="language"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                    {...profileMethods.register('language')}
                  >
                    <option value="uk">Українська</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200" htmlFor="theme">
                    Тема
                  </label>
                  <select
                    id="theme"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                    {...profileMethods.register('theme')}
                  >
                    <option value="dark">Темна</option>
                    <option value="light">Світла</option>
                    <option value="system">Системна</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-200">Сповіщення</p>
                <div className="flex flex-col gap-3">
                  <Switch
                    checked={profileMethods.watch('emailNotifications')}
                    onCheckedChange={(checked) => profileMethods.setValue('emailNotifications', checked)}
                    label="Email"
                  />
                  <Switch
                    checked={profileMethods.watch('pushNotifications')}
                    onCheckedChange={(checked) => profileMethods.setValue('pushNotifications', checked)}
                    label="Push"
                  />
                </div>
              </div>
              <Button type="submit">Зберегти</Button>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Зміна паролю</CardTitle>
        </CardHeader>
        <CardContent>
          <FormProvider {...passwordMethods}>
            <form onSubmit={passwordMethods.handleSubmit(onPasswordSubmit)} className="grid gap-4 md:grid-cols-3" noValidate>
              <FormField<PasswordFormValues>
                name="currentPassword"
                label="Поточний пароль"
                type="password"
                autoComplete="current-password"
              />
              <FormField<PasswordFormValues>
                name="newPassword"
                label="Новий пароль"
                type="password"
                autoComplete="new-password"
              />
              <FormField<PasswordFormValues>
                name="confirmPassword"
                label="Підтвердження"
                type="password"
                autoComplete="new-password"
              />
              <div className="md:col-span-3">
                <Button type="submit">Оновити пароль</Button>
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
};
