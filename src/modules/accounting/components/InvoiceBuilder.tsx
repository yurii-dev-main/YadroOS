import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Invoice, InvoiceLineItem, CurrencyCode } from '../types/accounting.types';

interface InvoiceBuilderProps {
  defaultCurrency?: CurrencyCode;
  onCreate: (invoice: Omit<Invoice, 'id' | 'number' | 'status' | 'createdAt' | 'updatedAt' | 'taxes'>) => Promise<void> | void;
}

const emptyLine = (currency: CurrencyCode): InvoiceLineItem => ({
  id: uuid(),
  name: '',
  quantity: 1,
  unitPrice: 0,
  currency,
  taxRate: 0.2,
});

export const InvoiceBuilder = ({ defaultCurrency = 'USD', onCreate }: InvoiceBuilderProps) => {
  const [clientName, setClientName] = useState('');
  const [clientId, setClientId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [currency, setCurrency] = useState<CurrencyCode>(defaultCurrency);
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([emptyLine(defaultCurrency)]);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');

  const subtotal = lineItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const taxes = lineItems.reduce((acc, item) => acc + item.quantity * item.unitPrice * (item.taxRate ?? 0), 0);
  const total = subtotal + taxes - subtotal * discount;

  const updateItem = (id: string, patch: Partial<InvoiceLineItem>) => {
    setLineItems((items) => items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const addItem = () => setLineItems((items) => [...items, emptyLine(currency)]);
  const removeItem = (id: string) => setLineItems((items) => items.filter((item) => item.id !== id));

  const handleCreate = async () => {
    if (!clientName.trim()) return;
    await onCreate({
      clientId: clientId || clientName,
      clientName,
      projectId: projectId || undefined,
      issueDate,
      dueDate,
      currency,
      lineItems,
      discount,
      notes,
      attachments: [],
      branding: { accentColor: '#6366f1' },
      payments: [],
    } as Omit<Invoice, 'id' | 'number' | 'status' | 'createdAt' | 'updatedAt' | 'taxes'>);

    setClientName('');
    setClientId('');
    setProjectId('');
    setLineItems([emptyLine(currency)]);
    setDiscount(0);
    setNotes('');
  };

  return (
    <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-200">
      <h3 className="text-base font-semibold text-slate-100">Invoice Builder</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="clientName">Client</Label>
          <Input id="clientName" value={clientName} onChange={(event) => setClientName(event.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="clientId">Client ID</Label>
          <Input id="clientId" value={clientId} onChange={(event) => setClientId(event.target.value)} placeholder="client-001" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="projectId">Project</Label>
          <Input id="projectId" value={projectId} onChange={(event) => setProjectId(event.target.value)} placeholder="project-001" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="currency">Currency</Label>
          <select
            id="currency"
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
            value={currency}
            onChange={(event) => {
              const next = event.target.value as CurrencyCode;
              setCurrency(next);
              setLineItems((items) => items.map((item) => ({ ...item, currency: next })));
            }}
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="UAH">UAH</option>
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="issueDate">Date</Label>
          <Input id="issueDate" type="date" value={issueDate} onChange={(event) => setIssueDate(event.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input id="dueDate" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
        </div>
      </div>
      <div className="space-y-3">
        {lineItems.map((item) => (
          <div key={item.id} className="grid gap-3 rounded-md border border-slate-800 bg-slate-900/80 p-3 md:grid-cols-6">
            <div className="md:col-span-2">
              <Label className="text-xs text-slate-500">Item</Label>
              <Input value={item.name} onChange={(event) => updateItem(item.id, { name: event.target.value })} />
            </div>
            <div>
              <Label className="text-xs text-slate-500">Qty</Label>
              <Input
                type="number"
                value={item.quantity}
                onChange={(event) => updateItem(item.id, { quantity: Number(event.target.value) })}
              />
            </div>
            <div>
              <Label className="text-xs text-slate-500">Price</Label>
              <Input
                type="number"
                value={item.unitPrice}
                onChange={(event) => updateItem(item.id, { unitPrice: Number(event.target.value) })}
              />
            </div>
            <div>
              <Label className="text-xs text-slate-500">VAT</Label>
              <Input
                type="number"
                value={(item.taxRate ?? 0) * 100}
                onChange={(event) => updateItem(item.id, { taxRate: Number(event.target.value) / 100 })}
              />
            </div>
            <div className="flex items-end justify-end">
              <Button type="button" variant="ghost" onClick={() => removeItem(item.id)}>
                Remove
              </Button>
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addItem}>
          Add item
        </Button>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="discount">Discount, %</Label>
        <Input
          id="discount"
          type="number"
          value={discount * 100}
          onChange={(event) => setDiscount(Number(event.target.value) / 100)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Payment terms, additional instructions"
          className="min-h-[120px] rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary"
        />
      </div>
      <div className="rounded-md border border-slate-800 bg-slate-900/80 p-3 text-sm">
        <div className="flex items-center justify-between text-slate-400">
          <span>Subtotal</span>
          <span className="text-slate-100">{subtotal.toFixed(2)} {currency}</span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span>VAT</span>
          <span className="text-slate-100">{taxes.toFixed(2)} {currency}</span>
        </div>
        {discount > 0 && (
          <div className="flex items-center justify-between text-slate-400">
            <span>Discount</span>
            <span className="text-slate-100">-{(subtotal * discount).toFixed(2)} {currency}</span>
          </div>
        )}
        <div className="mt-2 flex items-center justify-between text-lg font-semibold text-secondary">
          <span>Total Due</span>
          <span>{total.toFixed(2)} {currency}</span>
        </div>
      </div>
      <Button type="button" variant="secondary" onClick={handleCreate}>
        Create invoice
      </Button>
    </div>
  );
};
