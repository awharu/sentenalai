import React, { useState, useEffect } from 'react';
import { Tenant, PlanTier, IdentityProvider } from '../types';
import { Button } from '../components/Button';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Plus, Users, Server, Activity, Bell, Webhook, CheckCircle, Trash2, LayoutGrid, Shield, FileText, Lock, Globe } from 'lucide-react';
import { getIdPs, saveIdP, deleteIdP } from '../services/ssoService';
import { logAction } from '../services/auditService';
import { SSOConfigModal } from '../components/SSOConfigModal';
import { useToast } from '../contexts/ToastContext';

interface NotificationChannel {
    id: string;
    name: string;
    type: 'SLACK' | 'TEAMS' | 'GENERIC';
    url: string;
    active: boolean;
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'overview' | 'integrations' | 'compliance'>('overview');

  // SSO State
  const [idps, setIdps] = useState<IdentityProvider[]>([]);
  const [showSSOModal, setShowSSOModal] = useState(false);
  const [editingIdP, setEditingIdP] = useState<Partial<IdentityProvider> | undefined>(undefined);

  const { addToast } = useToast();

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

  useEffect(() => {
      if (activeTab === 'compliance') {
          loadIdPs();
      }
  }, [activeTab]);

  const loadIdPs = async () => {
      const data = await getIdPs();
      setIdps(data);
  };

  const handleAddChannel = (e: React.FormEvent) => {
      e.preventDefault();
      if (newChannel.name && newChannel.url) {
          setChannels([...channels, { ...newChannel, id: crypto.randomUUID() } as NotificationChannel]);
          setShowAddChannel(false);
          setNewChannel({ type: 'SLACK', active: true });
          addToast("Notification channel added.", "success");
      }
  };

  const handleDeleteChannel = (id: string) => {
      setChannels(prev => prev.filter(c => c.id !== id));
      addToast("Channel removed.", "info");
  };

