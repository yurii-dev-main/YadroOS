import { Request, Response } from 'express';
import { DealStage } from '@prisma/client';
import { prisma } from '../lib/prisma';

const getActorName = async (userId?: string) => {
  if (!userId) return 'System';
  const employee = await prisma.employee.findFirst({ where: { userId } });
  if (!employee) return 'System';
  return `${employee.firstName} ${employee.lastName}`;
};

export const listClients = async (_req: Request, res: Response) => {
  const clients = await prisma.client.findMany({
    include: { assignedEmployee: true, deals: true }
  });
  res.json({ data: clients });
};

export const createClient = async (req: Request, res: Response) => {
  const data = req.body;
  const clientRecord = await prisma.client.create({ data });
  res.status(201).json(clientRecord);
};

export const updateClient = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const updated = await prisma.client.update({ where: { id }, data });
  res.json(updated);
};

export const deleteClient = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.client.delete({ where: { id } });
  res.status(204).send();
};

export const listDeals = async (_req: Request, res: Response) => {
  const deals = await prisma.deal.findMany({ include: { client: true, assignedEmployee: true } });
  res.json({ data: deals });
};

export const createDeal = async (req: Request, res: Response) => {
  const data = req.body;
  const deal = await prisma.deal.create({ data });
  res.status(201).json(deal);
};

export const updateDeal = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;

  const existing = await prisma.deal.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ message: 'Deal not found' });
  }

  const updated = await prisma.deal.update({ where: { id }, data });

  if (
    data.stage &&
    data.stage === DealStage.closed_won &&
    existing.stage !== DealStage.closed_won
  ) {
    const actorName = await getActorName(req.user?.userId);
    await prisma.auditLog.create({
      data: {
        userId: req.user?.userId,
        entityType: 'deal',
        entityId: updated.id,
        action: 'deal_closed',
        description: `Manager ${actorName} closed deal ${updated.title}`
      }
    });
  }

  res.json(updated);
};

export const deleteDeal = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.deal.delete({ where: { id } });
  res.status(204).send();
};
