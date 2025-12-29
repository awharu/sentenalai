import React, { useState, useEffect } from 'react';
import { FileText, Filter, Search, Download, ShieldCheck, Lock } from 'lucide-react';
import { Button } from '../components/Button';
import { AuditLogEntry } from '../types';
import { getAuditLogs, logAction } from '../services/auditService';

export default function AuditLog() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [filterAction, setFilterAction] = useState('');
  const [filterActor, setFilterActor] = useState('');

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
      // Simulate CSV export
      const headers = ['Timestamp', 'Actor', 'Action', 'Resource', 'Details', 'IP Address', 'Hash'];
      const rows = logs.map(l => [
          new Date(l.timestamp).toISOString(),
          l.actorEmail,
          l.action,
          l.resource,
          l.details,
          l.ipAddress,
          l.hash
      ]);
      
      console.log("Exporting CSV...", [headers, ...rows]);
      
      // Log the export action itself
      await logAction('EXPORT_DATA', 'Audit Log', 'User exported audit trail to CSV.');
      alert("Audit Log exported successfully (Simulated).");
      loadLogs(); // Refresh to see the export action
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="text-blue-500" />
          Audit Logs
        </h1>
        <p className="text-slate-400 text-sm flex items-center gap-2">
           <Lock size={12} className="text-green-500" />
           Immutable Chain of Custody for Compliance (SOC2 / HIPAA).
        </p>
      </div>

      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
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
      </div>

      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col min-h-0">
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
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                      log.action.includes('DELETE') || log.action.includes('REMOVE') ? 'bg-red-900/30 text-red-400 border border-red-900/50' :
                                      log.action === 'EXPORT_DATA' ? 'bg-purple-900/30 text-purple-400 border border-purple-900/50' :
                                      'bg-blue-900/30 text-blue-400 border border-blue-900/50'
                                  }`}>
                                      {log.action.replace('_', ' ')}
                                  </span>
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
      </div>
    </div>
  );
}