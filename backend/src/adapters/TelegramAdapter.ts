import { IChannelAdapter, NormalizedMessage } from './IChannelAdapter';
import axios from 'axios';

export class TelegramAdapter implements IChannelAdapter {
  readonly provider = 'telegram';

  constructor(private botToken: string) {}

  async handleIncoming(payload: any): Promise<NormalizedMessage | null> {
    if (!payload || !payload.message) {
      return null;
    }
    const msg = payload.message;
    if (!msg.text) {
      // Only handling text messages for now
      return null;
    }
    
    return {
      source: 'telegram',
      sourceId: String(msg.message_id),
      threadId: `telegram-${msg.chat.id}`,
      fromAddress: String(msg.from.id),
      fromName: [msg.from.first_name, msg.from.last_name].filter(Boolean).join(' '),
      content: msg.text,
      direction: 'inbound',
      metadata: payload,
    };
  }

  async sendMessage(threadId: string, content: string): Promise<void> {
    const chatId = threadId.replace('telegram-', '');
    await axios.post(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
      chat_id: chatId,
      text: content,
    });
  }

  async checkHealth(): Promise<'healthy' | 'degraded' | 'unavailable'> {
    try {
      const res = await axios.get(`https://api.telegram.org/bot${this.botToken}/getMe`);
      if (res.data && res.data.ok) {
        return 'healthy';
      }
      return 'degraded';
    } catch (e) {
      return 'unavailable';
    }
  }
}
