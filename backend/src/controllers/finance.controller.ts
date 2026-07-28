import { Request, Response } from 'express';
import { InvoiceStatus, TransactionType } from '@prisma/client';
import { prisma } from '../lib/prisma';

const decimalToNumber = (value: any): number => {
  if (!value) return 0;
  return typeof value === 'number' ? value : Number(value);
};

export const getProfitAndLoss = async (req: Request, res: Response) => {
  const {
    from,
    to,
    currency = 'USD'
  } = req.query as {
    from?: string;
    to?: string;
    currency?: string;
  };

  const dateFilter: any = {};
  if (from) dateFilter.gte = new Date(from);
  if (to) dateFilter.lte = new Date(to);

  const incomeWhere: any = { organizationId: req.user!.organizationId, type: TransactionType.income, currency };
  const expenseWhere: any = { organizationId: req.user!.organizationId, type: TransactionType.expense, currency };
  if (from || to) {
    incomeWhere.date = dateFilter;
    expenseWhere.date = dateFilter;
  }

  const [income, expenses] = await Promise.all([
    prisma.transaction.aggregate({ _sum: { amount: true }, where: incomeWhere }),
    prisma.transaction.aggregate({ _sum: { amount: true }, where: expenseWhere })
  ]);

  const incomeValue = decimalToNumber(income._sum.amount);
  const expenseValue = decimalToNumber(expenses._sum.amount);
  const grossProfit = incomeValue - expenseValue;

  return res.json({
    type: 'profitAndLoss',
    generatedAt: new Date().toISOString(),
    currency,
    figures: {
      income: incomeValue,
      expenses: expenseValue,
      grossProfit
    },
    period: { from, to }
  });
};

export const createInvoice = async (req: Request, res: Response) => {
  const {
    clientId,
    amount,
    currency = 'USD',
    issueDate,
    dueDate,
    taxRate = 0.2,
    status
  } = req.body;
  const lineItems = req.body.lineItems as
    Array<{ quantity: number; unitPrice: number }> | undefined;

  const subtotal =
    lineItems?.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0) ?? Number(amount);
  const taxAmount = subtotal * taxRate;
  const totalAmount = subtotal + taxAmount;

  const employee = req.user
    ? await prisma.employee.findFirst({ where: { userId: req.user.userId } })
    : null;

  const invoiceNumber = `INV-${Date.now()}`;

  const invoice = await prisma.invoice.create({
    data: {
      organizationId: req.user!.organizationId,
      clientId,
      invoiceNumber,
      amount: subtotal,
      taxRate,
      taxAmount,
      totalAmount,
      currency,
      status: status ?? InvoiceStatus.sent,
      issueDate: issueDate ? new Date(issueDate) : new Date(),
      dueDate: dueDate ? new Date(dueDate) : undefined,
      createdBy: employee?.id || undefined
    },
    include: { client: true }
  });

  res.status(201).json(invoice);
};

export const sendInvoice = async (req: Request, res: Response) => {
  const { id } = req.params;
  const existing = await prisma.invoice.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ message: 'Invoice not found' });
  const invoice = await prisma.invoice.update({
    where: { id },
    data: { status: InvoiceStatus.sent }
  });
  res.json({ message: 'Invoice sent', data: invoice });
};

export const recordInvoicePayment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const existing = await prisma.invoice.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ message: 'Invoice not found' });
  const invoice = await prisma.invoice.update({
    where: { id },
    data: { status: InvoiceStatus.paid, paidDate: new Date() }
  });
  res.json({ message: 'Payment recorded', data: invoice });
};

export const sendInvoiceReminders = async (req: Request, res: Response) => {
  const organizationId = req.user!.organizationId;
  const now = new Date();

  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      organizationId,
      dueDate: { lt: now },
      status: { notIn: ['paid', 'overdue'] }
    }
  });

  if (overdueInvoices.length > 0) {
    const ids = overdueInvoices.map(inv => inv.id);
    await prisma.invoice.updateMany({
      where: { id: { in: ids } },
      data: { status: 'overdue' }
    });
  }

  res.json({ 
    message: `Reminders sent for ${overdueInvoices.length} overdue invoices`,
    remindedCount: overdueInvoices.length 
  });
};
