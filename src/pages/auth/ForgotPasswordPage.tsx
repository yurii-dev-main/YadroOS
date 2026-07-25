import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';

import { Button } from '../../components/ui/button';
import { FormField } from '../../components/forms/FormField';
import { useAuthStore } from '../../store/authStore';

const forgotSchema = z.object({
  email: z.string().email('Enter a valid email')
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export const ForgotPasswordPage = () => {
  const methods = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' }
  });
  const requestReset = useAuthStore((state) => state.resetPasswordRequest);
  const onSubmit = async (data: ForgotFormValues) => {
    try {
      await requestReset(data.email);
      methods.reset();
    } catch (error) {
      methods.setError('email', {
        message: error instanceof Error ? error.message : 'Failed to send email'
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <div>
          <h2 className="text-xl font-semibold text-slate-50">Password Reset</h2>
          <p className="text-sm text-slate-400">
            Specify your email, we will send a reset link
          </p>
        </div>
        <FormField<ForgotFormValues> name="email" label="Email" type="email" autoComplete="email" />
        <Button type="submit" className="w-full">
          Send instructions
        </Button>
        <p className="text-center text-sm text-slate-400">
          Back to <Link to="/login" className="text-primary hover:underline">login</Link>
        </p>
      </form>
    </FormProvider>
  );
};
