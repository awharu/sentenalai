import React, { useState } from 'react';
import { IdentityProvider, SSOType } from '../types';
import { Button } from './Button';
import { X, Shield, Globe, Key } from 'lucide-react';

interface SSOConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (idp: IdentityProvider) => void;
    initialData?: Partial<IdentityProvider>;
}

export const SSOConfigModal: React.FC<SSOConfigModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState<Partial<IdentityProvider>>(initialData || { type: 'OIDC', status: 'ACTIVE' });
    
    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name && formData.issuerUrl && formData.clientId) {
            onSave({
                id: formData.id || crypto.randomUUID(),
                name: formData.name,
                type: formData.type as SSOType,
                issuerUrl: formData.issuerUrl,
                clientId: formData.clientId,
                status: formData.status as 'ACTIVE' | 'INACTIVE',
                lastSync: Date.now()
            });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-900/50">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Shield className="text-purple-500" size={24} />
                        Configure IdP
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Provider Name</label>
                        <input
                            type="text"
                            value={formData.name || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
                            placeholder="e.g. Corporate Okta"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Protocol</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as SSOType }))}
                            className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
                        >
                            <option value="OIDC">OIDC (OpenID Connect)</option>
                            <option value="SAML">SAML 2.0</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Issuer URL</label>
                        <div className="relative">
                            <Globe size={16} className="absolute left-3 top-3 text-slate-500" />
                            <input
                                type="url"
                                value={formData.issuerUrl || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, issuerUrl: e.target.value }))}
                                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg py-2.5 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
                                placeholder="https://..."
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Client ID / Entity ID</label>
                        <div className="relative">
                            <Key size={16} className="absolute left-3 top-3 text-slate-500" />
                            <input
                                type="text"
                                value={formData.clientId || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
                                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg py-2.5 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
                                placeholder="Client ID"
                                required
                            />
                        </div>
                    </div>

                    <div>
                         <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Status</label>
                         <div className="flex gap-4 mt-2">
                             <label className="flex items-center gap-2 cursor-pointer">
                                 <input 
                                    type="radio" 
                                    name="status" 
                                    checked={formData.status === 'ACTIVE'} 
                                    onChange={() => setFormData(prev => ({...prev, status: 'ACTIVE'}))}
                                    className="text-purple-600 focus:ring-purple-500 bg-slate-900 border-slate-700"
                                 />
                                 <span className="text-sm text-white">Active</span>
                             </label>
                             <label className="flex items-center gap-2 cursor-pointer">
                                 <input 
                                    type="radio" 
                                    name="status" 
                                    checked={formData.status === 'INACTIVE'} 
                                    onChange={() => setFormData(prev => ({...prev, status: 'INACTIVE'}))}
                                    className="text-purple-600 focus:ring-purple-500 bg-slate-900 border-slate-700"
                                 />
                                 <span className="text-sm text-slate-400">Inactive</span>
                             </label>
                         </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-800 mt-2">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save Configuration</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};