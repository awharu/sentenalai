import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border min-w-[300px] animate-in slide-in-from-right-full fade-in duration-300
              ${toast.type === 'success' ? 'bg-slate-900 border-green-500/50 text-white' : ''}
              ${toast.type === 'error' ? 'bg-slate-900 border-red-500/50 text-white' : ''}
              ${toast.type === 'warning' ? 'bg-slate-900 border-orange-500/50 text-white' : ''}
              ${toast.type === 'info' ? 'bg-slate-900 border-blue-500/50 text-white' : ''}
            `}
          >
            {toast.type === 'success' && <CheckCircle className="text-green-500 w-5 h-5 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="text-red-500 w-5 h-5 shrink-0" />}
            {toast.type === 'warning' && <AlertTriangle className="text-orange-500 w-5 h-5 shrink-0" />}
            {toast.type === 'info' && <Info className="text-blue-500 w-5 h-5 shrink-0" />}
            
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            
            <button 
                onClick={() => removeToast(toast.id)} 
                className="text-slate-500 hover:text-white transition-colors"
            >
                <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};