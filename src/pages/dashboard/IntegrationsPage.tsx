/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
import { Plus, Settings2, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { apiClient, IS_DEMO_MODE } from '../../services/apiClient';
import { IntegrationConfigModal } from './IntegrationConfigModal';

interface IntegrationConnection {
  id: string;
  provider: string;
  displayName: string;
  status: string;
  connectedAt: string;
  lastSyncAt: string | null;
  configuration?: any;
}

export const IntegrationsPage = () => {
  const [connections, setConnections] = useState<IntegrationConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [configuringConnection, setConfiguringConnection] = useState<IntegrationConnection | null>(null);

  const handleSaveConfig = async (config: any) => {
    if (!configuringConnection) return;
    const id = configuringConnection.id;

    if (IS_DEMO_MODE) {
      const updated = connections.map(c => 
        c.id === id ? { ...c, configuration: config } : c
      );
      setConnections(updated);
      localStorage.setItem('demo_integrations', JSON.stringify(updated));
      return;
    }

    try {
      await apiClient.put(`/v1/integrations/${id}/config`, { config });
      fetchConnections();
    } catch (e) {
      alert('Failed to save configuration');
    }
  };

  const fetchConnections = async () => {
    try {
      if (IS_DEMO_MODE) {
        const stored = localStorage.getItem('demo_integrations');
        if (stored) {
          setConnections(JSON.parse(stored));
        } else {
          const initial = [
            {
              id: 'demo-1',
              provider: 'telegram',
              displayName: 'My Company Bot',
              status: 'connected',
              connectedAt: new Date().toISOString(),
              lastSyncAt: new Date().toISOString()
            }
          ];
          setConnections(initial);
          localStorage.setItem('demo_integrations', JSON.stringify(initial));
        }
        setLoading(false);
        return;
      }
      const response = await apiClient.get('/v1/integrations');
      setConnections(response.data);
    } catch (error) {
      console.error('Failed to fetch connections', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleConnect = async (provider: string) => {
    const token = prompt(`Enter API Key / Token for ${provider}:`);
    if (!token) return;

    if (IS_DEMO_MODE) {
      const newConn = {
        id: `demo-${Date.now()}`,
        provider,
        displayName: `${provider} Connection ${connections.length + 1}`,
        status: 'connected',
        connectedAt: new Date().toISOString(),
        lastSyncAt: new Date().toISOString(),
        configuration: provider === 'gemini' ? { apiKey: token } : {}
      };
      const updated = [...connections, newConn];
      setConnections(updated);
      localStorage.setItem('demo_integrations', JSON.stringify(updated));
      return;
    }

    try {
      await apiClient.post('/v1/integrations', {
        provider,
        displayName: `${provider} Connection`,
        credentials: provider === 'gemini' ? { apiKey: token } : { botToken: token }
      });
      fetchConnections();
    } catch (e) {
      alert('Failed to connect');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this integration?')) return;
    
    if (IS_DEMO_MODE) {
      const updated = connections.filter(c => c.id !== id);
      setConnections(updated);
      localStorage.setItem('demo_integrations', JSON.stringify(updated));
      return;
    }
    try {
      await apiClient.delete(`/v1/integrations/${id}`);
      fetchConnections();
    } catch (e) {
      alert('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Integration Hub</h1>
        <p className="text-slate-400">Manage connections to external services</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-slate-900/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-white">Available Integrations</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-white/5">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                  TG
                </div>
                <div>
                  <div className="text-white font-medium">Telegram Bot</div>
                  <div className="text-sm text-slate-400">Receive and reply to messages</div>
                </div>
              </div>
              <button
                onClick={() => handleConnect('telegram')}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                Connect
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-white/5 opacity-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                  BNK
                </div>
                <div>
                  <div className="text-white font-medium">Bank API (OpenBanking)</div>
                  <div className="text-sm text-slate-400">Sync transactions and cash flow</div>
                </div>
              </div>
              <button
                disabled
                className="px-3 py-1.5 bg-slate-700 text-slate-400 text-sm font-medium rounded-lg"
              >
                Connect
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-white/5">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 font-bold">
                  GM
                </div>
                <div>
                  <div className="text-white font-medium">Gmail OAuth</div>
                  <div className="text-sm text-slate-400">Sync emails directly</div>
                </div>
              </div>
              <button
                onClick={() => handleConnect('gmail')}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                Connect
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-white/5">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                  AI
                </div>
                <div>
                  <div className="text-white font-medium">Gemini AI</div>
                  <div className="text-sm text-slate-400">Advanced AI models and context</div>
                </div>
              </div>
              <button
                onClick={() => handleConnect('gemini')}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                Connect
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-900/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-white">Active Connections</h2>
          </div>

          {loading ? (
            <div className="text-slate-400 text-center py-8">Loading...</div>
          ) : connections.length === 0 ? (
            <div className="text-slate-400 text-center py-8">No active connections.</div>
          ) : (
            <div className="space-y-4">
              {connections.map((conn) => (
                <div
                  key={conn.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-white/5"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div>
                      <div className="text-white font-medium">{conn.displayName}</div>
                      <div className="text-xs text-slate-400">
                        {conn.provider} • Connected{' '}
                        {new Date(conn.connectedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setConfiguringConnection(conn)}
                      className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700"
                    >
                      <Settings2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(conn.id)}
                      className="p-2 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-900/30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {configuringConnection && (
        <IntegrationConfigModal
          connection={configuringConnection}
          onClose={() => setConfiguringConnection(null)}
          onSave={handleSaveConfig}
        />
      )}
    </div>
  );
};
