import Decimal from 'decimal.js';
import {
  Invoice,
  PayrollDeduction,
  PayrollRecord,
  TaxConfiguration,
  TaxBracket,
} from '../types/accounting.types';

export const defaultTaxConfiguration: TaxConfiguration = {
  country: 'Ukraine',
  incomeTaxRate: 0.18,
  socialSecurityRate: 0.22,
  pensionRate: 0.015,
  vatRate: 0.2,
  progressiveBrackets: [
    { id: 'income-low', name: 'До 50 000', rate: 0.1, appliesTo: 'income' },
    { id: 'income-mid', name: '50 000 - 150 000', rate: 0.18, appliesTo: 'income' },
    { id: 'income-high', name: '150 000+', rate: 0.22, appliesTo: 'income' },
  ],
};

export const calculateProgressiveTax = (amount: number, brackets: TaxBracket[]): number => {
  if (!brackets.length) {
    return 0;
  }

  const sorted = [...brackets].sort((a, b) => a.rate - b.rate);
  let remaining = new Decimal(amount);
  let tax = new Decimal(0);

  sorted.forEach((bracket, index) => {
    const nextBracket = sorted[index + 1];
    const limit = nextBracket ? new Decimal(amount).mul(nextBracket.rate / bracket.rate) : remaining;
    const taxable = Decimal.min(remaining, limit);

    tax = tax.add(taxable.mul(bracket.rate));
    remaining = remaining.minus(taxable);
  });

  return Number(tax.toFixed(2));
};

export const calculatePayrollDeductions = (
  grossSalary: number,
  config: TaxConfiguration = defaultTaxConfiguration,
): PayrollDeduction[] => {
  const salary = new Decimal(grossSalary);
  const incomeTax = salary.mul(config.incomeTaxRate);
  const socialSecurity = salary.mul(config.socialSecurityRate);
  const pension = salary.mul(config.pensionRate);

  return [
    { name: 'ПДФО', amount: Number(incomeTax.toFixed(2)), type: 'tax' },
    { name: 'ЄСВ', amount: Number(socialSecurity.toFixed(2)), type: 'insurance' },
    { name: 'Пенсійний фонд', amount: Number(pension.toFixed(2)), type: 'pension' },
  ];
};

export const calculateNetSalary = (
  record: Pick<PayrollRecord, 'grossSalary' | 'deductions'>,
): number => {
  const gross = new Decimal(record.grossSalary);
  const deductions = record.deductions.reduce((acc, deduction) => acc.add(deduction.amount), new Decimal(0));
  return Number(gross.minus(deductions).toFixed(2));
};

export const calculateInvoiceTaxes = (
  invoice: Invoice,
  config: TaxConfiguration = defaultTaxConfiguration,
): number => {
  const taxableAmount = invoice.lineItems.reduce((acc, item) => {
    const price = new Decimal(item.quantity).mul(item.unitPrice);
    const discounted = item.discount ? price.mul(new Decimal(1).minus(item.discount)) : price;
    return acc.add(discounted);
  }, new Decimal(0));

  const vatRate = invoice.lineItems.some((item) => item.taxRate !== undefined)
    ? invoice.lineItems.reduce((acc, item) => acc + (item.taxRate ?? config.vatRate), 0) / invoice.lineItems.length
    : config.vatRate;

  return Number(taxableAmount.mul(vatRate).toFixed(2));
};

export const calculateDiscountedAmount = (invoice: Invoice): number => {
  const subtotal = invoice.lineItems.reduce((acc, item) => {
    const price = new Decimal(item.quantity).mul(item.unitPrice);
    return acc.add(price);
  }, new Decimal(0));

  if (!invoice.discount) {
    return Number(subtotal.toFixed(2));
  }

  return Number(subtotal.mul(new Decimal(1).minus(invoice.discount)).toFixed(2));
};

export const applyTaxConfiguration = (invoice: Invoice, config: TaxConfiguration): Invoice => ({
  ...invoice,
  taxes: calculateInvoiceTaxes(invoice, config),
});

export const calculateTaxLiability = (
  records: PayrollRecord[],
  config: TaxConfiguration = defaultTaxConfiguration,
): number => {
  return records.reduce((acc, record) => {
    const deductions = record.deductions.filter((deduction) => deduction.type === 'tax');
    const total = deductions.reduce((sum, deduction) => sum + deduction.amount, 0);
    if (total === 0) {
      return acc + record.grossSalary * config.incomeTaxRate;
    }
    return acc + total;
  }, 0);
};
