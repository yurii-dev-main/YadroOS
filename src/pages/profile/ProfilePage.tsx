/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import { z } from 'zod';

import { AvatarUploader } from '../../components/forms/AvatarUploader';
import { FormField } from '../../components/forms/FormField';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Switch } from '../../components/ui/switch';
import { useAuthStore } from '../../store/authStore';
import type { User } from '../../types/auth';
import { useTranslation } from '../../i18n/useTranslation';

const profileSchema = z.object({
  name: z.string().min(2),
  company: z.string().min(2),
  language: z.enum(['uk', 'en']),
  theme: z.enum(['light', 'dark', 'system']),
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  signature: z.string().optional()
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
    message: 'Passwords do not match'
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export const ProfilePage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const changePassword = useAuthStore((state) => state.changePassword);
  const { t } = useTranslation();

  const profileMethods = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: user
      ? {
          name: user.name,
          company: user.company,
          language: user.preferences?.language || 'en',
          theme: user.preferences?.theme || 'dark',
          emailNotifications: user.preferences?.notifications?.email || false,
          pushNotifications: user.preferences?.notifications?.push || false,
          signature: (user.preferences as any)?.signature || ''
        }
      : {
          name: '',
          company: '',
          language: 'uk',
          theme: 'dark',
          emailNotifications: true,
          pushNotifications: true,
          signature: ''
        }
  });

  useEffect(() => {
    if (!user) {
      return;
    }
    profileMethods.reset({
      name: user.name,
      company: user.company,
      language: user.preferences?.language || 'en',
      theme: user.preferences?.theme || 'dark',
      emailNotifications: user.preferences?.notifications?.email || false,
      pushNotifications: user.preferences?.notifications?.push || false,
      signature: (user.preferences as any)?.signature || ''
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
        signature: values.signature,
        notifications: {
          email: values.emailNotifications,
          push: values.pushNotifications
        }
      }
    };
    await updateUser(updated);
  };

  const onPasswordSubmit = async (values: PasswordFormValues) => {
    await changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword
    });
    passwordMethods.reset();
  };

  const handleAvatarChange = async (avatar: string) => {
    if (!user) {
      return;
    }
    await updateUser({ avatarUrl: avatar });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-slate-100">{t('profile.settings')}</h1>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>{t('profile.avatar')}</CardTitle>
        </CardHeader>
        <CardContent>
          <AvatarUploader value={user?.avatarUrl} onChange={handleAvatarChange} />
        </CardContent>
      </Card>
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>{t('profile.personalDetails')}</CardTitle>
        </CardHeader>
        <CardContent>
          <FormProvider {...profileMethods}>
            <form
              onSubmit={profileMethods.handleSubmit(onProfileSubmit)}
              className="space-y-5"
              noValidate
            >
              <FormField<ProfileFormValues> name="name" label={t('profile.name')} />
              <FormField<ProfileFormValues> name="company" label={t('profile.company')} />
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200" htmlFor="signature">
                  Email Signature
                </label>
                <textarea
                  id="signature"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 min-h-[80px]"
                  placeholder="Best regards, ..."
                  {...profileMethods.register('signature')}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200" htmlFor="language">
                    {t('profile.language')}
                  </label>
                  <select
                    id="language"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                    {...profileMethods.register('language')}
                  >
                    <option value="uk">Ukrainian</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200" htmlFor="theme">
                    {t('profile.theme')}
                  </label>
                  <select
                    id="theme"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                    {...profileMethods.register('theme')}
                  >
                    <option value="dark">Steel Blue</option>
                    <option value="light">Bronze / Gold</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-200">{t('profile.notifications')}</p>
                <div className="flex flex-col gap-3">
                  <Switch
                    checked={profileMethods.watch('emailNotifications')}
                    onCheckedChange={(checked) =>
                      profileMethods.setValue('emailNotifications', checked)
                    }
                    label={t('profile.email')}
                  />
                  <Switch
                    checked={profileMethods.watch('pushNotifications')}
                    onCheckedChange={(checked) =>
                      profileMethods.setValue('pushNotifications', checked)
                    }
                    label={t('profile.push')}
                  />
                </div>
              </div>
              <Button type="submit">{t('profile.save')}</Button>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>{t('profile.changePassword')}</CardTitle>
        </CardHeader>
        <CardContent>
          <FormProvider {...passwordMethods}>
            <form
              onSubmit={passwordMethods.handleSubmit(onPasswordSubmit)}
              className="grid gap-4 md:grid-cols-3"
              noValidate
            >
              <FormField<PasswordFormValues>
                name="currentPassword"
                label={t('profile.currentPassword')}
                type="password"
                autoComplete="current-password"
              />
              <FormField<PasswordFormValues>
                name="newPassword"
                label={t('profile.newPassword')}
                type="password"
                autoComplete="new-password"
              />
              <FormField<PasswordFormValues>
                name="confirmPassword"
                label={t('profile.confirmPassword')}
                type="password"
                autoComplete="new-password"
              />
              <div className="md:col-span-3">
                <Button type="submit">{t('profile.updatePassword')}</Button>
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};
