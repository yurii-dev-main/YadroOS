import { useEffect } from 'react';
import { create } from 'zustand';
import { accountingService } from '../services/accounting.service';
import { generatePayslipPdf } from '../utils/pdf.utils';
import {
  PayrollCalendarEntry,
  PayrollRecord,
  PayrollRunRequest,
  PaymentExecutionRequest,
  PayslipGenerationOptions,
} from '../types/accounting.types';

interface PayrollState {
  records: PayrollRecord[];
  calendar: PayrollCalendarEntry[];
  loading: boolean;
  error?: string;
  lastRun?: string;
  loadPayroll: () => Promise<void>;
  runPayroll: (request: PayrollRunRequest) => Promise<void>;
  markPaid: (request: PaymentExecutionRequest) => Promise<void>;
  generatePayslip: (recordId: string, options?: PayslipGenerationOptions) => void;
}

const usePayrollStore = create<PayrollState>((set, get) => ({
  records: [],
  calendar: [],
  loading: false,
  error: undefined,
  lastRun: undefined,
  async loadPayroll() {
    set({ loading: true, error: undefined });
    try {
      const records = await accountingService.getPayrollRecords();
      set({ records, loading: false });
      if (!get().calendar.length) {
        const calendar: PayrollCalendarEntry[] = records.map((record) => ({
          id: `${record.period}-${record.employeeId}`,
          period: record.period,
          runDate: record.generatedAt,
          paymentDate: record.paidAt ?? record.generatedAt,
          status: record.status === 'paid' ? 'paid' : record.status === 'processed' ? 'processed' : 'scheduled',
        }));
        set({ calendar });
      }
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Не вдалося завантажити зарплатні дані',
      });
    }
  },
  async runPayroll(request) {
    set({ loading: true, error: undefined });
    try {
      const records = await accountingService.runPayroll(request);
      set({
        records: [...records, ...get().records],
        lastRun: request.period,
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Помилка запуску розрахунку зарплат',
      });
    }
  },
  async markPaid(request) {
    await accountingService.markPayrollPaid(request);
    const records = await accountingService.getPayrollRecords();
    set({ records });
  },
  generatePayslip(recordId, options) {
    const record = get().records.find((item) => item.id === recordId);
    if (!record) return;
    const doc = generatePayslipPdf(record, options);
    doc.save(`Payslip-${record.employeeName}-${record.period}.pdf`);
  },
}));

export const usePayroll = () => {
  const store = usePayrollStore();
  useEffect(() => {
    if (!store.records.length && !store.loading) {
      void store.loadPayroll();
    }
  }, [store.records.length, store.loading, store.loadPayroll]);
  return store;
};
