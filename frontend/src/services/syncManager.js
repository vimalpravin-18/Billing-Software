/**
 * BakeryPOS - Offline Sync Manager
 * Manages network status monitoring, automatic background synchronization of offline orders,
 * and event dispatching for UI status indicators.
 */

import api from './api';
import {
  getPendingSyncOrders,
  markOrderAsSyncedInDb,
  markOrderAsFailedInDb,
  purgeOldSyncedOrders,
} from './db';

class SyncManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.isServerReachable = false;
    this.isSyncing = false;
    this.pendingCount = 0;
    this.listeners = new Set();
    this.checkInterval = null;
    this.lastSyncTime = null;

    this.init();
  }

  init() {
    window.addEventListener('online', () => this.handleNetworkChange(true));
    window.addEventListener('offline', () => this.handleNetworkChange(false));

    // Initial check
    this.checkHealthAndSync();

    // Regular heartbeat check every 20 seconds
    this.checkInterval = setInterval(() => {
      this.checkHealthAndSync();
    }, 20000);
  }

  subscribe(listener) {
    this.listeners.add(listener);
    // Send immediate current state
    listener(this.getStatus());
    return () => this.listeners.delete(listener);
  }

  notify() {
    const status = this.getStatus();
    this.listeners.forEach((listener) => {
      try {
        listener(status);
      } catch (err) {
        console.error('Error notifying sync listener:', err);
      }
    });
  }

  getStatus() {
    return {
      isOnline: this.isOnline,
      isServerReachable: this.isServerReachable,
      isSyncing: this.isSyncing,
      pendingCount: this.pendingCount,
      lastSyncTime: this.lastSyncTime,
    };
  }

  async handleNetworkChange(online) {
    this.isOnline = online;
    if (online) {
      await this.checkHealthAndSync();
    } else {
      this.isServerReachable = false;
      await this.refreshPendingCount();
      this.notify();
    }
  }

  async refreshPendingCount() {
    try {
      const pending = await getPendingSyncOrders();
      this.pendingCount = pending.length;
    } catch {
      this.pendingCount = 0;
    }
  }

  async checkHealth() {
    if (!navigator.onLine) {
      this.isOnline = false;
      this.isServerReachable = false;
      return false;
    }

    try {
      // 4-second timeout to quickly detect sleep or connectivity drop
      await api.get('/health', { timeout: 4000 });
      this.isOnline = true;
      this.isServerReachable = true;
      return true;
    } catch {
      this.isServerReachable = false;
      return false;
    }
  }

  async checkHealthAndSync() {
    await this.refreshPendingCount();
    const reachable = await this.checkHealth();
    this.notify();

    if (reachable && this.pendingCount > 0 && !this.isSyncing) {
      await this.syncPendingOrders();
    }
  }

  async syncPendingOrders() {
    if (this.isSyncing) return;
    this.isSyncing = true;
    this.notify();

    try {
      const pendingList = await getPendingSyncOrders();
      if (pendingList.length === 0) {
        this.pendingCount = 0;
        return;
      }

      // Convert local queue records to CreateOrderRequest payloads
      const payloads = pendingList.map((item) => ({
        clientOrderUuid: item.clientOrderUuid,
        offlineInvoiceNumber: item.offlineInvoiceNumber || item.invoiceNumber,
        customerId: item.customerId ? Number(item.customerId) : null,
        paymentMethod: item.paymentMethod || 'CASH',
        discountAmount: Number(item.discountAmount) || 0,
        createdAt: item.createdAt,
        notes: item.notes || 'Offline POS Order (Synced)',
        items: (item.items || []).map((line) => ({
          productId: line.productId ? Number(line.productId) : null,
          quantity: Number(line.quantity),
          unitPrice: Number(line.unitPrice || line.price || 0),
          customItemName: line.customItemName || line.name,
          taxRate: Number(line.taxRate || 0),
        })),
      }));

      // Try batch sync endpoint first
      try {
        const response = await api.post('/orders/sync-offline', payloads, { timeout: 20000 });
        const syncedResults = response.data || [];
        for (const syncedOrder of syncedResults) {
          if (syncedOrder.clientOrderUuid) {
            await markOrderAsSyncedInDb(syncedOrder.clientOrderUuid, syncedOrder);
          }
        }
      } catch (batchErr) {
        // Fallback to sequential sync if batch endpoint failed
        console.warn('Batch sync fallback to sequential:', batchErr.message);
        for (const req of payloads) {
          try {
            const singleRes = await api.post('/orders', req, { timeout: 10000 });
            await markOrderAsSyncedInDb(req.clientOrderUuid, singleRes.data);
          } catch (singleErr) {
            await markOrderAsFailedInDb(req.clientOrderUuid, singleErr.response?.data?.message || singleErr.message);
          }
        }
      }

      this.lastSyncTime = new Date();
      await purgeOldSyncedOrders(7);
    } catch (err) {
      console.error('Error during offline sync:', err);
    } finally {
      this.isSyncing = false;
      await this.refreshPendingCount();
      this.notify();
    }
  }

  async forceSyncNow() {
    const reachable = await this.checkHealth();
    if (!reachable) {
      this.notify();
      throw new Error('Backend server is currently not reachable. Please check your internet or wait for server.');
    }
    await this.syncPendingOrders();
    return this.getStatus();
  }
}

export const syncManager = new SyncManager();
export default syncManager;
