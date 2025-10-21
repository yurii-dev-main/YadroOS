import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { Invoice, PayrollRecord, PayslipGenerationOptions } from '../types/accounting.types';

export const generateInvoicePdf = (invoice: Invoice, options?: { companyName?: string; address?: string }) => {
  const doc = new jsPDF();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(options?.companyName ?? 'Компанія', 14, 20);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Інвойс №${invoice.number}`, 14, 32);
  doc.text(`Дата: ${format(new Date(invoice.issueDate), 'dd.MM.yyyy')}`, 14, 40);
  doc.text(`Клієнт: ${invoice.clientName}`, 14, 48);
  doc.text(`Статус: ${invoice.status.toUpperCase()}`, 14, 56);

  autoTable(doc, {
    startY: 65,
    head: [['Позиція', 'К-сть', 'Ціна', 'Податок', 'Разом']],
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

  const finalTable = (doc as any).lastAutoTable;
  const summaryY = finalTable ? finalTable.finalY + 10 : 120;
  doc.setFont('helvetica', 'bold');
  doc.text(`Разом без ПДВ: ${subtotal.toFixed(2)} ${invoice.currency}`, 14, summaryY);
  doc.text(`ПДВ: ${taxes.toFixed(2)} ${invoice.currency}`, 14, summaryY + 8);
  if (discount) {
    doc.text(`Знижка: -${discount.toFixed(2)} ${invoice.currency}`, 14, summaryY + 16);
  }
  doc.text(`До оплати: ${total.toFixed(2)} ${invoice.currency}`, 14, summaryY + 24);

  return doc;
};

export const generatePayslipPdf = (
  record: PayrollRecord,
  options?: PayslipGenerationOptions,
) => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('Розрахунковий лист', 14, 20);
  doc.setFontSize(12);
  doc.text(`Працівник: ${record.employeeName}`, 14, 30);
  doc.text(`Період: ${record.period}`, 14, 38);
  doc.text(`Базова зарплата: ${record.baseSalary.toFixed(2)} ${record.currency}`, 14, 46);

  const bonusStart = 54;
  doc.setFont('helvetica', 'bold');
  doc.text('Бонуси', 14, bonusStart);
  doc.setFont('helvetica', 'normal');
  record.bonuses.forEach((bonus, index) => {
    doc.text(`${bonus.name}: ${bonus.amount.toFixed(2)} ${record.currency}`, 14, bonusStart + 8 * (index + 1));
  });

  let deductionsY = bonusStart + 8 * (record.bonuses.length + 2);
  doc.setFont('helvetica', 'bold');
  doc.text('Відрахування', 14, deductionsY);
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
  doc.text(`Брутто: ${record.grossSalary.toFixed(2)} ${record.currency}`, 14, totalsY);
  doc.text(`Нетто: ${record.netSalary.toFixed(2)} ${record.currency}`, 14, totalsY + 8);

  if (options?.includeSignature) {
    doc.setFont('helvetica', 'normal');
    doc.text('________________________', 14, totalsY + 24);
    doc.text('Підпис', 14, totalsY + 32);
  }

  return doc;
};
