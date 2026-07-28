import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { TransactionType, InvoiceStatus } from '@prisma/client';
import csv from 'csv-parser';
import * as xlsx from 'xlsx';
import crypto from 'crypto';
import { Readable } from 'stream';
import { getNBURates } from '../services/exchange.service';
import { bankingService } from '../services/banking.service';

// ---------------------------
// CATEGORIES
// ---------------------------
export const getExchangeRates = async (req: Request, res: Response) => {
  const rates = await getNBURates();
  res.json(rates);
};

export const listCategories = async (req: Request, res: Response) => {
  const { type } = req.query as { type?: TransactionType };
  
  const where: Record<string, any> = { organizationId: req.user!.organizationId };
  if (type) where.type = type;

  const categories = await prisma.category.findMany({
    where,
    orderBy: { name: 'asc' }
  });

  res.json({ data: categories });
};

export const createCategory = async (req: Request, res: Response) => {
  const { name, type, color } = req.body;
  const category = await prisma.category.create({
    data: {
      organizationId: req.user!.organizationId,
      name,
      type,
      color
    }
  });

  res.status(201).json(category);
};

// ---------------------------
// BUDGETS
// ---------------------------
export const listBudgets = async (req: Request, res: Response) => {
  const budgets = await prisma.budget.findMany({
    where: { organizationId: req.user!.organizationId },
    orderBy: { startDate: 'desc' }
  });

  const budgetsWithSpent = await Promise.all(
    budgets.map(async (budget) => {
      if (!budget.categoryId) return { ...budget, spentAmount: 0 };
      const transactions = await prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          organizationId: req.user!.organizationId,
          categoryId: budget.categoryId,
          date: {
            gte: budget.startDate,
            lte: budget.endDate
          }
        }
      });
      return {
        ...budget,
        spentAmount: Number(transactions._sum.amount) || 0
      };
    })
  );

  res.json({ data: budgetsWithSpent });
};

export const createBudget = async (req: Request, res: Response) => {
  const { name, amount, currency, period, startDate, endDate, categoryId } = req.body;
  const budget = await prisma.budget.create({
    data: {
      organizationId: req.user!.organizationId,
      name,
      amount,
      currency,
      period,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      categoryId
    }
  });
  res.status(201).json(budget);
};

export const updateBudget = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, amount, currency, period, startDate, endDate, categoryId } = req.body;

  const existing = await prisma.budget.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ message: 'Budget not found' });

  const updated = await prisma.budget.update({
    where: { id },
    data: {
      name,
      amount,
      currency,
      period,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      categoryId
    }
  });

  res.json(updated);
};

// ---------------------------
// INVOICES
// ---------------------------
export const listInvoices = async (req: Request, res: Response) => {
  const { status } = req.query as { status?: InvoiceStatus };
  const where: Record<string, any> = { organizationId: req.user!.organizationId };
  if (status) where.status = status;

  const invoices = await prisma.invoice.findMany({
    where,
    include: { client: true },
    orderBy: { createdAt: 'desc' }
  });

  res.json({ data: invoices });
};

export const createInvoice = async (req: Request, res: Response) => {
  const { invoiceNumber, clientId, amount, currency, issueDate, dueDate, taxRate } = req.body;
  
  const taxAmount = (Number(amount) * Number(taxRate || 0)) / 100;
  const totalAmount = Number(amount) + taxAmount;

  const invoice = await prisma.invoice.create({
    data: {
      organizationId: req.user!.organizationId,
      invoiceNumber,
      clientId,
      amount,
      currency: currency || 'USD',
      issueDate: issueDate ? new Date(issueDate) : undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      taxRate: taxRate || 0,
      taxAmount,
      totalAmount,
      createdBy: req.user!.userId
    }
  });

  res.status(201).json(invoice);
};

export const updateInvoiceStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body as { status: InvoiceStatus };

  const existing = await prisma.invoice.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ message: 'Invoice not found' });

  const updated = await prisma.invoice.update({
    where: { id },
    data: { 
      status,
      paidDate: status === 'paid' ? new Date() : undefined
    }
  });

  res.json(updated);
};

// ---------------------------
// PAYROLL
// ---------------------------
export const getPayroll = async (req: Request, res: Response) => {
  const employees = await prisma.employee.findMany({
    where: { organizationId: req.user!.organizationId },
    select: { id: true, firstName: true, lastName: true, position: true, salary: true, department: true }
  });
  res.json({ data: employees });
};

export const runPayroll = async (req: Request, res: Response) => {
  const { period, taxRates } = req.body;
  const organizationId = req.user!.organizationId;

  const employees = await prisma.employee.findMany({
    where: { organizationId, salary: { not: null } }
  });

  // taxRates is expected to be a record like { "Income Tax": 0.15, "Social Security": 0.05 }
  const rates = taxRates || { "Default Tax": 0.20 };

  const payrollRecords = await Promise.all(
    employees.map(async (employee) => {
      const grossSalary = Number(employee.salary) || 0;
      
      const deductions: Record<string, number> = {};
      let totalDeductionsAmount = 0;

      for (const [taxName, rate] of Object.entries(rates)) {
        const amt = grossSalary * Number(rate);
        deductions[taxName] = amt;
        totalDeductionsAmount += amt;
      }

      const netSalary = grossSalary - totalDeductionsAmount;

      return prisma.payrollRecord.create({
        data: {
          organizationId,
          employeeId: employee.id,
          period: period || new Date().toISOString().slice(0, 7),
          baseSalary: grossSalary,
          grossSalary,
          netSalary,
          deductions: deductions,
          status: 'draft'
        }
      });
    })
  );

  res.json({ message: 'Payroll run successfully', data: payrollRecords });
};

