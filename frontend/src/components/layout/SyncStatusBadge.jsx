import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import syncManager from '../../services/syncManager';
import { useToast } from '../../context/ToastContext';

const SyncStatusBadge = () => {
  const [syncState, setSyncState] = useState(() => syncManager.getStatus());
  const { showSuccess, showError, showWarning } = useToast();

  useEffect(() => {
    const unsubscribe = syncManager.subscribe((newState) => {
      setSyncState(newState);
    });
    return unsubscribe;
  }, []);

  const handleManualSync = async (e) => {
    e.stopPropagation();
    if (syncState.isSyncing) return;
    try {
      await syncManager.forceSyncNow();
      showSuccess('All offline orders synced successfully!');
    } catch (err) {
      showError(err.message || 'Sync failed. Server unreachable.');
    }
  };

  const { isOnline, isServerReachable, isSyncing, pendingCount } = syncState;

  // Fully online and synced
  if (isOnline && isServerReachable && pendingCount === 0 && !isSyncing) {
    return (
      <div
        className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-600/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold shrink-0 cursor-default"
        title="Live connection to cloud database"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="hidden sm:inline">Online</span>
      </div>
    );
  }

  // Currently syncing
  if (isSyncing) {
    return (
      <div
        className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-600/30 text-blue-700 dark:text-blue-400 text-xs font-semibold shrink-0 animate-pulse"
        title="Syncing offline orders to database..."
      >
        <RefreshCw className="w-3 h-3 animate-spin" />
        <span>Syncing{pendingCount > 0 ? ` (${pendingCount})` : ''}...</span>
      </div>
    );
  }

  // Pending offline orders waiting for sync
  if (pendingCount > 0) {
    return (
      <button
        type="button"
        onClick={handleManualSync}
        className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/50 border border-amber-600 text-amber-800 dark:text-amber-300 text-xs font-bold shrink-0 transition-colors cursor-pointer shadow-2xs"
        title="Click to sync offline orders now"
      >
        <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
        <span>{pendingCount} Pending Sync</span>
        <RefreshCw className="w-3 h-3 text-amber-700 dark:text-amber-400 ml-0.5" />
      </button>
    );
  }

  // Offline mode active
  return (
    <div
      className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-600/40 text-rose-700 dark:text-rose-400 text-xs font-semibold shrink-0 cursor-default"
      title="Offline Mode Active. Bills are safely saved locally."
    >
      <WifiOff className="w-3 h-3 text-rose-500" />
      <span className="hidden sm:inline">Offline Mode</span>
    </div>
  );
};

export default SyncStatusBadge;
