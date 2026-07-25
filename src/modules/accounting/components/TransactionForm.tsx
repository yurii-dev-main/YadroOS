import { useForm } from 'react-hook-form';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
  Account,
  Transaction,
  TransactionCategory,
  TransactionType,
  CurrencyCode
} from '../types/accounting.types';

interface TransactionFormProps {
  accounts: Account[];
  categories: TransactionCategory[];
  defaultCurrency?: CurrencyCode;
  onSubmit: (payload: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void> | void;
}

type FormValues = {
  type: TransactionType;
  amount: number;
  currency: CurrencyCode;
  accountId: string;
  toAccountId?: string;
  categoryId?: string;
  date: string;
  description?: string;
  tags?: string;
};

export const TransactionForm = ({
  accounts,
  categories,
  defaultCurrency = 'UAH',
  onSubmit
}: TransactionFormProps) => {
  const { register, handleSubmit, watch, reset } = useForm<FormValues>({
    defaultValues: {
      type: 'expense',
      amount: 0,
      currency: defaultCurrency,
      date: new Date().toISOString().slice(0, 10)
    }
  });

  const type = watch('type');

  const submit = async (values: FormValues) => {
    const { tags, ...rest } = values;
    const payload: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> = {
      ...rest,
      amount: Number(rest.amount),
      status: 'completed',
      tags: tags ? tags.split(',').map((tag) => tag.trim()) : [],
      attachments: []
    };

    await onSubmit(payload);
    reset();
  };

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="grid gap-4 rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-200"
    >
      <h3 className="text-base font-semibold text-slate-100">New Transaction</h3>
      <div className="grid gap-2">
        <Label htmlFor="type">Type</Label>
        <select
          id="type"
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          {...register('type', { required: true })}
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
          <option value="transfer">Transfer</option>
        </select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          {...register('amount', { valueAsNumber: true, required: true })}
        />
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
        <Label htmlFor="accountId">From Account</Label>
        <select
          id="accountId"
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          {...register('accountId', { required: true })}
        >
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name} ({account.currency})
            </option>
          ))}
        </select>
      </div>
      {type === 'transfer' && (
        <div className="grid gap-2">
          <Label htmlFor="toAccountId">To Account</Label>
          <select
            id="toAccountId"
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
            {...register('toAccountId', { required: true })}
          >
            <option value="">Select account</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="grid gap-2">
        <Label htmlFor="categoryId">Category</Label>
        <select
          id="categoryId"
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          {...register('categoryId')}
        >
          <option value="">Uncategorized</option>
          {categories
            .filter((category) => category.type !== 'income' || type !== 'expense')
            .map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
        </select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="date">Date</Label>
        <Input id="date" type="date" {...register('date', { required: true })} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" {...register('description')} placeholder="Note" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="tags">Tags</Label>
        <Input id="tags" {...register('tags')} placeholder="marketing, quarter" />
      </div>
      <Button type="submit" variant="secondary" className="mt-2">
        Add Transaction
      </Button>
    </form>
  );
};
