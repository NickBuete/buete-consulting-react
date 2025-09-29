import React, { createContext, useEffect, useMemo, useState } from 'react';
import { OfflineAction, processOfflineQueue, subscribeToQueue } from '../offline/offlineQueue';

interface OfflineContextValue {
  isOnline: boolean;
  pendingActions: OfflineAction[];
  syncNow: () => void;
}

const OfflineContext = createContext<OfflineContextValue>({
  isOnline: true,
  pendingActions: [],
  syncNow: () => undefined,
});

export const OfflineProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [pendingActions, setPendingActions] = useState<OfflineAction[]>([]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const unsubscribe = subscribeToQueue(setPendingActions);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  const value = useMemo<OfflineContextValue>(
    () => ({
      isOnline,
      pendingActions,
      syncNow: () => {
        void processOfflineQueue();
      },
    }),
    [isOnline, pendingActions],
  );

  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
};

export const useOffline = () => React.useContext(OfflineContext);
