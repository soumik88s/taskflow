import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { ToastMessage } from '../../types';

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning', title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success', title?: string) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastMessage = { id, message, type, title };

      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    []
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto flex items-start p-3.5 rounded-xl border shadow-lg backdrop-blur-md bg-white/95 dark:bg-zinc-900/95 border-zinc-200/80 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
              id={`toast-${toast.id}`}
            >
              <div className="mr-3 mt-0.5 shrink-0">
                {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-500" />}
                {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                {toast.type === 'info' && <Info className="w-5 h-5 text-indigo-500" />}
              </div>
              <div className="flex-1 pr-2">
                {toast.title && <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-0.5">{toast.title}</p>}
                <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300 leading-snug">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors shrink-0 p-1 rounded-lg"
                id={`toast-close-${toast.id}`}
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
