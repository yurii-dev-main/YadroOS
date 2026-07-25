import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const listTransactions = async (req: Request, res: Response) => {
  const { accountId, type, currency, status, clientId, from, to } = req.query as {
    accountId?: string;
    type?: string;
    currency?: string;
    status?: string;
    clientId?: string;
    from?: string;
    to?: string;
  };

  const where: Record<string, any> = {};
  if (accountId) where.accountId = accountId;
  if (type) where.type = type;
  if (currency) where.currency = currency;
  if (status) where.status = status;
  if (clientId) where.clientId = clientId;

  const dateFilter: Record<string, Date> = {};
  if (from) dateFilter.gte = new Date(from);
  if (to) dateFilter.lte = new Date(to);
  if (Object.keys(dateFilter).length) {
    where.date = dateFilter;
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: { account: true, transferTo: true, client: true },
    orderBy: { date: 'desc' }
  });

  res.json({ data: transactions });
};

export const getTransactionById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: { account: true, transferTo: true, client: true }
  });

  if (!transaction) {
    return res.status(404).json({ message: 'Transaction not found' });
  }

  return res.json(transaction);
};

export const createTransaction = async (req: Request, res: Response) => {
  const {
    accountId,
    toAccountId,
    type,
    amount,
    currency,
    category,
    description,
    date,
    clientId,
    status
  } = req.body;

  const transaction = await prisma.transaction.create({
    data: {
      accountId,
      toAccountId,
      type,
      amount,
      currency,
      category,
      description,
      date: date ? new Date(date) : new Date(),
      clientId,
      status
    },
    include: { account: true, transferTo: true, client: true }
  });

  res.status(201).json(transaction);
};

export const updateTransaction = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    accountId,
    toAccountId,
    type,
    amount,
    currency,
    category,
    description,
    date,
    clientId,
    status
  } = req.body;

  const existing = await prisma.transaction.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ message: 'Transaction not found' });
  }

  const updated = await prisma.transaction.update({
    where: { id },
    data: {
      accountId,
      toAccountId,
      type,
      amount,
      currency,
      category,
      description,
      date: date ? new Date(date) : undefined,
      clientId,
      status
    },
    include: { account: true, transferTo: true, client: true }
  });

  return res.json(updated);
};

export const deleteTransaction = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.transaction.delete({ where: { id } });
  res.status(204).send();
};
