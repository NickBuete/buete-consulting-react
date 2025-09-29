import React from 'react';
import { useOffline } from '../../context/OfflineContext';

export const OfflineBanner: React.FC = () => {
  const { isOnline, pendingActions, syncNow } = useOffline();

  if (isOnline && pendingActions.length === 0) {
    return null;
  }

  return (
    <div className="bg-amber-100 border-b border-amber-200 text-amber-900 text-sm px-4 py-2 flex items-center justify-between">
      <div className="flex-1">
        {!isOnline ? 'Offline mode: changes will sync once connection returns.' : null}
        {isOnline && pendingActions.length > 0
          ? `Sync queued: ${pendingActions.length} pending ${pendingActions.length === 1 ? 'action' : 'actions'}.`
          : null}
      </div>
      {pendingActions.length > 0 ? (
        <button
          type="button"
          className="ml-4 rounded bg-amber-200 px-3 py-1 text-xs font-semibold hover:bg-amber-300"
          onClick={syncNow}
        >
          Sync now
        </button>
      ) : null}
    </div>
  );
};
