import { useForm } from 'react-hook-form';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Account, AccountType, CurrencyCode } from '../types/accounting.types';

interface AccountFormProps {
  onSubmit: (payload: Omit<Account, 'id' | 'isActive' | 'syncedAt' | 'reconciliationStatus'> & { balance?: number }) => Promise<void> | void;
}

type FormValues = {
  name: string;
  type: AccountType;
  currency: CurrencyCode;
  balance: number;
  bankName?: string;
  accountNumber?: string;
  iban?: string;
  color?: string;
};

export const AccountForm = ({ onSubmit }: AccountFormProps) => {
  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      type: 'bank',
      currency: 'UAH',
      balance: 0,
    },
  });

  const submit = async (values: FormValues) => {
    await onSubmit({ ...values });
    reset();
  };

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="grid gap-4 rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-200"
    >
      <h3 className="text-base font-semibold text-slate-100">New Account</h3>
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register('name', { required: true })} placeholder="Monobank USD" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="type">Type</Label>
        <select
          id="type"
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          {...register('type', { required: true })}
        >
          <option value="bank">Bank</option>
          <option value="cash">Cash</option>
          <option value="card">Card</option>
        </select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="currency">Currency</Label>
        <select
          id="currency"
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          {...register('currency', { required: true })}
        >
          <option value="UAH">UAH</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
        </select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="balance">Initial Balance</Label>
        <Input id="balance" type="number" step="0.01" {...register('balance', { valueAsNumber: true })} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="bankName">Bank</Label>
        <Input id="bankName" {...register('bankName')} placeholder="Bank name" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="accountNumber">Account Number</Label>
        <Input id="accountNumber" {...register('accountNumber')} placeholder="2600..." />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="iban">IBAN</Label>
        <Input id="iban" {...register('iban')} placeholder="UA..." />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="color">Color</Label>
        <Input id="color" type="color" {...register('color')} />
      </div>
      <Button type="submit" variant="secondary" className="mt-2">Add Account</Button>
    </form>
  );
};
