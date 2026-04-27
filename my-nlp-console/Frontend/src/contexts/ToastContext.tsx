// core-nlp-support\my-nlp-console\Frontend\src\contexts\ToastContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'; // Adicionado AlertTriangle

// 1. Adicionamos 'warning' ao tipo
type ToastType = 'success' | 'error' | 'info' | 'warning'; 

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextData {
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-9999 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-3 min-w-70 bg-theme-panel border border-theme-border shadow-xl rounded-shape-lg p-4 animate-in slide-in-from-right-8 fade-in duration-300"
          >
            {toast.type === 'success' && <CheckCircle className="text-emerald-500 shrink-0" size={20} />}
            {toast.type === 'error' && <AlertCircle className="text-rose-500 shrink-0" size={20} />}
            {toast.type === 'info' && <Info className="text-blue-500 shrink-0" size={20} />}
            {toast.type === 'warning' && <AlertTriangle className="text-amber-500 shrink-0" size={20} />}
            
            <p className="text-sm font-bold text-theme-text flex-1">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="text-theme-muted hover:text-theme-text transition-colors">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);