// ---------------------------
// ANALYTICS
// ---------------------------
export const getDashboardAnalytics = async (req: Request, res: Response) => {
  const organizationId = req.user!.organizationId;

  const transactions = await prisma.transaction.findMany({
    where: { organizationId }
  });

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
  
  const accounts = await prisma.account.findMany({
    where: { organizationId }
  });
  const totalBalance = accounts.reduce((acc, a) => acc + Number(a.balance), 0);

  const pendingInvoices = await prisma.invoice.count({
    where: { organizationId, status: { in: ['draft', 'sent'] } }
  });

  res.json({
    data: {
      totalIncome,
      totalExpense,
      totalBalance,
      pendingInvoices
    }
  });
};

export const getCashBalances = async (req: Request, res: Response) => {
  const accounts = await prisma.account.findMany({
    where: { organizationId: req.user!.organizationId }
  });

  const balances = accounts.reduce((acc, account) => {
    acc[account.type] = (acc[account.type] || 0) + Number(account.balance);
    return acc;
  }, {} as Record<string, number>);

  res.json({ data: balances });
};

export const getCategoryBreakdown = async (req: Request, res: Response) => {
  const transactions = await prisma.transaction.findMany({
    where: { organizationId: req.user!.organizationId, type: 'expense' }
  });

  const breakdown = transactions.reduce((acc, t) => {
    const cat = t.category || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + Number(t.amount);
    return acc;
  }, {} as Record<string, number>);

  const data = Object.keys(breakdown).map(k => ({ category: k, amount: breakdown[k] }));
  res.json({ data });
};

export const getClientProfitability = async (req: Request, res: Response) => {
  const organizationId = req.user!.organizationId;

  const invoices = await prisma.invoice.findMany({
    where: { organizationId },
    include: { client: true }
  });

  const transactions = await prisma.transaction.findMany({
    where: { organizationId, clientId: { not: null }, type: 'expense' },
    include: { client: true }
  });

  const profitability: Record<string, { revenue: number, cost: number, profit: number }> = {};

  // Add revenue from invoices
  invoices.forEach(inv => {
    const clientName = inv.client.name;
    if (!profitability[clientName]) profitability[clientName] = { revenue: 0, cost: 0, profit: 0 };
    profitability[clientName].revenue += Number(inv.totalAmount);
    profitability[clientName].profit = profitability[clientName].revenue - profitability[clientName].cost;
  });

  // Add cost from expense transactions
  transactions.forEach(tx => {
    if (tx.client) {
      const clientName = tx.client.name;
      if (!profitability[clientName]) profitability[clientName] = { revenue: 0, cost: 0, profit: 0 };
      profitability[clientName].cost += Number(tx.amount);
      profitability[clientName].profit = profitability[clientName].revenue - profitability[clientName].cost;
    }
  });

  res.json({ data: profitability });
};

export const getReports = async (req: Request, res: Response) => {
  const organizationId = req.user!.organizationId;

  // Fetch all transactions to build cashflow
  const transactions = await prisma.transaction.findMany({
    where: { organizationId },
    orderBy: { date: 'asc' }
  });

  let totalIncome = 0;
  let totalExpense = 0;

  const monthlyCashflow: Record<string, { inflow: number; outflow: number }> = {};

  transactions.forEach((tx) => {
    const month = tx.date.toISOString().slice(0, 7); // YYYY-MM
    if (!monthlyCashflow[month]) {
      monthlyCashflow[month] = { inflow: 0, outflow: 0 };
    }
    const amount = Number(tx.amount);
    if (tx.type === 'income') {
      monthlyCashflow[month].inflow += amount;
      totalIncome += amount;
    } else if (tx.type === 'expense') {
      monthlyCashflow[month].outflow += amount;
      totalExpense += amount;
    }
  });

  const cashFlowForecast = Object.entries(monthlyCashflow).map(([month, data]) => ({
    month,
    inflow: data.inflow,
    outflow: data.outflow
  }));

  res.json({
    data: {
      summaries: [
        {
          type: 'profitAndLoss',
          title: 'P&L Statement',
          generatedAt: new Date().toISOString(),
          currency: 'USD',
          figures: {
            Revenue: totalIncome,
            Expenses: totalExpense,
            NetProfit: totalIncome - totalExpense
          }
        }
      ],
      cashFlow: cashFlowForecast.map(c => ({ name: c.month, inflow: c.inflow, outflow: c.outflow })),
      forecasts: [],
      balanceSheet: [],
      taxLiability: (totalIncome - totalExpense) > 0 ? (totalIncome - totalExpense) * 0.2 : 0,
      cashFlowForecast
    }
  });
};

