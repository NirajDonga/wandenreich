'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

interface ConfirmDialogContextType {
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(undefined);

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmDialogOptions>({
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'danger'
  });
  const [resolveCallback, setResolveCallback] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmDialogOptions): Promise<boolean> => {
    setOptions({ ...opts, confirmText: opts.confirmText || 'Confirm', cancelText: opts.cancelText || 'Cancel', variant: opts.variant || 'danger' });
    setIsOpen(true);

    return new Promise((resolve) => {
      setResolveCallback(() => resolve);
    });
  }, []);

  const handleConfirm = () => {
    resolveCallback?.(true);
    setIsOpen(false);
  };

  const handleCancel = () => {
    resolveCallback?.(false);
    setIsOpen(false);
  };

  const variantStyles = {
    danger: {
      button: 'bg-red-600 hover:bg-red-700 text-white',
      icon: 'text-red-600',
      iconBg: 'bg-red-100'
    },
    warning: {
      button: 'bg-orange-600 hover:bg-orange-700 text-white',
      icon: 'text-orange-600',
      iconBg: 'bg-orange-100'
    },
    info: {
      button: 'bg-blue-600 hover:bg-blue-700 text-white',
      icon: 'text-blue-600',
      iconBg: 'bg-blue-100'
    }
  };

  const currentVariant = variantStyles[options.variant || 'danger'];

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 w-12 h-12 rounded-full ${currentVariant.iconBg} flex items-center justify-center`}>
                <svg className={`w-6 h-6 ${currentVariant.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {options.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {options.message}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-medium transition-colors"
              >
                {options.cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className={`px-4 py-2 rounded-xl font-medium transition-colors ${currentVariant.button}`}
              >
                {options.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmDialogContext);
  if (context === undefined) {
    throw new Error('useConfirm must be used within a ConfirmDialogProvider');
  }
  return context;
}
