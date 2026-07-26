export interface NormalizedMessage {
  sourceId: string;
  source: string;
  threadId: string;
  fromAddress: string;
  fromName?: string;
  content: string;
  direction: 'inbound' | 'outbound';
  clientId?: string;
  metadata?: any;
}

export interface IChannelAdapter {
  readonly provider: string;

  /**
   * Parse an incoming webhook/event payload into a NormalizedMessage.
   * If the payload is not a valid message (e.g. typing indicator), return null.
   */
  handleIncoming(rawPayload: any): Promise<NormalizedMessage | null>;

  /**
   * Send a message out through this provider.
   */
  sendMessage(threadId: string, content: string): Promise<void>;

  /**
   * Check if the connection to the provider is healthy.
   */
  checkHealth(): Promise<'healthy' | 'degraded' | 'unavailable'>;
}
