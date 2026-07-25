import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { Button } from '../../components/ui/button';
import { FormField } from '../../components/forms/FormField';
import { useAuthStore } from '../../store/authStore';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Minimum 2 characters'),
    company: z.string().min(2, 'Specify company name'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(6, 'Minimum 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password')
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match'
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

  const onSubmit = async ({
    confirmPassword: _confirmPassword,
    ...payload
  }: RegisterFormValues) => {
    try {
      await registerUser(payload);
      navigate('/dashboard');
    } catch (error) {
      methods.setError('email', {
        message: error instanceof Error ? error.message : 'Registration error'
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <div>
          <h2 className="text-xl font-semibold text-slate-50">Registration</h2>
          <p className="text-sm text-slate-400">Create a team account</p>
        </div>
        <FormField<RegisterFormValues> name="name" label="Name" autoComplete="name" />
        <FormField<RegisterFormValues> name="company" label="Company" autoComplete="organization" />
        <FormField<RegisterFormValues>
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
        />
        <FormField<RegisterFormValues>
          name="password"
          label="Password"
          type="password"
          autoComplete="new-password"
        />
        <FormField<RegisterFormValues>
          name="confirmPassword"
          label="Confirm Password"
          type="password"
          autoComplete="new-password"
        />
        <Button type="submit" className="w-full">
          Create Account
        </Button>
        <p className="text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </FormProvider>
  );
};
