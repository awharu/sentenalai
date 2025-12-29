import React, { useState } from 'react';
import { Smartphone, QrCode, ShieldCheck, Trash2, Apple, MonitorSmartphone } from 'lucide-react';
import { Button } from '../components/Button';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { MobileDevice } from '../types';
import { logAction } from '../services/auditService';

export default function MobileApp() {
  const [showQr, setShowQr] = useState(false);
  const [devices, setDevices] = useState<MobileDevice[]>([
      { id: 'dev_1', name: "Chief Security's iPad", os: 'iOS', appVersion: '2.1.0', lastActive: Date.now() - 3600000, status: 'AUTHORIZED', ownerEmail: 'chief@sentinel.ai' }
  ]);

  const handleGeneratePairingCode = async () => {
      setShowQr(true);
      await logAction('DEVICE_PAIRING', 'Mobile App', 'Generated pairing QR code.');
  };

  const handleRevoke = async (id: string) => {
      if (confirm("Revoke access for this device? It will be logged out immediately.")) {
          setDevices(devices.filter(d => d.id !== id));
          await logAction('DEVICE_PAIRING', 'Revoked Device', `ID: ${id}`);
      }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <PageHeader 
        title="Mobile Companion"
        description="Download the SentinelAI mobile app for field operations and manage authorized devices."
        icon={Smartphone}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Download & Pair Card */}
          <Card className="flex flex-col items-center text-center p-8">
              <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500 mb-6">
                  <MonitorSmartphone size={32} />
              </div>
              
              <h2 className="text-xl font-bold text-white mb-2">Get the App</h2>
              <p className="text-slate-400 text-sm max-w-sm mb-8">
                  Access live streams, receive push notifications for critical alerts, and perform LPR scans directly from your mobile device.
              </p>

              <div className="flex gap-4 mb-8">
                  <button className="flex items-center gap-3 bg-white text-black px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors">
                      <Apple size={20} />
                      <div className="text-left">
                          <div className="text-[10px] font-bold uppercase leading-none">Download on the</div>
                          <div className="text-sm font-bold leading-none">App Store</div>
                      </div>
                  </button>
                  <button className="flex items-center gap-3 bg-slate-800 text-white border border-slate-700 px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors">
                       <div className="text-left">
                          <div className="text-[10px] font-bold uppercase leading-none">Get it on</div>
                          <div className="text-sm font-bold leading-none">Google Play</div>
                      </div>
                  </button>
              </div>

              <div className="w-full border-t border-slate-800 pt-8">
                  <h3 className="text-white font-bold mb-4">Pair New Device</h3>
                  {showQr ? (
                      <div className="flex flex-col items-center animate-in zoom-in duration-300">
                          <div className="bg-white p-4 rounded-xl shadow-lg mb-4">
                              <div className="w-48 h-48 bg-white flex flex-wrap content-start">
                                  {Array.from({length: 64}).map((_, i) => (
                                      <div key={i} className={`w-6 h-6 ${Math.random() > 0.5 ? 'bg-black' : 'bg-white'}`}></div>
                                  ))}
                              </div>
                          </div>
                          <p className="text-xs text-slate-500 mb-4">Scan with the SentinelAI App</p>
                          <p className="text-xs font-mono text-yellow-500 bg-yellow-900/20 px-2 py-1 rounded">Expires in 04:59</p>
                          <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowQr(false)}>Cancel</Button>
                      </div>
                  ) : (
                      <Button onClick={handleGeneratePairingCode} className="flex items-center gap-2">
                          <QrCode size={18} />
                          Generate Pairing QR Code
                      </Button>
                  )}
              </div>
          </Card>

          {/* Authorized Devices List */}
          <Card noPadding className="flex flex-col">
              <div className="p-6 border-b border-slate-800">
                  <h3 className="font-bold text-white flex items-center gap-2">
                      <ShieldCheck size={18} className="text-green-500" />
                      Authorized Devices
                  </h3>
              </div>
              <div className="flex-1 p-6 overflow-y-auto">
                  {devices.length === 0 ? (
                      <div className="text-center text-slate-500 py-10">No devices paired.</div>
                  ) : (
                      <div className="space-y-4">
                          {devices.map(device => (
                              <div key={device.id} className="flex items-center justify-between bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                  <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-slate-400">
                                          {device.os === 'iOS' ? <Apple size={20} /> : <Smartphone size={20} />}
                                      </div>
                                      <div>
                                          <h4 className="font-bold text-white text-sm">{device.name}</h4>
                                          <div className="flex items-center gap-2 text-xs text-slate-400">
                                              <span>v{device.appVersion}</span>
                                              <span>•</span>
                                              <span>{new Date(device.lastActive).toLocaleDateString()}</span>
                                          </div>
                                          <p className="text-[10px] text-slate-500 mt-0.5">{device.ownerEmail}</p>
                                      </div>
                                  </div>
                                  <button onClick={() => handleRevoke(device.id)} className="text-slate-500 hover:text-red-500 transition-colors p-2" title="Revoke Access">
                                      <Trash2 size={16} />
                                  </button>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          </Card>
      </div>
    </div>
  );
}