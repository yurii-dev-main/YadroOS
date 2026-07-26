import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { adapterRegistry } from '../adapters/AdapterRegistry';
import { TelegramAdapter } from '../adapters/TelegramAdapter';

export const integrationsController = {
  async getConnections(req: Request, res: Response) {
    try {
      const connections = await prisma.integrationConnection.findMany({
        select: {
          id: true,
          provider: true,
          displayName: true,
          status: true,
          connectedAt: true,
          lastSyncAt: true
        }
      });
      res.json(connections);
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch connections' });
    }
  },

  async addConnection(req: Request, res: Response) {
    const { provider, displayName, credentials } = req.body;

    try {
      const connection = await prisma.integrationConnection.create({
        data: {
          provider,
          displayName,
          credentials, // In a real app, this should be encrypted using AES-256 before saving
          status: 'connected'
        }
      });

      // Register adapter in memory
      if (provider === 'telegram') {
        const botToken = credentials.botToken;
        if (botToken) {
          adapterRegistry.register(connection.id, new TelegramAdapter(botToken));
        }
      }

      res.status(201).json({
        id: connection.id,
        provider: connection.provider,
        displayName: connection.displayName,
        status: connection.status
      });
    } catch (e) {
      res.status(500).json({ error: 'Failed to add connection' });
    }
  },

  async deleteConnection(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await prisma.integrationConnection.delete({ where: { id } });
      adapterRegistry.remove(id);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Failed to delete connection' });
    }
  },

  async checkHealth(req: Request, res: Response) {
    const { id } = req.params;
    const adapter = adapterRegistry.get(id);

    if (!adapter) {
      return res.status(404).json({ error: 'Adapter not found or not registered' });
    }

    const status = await adapter.checkHealth();
    await prisma.integrationConnection.update({
      where: { id },
      data: { status }
    });

    res.json({ status });
  }
};
