import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { Invoice, PayrollRecord, PayslipGenerationOptions } from '../types/accounting.types';

export const generateInvoicePdf = (invoice: Invoice, options?: { companyName?: string; address?: string }) => {
  const doc = new jsPDF();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(options?.companyName ?? 'Company', 14, 20);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice #${invoice.number}`, 14, 32);
  doc.text(`Date: ${format(new Date(invoice.issueDate), 'dd.MM.yyyy')}`, 14, 40);
  doc.text(`Client: ${invoice.clientName}`, 14, 48);
  doc.text(`Status: ${invoice.status.toUpperCase()}`, 14, 56);

  autoTable(doc, {
    startY: 65,
    head: [['Item', 'Qty', 'Price', 'Tax', 'Total']],
    body: invoice.lineItems.map((item) => {
      const total = item.quantity * item.unitPrice * (1 + (item.taxRate ?? 0));
      return [
        item.name,
        item.quantity.toString(),
        `${item.unitPrice.toFixed(2)} ${item.currency}`,
        `${((item.taxRate ?? 0) * 100).toFixed(2)}%`,
        `${total.toFixed(2)} ${item.currency}`,
      ];
    }),
  });

  const subtotal = invoice.lineItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const taxes = invoice.taxes;
  const discount = invoice.discount ? subtotal * invoice.discount : 0;
  const total = subtotal + taxes - discount;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalTable = (doc as any).lastAutoTable;
  const summaryY = finalTable ? finalTable.finalY + 10 : 120;
  doc.setFont('helvetica', 'bold');
  doc.text(`Subtotal excl. VAT: ${subtotal.toFixed(2)} ${invoice.currency}`, 14, summaryY);
  doc.text(`VAT: ${taxes.toFixed(2)} ${invoice.currency}`, 14, summaryY + 8);
  if (discount) {
    doc.text(`Discount: -${discount.toFixed(2)} ${invoice.currency}`, 14, summaryY + 16);
  }
  doc.text(`Total due: ${total.toFixed(2)} ${invoice.currency}`, 14, summaryY + 24);

  return doc;
};

export const generatePayslipPdf = (
  record: PayrollRecord,
  options?: PayslipGenerationOptions,
) => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('Payslip', 14, 20);
  doc.setFontSize(12);
  doc.text(`Employee: ${record.employeeName}`, 14, 30);
  doc.text(`Period: ${record.period}`, 14, 38);
  doc.text(`Base Salary: ${record.baseSalary.toFixed(2)} ${record.currency}`, 14, 46);

  const bonusStart = 54;
  doc.setFont('helvetica', 'bold');
  doc.text('Bonuses', 14, bonusStart);
  doc.setFont('helvetica', 'normal');
  record.bonuses.forEach((bonus, index) => {
    doc.text(`${bonus.name}: ${bonus.amount.toFixed(2)} ${record.currency}`, 14, bonusStart + 8 * (index + 1));
  });

  const deductionsY = bonusStart + 8 * (record.bonuses.length + 2);
  doc.setFont('helvetica', 'bold');
  doc.text('Deductions', 14, deductionsY);
  doc.setFont('helvetica', 'normal');
  record.deductions.forEach((deduction, index) => {
    doc.text(
      `${deduction.name}: -${deduction.amount.toFixed(2)} ${record.currency}`,
      14,
      deductionsY + 8 * (index + 1),
    );
  });

  const totalsY = deductionsY + 8 * (record.deductions.length + 2);
  doc.setFont('helvetica', 'bold');
  doc.text(`Gross: ${record.grossSalary.toFixed(2)} ${record.currency}`, 14, totalsY);
  doc.text(`Net: ${record.netSalary.toFixed(2)} ${record.currency}`, 14, totalsY + 8);

  if (options?.includeSignature) {
    doc.setFont('helvetica', 'normal');
    doc.text('________________________', 14, totalsY + 24);
    doc.text('Signature', 14, totalsY + 32);
  }

  return doc;
};
