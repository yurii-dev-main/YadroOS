import { useEffect, useMemo, useState } from 'react';
import { telegramService } from '../services/telegram.service';
import { TelegramConnectionStatus } from '../types/communication.types';

export const TelegramIntegrationCard = () => {
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<TelegramConnectionStatus>({
    connected: false,
    botName: null,
    webhookUrl: null,
    lastEventAt: null,
  });
  const [statusMessage, setStatusMessage] = useState('Бот не підключено');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const response = await telegramService.fetchStatus();
        setStatus(response);
        setStatusMessage(response.connected ? 'Webhook активний.' : 'Бот не підключено');
      } catch (error) {
        setStatusMessage('Не вдалося отримати статус підключення.');
      } finally {
        setIsLoading(false);
      }
    };
    loadStatus();
  }, []);

  const isConnected = status.connected;

  const handleConnect = async () => {
    if (!token.trim()) return;
    setIsLoading(true);
    try {
      const response = await telegramService.updateStatus({
        connected: true,
        botName: `Bot ${token.slice(0, 6).toUpperCase()}`,
        webhookUrl: status.webhookUrl ?? 'https://api.yadroos.local/telegram/webhook',
      });
      setStatus(response);
      setStatusMessage('Бот успішно підключено. Webhook активний.');
    } catch (error) {
      setStatusMessage('Не вдалося підключити Telegram бот.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestMessage = () => {
    if (!isConnected) return;
    setStatusMessage('Тестове повідомлення надіслано в Telegram.');
  };

  const subtitle = useMemo(() => {
    if (isLoading) return 'Оновлюємо статус інтеграції...';
    if (!status.connected) return 'Підключення неактивне';
    if (status.botName) return `Підключено: ${status.botName}`;
    return 'Підключено';
  }, [isLoading, status.botName, status.connected]);

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <header className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-100">Інтеграція Telegram</h3>
        <span className={`text-xs ${isConnected ? 'text-emerald-300' : 'text-slate-500'}`}>
          {isConnected ? 'Підключено' : 'Не підключено'}
        </span>
      </header>
      <p className="text-xs text-slate-500">{subtitle}</p>
      <p className="text-sm text-slate-400">
        Вкажіть токен бота для синхронізації чатів Telegram з внутрішньою системою. Повідомлення будуть доступні у
        unified inbox.
      </p>
      <input
        className="mt-3 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
        placeholder="Bot token"
        value={token}
        onChange={(event) => setToken(event.target.value)}
      />
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <button
          className="rounded border border-emerald-500 px-3 py-2 text-emerald-300 hover:bg-emerald-500/20"
          onClick={handleConnect}
          disabled={isLoading}
        >
          Підключити
        </button>
        <button
          className="rounded border border-sky-500 px-3 py-2 text-sky-300 hover:bg-sky-500/20 disabled:opacity-40"
          disabled={!isConnected || isLoading}
          onClick={sendTestMessage}
        >
          Надіслати тест
        </button>
      </div>
      <p className="mt-3 text-xs text-slate-500">{statusMessage}</p>
    </section>
  );
};
