'use client';

import { SessionProvider } from 'next-auth/react';
import { ToastProvider } from '@/components/shared/ToastProvider';
import { ConfirmDialogProvider } from '@/components/shared/ConfirmDialog';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <ConfirmDialogProvider>
          {children}
        </ConfirmDialogProvider>
      </ToastProvider>
    </SessionProvider>
  );
}
