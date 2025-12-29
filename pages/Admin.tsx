import React, { useState } from 'react';
import { Tenant, PlanTier } from '../types';
import { Button } from '../components/Button';
import { Plus, Users, Server, Activity, Bell, Webhook, CheckCircle, Trash2, LayoutGrid } from 'lucide-react';

interface NotificationChannel {
    id: string;
    name: string;
    type: 'SLACK' | 'TEAMS' | 'GENERIC';
    url: string;
    active: boolean;
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'overview' | 'integrations'>('overview');

  // Mock Data for Tenants
  const [tenants, setTenants] = useState<Tenant[]>([
    { id: '1', name: 'Alpha Corp', plan: PlanTier.ENTERPRISE, maxStreams: 50, aiEnabled: true },
    { id: '2', name: 'Beta Retail', plan: PlanTier.PRO, maxStreams: 10, aiEnabled: true },
    { id: '3', name: 'Gamma Logistics', plan: PlanTier.BASIC, maxStreams: 5, aiEnabled: false },
  ]);

  // Mock Data for Notification Integrations
  const [channels, setChannels] = useState<NotificationChannel[]>([
      { id: '1', name: 'Security Ops Slack', type: 'SLACK', url: 'https://hooks.slack.com/services/T000/B000/XXX', active: true },
      { id: '2', name: 'Global SOC Teams', type: 'TEAMS', url: 'https://outlook.office.com/webhook/...', active: false }
  ]);

  const [newChannel, setNewChannel] = useState<Partial<NotificationChannel>>({ type: 'SLACK', active: true });
  const [showAddChannel, setShowAddChannel] = useState(false);

  const handleAddChannel = (e: React.FormEvent) => {
      e.preventDefault();
      if (newChannel.name && newChannel.url) {
          setChannels([...channels, { ...newChannel, id: crypto.randomUUID() } as NotificationChannel]);
          setShowAddChannel(false);
          setNewChannel({ type: 'SLACK', active: true });
      }
  };

  const handleDeleteChannel = (id: string) => {
      setChannels(prev => prev.filter(c => c.id !== id));
  };

