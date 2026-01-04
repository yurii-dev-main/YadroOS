import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const listActivities = async (req: Request, res: Response) => {
  const { clientId, dealId, createdBy } = req.query as {
    clientId?: string;
    dealId?: string;
    createdBy?: string;
  };

  const where: Record<string, string> = {};
  if (clientId) where.clientId = clientId;
  if (dealId) where.dealId = dealId;
  if (createdBy) where.createdBy = createdBy;

  const activities = await prisma.activity.findMany({
    where,
    include: { client: true, deal: true, creator: true },
    orderBy: { createdAt: 'desc' }
  });

  res.json({ data: activities });
};

export const getActivityById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const activity = await prisma.activity.findUnique({
    where: { id },
    include: { client: true, deal: true, creator: true }
  });

  if (!activity) {
    return res.status(404).json({ message: 'Activity not found' });
  }

  return res.json(activity);
};

export const createActivity = async (req: Request, res: Response) => {
  const { clientId, dealId, type, subject, description, date, duration } = req.body;
  const employee = req.user
    ? await prisma.employee.findFirst({ where: { userId: req.user.userId } })
    : null;

  const activity = await prisma.activity.create({
    data: {
      clientId,
      dealId,
      type,
      subject,
      description,
      date: date ? new Date(date) : undefined,
      duration,
      createdBy: employee?.id
    },
    include: { client: true, deal: true, creator: true }
  });

  res.status(201).json(activity);
};

export const updateActivity = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { clientId, dealId, type, subject, description, date, duration } = req.body;

  const existing = await prisma.activity.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ message: 'Activity not found' });
  }

  const updated = await prisma.activity.update({
    where: { id },
    data: {
      clientId,
      dealId,
      type,
      subject,
      description,
      date: date ? new Date(date) : undefined,
      duration
    },
    include: { client: true, deal: true, creator: true }
  });

  return res.json(updated);
};

export const deleteActivity = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.activity.delete({ where: { id } });
  res.status(204).send();
};
