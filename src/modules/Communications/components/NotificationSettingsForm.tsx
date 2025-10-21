import { useEffect, useState } from 'react';
import { chatService } from '../services/chat.service';
import { NotificationPreferences } from '../types/communication.types';

export const NotificationSettingsForm = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    chatService.fetchNotificationPreferences().then(setPreferences);
  }, []);

  if (!preferences) {
    return <div className="p-4 text-sm text-slate-400">Завантаження налаштувань...</div>;
  }

  const toggleChannel = (channel: keyof NotificationPreferences['channelPreferences']) => {
    setPreferences((prev) =>
      prev
        ? {
            ...prev,
            channelPreferences: {
              ...prev.channelPreferences,
              [channel]: !prev.channelPreferences[channel],
            },
          }
        : prev,
    );
  };

  const handleSave = async () => {
    if (!preferences) return;
    setIsSaving(true);
    await chatService.updateNotificationPreferences(preferences);
    setIsSaving(false);
  };

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <h3 className="text-base font-semibold text-slate-100">Налаштування сповіщень</h3>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <div className="space-y-2 text-sm text-slate-300">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="rounded border-slate-700 bg-slate-900"
              checked={preferences.desktop}
              onChange={(event) => setPreferences({ ...preferences, desktop: event.target.checked })}
            />
            Push-сповіщення в браузері
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="rounded border-slate-700 bg-slate-900"
              checked={preferences.sound}
              onChange={(event) => setPreferences({ ...preferences, sound: event.target.checked })}
            />
            Звукові сигнали
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="rounded border-slate-700 bg-slate-900"
              checked={preferences.doNotDisturb}
              onChange={(event) => setPreferences({ ...preferences, doNotDisturb: event.target.checked })}
            />
            Не турбувати
          </label>
        </div>
        <div className="space-y-3 text-sm text-slate-300">
          <div>
            <span className="text-xs uppercase text-slate-500">Дайджест Email</span>
            <select
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200"
              value={preferences.emailDigest}
              onChange={(event) => setPreferences({ ...preferences, emailDigest: event.target.value as typeof preferences.emailDigest })}
            >
              <option value="daily">Щоденно</option>
              <option value="weekly">Щотижнево</option>
              <option value="off">Вимкнено</option>
            </select>
          </div>
          <div>
            <span className="text-xs uppercase text-slate-500">Канали</span>
            <div className="mt-2 space-y-2">
              {Object.entries(preferences.channelPreferences).map(([channel, enabled]) => (
                <label key={channel} className="flex items-center justify-between rounded border border-slate-800 px-3 py-2">
                  <span className="text-xs uppercase tracking-wide text-slate-400">{channel}</span>
                  <input
                    type="checkbox"
                    className="rounded border-slate-700 bg-slate-900"
                    checked={enabled}
                    onChange={() => toggleChannel(channel as keyof NotificationPreferences['channelPreferences'])}
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
      <button
        className="mt-4 rounded border border-emerald-500 px-4 py-2 text-sm text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50"
        onClick={handleSave}
        disabled={isSaving}
      >
        {isSaving ? 'Збереження...' : 'Зберегти налаштування'}
      </button>
    </section>
  );
};
