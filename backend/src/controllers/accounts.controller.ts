import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const listAccounts = async (req: Request, res: Response) => {
  const { type, currency, isActive } = req.query as {
    type?: string;
    currency?: string;
    isActive?: string;
  };

  const where: Record<string, any> = {};
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
