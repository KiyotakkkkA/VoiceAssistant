import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast } from '../ui/atoms/feedback';

interface ToastItem {
  id: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastItem['type'], duration?: number) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

interface Props {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<Props> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: ToastItem['type'] = 'info', duration = 3500) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    
    setToasts(prev => [...prev, { id, message, type, duration }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
    
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const contextValue: ToastContextType = {
    addToast,
    removeToast,
    clearAllToasts
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      
      {/* Toast Container */}
      <div className='pointer-events-none fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm'>
        {toasts.map(toast => (
          <Toast 
            key={toast.id} 
            title={toast.message} 
            className={`pointer-events-auto ${
              toast.type === 'success' ? 'border-green-500/30 from-green-900/20 to-green-800/30' :
              toast.type === 'warning' ? 'border-orange-500/30 from-orange-900/20 to-orange-800/30' :
              toast.type === 'error' ? 'border-red-500/30 from-red-900/20 to-red-800/30' :
              ''
            }`}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};