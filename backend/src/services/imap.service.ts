import { ImapFlow } from 'imapflow';
import { prisma } from '../lib/prisma';
import { getIO } from '../lib/socket';

export class ImapListener {
  private client: ImapFlow;
  private organizationId: string;
  public isConnected = false;

  constructor(
    config: { host: string; port: number; user: string; pass: string },
    organizationId: string
  ) {
    this.organizationId = organizationId;
    this.client = new ImapFlow({
      host: config.host,
      port: config.port,
      secure: config.port === 993,
      auth: { user: config.user, pass: config.pass },
      logger: false
    });
  }

  public async connect() {
    try {
      await this.client.connect();
      this.isConnected = true;
      this.notifyStatus(true);

      this.client.on('exists', (data) => this.handleNewMessage(data));
      this.client.on('error', (err) => {
        console.error('IMAP Error:', err);
        this.isConnected = false;
        this.notifyStatus(false);
        this.reconnect();
      });

      const lock = await this.client.getMailboxLock('INBOX');
      try {
        console.log(`Listening on INBOX for org ${this.organizationId}`);
      } finally {
        lock.release();
      }
    } catch (e) {
      console.error('IMAP Connection failed:', e);
      this.isConnected = false;
      this.notifyStatus(false);
      this.reconnect();
    }
  }

  private async handleNewMessage(data: any) {
    // In a full implementation, we fetch the message body and headers by sequence number
    // using this.client.fetchOne(...)
    console.log('New message received via IMAP', data);

    // Example pseudo-implementation
    // await prisma.emailMessage.create({ ... });
  }

  private notifyStatus(connected: boolean) {
    const io = getIO();
    if (io) {
      io.to(`org_${this.organizationId}`).emit('imap:status', { connected });
    }
  }

  private reconnect() {
    setTimeout(() => {
      console.log('Attempting to reconnect IMAP...');
      this.connect();
    }, 10000); // 10s backoff
  }
}
