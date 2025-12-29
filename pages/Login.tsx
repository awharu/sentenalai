import React, { useState, useEffect } from 'react';
import { Shield, Lock, User as UserIcon, ArrowRight, Building2 } from 'lucide-react';
import { Button } from '../components/Button';
import { STORAGE_KEYS } from '../constants';
import { User, UserRole, IdentityProvider } from '../types';
import { logAction } from '../services/auditService';
import { getIdPs, simulateSSOLogin } from '../services/ssoService';

export default function Login() {
  const [email, setEmail] = useState('admin@sentinel.ai');
  const [password, setPassword] = useState('securepassword');
  const [isLoading, setIsLoading] = useState(false);
  const [ssoProviders, setSsoProviders] = useState<IdentityProvider[]>([]);
  const [isSsoLoading, setIsSsoLoading] = useState(false);

  useEffect(() => {
    // Check for configured IdPs to optionally show SSO button
    getIdPs().then(providers => {
        setSsoProviders(providers.filter(p => p.status === 'ACTIVE'));
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
        await new Promise(resolve => setTimeout(resolve, 800)); // Network latency simulation
        
        const mockUser: User = {
            id: crypto.randomUUID(),
            email: email,
            role: email.includes('admin') ? UserRole.ADMIN : UserRole.OPERATOR,
            tenantId: 'tenant-alpha-001',
            token: 'secure-jwt-' + crypto.randomUUID()
        };

        completeLogin(mockUser, 'Credentials');
    } catch (error) {
        console.error("Auth failed");
    } finally {
        setIsLoading(false);
    }
  };

  const handleSSO = async () => {
      if (ssoProviders.length === 0) return;
      
      setIsSsoLoading(true);
      try {
          // Simulate Redirect to Okta/Azure
          await simulateSSOLogin(ssoProviders[0].id);
          
          // Simulate Callback
          const mockUser: User = {
              id: 'sso_user_' + crypto.randomUUID(),
              email: 'corp_user@enterprise.com',
              role: UserRole.VIEWER, // Default to viewer for SSO
              tenantId: 'tenant-alpha-001',
              token: 'sso-jwt-' + crypto.randomUUID()
          };

          await completeLogin(mockUser, `SSO (${ssoProviders[0].name})`);
      } catch (e) {
          alert("SSO Failed");
      } finally {
          setIsSsoLoading(false);
      }
  };

  const completeLogin = async (user: User, method: string) => {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, user.token);
      await logAction('LOGIN', 'Auth System', `User logged in via ${method}.`);
      window.location.hash = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[100px]"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] rounded-full bg-indigo-900/10 blur-[100px]"></div>
      </div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
            <Shield size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">SentinelAI</h1>
          <p className="text-slate-400 text-sm mt-1">Secure VMS Login</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon size={18} className="text-slate-500" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="operator@company.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-slate-500" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
             <div className="flex items-center">
               <input id="remember" type="checkbox" className="h-4 w-4 bg-slate-800 border-slate-700 rounded text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900" />
               <label htmlFor="remember" className="ml-2 text-sm text-slate-400">Remember me</label>
             </div>
             <a href="#" className="text-sm text-blue-500 hover:text-blue-400">Forgot password?</a>
          </div>

          <Button type="submit" className="w-full mt-6 py-3" isLoading={isLoading}>
            Authenticate
          </Button>

          {ssoProviders.length > 0 && (
              <div className="pt-4 mt-4 border-t border-slate-800">
                  <button 
                    type="button"
                    onClick={handleSSO}
                    disabled={isSsoLoading}
                    className="w-full bg-white text-slate-900 hover:bg-slate-200 font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
                  >
                      {isSsoLoading ? (
                           <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                          <Building2 size={18} />
                      )}
                      <span>Continue with {ssoProviders.length === 1 ? ssoProviders[0].name : 'Single Sign-On'}</span>
                      {!isSsoLoading && <ArrowRight size={16} />}
                  </button>
                  <p className="text-center text-[10px] text-slate-500 mt-2">
                      Redirects to your corporate identity provider.
                  </p>
              </div>
          )}
        </form>
        
        <p className="mt-6 text-center text-xs text-slate-500">
          Authorized Personnel Only. All activity is logged.
        </p>
      </div>
    </div>
  );
}