  const toggleChannel = (id: string) => {
      setChannels(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-white">System Administration</h1>
            <p className="text-slate-400 text-sm">Manage tenants, system health, and integrations.</p>
        </div>
        
        {/* Tab Switcher */}
        <div className="bg-slate-900 p-1 rounded-lg border border-slate-800 flex">
            <button 
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'overview' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
                <LayoutGrid size={16} />
                Overview
            </button>
            <button 
                onClick={() => setActiveTab('integrations')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'integrations' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
                <Webhook size={16} />
                Integrations
            </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-900/30 rounded-lg text-blue-400"><Users size={24} /></div>
                        <div>
                            <p className="text-slate-400 text-sm">Total Tenants</p>
                            <p className="text-2xl font-bold text-white">124</p>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-900/30 rounded-lg text-green-400"><Server size={24} /></div>
                        <div>
                            <p className="text-slate-400 text-sm">Active Streams</p>
                            <p className="text-2xl font-bold text-white">842</p>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-900/30 rounded-lg text-purple-400"><Activity size={24} /></div>
                        <div>
                            <p className="text-slate-400 text-sm">AI Inferences (24h)</p>
                            <p className="text-2xl font-bold text-white">1.2M</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="font-semibold text-white">Tenant Management</h3>
                    <Button size="sm" variant="outline" className="text-xs">
                        <Plus size={14} className="mr-1 inline" /> New Tenant
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase">
                                <th className="px-6 py-3 font-medium">Tenant Name</th>
                                <th className="px-6 py-3 font-medium">Plan Tier</th>
                                <th className="px-6 py-3 font-medium">Streams</th>
                                <th className="px-6 py-3 font-medium">AI Status</th>
                                <th className="px-6 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {tenants.map(tenant => (
                                <tr key={tenant.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4 text-white font-medium">{tenant.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            tenant.plan === PlanTier.ENTERPRISE ? 'bg-purple-900 text-purple-200' : 
                                            tenant.plan === PlanTier.PRO ? 'bg-blue-900 text-blue-200' :
                                            'bg-slate-700 text-slate-300'
                                        }`}>
                                            {tenant.plan}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-300">{tenant.maxStreams} allocated</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${tenant.aiEnabled ? 'bg-green-500' : 'bg-slate-600'}`}></div>
                                            <span className="text-sm text-slate-300">{tenant.aiEnabled ? 'Enabled' : 'Disabled'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-blue-500 hover:text-blue-400 text-sm font-medium">Manage</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
      )}

      {activeTab === 'integrations' && (
          <div className="space-y-6">
              <div className="bg-blue-900/20 border border-blue-900/50 p-4 rounded-xl flex gap-3 items-start">
                  <div className="p-2 bg-blue-900/50 rounded-lg text-blue-400 shrink-0">
                      <Bell size={20} />
                  </div>
                  <div>
                      <h3 className="text-blue-100 font-medium">Notification Engine</h3>
                      <p className="text-sm text-blue-300/80 mt-1">
                          Configure webhooks to receive real-time alerts in your preferred external systems (Slack, Microsoft Teams, or custom endpoints).
                          Notifications are triggered for <span className="font-bold text-white">HIGH</span> and <span className="font-bold text-white">CRITICAL</span> severity events.
                      </p>
                  </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="font-semibold text-white">Active Channels</h3>
                    <Button onClick={() => setShowAddChannel(true)} size="sm">
                        <Plus size={16} className="mr-2 inline" />
                        Add Channel
                    </Button>
                </div>

                {showAddChannel && (
                    <div className="p-6 border-b border-slate-800 bg-slate-900/50 animate-in slide-in-from-top-2">
                        <h4 className="text-sm font-medium text-white mb-4">New Integration</h4>
                        <form onSubmit={handleAddChannel} className="space-y-4 max-w-lg">
                            <div>
                                <label className="block text-xs text-slate-400 uppercase mb-1">Channel Name</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-600 outline-none" 
                                    placeholder="e.g. #security-alerts"
                                    value={newChannel.name || ''}
                                    onChange={e => setNewChannel(prev => ({...prev, name: e.target.value}))}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-slate-400 uppercase mb-1">Type</label>
                                    <select 
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-600 outline-none"
                                        value={newChannel.type}
                                        onChange={e => setNewChannel(prev => ({...prev, type: e.target.value as any}))}
                                    >
                                        <option value="SLACK">Slack Webhook</option>
                                        <option value="TEAMS">Microsoft Teams</option>
                                        <option value="GENERIC">Generic (POST)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 uppercase mb-1">Status</label>
                                    <select 
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-600 outline-none"
                                        value={newChannel.active ? 'active' : 'inactive'}
                                        onChange={e => setNewChannel(prev => ({...prev, active: e.target.value === 'active'}))}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Disabled</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 uppercase mb-1">Webhook URL</label>
                                <input 
                                    type="url" 
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-600 outline-none font-mono text-xs" 
                                    placeholder="https://hooks.slack.com/..."
                                    value={newChannel.url || ''}
                                    onChange={e => setNewChannel(prev => ({...prev, url: e.target.value}))}
                                    required
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button type="submit">Save Integration</Button>
                                <Button type="button" variant="outline" onClick={() => setShowAddChannel(false)}>Cancel</Button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase">
                                <th className="px-6 py-3 font-medium">Name</th>
                                <th className="px-6 py-3 font-medium">Platform</th>
                                <th className="px-6 py-3 font-medium">Webhook URL</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {channels.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        No integrations configured. Add a webhook to get started.
                                    </td>
                                </tr>
                            ) : channels.map(channel => (
                                <tr key={channel.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4 text-white font-medium flex items-center gap-2">
                                        {channel.type === 'SLACK' && <div className="w-2 h-2 rounded-full bg-purple-500"></div>}
                                        {channel.type === 'TEAMS' && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                                        {channel.type === 'GENERIC' && <div className="w-2 h-2 rounded-full bg-slate-500"></div>}
                                        {channel.name}
                                    </td>
                                    <td className="px-6 py-4 text-xs font-mono text-slate-400">
                                        {channel.type}
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-500 font-mono truncate max-w-[200px]" title={channel.url}>
                                        {channel.url}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button 
                                            onClick={() => toggleChannel(channel.id)}
                                            className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors ${channel.active ? 'bg-green-900/30 text-green-400 border border-green-900/50' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}
                                        >
                                            {channel.active ? <CheckCircle size={12} /> : <div className="w-3 h-3 rounded-full border-2 border-slate-500"></div>}
                                            {channel.active ? 'Active' : 'Disabled'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => handleDeleteChannel(channel.id)}
                                            className="text-slate-500 hover:text-red-400 transition-colors p-1" 
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
              </div>
          </div>
      )}
    </div>
  );
}