import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { adapterRegistry } from '../adapters/AdapterRegistry';
import { smtpService } from '../services/smtp.service';

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
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed to list threads' });
  }
};

export const listMessagesForThread = async (req: Request, res: Response) => {
  try {
    const { threadId } = req.params;
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
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed to list messages' });
  }
};

export const listMessages = async (req: Request, res: Response) => {
  try {
    const { chatId, query } = req.query;
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
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed to search messages' });
  }
};

export const createMessage = async (req: Request, res: Response) => {
  try {
    const { chatId, author, content } = req.body;
    if (!chatId || !author || !content) {
      return res.status(400).json({ message: 'chatId, author and content are required' });
    }

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
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed to send message' });
  }
};

export const getTelegramStatus = async (req: Request, res: Response) => {
  try {
    const adapters = adapterRegistry.getAll().filter((a) => a.provider === 'telegram');
    res.json({
      connected: adapters.length > 0,
      botName: adapters.length > 0 ? 'Telegram Bot Active' : null
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const updateTelegramStatus = async (req: Request, res: Response) => {
  try {
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const handleTelegramWebhook = async (req: Request, res: Response) => {
  try {
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
  } catch (e: any) {
    console.error('Failed to save webhook message:', e);
    return res.status(500).json({ error: e.message || 'Failed to process' });
  }
};

export const listEmails = async (req: Request, res: Response) => {
  try {
    const emails = await prisma.emailMessage.findMany({
      where: { organizationId: req.user!.organizationId },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ data: emails });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const createEmail = async (req: Request, res: Response) => {
  try {
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

    try {
      const smtpConfig = {
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: Number(process.env.SMTP_PORT) || 587,
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      };
      if (smtpConfig.user) {
        await smtpService.sendEmail(smtpConfig, email.to, email.subject, email.body);
      }
    } catch (err) {
      console.error('SMTP error:', err);
    }

    res.status(201).json(email);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const updateEmail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, starred, folder, relatedClientId, unread } = req.body;
    const updated = await prisma.emailMessage.update({
      where: { id, organizationId: req.user!.organizationId },
      data: {
        ...(status !== undefined && { status }),
        ...(starred !== undefined && { starred }),
        ...(folder !== undefined && { folder }),
        ...(relatedClientId !== undefined && { relatedClientId }),
        ...(unread !== undefined && { unread })
      }
    });
    res.json({ data: updated });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const bulkMoveFolder = async (req: Request, res: Response) => {
  try {
    const { emailIds, folder } = req.body;
    await prisma.emailMessage.updateMany({
      where: { id: { in: emailIds }, organizationId: req.user!.organizationId },
      data: { folder }
    });
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const listCannedResponses = async (req: Request, res: Response) => {
  try {
    const responses = await prisma.cannedResponse.findMany({
      where: { organizationId: req.user!.organizationId }
    });
    res.json({ data: responses });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const getAutoResponders = async (req: Request, res: Response) => {
  try {
    const responders = await prisma.autoResponder.findMany({
      where: { organizationId: req.user!.organizationId }
    });
    res.json({ data: responders });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const updateAutoResponder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { active, message, type } = req.body;
    const responder = await prisma.autoResponder.update({
      where: { id, organizationId: req.user!.organizationId },
      data: { active, message, type }
    });
    res.json({ data: responder });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const getNotificationPreferences = async (req: Request, res: Response) => {
  try {
    res.json({
      data: {
        emailNotifications: true,
        pushNotifications: false,
        smsNotifications: true
      }
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const listEmailTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await prisma.emailTemplate.findMany({
      where: { organizationId: req.user!.organizationId }
    });
    res.json({ data: templates });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const createEmailTemplate = async (req: Request, res: Response) => {
  try {
    const { name, subject, body } = req.body;
    const template = await prisma.emailTemplate.create({
      data: {
        organizationId: req.user!.organizationId,
        name,
        subject,
        body
      }
    });
    res.status(201).json({ data: template });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const deleteEmailTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.emailTemplate.delete({
      where: { id, organizationId: req.user!.organizationId }
    });
    res.status(204).send();
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};
