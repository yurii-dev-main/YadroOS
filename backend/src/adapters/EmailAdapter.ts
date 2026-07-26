import { IChannelAdapter, NormalizedMessage } from './IChannelAdapter';
import nodemailer from 'nodemailer';

export class EmailAdapter implements IChannelAdapter {
  readonly provider = 'email';
  private transporter: nodemailer.Transporter;

  constructor(private smtpConfig: any) {
    this.transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass,
      },
    });
  }

  async handleIncoming(rawPayload: any): Promise<NormalizedMessage | null> {
    // In a real scenario, this would be triggered by an IMAP listener or SendGrid webhook
    if (!rawPayload.subject || !rawPayload.from) {
      return null;
    }
    
    return {
      source: 'email',
      sourceId: String(Date.now()), // Replace with real Message-ID
      threadId: `email-${rawPayload.from}`,
      fromAddress: rawPayload.from,
      fromName: rawPayload.fromName,
      content: rawPayload.text || rawPayload.html,
      direction: 'inbound',
      metadata: rawPayload,
    };
  }

  async sendMessage(threadId: string, content: string): Promise<void> {
    const toAddress = threadId.replace('email-', '');
    await this.transporter.sendMail({
      from: this.smtpConfig.user,
      to: toAddress,
      subject: 'Re: YadroOS Communication',
      text: content,
    });
  }

  async checkHealth(): Promise<'healthy' | 'degraded' | 'unavailable'> {
    try {
      await this.transporter.verify();
      return 'healthy';
    } catch (e) {
      return 'unavailable';
    }
  }
}
