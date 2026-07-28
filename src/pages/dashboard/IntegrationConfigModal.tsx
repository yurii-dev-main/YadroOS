/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
import React, { useState } from 'react';
import { X } from 'lucide-react';

interface IntegrationConfigModalProps {
  connection: any;
  onClose: () => void;
  onSave: (config: any) => Promise<void>;
}

export const IntegrationConfigModal: React.FC<IntegrationConfigModalProps> = ({
  connection,
  onClose,
  onSave
}) => {
  const [configStr, setConfigStr] = useState(() => {
    return JSON.stringify(connection.configuration || {}, null, 2);
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setError(null);
      const parsed = JSON.parse(configStr);
      setSaving(true);
      await onSave(parsed);
      onClose();
    } catch (e: any) {
      if (e instanceof SyntaxError) {
        setError('Invalid JSON format');
      } else {
        setError(e.message || 'Failed to save configuration');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl">
        <div className="px-4 py-3 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">
            Configure {connection.displayName}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 flex-1">
          <p className="text-sm text-slate-400 mb-2">Edit configuration JSON:</p>
          <textarea
            value={configStr}
            onChange={(e) => setConfigStr(e.target.value)}
            className="w-full h-48 bg-slate-800 text-slate-200 border border-slate-700 rounded-md p-3 font-mono text-sm focus:outline-none focus:border-blue-500"
            spellCheck={false}
          />
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>
        <div className="px-4 py-3 border-t border-slate-700 flex justify-end gap-3 bg-slate-800/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-transparent rounded-lg hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
};
