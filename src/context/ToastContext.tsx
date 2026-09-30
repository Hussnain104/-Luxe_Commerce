import React, { createContext, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        id="toast-container"
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 pointer-events-none max-w-sm w-full"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.85, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className={`pointer-events-auto relative overflow-hidden flex items-center gap-3 px-4 py-3.5 rounded-xl shadow-2xl text-xs font-medium border backdrop-blur-md ${
                toast.type === 'success'
                  ? 'bg-neutral-950/95 text-white border-amber-500/40 shadow-amber-950/20'
                  : toast.type === 'error'
                  ? 'bg-rose-950/95 text-white border-rose-600/40 shadow-rose-950/20'
                  : 'bg-neutral-900/95 text-white border-neutral-700/60 shadow-black/40'
              }`}
            >
              {toast.type === 'success' && (
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              {toast.type === 'error' && (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              {toast.type === 'info' && (
                <Info className="w-4 h-4 text-sky-400 shrink-0" />
              )}

              <span className="flex-1 pr-1 font-sans">{toast.message}</span>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-neutral-400 hover:text-white p-1 transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Countdown progress bar */}
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 4.2, ease: 'linear' }}
                className={`absolute bottom-0 left-0 h-0.5 ${
                  toast.type === 'success'
                    ? 'bg-amber-400'
                    : toast.type === 'error'
                    ? 'bg-rose-400'
                    : 'bg-neutral-400'
                }`}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
