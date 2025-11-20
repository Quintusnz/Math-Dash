import { db, SyncQueueItem } from "@/lib/db";

export const SyncManager = {
  async addToQueue(type: SyncQueueItem['type'], payload: any) {
    await db.syncQueue.add({
      type,
      payload,
      createdAt: new Date().toISOString(),
      retryCount: 0
    });
    
    // Try to process immediately if online
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      this.processQueue();
    }
  },

  async processQueue() {
    const items = await db.syncQueue.toArray();
    if (items.length === 0) return;

    console.log(`[Sync] Processing ${items.length} items...`);

    for (const item of items) {
      try {
        await this.processItem(item);
        if (item.id) await db.syncQueue.delete(item.id);
      } catch (error) {
        console.error(`[Sync] Failed to process item ${item.id}`, error);
        if (item.id) {
          await db.syncQueue.update(item.id, { 
            retryCount: item.retryCount + 1 
          });
        }
      }
    }
  },

  async processItem(item: SyncQueueItem) {
    // Mock API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    switch (item.type) {
      case 'SESSION_UPLOAD':
        console.log('[Sync] Uploading session:', item.payload);
        // TODO: Replace with actual API call
        // await api.post('/sessions', item.payload);
        
        // Mark session as synced in local DB
        if (item.payload.id) {
          await db.sessions.update(item.payload.id, { synced: 1 });
        }
        break;
        
      case 'PROFILE_UPDATE':
        console.log('[Sync] Updating profile:', item.payload);
        // await api.put(`/profiles/${item.payload.id}`, item.payload);
        break;
    }
  }
};
