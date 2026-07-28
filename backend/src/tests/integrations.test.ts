import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TelegramAdapter } from '../adapters/TelegramAdapter';
import { adapterRegistry } from '../adapters/AdapterRegistry';
import { prisma } from '../lib/prisma';
import { handleTelegramWebhook } from '../controllers/communications.controller';

// Mock dependencies
vi.mock('../lib/prisma', () => ({
  prisma: {
    unifiedMessage: {
      create: vi.fn()
    },
    integrationConnection: {
      findUnique: vi.fn().mockResolvedValue({ organizationId: 'org-1' })
    }
  }
}));

vi.mock('../lib/socket', () => ({
  getIO: vi.fn(),
  emitToUser: vi.fn()
}));

describe('Integrations & Adapters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear the singleton registry for tests
    (adapterRegistry as any).adapters = new Map();
  });

  it('TelegramAdapter parses incoming webhook correctly', async () => {
    const adapter = new TelegramAdapter('fake-token');

    const payload = {
      message: {
        message_id: 123,
        chat: { id: 456 },
        from: {
          id: 789,
          first_name: 'John',
          last_name: 'Doe'
        },
        text: 'Hello from Telegram!'
      }
    };

    const normalized = await adapter.handleIncoming(payload);

    expect(normalized).not.toBeNull();
    expect(normalized?.source).toBe('telegram');
    expect(normalized?.threadId).toBe('telegram-456');
    expect(normalized?.fromName).toBe('John Doe');
    expect(normalized?.content).toBe('Hello from Telegram!');
  });

  it('handleTelegramWebhook controller processes and saves message', async () => {
    const adapter = new TelegramAdapter('fake-token');
    adapterRegistry.register('conn-1', adapter);

    const req = {
      body: {
        message: {
          message_id: 123,
          chat: { id: 456 },
          from: { id: 789, first_name: 'John' },
          text: 'Webhook test'
        }
      }
    } as any;

    const res = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis()
    } as any;

    await handleTelegramWebhook(req, res);

    expect(prisma.unifiedMessage.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        source: 'telegram',
        threadId: 'telegram-456',
        fromName: 'John',
        content: 'Webhook test'
      })
    });
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });
});
