import React, { useState, useEffect, PropsWithChildren } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Shield, FileText, LogOut, Menu, X, Search, Users, Car, Map, Lock, Smartphone, TrendingUp } from 'lucide-react';
import { VoiceCommandWidget } from './VoiceCommandWidget';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  to: string;
  active: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, to, active, onClick }) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

export const Layout = ({ children }: PropsWithChildren<{}>) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="flex h-screen w-full bg-slate-950 overflow-hidden">
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 z-[60] md:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-[70] w-64 bg-slate-900 border-r border-slate-800 flex flex-col 
        transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2 text-blue-500">
            <Shield size={24} />
            <div className="flex flex-col">
                <span className="text-xl font-bold text-white leading-none">SentinelAI</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-1">
                  {user?.role || 'Guest'} View
                </span>
            </div>
          </div>
          {/* Close button for mobile */}
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-slate-400 hover:text-white md:hidden p-1 hover:bg-slate-800 rounded transition-colors"
            aria-label="Close Menu"
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 overflow-y-auto">
          <SidebarItem icon={LayoutDashboard} label="Live Monitor" to="/" active={location.pathname === '/'} />
          <SidebarItem icon={Map} label="Map View" to="/map" active={location.pathname === '/map'} />
          <SidebarItem icon={Users} label="Identity Management" to="/identities" active={location.pathname === '/identities'} />
          <SidebarItem icon={Car} label="Vehicle Access" to="/access-control" active={location.pathname === '/access-control'} />
          <SidebarItem icon={Search} label="AI Archive Search" to="/search" active={location.pathname === '/search'} />
          
          <div className="my-2 border-t border-slate-800/50"></div>
          
          <SidebarItem icon={TrendingUp} label="Analytics" to="/analytics" active={location.pathname === '/analytics'} />
          
          {user?.role === UserRole.ADMIN && (
             <>
                 <SidebarItem icon={Lock} label="Audit Logs" to="/audit-logs" active={location.pathname === '/audit-logs'} />
                 <SidebarItem icon={Shield} label="Admin Console" to="/admin" active={location.pathname === '/admin'} />
             </>
          )}

          <SidebarItem icon={Smartphone} label="Mobile App" to="/mobile" active={location.pathname === '/mobile'} />
          <SidebarItem icon={FileText} label="Documents" to="/documents" active={location.pathname === '/documents'} />
        </nav>

        <div className="p-4 border-t border-slate-800 shrink-0">
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-white truncate" title={user?.email}>{user?.email}</p>
              <p className="text-xs text-slate-500 truncate" title={user?.tenantId}>{user?.tenantId}</p>
            </div>
            <button onClick={logout} className="text-slate-500 hover:text-red-400 transition-colors p-1" title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full w-full relative overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-slate-900 border-b border-slate-800 flex items-center px-4 justify-between shrink-0 z-50">
             <div className="flex items-center gap-2 text-blue-500">
                <Shield size={24} />
                <span className="text-lg font-bold text-white">SentinelAI</span>
              </div>
              <button 
                className="text-slate-400 hover:text-white p-2 -mr-2"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open Menu"
              >
                  <Menu size={24} />
              </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-950">
            {children}
        </div>

        {/* Global Voice Widget */}
        <VoiceCommandWidget />
      </main>
    </div>
  );
};