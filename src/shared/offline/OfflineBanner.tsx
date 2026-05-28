'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { useNotifications } from '@/shared/notifications';

const OFFLINE_COPY =
  "You're offline. Your work is being saved locally and will sync when you reconnect.";

function subscribeToNetworkStatus(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('offline', callback);
  window.addEventListener('online', callback);
  return () => {
    window.removeEventListener('offline', callback);
    window.removeEventListener('online', callback);
  };
}

function getOfflineSnapshot() {
  return typeof navigator !== 'undefined' ? !navigator.onLine : false;
}

function getServerOfflineSnapshot() {
  return false;
}

export default function OfflineBanner() {
  const { notify } = useNotifications();
  const wasOfflineRef = useRef(false);
  const isOffline = useSyncExternalStore(
    subscribeToNetworkStatus,
    getOfflineSnapshot,
    getServerOfflineSnapshot,
  );

  useEffect(() => {
    if (wasOfflineRef.current && !isOffline) {
      notify({
        id: 'network-reconnected',
        tone: 'success',
        title: 'Back online',
        description: 'Your saved work can sync now.',
      });
    }
    wasOfflineRef.current = isOffline;
  }, [isOffline, notify]);

  if (!isOffline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-0 z-[70] border-b border-wheat-300 bg-wheat-50 px-4 py-3 text-sm font-medium text-wheat-950 shadow-sm dark:border-wheat-700 dark:bg-wheat-950 dark:text-wheat-50"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-3">
        <span className="h-2 w-2 shrink-0 rounded-full bg-wheat-500" />
        <span>{OFFLINE_COPY}</span>
      </div>
    </div>
  );
}
