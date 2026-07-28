import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const listAccounts = async (req: Request, res: Response) => {
  const { type, currency, isActive } = req.query as {
    type?: string;
    currency?: string;
    isActive?: string;
  };

  const where: Record<string, any> = { organizationId: req.user!.organizationId };
  if (type) where.type = type;
  if (currency) where.currency = currency;
  if (isActive !== undefined) where.isActive = isActive === 'true';

  const accounts = await prisma.account.findMany({
    where,
    include: { transactions: true, transferTarget: true },
    orderBy: { createdAt: 'desc' }
  });

  res.json({ data: accounts });
};

export const getAccountById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const account = await prisma.account.findUnique({
    where: { id },
    include: { transactions: true, transferTarget: true }
  });

  if (!account) {
    return res.status(404).json({ message: 'Account not found' });
  }

  return res.json(account);
};

export const createAccount = async (req: Request, res: Response) => {
  const { name, type, currency, balance, bankName, accountNumber, isActive } = req.body;

  const account = await prisma.account.create({
    data: {
      organizationId: req.user!.organizationId,
      name,
      type,
      currency,
      balance,
      bankName,
      accountNumber,
      isActive
    }
  });

  res.status(201).json(account);
};

export const updateAccount = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, type, currency, balance, bankName, accountNumber, isActive } = req.body;

  const existing = await prisma.account.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ message: 'Account not found' });
  }

  const updated = await prisma.account.update({
    where: { id },
    data: {
      name,
      type,
      currency,
      balance,
      bankName,
      accountNumber,
      isActive
    }
  });

  return res.json(updated);
};

export const deleteAccount = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.account.delete({ where: { id } });
  res.status(204).send();
};

export const transferFunds = async (req: Request, res: Response) => {
  const { fromAccountId, toAccountId, amount, currency, description } = req.body;
  try {
    const newTransaction = await prisma.$transaction(async (tx) => {
      const fromAccount = await tx.account.findUnique({ where: { id: fromAccountId } });
      const toAccount = await tx.account.findUnique({ where: { id: toAccountId } });
      if (!fromAccount || !toAccount) throw new Error('Account not found');

      const transaction = await tx.transaction.create({
        data: {
          organizationId: req.user!.organizationId,
          accountId: fromAccountId,
          toAccountId,
          type: 'transfer',
          amount,
          currency: currency || fromAccount.currency,
          description: description || 'Transfer',
          date: new Date(),
          status: 'completed'
        }
      });

      await tx.account.update({ where: { id: fromAccountId }, data: { balance: { decrement: amount } } });
      await tx.account.update({ where: { id: toAccountId }, data: { balance: { increment: amount } } });
      
      return transaction;
    });

    res.status(201).json(newTransaction);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const reconcileAccount = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { expectedBalance } = req.body;
  const account = await prisma.account.findUnique({ where: { id } });
  if (!account) return res.status(404).json({ message: 'Account not found' });
  
  if (Number(account.balance) === Number(expectedBalance)) {
    const updated = await prisma.account.update({
      where: { id },
      data: { reconciliationStatus: 'reconciled' }
    });
    return res.json({ message: 'Account reconciled', account: updated });
  } else {
    return res.status(400).json({ message: 'Balance mismatch', account, expectedBalance });
  }
};
