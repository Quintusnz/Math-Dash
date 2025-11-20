import { useEffect } from 'react';
import { SyncManager } from '@/lib/sync/sync-manager';

export function useSync() {
  useEffect(() => {
    const handleOnline = () => {
      console.log('[Sync] Network restored. Processing queue...');
      SyncManager.processQueue();
    };

    window.addEventListener('online', handleOnline);
    
    // Initial check
    if (navigator.onLine) {
      SyncManager.processQueue();
    }

    return () => window.removeEventListener('online', handleOnline);
  }, []);
}