// ---------------------------
// IMPORT & SYNC
// ---------------------------
export const bulkImportTransactions = async (req: Request, res: Response) => {
  const { accountId } = req.body;
  const file = req.file;

  if (!file) return res.status(400).json({ message: 'File is required' });
  if (!accountId) return res.status(400).json({ message: 'accountId is required' });

  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account || account.organizationId !== req.user!.organizationId) {
    return res.status(404).json({ message: 'Account not found' });
  }

  const importBatchId = crypto.randomUUID();
  const rows: any[] = [];

  if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
    const stream = Readable.from(file.buffer);
    await new Promise((resolve, reject) => {
      stream.pipe(csv())
        .on('data', (data) => rows.push(data))
        .on('end', resolve)
        .on('error', reject);
    });
  } else if (file.mimetype.includes('spreadsheetml') || file.originalname.endsWith('.xlsx')) {
    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const sheetData = xlsx.utils.sheet_to_json(sheet);
    rows.push(...sheetData);
  } else {
    return res.status(400).json({ message: 'Unsupported file type' });
  }

  let totalDifference = 0;
  let importedCount = 0;
  
  for (const row of rows) {
    const date = new Date(row.Date || row.date);
    const amount = Number(row.Amount || row.amount);
    const description = row.Description || row.description || '';
    const type = (row.Type || row.type || 'expense').toLowerCase();
    
    if (isNaN(amount) || isNaN(date.getTime())) continue;

    const hashString = `${date.toISOString()}-${amount}-${description}`;
    const externalId = crypto.createHash('sha256').update(hashString).digest('hex');

    try {
      await prisma.transaction.create({
        data: {
          organizationId: req.user!.organizationId,
          accountId,
          type: type as any,
          amount,
          currency: account.currency,
          description,
          date,
          source: 'CSV_IMPORT',
          importBatchId,
          externalId,
        }
      });
      
      if (type === 'income') {
        totalDifference += amount;
      } else {
        totalDifference -= amount;
      }
      importedCount++;
    } catch (error: any) {
      if (error.code === 'P2002') {
        continue;
      }
      console.error(error);
    }
  }

  if (importedCount > 0) {
    await prisma.account.update({
      where: { id: accountId },
      data: { balance: { increment: totalDifference } }
    });
  }

  res.json({ message: 'Import successful', importedCount, importBatchId });
};

export const rollbackImport = async (req: Request, res: Response) => {
  const { batchId } = req.params;
  const organizationId = req.user!.organizationId;

  const transactions = await prisma.transaction.findMany({
    where: { importBatchId: batchId, organizationId }
  });

  if (transactions.length === 0) {
    return res.status(404).json({ message: 'No transactions found for this batch' });
  }

  const accountDifferences: Record<string, number> = {};

  for (const tx of transactions) {
    const amt = Number(tx.amount);
    if (!accountDifferences[tx.accountId]) {
      accountDifferences[tx.accountId] = 0;
    }
    if (tx.type === 'income') {
      accountDifferences[tx.accountId] -= amt;
    } else {
      accountDifferences[tx.accountId] += amt;
    }
  }

  await prisma.$transaction(async (tx) => {
    for (const [accountId, diff] of Object.entries(accountDifferences)) {
      await tx.account.update({
        where: { id: accountId },
        data: { balance: { increment: diff } }
      });
    }

    await tx.transaction.deleteMany({
      where: { importBatchId: batchId, organizationId }
    });
  });

  res.json({ message: 'Rollback successful', rolledBackCount: transactions.length });
};

export const syncAccountTransactions = async (req: Request, res: Response) => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId;

  const account = await prisma.account.findUnique({
    where: { id, organizationId }
  });

  if (!account) return res.status(404).json({ message: 'Account not found' });

  // Get banking adapter based on account setup (using monobank for example)
  const adapter = bankingService.getAdapter('monobank', { token: 'mock-token' });
  
  // Fetch transactions for the last 30 days
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 30);
  const bankTx = await adapter.fetchTransactions(id, fromDate, new Date());

  let totalDifference = 0;
  let syncedCount = 0;

  for (const tx of bankTx) {
    const date = new Date(tx.time);
    const hashString = `BANK-${tx.id}`;
    const externalId = crypto.createHash('sha256').update(hashString).digest('hex');

    try {
      await prisma.transaction.create({
        data: {
          organizationId,
          accountId: id,
          type: tx.type as any,
          amount: tx.amount,
          currency: account.currency,
          description: tx.description,
          date: date,
          source: 'BANK_API',
          externalId
        }
      });

      if (tx.type === 'income') {
        totalDifference += tx.amount;
      } else {
        totalDifference -= tx.amount;
      }
      syncedCount++;
    } catch (error: any) {
       if (error.code === 'P2002') continue;
       console.error(error);
    }
  }

  await prisma.account.update({
    where: { id },
    data: { 
      balance: { increment: totalDifference },
      lastSyncedAt: new Date()
    }
  });

  res.json({ message: 'Sync successful', syncedCount });
};
