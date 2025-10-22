import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { InvoiceBuilder } from '../components/InvoiceBuilder';
import { InvoiceList } from '../components/InvoiceList';
import { useInvoices } from '../hooks/useInvoices';

export const InvoicesPage = () => {
  const { invoices, createInvoice, sendInvoice, recordPayment, generatePdf, scheduleReminders, reminderConfig } = useInvoices();
  const [daysBefore, setDaysBefore] = useState(reminderConfig.daysBeforeDue.join(','));
  const [daysAfter, setDaysAfter] = useState(reminderConfig.daysAfterDue.join(','));

  const handleRecordPayment = async (invoiceId: string) => {
    const invoice = invoices.find((item) => item.id === invoiceId);
    if (!invoice) return;
    const subtotal = invoice.lineItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
    const taxes = invoice.taxes;
    const discount = invoice.discount ? subtotal * invoice.discount : 0;
    const total = subtotal + taxes - discount;
    const paid = (invoice.payments ?? []).reduce((acc, payment) => acc + payment.amount, 0);
    const outstanding = Math.max(0, total - paid);
    if (outstanding <= 0) return;
    await recordPayment(invoiceId, outstanding, invoice.currency);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <InvoiceList
          invoices={invoices}
          onSend={(invoiceId) => sendInvoice(invoiceId, { to: 'billing@client.com' })}
          onRecordPayment={handleRecordPayment}
          onDownload={generatePdf}
        />
        <InvoiceBuilder onCreate={createInvoice} />
      </div>
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-200">
        <h3 className="text-base font-semibold text-slate-100">Нагадування про оплату</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <span className="text-xs text-slate-500">Дні до дедлайну</span>
            <Input value={daysBefore} onChange={(event) => setDaysBefore(event.target.value)} placeholder="7,1" />
          </div>
          <div className="grid gap-2">
            <span className="text-xs text-slate-500">Дні після дедлайну</span>
            <Input value={daysAfter} onChange={(event) => setDaysAfter(event.target.value)} placeholder="3,7" />
          </div>
        </div>
        <Button
          variant="secondary"
          className="mt-4"
          onClick={() =>
            scheduleReminders({
              daysBeforeDue: daysBefore.split(',').map((day) => Number(day.trim())).filter(Boolean),
              daysAfterDue: daysAfter.split(',').map((day) => Number(day.trim())).filter(Boolean),
              enabled: true,
            })
          }
        >
          Зберегти налаштування
        </Button>
      </div>
    </div>
  );
};