  const toggleChannel = (id: string) => {
      setChannels(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  const handleSaveIdP = async (idp: IdentityProvider) => {
      await saveIdP(idp);
      await logAction('CONFIG_SSO', `IdP: ${idp.name}`, `Type: ${idp.type}, Status: ${idp.status}`);
      addToast("IdP Configuration Saved.", "success");
      loadIdPs();
  };

  const handleDeleteIdP = async (id: string) => {
      if (confirm("Are you sure? This will prevent users from logging in via this provider.")) {
          await deleteIdP(id);
          await logAction('CONFIG_SSO', 'Deleted IdP', `ID: ${id}`);
          addToast("Identity Provider deleted.", "warning");
          loadIdPs();
      }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="System Administration"
        description="Manage tenants, system health, and integrations."
        actions={
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
            <button 
                onClick={() => setActiveTab('compliance')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'compliance' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
                <Shield size={16} />
                Compliance
            </button>
        </div>
        }
      />

      {activeTab === 'overview' && (
        <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="flex items-center gap-4">
                        <div className="p-3 bg-blue-900/30 rounded-lg text-blue-400"><Users size={24} /></div>
                        <div>
                            <p className="text-slate-400 text-sm">Total Tenants</p>
                            <p className="text-2xl font-bold text-white">124</p>
                        </div>
                </Card>
                <Card className="flex items-center gap-4">
                        <div className="p-3 bg-green-900/30 rounded-lg text-green-400"><Server size={24} /></div>
                        <div>
                            <p className="text-slate-400 text-sm">Active Streams</p>
                            <p className="text-2xl font-bold text-white">842</p>
                        </div>
                </Card>
                <Card className="flex items-center gap-4">
                        <div className="p-3 bg-purple-900/30 rounded-lg text-purple-400"><Activity size={24} /></div>
                        <div>
                            <p className="text-slate-400 text-sm">AI Inferences (24h)</p>
                            <p className="text-2xl font-bold text-white">1.2M</p>
                        </div>
                </Card>
            </div>

            <Card noPadding>
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
                                        <Badge variant={tenant.plan === PlanTier.ENTERPRISE ? 'purple' : tenant.plan === PlanTier.PRO ? 'info' : 'neutral'}>
                                            {tenant.plan}
                                        </Badge>
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
            </Card>
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

              <Card noPadding>
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
              </Card>
          </div>
      )}

      {activeTab === 'compliance' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="space-y-6">
                 {/* SOC2 Card */}
                 <Card>
                     <div className="flex items-center gap-3 mb-6">
                         <div className="p-2 bg-green-900/30 rounded-lg text-green-500">
                             <Shield size={24} />
                         </div>
                         <div>
                             <h3 className="font-bold text-white">SOC 2 Type II Readiness</h3>
                             <p className="text-xs text-slate-400">Security Control Status</p>
                         </div>
                     </div>

                     <div className="space-y-4">
                         <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-800">
                             <div className="flex items-center gap-3">
                                 <Lock size={16} className="text-blue-500" />
                                 <div>
                                     <p className="text-sm font-medium text-white">Encryption at Rest</p>
                                     <p className="text-xs text-slate-500">AES-256 Volume Encryption</p>
                                 </div>
                             </div>
                             <Badge variant="success">ACTIVE</Badge>
                         </div>
                         <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-800">
                             <div className="flex items-center gap-3">
                                 <Globe size={16} className="text-purple-500" />
                                 <div>
                                     <p className="text-sm font-medium text-white">Encryption in Transit</p>
                                     <p className="text-xs text-slate-500">TLS 1.3 / HTTPS Enforced</p>
                                 </div>
                             </div>
                             <Badge variant="success">ACTIVE</Badge>
                         </div>
                         <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-800">
                             <div className="flex items-center gap-3">
                                 <FileText size={16} className="text-orange-500" />
                                 <div>
                                     <p className="text-sm font-medium text-white">Audit Logging</p>
                                     <p className="text-xs text-slate-500">Immutable Chain of Custody</p>
                                 </div>
                             </div>
                             <Badge variant="success">ACTIVE</Badge>
                         </div>
                     </div>
                     
                     <div className="mt-6 pt-4 border-t border-slate-800">
                         <Button className="w-full flex justify-center items-center gap-2" variant="outline">
                             <FileText size={16} />
                             Generate Compliance Report (PDF)
                         </Button>
                     </div>
                 </Card>

                 {/* Retention Card */}
                 <Card>
                    <h3 className="font-bold text-white mb-4">Data Retention Policy</h3>
                    <div className="space-y-4">
                        <div>
                             <div className="flex justify-between text-sm text-slate-300 mb-1">
                                 <span>Video Retention</span>
                                 <span className="font-bold">30 Days</span>
                             </div>
                             <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                 <div className="h-full w-1/3 bg-blue-600"></div>
                             </div>
                        </div>
                        <div>
                             <div className="flex justify-between text-sm text-slate-300 mb-1">
                                 <span>Audit Logs</span>
                                 <span className="font-bold">365 Days</span>
                             </div>
                             <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                 <div className="h-full w-full bg-green-600"></div>
                             </div>
                        </div>
                    </div>
                </Card>
             </div>

             <div className="space-y-6">
                {/* Enterprise SSO Card */}
                <Card noPadding className="flex flex-col h-full">
                    <div className="p-6 border-b border-slate-800 flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-white mb-1">Enterprise SSO</h3>
                            <p className="text-sm text-slate-400">
                                Connect your corporate identity provider (Okta, Azure AD).
                            </p>
                        </div>
                        <Button size="sm" onClick={() => { setEditingIdP(undefined); setShowSSOModal(true); }}>
                            <Plus size={16} className="mr-2 inline" /> Add Provider
                        </Button>
                    </div>
                    
                    <div className="flex-1 p-6 overflow-y-auto min-h-[300px]">
                        {idps.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                <Shield size={48} className="mb-4 opacity-50" />
                                <p>No Identity Providers configured.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {idps.map(idp => (
                                    <div key={idp.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded bg-slate-700 flex items-center justify-center text-slate-300">
                                                {idp.type === 'OIDC' ? <Globe size={20} /> : <Lock size={20} />}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white text-sm">{idp.name}</h4>
                                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                                    <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">{idp.type}</span>
                                                    <span className="truncate max-w-[150px]">{idp.issuerUrl}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant={idp.status === 'ACTIVE' ? 'success' : 'neutral'}>
                                                {idp.status}
                                            </Badge>
                                            <button onClick={() => handleDeleteIdP(idp.id)} className="text-slate-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Card>
             </div>
          </div>
      )}

      {/* SSO Config Modal */}
      <SSOConfigModal 
        isOpen={showSSOModal} 
        onClose={() => setShowSSOModal(false)}
        onSave={handleSaveIdP}
        initialData={editingIdP}
      />
    </div>
  );
}