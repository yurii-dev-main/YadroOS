import { Request, Response } from 'express';
import { getAIOverview } from '../services/ai-insights.service';
import { generateAIResponse } from '../services/ai.service';
import { prisma } from '../lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { randomUUID } from 'crypto';

export const createChatCompletion = async (req: Request, res: Response) => {
  const { messages } = req.body as { messages?: Array<{ role: string; content: string }> };

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ message: 'Messages array is required' });
  }

  if (messages.length === 0) {
    return res.json({ content: 'How can I help you today?', actions: [] });
  }

  try {
    const response = await generateAIResponse(
      messages.map((message) => ({
        role: message.role as 'system' | 'user' | 'assistant' | 'tool',
        content: message.content
      })),
      req.user!.organizationId
    );

    return res.json(response);
  } catch (e) {
    console.error('AI Error:', e);
    return res.status(500).json({ error: 'Failed to generate AI response' });
  }
};

export const getAIInsights = async (_req: Request, res: Response) => {
  const overview = getAIOverview();

  try {
    const geminiIntegration = await prisma.integrationConnection.findFirst({
      where: { provider: 'gemini', status: 'connected' },
    });

    let customInsights: any[] = [];
    let isGeminiConnected = false;

    if (geminiIntegration && geminiIntegration.credentials) {
      isGeminiConnected = true;
      const creds = geminiIntegration.credentials as { apiKey?: string };
      const apiKey = creds.apiKey;
      
      if (apiKey) {
        try {
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

          const deals = await prisma.deal.findMany({ include: { client: true }, take: 10, orderBy: { value: 'desc' } });
          const transactions = await prisma.transaction.findMany({ take: 10, orderBy: { date: 'desc' } });

          const prompt = `Analyze these deals and transactions and provide 3 key business insights.
          Deals: ${JSON.stringify(deals)}
          Transactions: ${JSON.stringify(transactions)}
          Return ONLY a JSON array of objects with keys: "type" (string: 'action' | 'insight' | 'alert'), "title" (string), "description" (string), "confidence" (number between 0.0 and 1.0).`;

          const result = await model.generateContent(prompt);
          let text = result.response.text();
          text = text.replace(/```json/g, '').replace(/```/g, '').trim();
          customInsights = JSON.parse(text);
        } catch (e) {
          console.error("Gemini query error:", e);
        }
      }
    }

    if (!isGeminiConnected || customInsights.length === 0) {
      const orgId = _req.user!.organizationId;

      const highValueDeals = await prisma.deal.findMany({
        where: { organizationId: orgId, stage: 'negotiation' },
        orderBy: { value: 'desc' },
        take: 2,
        include: { client: true }
      });

      const overdueInvoices = await prisma.invoice.findMany({
        where: { 
          organizationId: orgId, 
          status: { in: ['sent', 'overdue'] }, 
          dueDate: { lt: new Date() } 
        },
        take: 2
      });

      if (highValueDeals.length > 0) {
        customInsights.push({
          type: 'action',
          title: 'Focus on High-Value Deals',
          description: `You have high-value deals in negotiation. Consider reaching out to ${highValueDeals[0].client?.name || 'the client'}.`,
          confidence: 0.9,
        });
      }

      if (overdueInvoices.length > 0) {
        customInsights.push({
          type: 'alert',
          title: 'Overdue Invoices Detected',
          description: `There are unpaid overdue invoices (e.g. ${overdueInvoices[0].invoiceNumber}). Follow up with clients.`,
          confidence: 0.85,
        });
      }

      if (customInsights.length === 0) {
        customInsights.push({
          type: 'insight',
          title: 'All Systems Normal',
          description: 'Your business metrics look healthy with no immediate actions required.',
          confidence: 0.95,
        });
      }
    }

    const formattedInsights = customInsights.map(insight => ({
      id: randomUUID(),
      title: insight.title || 'Insight',
      description: insight.description || '',
      type: insight.type || 'insight',
      confidence: insight.confidence || 0.8
    }));

    return res.json({
      ...overview,
      isGeminiConnected,
      customInsights: formattedInsights
    });
  } catch (error) {
    console.error('getAIInsights Error:', error);
    return res.json(overview);
  }
};

export const createAIInsights = async (_req: Request, res: Response) => {
  const overview = getAIOverview();
  return res.json(overview);
};
