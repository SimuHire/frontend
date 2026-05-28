'use client';

import { createContext, useContext, useMemo } from 'react';
import OfflineBanner from '@/shared/offline/OfflineBanner';
import { ToastContainer } from './components/ToastContainer';
import { useToastQueue } from './hooks/useToastQueue';
import type { NotificationsContextValue } from './types';

const NotificationsContext = createContext<NotificationsContextValue>({
  notify: () => {},
  dismiss: () => {},
  update: () => {},
});

export function useNotifications(): NotificationsContextValue {
  return useContext(NotificationsContext);
}

export function NotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { toasts, notify, dismiss, update } = useToastQueue();
  const contextValue = useMemo(
    () => ({ notify, dismiss, update }),
    [dismiss, notify, update],
  );

  return (
    <NotificationsContext.Provider value={contextValue}>
      {children}
      <OfflineBanner />
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </NotificationsContext.Provider>
  );
}
