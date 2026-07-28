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

  const where: Record<string, any> = { organizationId: req.user!.organizationId };
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

  const newTransaction = await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({
      data: {
        organizationId: req.user!.organizationId,
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

    if (type === 'income') {
      await tx.account.update({
        where: { id: accountId },
        data: { balance: { increment: amount } }
      });
    } else if (type === 'expense') {
      await tx.account.update({
        where: { id: accountId },
        data: { balance: { decrement: amount } }
      });
    } else if (type === 'transfer' && toAccountId) {
      await tx.account.update({
        where: { id: accountId },
        data: { balance: { decrement: amount } }
      });
      await tx.account.update({
        where: { id: toAccountId },
        data: { balance: { increment: amount } }
      });
    }

    return transaction;
  });

  res.status(201).json(newTransaction);
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

  try {
    const updatedTransaction = await prisma.$transaction(async (tx) => {
      const existing = await tx.transaction.findUnique({ where: { id } });
      if (!existing) throw new Error('Transaction not found');

      if (existing.type === 'income') {
        await tx.account.update({
          where: { id: existing.accountId },
          data: { balance: { decrement: existing.amount } }
        });
      } else if (existing.type === 'expense') {
        await tx.account.update({
          where: { id: existing.accountId },
          data: { balance: { increment: existing.amount } }
        });
      } else if (existing.type === 'transfer' && existing.toAccountId) {
        await tx.account.update({
          where: { id: existing.accountId },
          data: { balance: { increment: existing.amount } }
        });
        await tx.account.update({
          where: { id: existing.toAccountId },
          data: { balance: { decrement: existing.amount } }
        });
      }

      const updated = await tx.transaction.update({
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

      if (type === 'income') {
        await tx.account.update({
          where: { id: accountId },
          data: { balance: { increment: amount } }
        });
      } else if (type === 'expense') {
        await tx.account.update({
          where: { id: accountId },
          data: { balance: { decrement: amount } }
        });
      } else if (type === 'transfer' && toAccountId) {
        await tx.account.update({
          where: { id: accountId },
          data: { balance: { decrement: amount } }
        });
        await tx.account.update({
          where: { id: toAccountId },
          data: { balance: { increment: amount } }
        });
      }

      return updated;
    });
    return res.json(updatedTransaction);
  } catch (error: any) {
    if (error.message === 'Transaction not found') {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    throw error;
  }
};

export const deleteTransaction = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.findUnique({ where: { id } });
    if (!transaction) return;

    if (transaction.type === 'income') {
      await tx.account.update({
        where: { id: transaction.accountId },
        data: { balance: { decrement: transaction.amount } }
      });
    } else if (transaction.type === 'expense') {
      await tx.account.update({
        where: { id: transaction.accountId },
        data: { balance: { increment: transaction.amount } }
      });
    } else if (transaction.type === 'transfer' && transaction.toAccountId) {
      await tx.account.update({
        where: { id: transaction.accountId },
        data: { balance: { increment: transaction.amount } }
      });
      await tx.account.update({
        where: { id: transaction.toAccountId },
        data: { balance: { decrement: transaction.amount } }
      });
    }

    await tx.transaction.delete({ where: { id } });
  });
  res.status(204).send();
};
