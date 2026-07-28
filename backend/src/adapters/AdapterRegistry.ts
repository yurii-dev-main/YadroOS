import { IChannelAdapter } from './IChannelAdapter';

class AdapterRegistry {
  private adapters = new Map<string, IChannelAdapter>();

  register(connectionId: string, adapter: IChannelAdapter) {
    this.adapters.set(connectionId, adapter);
  }

  get(connectionId: string): IChannelAdapter | undefined {
    return this.adapters.get(connectionId);
  }

  getAll(): IChannelAdapter[] {
    return Array.from(this.adapters.values());
  }

  getEntries(): [string, IChannelAdapter][] {
    return Array.from(this.adapters.entries());
  }

  remove(connectionId: string) {
    this.adapters.delete(connectionId);
  }
}

export const adapterRegistry = new AdapterRegistry();
