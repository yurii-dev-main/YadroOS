import { Request, Response } from 'express';
import { getAIOverview } from '../services/ai-insights.service';
import { generateAIResponse } from '../services/ai.service';

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
      }))
    );

    return res.json(response);
  } catch (e) {
    console.error('AI Error:', e);
    return res.status(500).json({ error: 'Failed to generate AI response' });
  }
};

export const getAIInsights = async (_req: Request, res: Response) => {
  const overview = getAIOverview();
  return res.json(overview);
};

export const createAIInsights = async (_req: Request, res: Response) => {
  const overview = getAIOverview();
  return res.json(overview);
};
