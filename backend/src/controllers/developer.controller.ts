import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import crypto from 'crypto';

export const listApiKeys = async (req: Request, res: Response) => {
  const apiKeys = await prisma.apiKey.findMany({
    where: { organizationId: req.user!.organizationId },
    orderBy: { createdAt: 'desc' }
  });
  // Mask the key
  res.json(apiKeys.map(k => ({ ...k, key: k.key.substring(0, 8) + '...' })));
};

export const createApiKey = async (req: Request, res: Response) => {
  const { name, expiresAt } = req.body;
  const rawKey = 'sk_test_' + crypto.randomBytes(24).toString('hex');
  
  const apiKey = await prisma.apiKey.create({
    data: {
      name,
      key: rawKey,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      organizationId: req.user!.organizationId,
      userId: req.user!.userId
    }
  });

  // Only return the raw key once
  res.json({ apiKey: rawKey, id: apiKey.id, name: apiKey.name, expiresAt: apiKey.expiresAt });
};

export const deleteApiKey = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.apiKey.delete({
    where: { id, organizationId: req.user!.organizationId }
  });
  res.json({ success: true });
};

export const listWebhooks = async (req: Request, res: Response) => {
  const webhooks = await prisma.webhookSubscription.findMany({
    where: { organizationId: req.user!.organizationId },
    orderBy: { createdAt: 'desc' }
  });
  res.json(webhooks);
};

export const createWebhook = async (req: Request, res: Response) => {
  const { event, targetUrl, secret } = req.body;
  const webhook = await prisma.webhookSubscription.create({
    data: {
      event,
      targetUrl,
      secret: secret || crypto.randomBytes(16).toString('hex'),
      organizationId: req.user!.organizationId
    }
  });
  res.json(webhook);
};

export const deleteWebhook = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.webhookSubscription.delete({
    where: { id, organizationId: req.user!.organizationId }
  });
  res.json({ success: true });
};
