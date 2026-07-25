import { useEffect } from 'react';
import { create } from 'zustand';
import { generateInvoicePdf } from '../utils/pdf.utils';
import { accountingService } from '../services/accounting.service';
import {
  Invoice,
  InvoiceEmailOptions,
  InvoiceReminderConfig,
  PaymentReminder,
  CurrencyCode
} from '../types/accounting.types';

interface InvoiceState {
  invoices: Invoice[];
  reminders: PaymentReminder[];
  loading: boolean;
  selectedInvoice: Invoice | null;
  reminderConfig: InvoiceReminderConfig;
  error?: string;
  loadInvoices: () => Promise<void>;
  createInvoice: (
    payload: Omit<Invoice, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'number' | 'taxes'>
  ) => Promise<Invoice>;
  sendInvoice: (invoiceId: string, options: InvoiceEmailOptions) => Promise<void>;
  recordPayment: (invoiceId: string, amount: number, currency: CurrencyCode) => Promise<void>;
  generatePdf: (invoiceId: string) => void;
  scheduleReminders: (config: InvoiceReminderConfig) => Promise<void>;
  setSelectedInvoice: (invoiceId: string | null) => void;
}

const defaultReminderConfig: InvoiceReminderConfig = {
  daysBeforeDue: [7, 1],
  daysAfterDue: [3, 7],
  enabled: true
};

const useInvoiceStore = create<InvoiceState>((set, get) => ({
  invoices: [],
  reminders: [],
  loading: false,
  selectedInvoice: null,
  reminderConfig: defaultReminderConfig,
  error: undefined,
  async loadInvoices() {
    set({ loading: true, error: undefined });
    try {
      const invoices = await accountingService.getInvoices();
      set({ invoices, loading: false });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load invoices'
      });
    }
  },
  async createInvoice(payload) {
    const invoice = await accountingService.createInvoice(payload);
    set({ invoices: [invoice, ...get().invoices] });
    return invoice;
  },
  async sendInvoice(invoiceId, options) {
    await accountingService.sendInvoice(invoiceId, options);
    const invoices = await accountingService.getInvoices();
    set({ invoices });
  },
  async recordPayment(invoiceId, amount, currency) {
    await accountingService.recordInvoicePayment(invoiceId, amount, currency);
    const invoices = await accountingService.getInvoices();
    set({ invoices });
  },
  generatePdf(invoiceId) {
    const invoice = get().invoices.find((item) => item.id === invoiceId);
    if (!invoice) return;
    const doc = generateInvoicePdf(invoice, { companyName: 'YadroOS' });
    doc.save(`${invoice.number}.pdf`);
  },
  async scheduleReminders(config) {
    const reminders = await accountingService.scheduleReminders(config);
    set({ reminders, reminderConfig: config });
  },
  setSelectedInvoice(invoiceId) {
    if (!invoiceId) {
      set({ selectedInvoice: null });
      return;
    }
    const invoice = get().invoices.find((item) => item.id === invoiceId) ?? null;
    set({ selectedInvoice: invoice });
  }
}));

export const useInvoices = () => {
  const store = useInvoiceStore();
  useEffect(() => {
    if (!store.invoices.length && !store.loading) {
      void store.loadInvoices();
    }
  }, [store, store.invoices.length, store.loading, store.loadInvoices]);
  return store;
};
