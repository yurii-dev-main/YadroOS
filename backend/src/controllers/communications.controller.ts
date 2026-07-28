import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { adapterRegistry } from '../adapters/AdapterRegistry';

export const listThreads = async (req: Request, res: Response) => {
  try {
    const messages = await prisma.unifiedMessage.findMany({
      where: { organizationId: req.user!.organizationId },
      orderBy: { createdAt: 'desc' }
    });

    const threadsMap = new Map();
    for (const msg of messages) {
      if (!threadsMap.has(msg.threadId)) {
        threadsMap.set(msg.threadId, {
          id: msg.threadId,
          title: `Chat with ${msg.fromName || msg.fromAddress}`,
          participants: [
            {
              id: msg.fromAddress,
              name: msg.fromName || msg.fromAddress
            }
          ],
          type: 'dm',
          unreadCount: 0,
          lastMessage: {
            id: msg.id,
            chatId: msg.threadId,
            author: { id: msg.fromAddress, name: msg.fromName },
            content: msg.content,
            createdAt: msg.createdAt,
            status: 'read'
          }
        });
      }
    }
    res.json(Array.from(threadsMap.values()));
  } catch (e) {
    res.status(500).json({ error: 'Failed to list threads' });
  }
};

export const listMessagesForThread = async (req: Request, res: Response) => {
  const { threadId } = req.params;
  try {
    const messages = await prisma.unifiedMessage.findMany({
      where: { threadId, organizationId: req.user!.organizationId },
      orderBy: { createdAt: 'asc' }
    });

    const mapped = messages.map((msg) => ({
      id: msg.id,
      chatId: msg.threadId,
      author: { id: msg.fromAddress, name: msg.fromName || 'Unknown' },
      content: msg.content,
      createdAt: msg.createdAt,
      status: 'read'
    }));
    res.json(mapped);
  } catch (e) {
    res.status(500).json({ error: 'Failed to list messages' });
  }
};

export const listMessages = async (req: Request, res: Response) => {
  const { chatId, query } = req.query;
  try {
    const where: any = { organizationId: req.user!.organizationId };
    if (chatId) where.threadId = String(chatId);
    if (query) where.content = { contains: String(query), mode: 'insensitive' };

    const messages = await prisma.unifiedMessage.findMany({ where, orderBy: { createdAt: 'asc' } });
    const mapped = messages.map((msg) => ({
      id: msg.id,
      chatId: msg.threadId,
      author: { id: msg.fromAddress, name: msg.fromName || 'Unknown' },
      content: msg.content,
      createdAt: msg.createdAt,
      status: 'read'
    }));
    res.json(mapped);
  } catch (e) {
    res.status(500).json({ error: 'Failed to search messages' });
  }
};

export const createMessage = async (req: Request, res: Response) => {
  const { chatId, author, content } = req.body;
  if (!chatId || !author || !content) {
    return res.status(400).json({ message: 'chatId, author and content are required' });
  }

  try {
    const newMessage = await prisma.unifiedMessage.create({
      data: {
        organizationId: req.user!.organizationId,
        source: 'internal',
        sourceId: Date.now().toString(),
        threadId: chatId,
        fromAddress: author.id,
        fromName: author.name,
        content,
        direction: 'outbound'
      }
    });

    if (chatId.startsWith('telegram-')) {
      const adapters = adapterRegistry.getAll();
      const tgAdapter = adapters.find((a) => a.provider === 'telegram');
      if (tgAdapter) {
        await tgAdapter.sendMessage(chatId, content);
      }
    }

    res.status(201).json({
      id: newMessage.id,
      chatId: newMessage.threadId,
      author: { id: newMessage.fromAddress, name: newMessage.fromName },
      content: newMessage.content,
      createdAt: newMessage.createdAt,
      status: 'sent'
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to send message' });
  }
};

export const getTelegramStatus = async (req: Request, res: Response) => {
  const adapters = adapterRegistry.getAll().filter((a) => a.provider === 'telegram');
  res.json({
    connected: adapters.length > 0,
    botName: adapters.length > 0 ? 'Telegram Bot Active' : null
  });
};

export const updateTelegramStatus = (req: Request, res: Response) => {
  res.json({ ok: true });
};

export const handleTelegramWebhook = async (req: Request, res: Response) => {
  const payload = req.body;
  const entries = adapterRegistry.getEntries().filter(([, a]) => a.provider === 'telegram');

  let normalizedMsg = null;
  let matchedConnectionId = null;

  for (const [connId, adapter] of entries) {
    normalizedMsg = await adapter.handleIncoming(payload);
    if (normalizedMsg) {
      matchedConnectionId = connId;
      break;
    }
  }

  if (!normalizedMsg || !matchedConnectionId) {
    return res.json({ ok: true });
  }

  try {
    const connection = await prisma.integrationConnection.findUnique({
      where: { id: matchedConnectionId }
    });
    
    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    await prisma.unifiedMessage.create({
      data: {
        organizationId: connection.organizationId,
        source: normalizedMsg.source,
        sourceId: normalizedMsg.sourceId,
        threadId: normalizedMsg.threadId,
        fromAddress: normalizedMsg.fromAddress,
        fromName: normalizedMsg.fromName,
        content: normalizedMsg.content,
        direction: normalizedMsg.direction,
        metadata: normalizedMsg.metadata as any
      }
    });

    return res.json({ ok: true });
  } catch (e) {
    console.error('Failed to save webhook message:', e);
    return res.status(500).json({ error: 'Failed to process' });
  }
};

export const listEmails = async (req: Request, res: Response) => {
  const emails = await prisma.emailMessage.findMany({
    where: { organizationId: req.user!.organizationId },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ data: emails });
};

export const createEmail = async (req: Request, res: Response) => {
  const { subject, body, from, to } = req.body;
  const email = await prisma.emailMessage.create({
    data: {
      organizationId: req.user!.organizationId,
      subject,
      body,
      from,
      to,
      status: 'sent'
    }
  });
  res.status(201).json(email);
};

export const listCannedResponses = async (req: Request, res: Response) => {
  const responses = await prisma.cannedResponse.findMany({
    where: { organizationId: req.user!.organizationId }
  });
  res.json({ data: responses });
};

export const getAutoResponders = (req: Request, res: Response) => {
  res.json({
    data: [
      { id: 1, name: 'Welcome Auto-Responder', active: true },
      { id: 2, name: 'Out of Office', active: false }
    ]
  });
};

export const getNotificationPreferences = (req: Request, res: Response) => {
  res.json({
    data: {
      emailNotifications: true,
      pushNotifications: false,
      smsNotifications: true
    }
  });
};
