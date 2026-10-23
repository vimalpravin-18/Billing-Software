/**
 * BakeryPOS - IndexedDB Offline Storage Service
 * Provides local structured persistence for products, categories, customers,
 * settings, offline sync queue, and local completed orders.
 */

const DB_NAME = 'BakeryPOS_Offline_DB';
const DB_VERSION = 1;

let dbInstance = null;

export const initDb = () => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      return resolve(dbInstance);
    }

    if (!window.indexedDB) {
      console.warn('IndexedDB not supported in this browser. Falling back to memory/localStorage.');
      return resolve(null);
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Products store
      if (!db.objectStoreNames.contains('products')) {
        const productStore = db.createObjectStore('products', { keyPath: 'id' });
        productStore.createIndex('name', 'name', { unique: false });
        productStore.createIndex('barcode', 'barcode', { unique: false });
        productStore.createIndex('categoryId', 'category.id', { unique: false });
      }

      // Categories store
      if (!db.objectStoreNames.contains('categories')) {
        db.createObjectStore('categories', { keyPath: 'id' });
      }

      // Customers store
      if (!db.objectStoreNames.contains('customers')) {
        const custStore = db.createObjectStore('customers', { keyPath: 'id' });
        custStore.createIndex('phone', 'phone', { unique: false });
      }

      // Settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }

      // Offline Orders Sync Queue
      if (!db.objectStoreNames.contains('sync_queue')) {
        const queueStore = db.createObjectStore('sync_queue', { keyPath: 'clientOrderUuid' });
        queueStore.createIndex('status', 'status', { unique: false });
        queueStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Local Orders History (accessible offline)
      if (!db.objectStoreNames.contains('local_orders')) {
        const orderStore = db.createObjectStore('local_orders', { keyPath: 'invoiceNumber' });
        orderStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.error('IndexedDB open error:', event.target.error);
      reject(event.target.error);
    };
  });
};

const getStore = async (storeName, mode = 'readonly') => {
  const db = await initDb();
  if (!db) return null;
  const tx = db.transaction(storeName, mode);
  return tx.objectStore(storeName);
};

// -------------------------------------------------------------
// Products
// -------------------------------------------------------------
export const saveProductsToDb = async (products) => {
  try {
    const db = await initDb();
    if (!db || !Array.isArray(products)) return;
    const tx = db.transaction('products', 'readwrite');
    const store = tx.objectStore('products');
    await new Promise((resolve, reject) => {
      const clearReq = store.clear();
      clearReq.onsuccess = () => {
        products.forEach((p) => store.put(p));
        resolve();
      };
      clearReq.onerror = () => reject(clearReq.error);
    });
  } catch (err) {
    console.error('Error saving products to IndexedDB:', err);
  }
};

