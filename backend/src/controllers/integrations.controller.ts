import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { adapterRegistry } from '../adapters/AdapterRegistry';
import { TelegramAdapter } from '../adapters/TelegramAdapter';

import { encrypt } from '../utils/encryption';

export const integrationsController = {
  async getConnections(req: Request, res: Response) {
    try {
      const connections = await prisma.integrationConnection.findMany({
        where: { organizationId: req.user!.organizationId },
        select: {
          id: true,
          provider: true,
          displayName: true,
          status: true,
          connectedAt: true,
          lastSyncAt: true,
          configuration: true
        }
      });
      res.json(connections);
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch connections' });
    }
  },

  async addConnection(req: Request, res: Response) {
    const { provider, displayName, credentials } = req.body;
    
    // Encrypt credentials before saving
    const encryptedCredentials = { encryptedData: encrypt(JSON.stringify(credentials)) };

    try {
      const connection = await prisma.integrationConnection.create({
        data: {
          organizationId: req.user!.organizationId,
          provider,
          displayName,
          credentials: encryptedCredentials,
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
  },

  async updateConfig(req: Request, res: Response) {
    const { id } = req.params;
    const { config } = req.body;

    try {
      const connection = await prisma.integrationConnection.update({
        where: { id },
        data: { configuration: config }
      });
      res.json(connection);
    } catch (e) {
      res.status(500).json({ error: 'Failed to update configuration' });
    }
  }
};
