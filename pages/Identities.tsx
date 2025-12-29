import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Trash2, ShieldAlert, UserCheck, User, Briefcase } from 'lucide-react';
import { Button } from '../components/Button';
import { PageHeader } from '../components/PageHeader';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { PersonIdentity, IdentityCategory } from '../types';
import { getIdentities, addIdentity, deleteIdentity } from '../services/identityService';
import { logAction } from '../services/auditService';

export default function Identities() {
  const [identities, setIdentities] = useState<PersonIdentity[]>([]);
  const [filter, setFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newPerson, setNewPerson] = useState<Partial<PersonIdentity>>({
      category: 'EMPLOYEE',
      imageUrl: ''
  });

  useEffect(() => {
    loadIdentities();
  }, []);

  const loadIdentities = async () => {
    const data = await getIdentities();
    setIdentities(data);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPerson.name && newPerson.category) {
        await addIdentity({
            id: crypto.randomUUID(),
            name: newPerson.name,
            category: newPerson.category as IdentityCategory,
            imageUrl: newPerson.imageUrl || 'https://via.placeholder.com/200',
            notes: newPerson.notes
        });
        
        await logAction('ADD_IDENTITY', `Person: ${newPerson.name}`, `Category: ${newPerson.category}`);

        setShowModal(false);
        setNewPerson({ category: 'EMPLOYEE', imageUrl: '' });
        loadIdentities();
    }
  };

  const handleDelete = async (id: string, name: string) => {
      if (confirm('Are you sure you want to remove this identity record?')) {
          await deleteIdentity(id);
          await logAction('REMOVE_IDENTITY', `Person: ${name}`, `ID: ${id}`);
          loadIdentities();
      }
  };

  const filteredIdentities = identities.filter(p => 
      p.name.toLowerCase().includes(filter.toLowerCase()) || 
      p.category.toLowerCase().includes(filter.toLowerCase())
  );

  const getCategoryIcon = (cat: IdentityCategory) => {
      switch(cat) {
          case 'BLACKLISTED': return <ShieldAlert size={14} />;
          case 'VIP': return <UserCheck size={14} />;
          case 'CONTRACTOR': return <Briefcase size={14} />;
          default: return <User size={14} />;
      }
  };

  const getCategoryVariant = (cat: IdentityCategory) => {
      switch(cat) {
          case 'BLACKLISTED': return 'danger';
          case 'VIP': return 'purple';
          case 'CONTRACTOR': return 'orange';
          default: return 'info';
      }
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      <PageHeader 
        title="Identity Management"
        description="Manage known personnel, VIPs, and security threats (Watchlist)."
        icon={Users}
        actions={
            <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
                <Plus size={16} />
                Add Identity
            </Button>
        }
      />

      {/* Filter Bar */}
      <Card noPadding className="p-4 flex items-center gap-4">
          <Search size={20} className="text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by name or category..." 
            className="bg-transparent border-none focus:outline-none text-white w-full"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
      </Card>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto pb-6">
          {filteredIdentities.map(person => (
              <Card key={person.id} noPadding className="overflow-hidden group hover:border-slate-700 transition-all shadow-lg">
                  <div className="relative h-48 bg-slate-950">
                      <img src={person.imageUrl} alt={person.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-lg font-bold text-white truncate">{person.name}</h3>
                          <div className="mt-1">
                            <Badge variant={getCategoryVariant(person.category)} icon={getCategoryIcon(person.category)}>
                                {person.category}
                            </Badge>
                          </div>
                      </div>
                  </div>
                  <div className="p-4 space-y-3">
                      <div className="text-xs text-slate-400">
                          <span className="font-semibold text-slate-500 uppercase block mb-0.5">Notes</span>
                          {person.notes || 'No notes available.'}
                      </div>
                      <div className="text-xs text-slate-400">
                          <span className="font-semibold text-slate-500 uppercase block mb-0.5">Last Seen</span>
                          {person.lastSeen ? new Date(person.lastSeen).toLocaleString() : 'Never'}
                      </div>
                      <div className="pt-2 flex justify-end">
                          <button 
                            onClick={() => handleDelete(person.id, person.name)}
                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors"
                          >
                              <Trash2 size={16} />
                          </button>
                      </div>
                  </div>
              </Card>
          ))}
      </div>

      {/* Add Modal */}
      {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
              <div className="relative bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                  <div className="p-6 border-b border-slate-800">
                      <h2 className="text-xl font-bold text-white">Enroll New Identity</h2>
                  </div>
                  <form onSubmit={handleAdd} className="p-6 space-y-4">
                      <div>
                          <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Full Name</label>
                          <input 
                             type="text" 
                             className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-600 outline-none"
                             required
                             value={newPerson.name || ''}
                             onChange={e => setNewPerson({...newPerson, name: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Category</label>
                          <select 
                             className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-600 outline-none"
                             value={newPerson.category}
                             onChange={e => setNewPerson({...newPerson, category: e.target.value as IdentityCategory})}
                          >
                              <option value="EMPLOYEE">Employee</option>
                              <option value="VIP">VIP</option>
                              <option value="CONTRACTOR">Contractor</option>
                              <option value="BLACKLISTED">Blacklisted (Threat)</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Photo URL</label>
                          <input 
                             type="url" 
                             placeholder="https://..."
                             className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-600 outline-none"
                             value={newPerson.imageUrl || ''}
                             onChange={e => setNewPerson({...newPerson, imageUrl: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Notes</label>
                          <textarea 
                             className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-600 outline-none h-20 resize-none"
                             value={newPerson.notes || ''}
                             onChange={e => setNewPerson({...newPerson, notes: e.target.value})}
                          />
                      </div>
                      <div className="flex justify-end gap-3 pt-2">
                          <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                          <Button type="submit">Enroll Identity</Button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}