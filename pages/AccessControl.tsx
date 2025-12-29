import React, { useState, useEffect } from 'react';
import { Car, Clock, Filter, Search, Plus, Trash2, ShieldCheck, ShieldAlert, AlertCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { VehicleAccessLog, PlateRecord } from '../types';
import { getAccessLogs, getPlateDatabase, addPlateRecord, deletePlateRecord } from '../services/accessControlService';

export default function AccessControl() {
  const [logs, setLogs] = useState<VehicleAccessLog[]>([]);
  const [plates, setPlates] = useState<PlateRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'logs' | 'database'>('logs');
  const [showModal, setShowModal] = useState(false);
  const [newPlate, setNewPlate] = useState<Partial<PlateRecord>>({ status: 'ALLOWED' });

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Poll for new logs
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    const logsData = await getAccessLogs();
    const platesData = await getPlateDatabase();
    setLogs(logsData);
    setPlates(platesData);
  };

  const handleAddPlate = async (e: React.FormEvent) => {
      e.preventDefault();
      if (newPlate.plateNumber && newPlate.status) {
          await addPlateRecord({
              plateNumber: newPlate.plateNumber,
              ownerName: newPlate.ownerName || 'Unknown',
              status: newPlate.status as any,
              vehicleType: newPlate.vehicleType || 'Car',
              notes: newPlate.notes
          });
          setShowModal(false);
          setNewPlate({ status: 'ALLOWED' });
          loadData();
      }
  };

  const handleDeletePlate = async (plate: string) => {
      if (confirm('Remove this plate from database?')) {
          await deletePlateRecord(plate);
          loadData();
      }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Car className="text-blue-500" />
                Vehicle Access Control
            </h1>
            <p className="text-slate-400 text-sm">LPR Monitoring and Gate Security Logs.</p>
        </div>
        
        <div className="bg-slate-900 p-1 rounded-lg border border-slate-800 flex">
            <button 
                onClick={() => setActiveTab('logs')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'logs' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
                Live Logs
            </button>
            <button 
                onClick={() => setActiveTab('database')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'database' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
                Plate Database
            </button>
        </div>
      </div>

      {activeTab === 'logs' && (
          <>
            {/* KPI Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                    <p className="text-slate-400 text-xs uppercase font-semibold mb-1">Vehicles Today</p>
                    <p className="text-3xl font-bold text-white">{logs.length + 42}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                    <p className="text-slate-400 text-xs uppercase font-semibold mb-1">Denied / Blocked</p>
                    <p className="text-3xl font-bold text-red-500">{logs.filter(l => l.status === 'DENIED').length}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                    <p className="text-slate-400 text-xs uppercase font-semibold mb-1">Avg Dwell Time</p>
                    <p className="text-3xl font-bold text-blue-500">4m 12s</p>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex-1 flex flex-col min-h-0">
                <div className="p-4 border-b border-slate-800 flex items-center gap-2">
                    <Clock size={16} className="text-slate-500" />
                    <span className="text-sm font-semibold text-white">Recent Entries & Exits</span>
                </div>
                <div className="overflow-auto flex-1">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 bg-slate-900 z-10">
                            <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase">
                                <th className="px-6 py-3 font-medium">Timestamp</th>
                                <th className="px-6 py-3 font-medium">Plate Number</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium">Stream</th>
                                <th className="px-6 py-3 font-medium">Confidence</th>
                                <th className="px-6 py-3 font-medium text-right">Evidence</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {logs.map(log => (
                                <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4 text-slate-300 text-sm font-mono">
                                        {new Date(log.timestamp).toLocaleTimeString()} <span className="text-slate-500 text-xs">{new Date(log.timestamp).toLocaleDateString()}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-white text-black font-mono font-bold px-2 py-0.5 rounded border-2 border-slate-300 text-sm shadow-sm">
                                                {log.plateNumber}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold inline-flex items-center gap-1 ${
                                            log.status === 'GRANTED' ? 'bg-green-900/30 text-green-400 border border-green-900/50' : 
                                            log.status === 'DENIED' ? 'bg-red-900/30 text-red-400 border border-red-900/50' :
                                            'bg-orange-900/30 text-orange-400 border border-orange-900/50'
                                        }`}>
                                            {log.status === 'GRANTED' && <ShieldCheck size={12} />}
                                            {log.status === 'DENIED' && <ShieldAlert size={12} />}
                                            {log.status === 'FLAGGED' && <AlertCircle size={12} />}
                                            {log.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 text-sm">
                                        Camera #{log.streamId}
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 text-sm">
                                        {Math.round(log.confidence * 100)}%
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {log.thumbnailUrl && (
                                            <img src={log.thumbnailUrl} alt="Plate" className="h-8 w-14 object-cover rounded bg-black inline-block border border-slate-700 hover:scale-150 transition-transform origin-right" />
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
          </>
      )}

      {activeTab === 'database' && (
          <div className="space-y-4">
               <div className="flex justify-end">
                   <Button onClick={() => setShowModal(true)} size="sm" className="flex items-center gap-2">
                       <Plus size={16} /> Add Plate
                   </Button>
               </div>
               
               <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase">
                                    <th className="px-6 py-3 font-medium">Plate Number</th>
                                    <th className="px-6 py-3 font-medium">Registered Owner</th>
                                    <th className="px-6 py-3 font-medium">Vehicle</th>
                                    <th className="px-6 py-3 font-medium">Access Level</th>
                                    <th className="px-6 py-3 font-medium">Notes</th>
                                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {plates.map(plate => (
                                    <tr key={plate.plateNumber} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="bg-white text-black font-mono font-bold px-2 py-0.5 rounded border-2 border-slate-300 text-sm shadow-sm inline-block">
                                                {plate.plateNumber}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-white font-medium">{plate.ownerName}</td>
                                        <td className="px-6 py-4 text-slate-400 text-sm">{plate.vehicleType}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                plate.status === 'ALLOWED' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                                            }`}>
                                                {plate.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-xs italic">{plate.notes || '-'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleDeletePlate(plate.plateNumber)}
                                                className="text-slate-500 hover:text-red-400 transition-colors p-1"
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

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <div className="relative bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-800">
                    <h2 className="text-xl font-bold text-white">Register Vehicle</h2>
                </div>
                <form onSubmit={handleAddPlate} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Plate Number</label>
                        <input 
                            type="text" 
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono uppercase focus:ring-2 focus:ring-blue-600 outline-none"
                            required
                            value={newPlate.plateNumber || ''}
                            onChange={e => setNewPlate({...newPlate, plateNumber: e.target.value.toUpperCase()})}
                            placeholder="ABC-1234"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Owner Name</label>
                        <input 
                            type="text" 
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-600 outline-none"
                            value={newPlate.ownerName || ''}
                            onChange={e => setNewPlate({...newPlate, ownerName: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Status</label>
                        <select 
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-600 outline-none"
                            value={newPlate.status}
                            onChange={e => setNewPlate({...newPlate, status: e.target.value as any})}
                        >
                            <option value="ALLOWED">Allowed (Grant Access)</option>
                            <option value="BLOCKED">Blocked (Deny Access)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Vehicle Type</label>
                        <input 
                            type="text" 
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-600 outline-none"
                            value={newPlate.vehicleType || ''}
                            onChange={e => setNewPlate({...newPlate, vehicleType: e.target.value})}
                            placeholder="e.g. Sedan, Truck"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button type="submit">Register Plate</Button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}