export const getProductsFromDb = async () => {
  try {
    const store = await getStore('products', 'readonly');
    if (!store) return [];
    return new Promise((resolve) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
};

export const updateProductStockInDb = async (productId, quantityDeducted) => {
  try {
    if (!productId) return;
    const db = await initDb();
    if (!db) return;
    const tx = db.transaction('products', 'readwrite');
    const store = tx.objectStore('products');
    const getReq = store.get(productId);
    getReq.onsuccess = () => {
      const prod = getReq.result;
      if (prod) {
        prod.stockQuantity = Math.max(0, (Number(prod.stockQuantity) || 0) - Number(quantityDeducted));
        store.put(prod);
      }
    };
  } catch (err) {
    console.error('Error updating stock in IndexedDB:', err);
  }
};

// -------------------------------------------------------------
// Categories
// -------------------------------------------------------------
export const saveCategoriesToDb = async (categories) => {
  try {
    const db = await initDb();
    if (!db || !Array.isArray(categories)) return;
    const tx = db.transaction('categories', 'readwrite');
    const store = tx.objectStore('categories');
    store.clear();
    categories.forEach((c) => store.put(c));
  } catch (err) {
    console.error('Error saving categories to IndexedDB:', err);
  }
};

export const getCategoriesFromDb = async () => {
  try {
    const store = await getStore('categories', 'readonly');
    if (!store) return [];
    return new Promise((resolve) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
};

// -------------------------------------------------------------
// Customers
// -------------------------------------------------------------
export const saveCustomersToDb = async (customers) => {
  try {
    const db = await initDb();
    if (!db || !Array.isArray(customers)) return;
    const tx = db.transaction('customers', 'readwrite');
    const store = tx.objectStore('customers');
    store.clear();
    customers.forEach((c) => store.put(c));
  } catch (err) {
    console.error('Error saving customers to IndexedDB:', err);
  }
};

export const getCustomersFromDb = async () => {
  try {
    const store = await getStore('customers', 'readonly');
    if (!store) return [];
    return new Promise((resolve) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
};

export const addCustomerToDb = async (customer) => {
  try {
    const store = await getStore('customers', 'readwrite');
    if (!store) return;
    store.put(customer);
  } catch (err) {
    console.error('Error adding customer to IndexedDB:', err);
  }
};

// -------------------------------------------------------------
// Settings
// -------------------------------------------------------------
export const saveSettingsToDb = async (settings) => {
  try {
    const store = await getStore('settings', 'readwrite');
    if (!store || !settings) return;
    store.put({ key: 'shop_settings', data: settings });
  } catch (err) {
    console.error('Error saving settings to IndexedDB:', err);
  }
};

export const getSettingsFromDb = async () => {
  try {
    const store = await getStore('settings', 'readonly');
    if (!store) return null;
    return new Promise((resolve) => {
      const req = store.get('shop_settings');
      req.onsuccess = () => resolve(req.result ? req.result.data : null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
};

// -------------------------------------------------------------
// Offline Sync Queue
// -------------------------------------------------------------
export const enqueueOrderForSync = async (orderPayload) => {
  try {
    const store = await getStore('sync_queue', 'readwrite');
    if (!store) return;
    const queueRecord = {
      ...orderPayload,
      status: 'PENDING',
      attempts: 0,
      enqueuedAt: new Date().toISOString(),
    };
    return new Promise((resolve, reject) => {
      const req = store.put(queueRecord);
      req.onsuccess = () => resolve(queueRecord);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Error enqueuing order in IndexedDB:', err);
    throw err;
  }
};

export const getPendingSyncOrders = async () => {
  try {
    const store = await getStore('sync_queue', 'readonly');
    if (!store) return [];
    return new Promise((resolve) => {
      const req = store.getAll();
      req.onsuccess = () => {
        const all = req.result || [];
        resolve(all.filter((item) => item.status === 'PENDING' || item.status === 'FAILED'));
      };
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
};

export const markOrderAsSyncedInDb = async (clientOrderUuid, serverResponse) => {
  try {
    const db = await initDb();
    if (!db) return;
    const tx = db.transaction(['sync_queue', 'local_orders'], 'readwrite');
    const queueStore = tx.objectStore('sync_queue');
    const localStore = tx.objectStore('local_orders');

    // Update queue record status
    const getReq = queueStore.get(clientOrderUuid);
    getReq.onsuccess = () => {
      const record = getReq.result;
      if (record) {
        record.status = 'SYNCED';
        record.syncedAt = new Date().toISOString();
        record.serverInvoiceNumber = serverResponse?.invoiceNumber;
        queueStore.put(record);
      }
    };

    // Also persist into local completed orders for offline history
    if (serverResponse && serverResponse.invoiceNumber) {
      localStore.put(serverResponse);
    }
  } catch (err) {
    console.error('Error updating sync status in IndexedDB:', err);
  }
};

export const markOrderAsFailedInDb = async (clientOrderUuid, errorMsg) => {
  try {
    const store = await getStore('sync_queue', 'readwrite');
    if (!store) return;
    const getReq = store.get(clientOrderUuid);
    getReq.onsuccess = () => {
      const record = getReq.result;
      if (record) {
        record.status = 'FAILED';
        record.lastError = errorMsg || 'Sync failed';
        record.attempts = (record.attempts || 0) + 1;
        store.put(record);
      }
    };
  } catch (err) {
    console.error('Error marking order failed in IndexedDB:', err);
  }
};

// -------------------------------------------------------------
// Local Orders History & Purge
// -------------------------------------------------------------
export const saveLocalOrder = async (order) => {
  try {
    const store = await getStore('local_orders', 'readwrite');
    if (!store || !order) return;
    store.put(order);
  } catch (err) {
    console.error('Error saving local order:', err);
  }
};

export const getLocalOrders = async (limit = 100) => {
  try {
    const store = await getStore('local_orders', 'readonly');
    if (!store) return [];
    return new Promise((resolve) => {
      const req = store.getAll();
      req.onsuccess = () => {
        const list = req.result || [];
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        resolve(list.slice(0, limit));
      };
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
};

export const purgeOldSyncedOrders = async (retentionDays = 7) => {
  try {
    const db = await initDb();
    if (!db) return;
    const tx = db.transaction('sync_queue', 'readwrite');
    const store = tx.objectStore('sync_queue');
    const now = Date.now();
    const cutoff = now - retentionDays * 24 * 60 * 60 * 1000;

    const req = store.getAll();
    req.onsuccess = () => {
      const items = req.result || [];
      items.forEach((item) => {
        if (item.status === 'SYNCED') {
          const syncedTime = item.syncedAt ? new Date(item.syncedAt).getTime() : 0;
          if (syncedTime > 0 && syncedTime < cutoff) {
            store.delete(item.clientOrderUuid);
          }
        }
      });
    };
  } catch (err) {
    console.error('Error purging old synced orders:', err);
  }
};

// -------------------------------------------------------------
// Backup & Restore
// -------------------------------------------------------------
export const exportAllDataAsJson = async () => {
  const [products, categories, customers, settings, syncQueue, localOrders] = await Promise.all([
    getProductsFromDb(),
    getCategoriesFromDb(),
    getCustomersFromDb(),
    getSettingsFromDb(),
    getPendingSyncOrders(),
    getLocalOrders(500),
  ]);

  return {
    version: '2.0',
    exportedAt: new Date().toISOString(),
    system: 'BakeFlow',
    data: {
      products,
      categories,
      customers,
      settings,
      syncQueue,
      localOrders,
    },
  };
};

export const importAllDataFromJson = async (backupJson) => {
  if (!backupJson || !backupJson.data) {
    throw new Error('Invalid backup file format.');
  }

  const { products, categories, customers, settings, syncQueue, localOrders } = backupJson.data;

  if (Array.isArray(products) && products.length > 0) {
    await saveProductsToDb(products);
  }
  if (Array.isArray(categories) && categories.length > 0) {
    await saveCategoriesToDb(categories);
  }
  if (Array.isArray(customers) && customers.length > 0) {
    await saveCustomersToDb(customers);
  }
  if (settings) {
    await saveSettingsToDb(settings);
  }
  if (Array.isArray(syncQueue) && syncQueue.length > 0) {
    const store = await getStore('sync_queue', 'readwrite');
    if (store) {
      syncQueue.forEach((item) => store.put(item));
    }
  }
  if (Array.isArray(localOrders) && localOrders.length > 0) {
    const store = await getStore('local_orders', 'readwrite');
    if (store) {
      localOrders.forEach((o) => store.put(o));
    }
  }

  return true;
};
