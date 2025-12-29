import React, { useState, useEffect } from 'react';
import { FileText, Filter, Search, Download, ShieldCheck, Lock } from 'lucide-react';
import { Button } from '../components/Button';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { AuditLogEntry } from '../types';
import { getAuditLogs, logAction } from '../services/auditService';
import { useToast } from '../contexts/ToastContext';

export default function AuditLog() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [filterAction, setFilterAction] = useState('');
  const [filterActor, setFilterActor] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    loadLogs();
  }, [filterAction, filterActor]);

  const loadLogs = async () => {
    const data = await getAuditLogs({ 
        action: filterAction || undefined, 
        actor: filterActor || undefined 
    });
    setLogs(data);
  };

  const handleExport = async () => {
      // Log the export action itself
      await logAction('EXPORT_DATA', 'Audit Log', 'User exported audit trail to CSV.');
      addToast("Audit Log exported to CSV.", "success");
      loadLogs(); 
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <PageHeader 
        title="Audit Logs"
        description={
            <span className="flex items-center gap-2">
                <Lock size={12} className="text-green-500" />
                Immutable Chain of Custody for Compliance (SOC2 / HIPAA).
            </span>
        }
        icon={FileText}
      />

      <Card noPadding className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4 w-full md:w-auto">
             <div className="relative">
                 <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                 <input 
                    type="text" 
                    placeholder="Filter by Actor..." 
                    className="bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                    value={filterActor}
                    onChange={e => setFilterActor(e.target.value)}
                 />
             </div>
             <div className="relative">
                 <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                 <select 
                    className="bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-600 appearance-none min-w-[150px]"
                    value={filterAction}
                    onChange={e => setFilterAction(e.target.value)}
                 >
                     <option value="">All Actions</option>
                     <option value="LOGIN">User Login</option>
                     <option value="CREATE_STREAM">Create Stream</option>
                     <option value="UPDATE_STREAM">Update Stream</option>
                     <option value="DELETE_STREAM">Delete Stream</option>
                     <option value="ADD_IDENTITY">Add Identity</option>
                     <option value="REMOVE_IDENTITY">Remove Identity</option>
                     <option value="EXPORT_DATA">Data Export</option>
                 </select>
             </div>
          </div>
          <Button onClick={handleExport} size="sm" variant="outline" className="flex items-center gap-2">
              <Download size={14} />
              Export CSV
          </Button>
      </Card>

      <Card noPadding className="flex-1 flex flex-col min-h-0">
          <div className="overflow-auto flex-1">
              <table className="w-full text-left">
                  <thead className="sticky top-0 bg-slate-900 z-10 border-b border-slate-800">
                      <tr className="text-xs uppercase text-slate-400 font-semibold">
                          <th className="px-6 py-3">Timestamp</th>
                          <th className="px-6 py-3">Actor</th>
                          <th className="px-6 py-3">Action</th>
                          <th className="px-6 py-3">Resource</th>
                          <th className="px-6 py-3">Details</th>
                          <th className="px-6 py-3 text-right">Verification</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-sm">
                      {logs.map(log => (
                          <tr key={log.id} className="hover:bg-slate-800/30 transition-colors group">
                              <td className="px-6 py-3 text-slate-300 whitespace-nowrap font-mono text-xs">
                                  {new Date(log.timestamp).toLocaleString()}
                              </td>
                              <td className="px-6 py-3 text-white font-medium">
                                  {log.actorEmail}
                              </td>
                              <td className="px-6 py-3">
                                  <Badge variant={
                                      log.action.includes('DELETE') || log.action.includes('REMOVE') ? 'danger' :
                                      log.action === 'EXPORT_DATA' ? 'purple' : 'info'
                                  }>
                                      {log.action.replace('_', ' ')}
                                  </Badge>
                              </td>
                              <td className="px-6 py-3 text-slate-300">
                                  {log.resource}
                              </td>
                              <td className="px-6 py-3 text-slate-400 max-w-xs truncate" title={log.details}>
                                  {log.details}
                              </td>
                              <td className="px-6 py-3 text-right">
                                  <div className="flex items-center justify-end gap-2 text-xs font-mono text-slate-600">
                                      <span className="truncate w-24" title={log.hash}>
                                          {log.hash.substring(0, 10)}...
                                      </span>
                                      <ShieldCheck size={14} className="text-green-800" />
                                  </div>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </Card>
    </div>
  );
}