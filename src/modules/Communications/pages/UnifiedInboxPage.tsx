import { useEffect, useState } from 'react';
import { NotificationSettingsForm } from '../components/NotificationSettingsForm';
import { TelegramIntegrationCard } from '../components/TelegramIntegrationCard';
import { UnifiedInboxPanel } from '../components/UnifiedInboxPanel';
import { chatService } from '../services/chat.service';
import { emailService } from '../services/email.service';
import { CommunicationChannel, UnifiedInboxItem } from '../types/communication.types';

const channelPriority: Record<CommunicationChannel, number> = {
  email: 2,
  internal: 3,
  telegram: 1
};

export const UnifiedInboxPage = () => {
  const [items, setItems] = useState<UnifiedInboxItem[]>([]);

  useEffect(() => {
    const load = async () => {
      const [emails, threads] = await Promise.all([
        emailService.fetchEmails({}),
        chatService.fetchThreads()
      ]);
      const unified: UnifiedInboxItem[] = [
        ...emails.map<UnifiedInboxItem>((email) => ({
          id: `email-${email.id}`,
          channel: 'email',
          title: email.subject,
          preview: email.preview,
          timestamp: email.date,
          unread: email.unread,
          priority: (email.starred ? 'high' : 'normal') as 'high' | 'normal',
          tags: email.tags,
          relatedClient: email.relatedClientId
            ? {
                id: email.relatedClientId,
                name: email.from,
                email: email.from
              }
            : undefined,
          payload: email
        })),
        ...threads
          .map((thread) => ({ thread, messages: [] as UnifiedInboxItem[] }))
          .flatMap(({ thread }) =>
            thread.lastMessage
              ? [
                  {
                    id: `chat-${thread.id}`,
                    channel: (thread.id.startsWith('telegram-')
                      ? 'telegram'
                      : 'internal') as CommunicationChannel,
                    title: thread.title,
                    preview: thread.lastMessage?.content ?? '',
                    timestamp: thread.lastMessage?.createdAt ?? new Date().toISOString(),
                    unread: Boolean(thread.unreadCount),
                    priority: (thread.unreadCount && thread.unreadCount > 0 ? 'high' : 'normal') as
                      'high' | 'normal',
                    payload: thread.lastMessage
                  }
                ]
              : []
          )
      ];
      setItems(unified.sort((a, b) => channelPriority[b.channel] - channelPriority[a.channel]));
    };
    load();
  }, []);

  return (
    <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-4">
        <UnifiedInboxPanel items={items} />
      </div>
      <div className="space-y-4">
        <TelegramIntegrationCard />
        <NotificationSettingsForm />
      </div>
    </div>
  );
};
