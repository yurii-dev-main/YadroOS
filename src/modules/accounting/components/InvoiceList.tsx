import { format } from 'date-fns';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Invoice } from '../types/accounting.types';

interface InvoiceListProps {
  invoices: Invoice[];
  onSend: (invoiceId: string) => void;
  onRecordPayment: (invoiceId: string) => void;
  onDownload: (invoiceId: string) => void;
}

const statusStyles: Record<Invoice['status'], string> = {
  draft: 'bg-slate-800 text-slate-300',
  sent: 'bg-amber-500/10 text-amber-300',
  paid: 'bg-emerald-500/10 text-emerald-300',
  overdue: 'bg-rose-500/10 text-rose-300',
};

export const InvoiceList = ({ invoices, onSend, onRecordPayment, onDownload }: InvoiceListProps) => (
  <Card className="border border-slate-800 bg-slate-900/60">
    <CardHeader>
      <CardTitle className="text-base text-slate-100">Invoices</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4 text-sm text-slate-200">
      {invoices.map((invoice) => {
        const subtotal = invoice.lineItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
        const taxes = invoice.taxes;
        const discount = invoice.discount ? subtotal * invoice.discount : 0;
        const total = subtotal + taxes - discount;
        return (
          <div key={invoice.id} className="rounded-lg border border-slate-800 bg-slate-900/80 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-100">{invoice.number}</p>
                <p className="text-xs text-slate-500">{invoice.clientName}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs uppercase tracking-wide ${statusStyles[invoice.status]}`}>
                {invoice.status}
              </span>
            </div>
            <div className="mt-3 grid gap-2 text-xs text-slate-400 md:grid-cols-4">
              <span>Issued: {format(new Date(invoice.issueDate), 'dd.MM.yyyy')}</span>
              <span>Due: {format(new Date(invoice.dueDate), 'dd.MM.yyyy')}</span>
              <span>Total: {total.toFixed(2)} {invoice.currency}</span>
              <span>Paid: {(invoice.payments ?? []).reduce((acc, payment) => acc + payment.amount, 0).toFixed(2)} {invoice.currency}</span>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => onDownload(invoice.id)}>
                PDF
              </Button>
              {invoice.status === 'draft' && (
                <Button variant="secondary" size="sm" onClick={() => onSend(invoice.id)}>
                  Send
                </Button>
              )}
              {invoice.status !== 'paid' && (
                <Button variant="outline" size="sm" onClick={() => onRecordPayment(invoice.id)}>
                  Record payment
                </Button>
              )}
            </div>
          </div>
        );
      })}
      {!invoices.length && <p className="text-xs text-slate-500">No invoices available.</p>}
    </CardContent>
  </Card>
);
