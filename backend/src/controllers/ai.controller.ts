import { Request, Response } from 'express';
import { generateAIResponse } from '../services/ai.service';

export const createChatCompletion = async (req: Request, res: Response) => {
  const { messages } = req.body as { messages?: Array<{ role: string; content: string }> };

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ message: 'Messages array is required' });
  }

  if (messages.length === 0) {
    return res.json({ content: 'Чим можу допомогти сьогодні?' });
  }

  const response = await generateAIResponse(
    messages.map((message) => ({
      role: message.role as 'system' | 'user' | 'assistant',
      content: message.content
    }))
  );

  return res.json({ content: response });
};
