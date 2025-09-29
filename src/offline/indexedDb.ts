const DB_NAME = 'hmr-offline';
const DB_VERSION = 1;
const STORE_PENDING = 'pendingActions';

const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_PENDING)) {
        db.createObjectStore(STORE_PENDING, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const addPendingAction = async <T extends { id: string }>(value: T) => {
  const db = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_PENDING, 'readwrite');
      transaction.onerror = () => reject(transaction.error);
      transaction.oncomplete = () => resolve();
      const store = transaction.objectStore(STORE_PENDING);
      store.put(value);
    });
  } finally {
    db.close();
  }
};

export const getPendingActions = async <T>(): Promise<T[]> => {
  const db = await openDatabase();
  try {
    return await new Promise<T[]>((resolve, reject) => {
      const transaction = db.transaction(STORE_PENDING, 'readonly');
      transaction.onerror = () => reject(transaction.error);
      const store = transaction.objectStore(STORE_PENDING);
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve((request.result as T[]) ?? []);
    });
  } finally {
    db.close();
  }
};

export const deletePendingAction = async (id: string) => {
  const db = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_PENDING, 'readwrite');
      transaction.onerror = () => reject(transaction.error);
      transaction.oncomplete = () => resolve();
      const store = transaction.objectStore(STORE_PENDING);
      store.delete(id);
    });
  } finally {
    db.close();
  }
};

export const clearPendingActions = async () => {
  const db = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_PENDING, 'readwrite');
      transaction.onerror = () => reject(transaction.error);
      transaction.oncomplete = () => resolve();
      const store = transaction.objectStore(STORE_PENDING);
      store.clear();
    });
  } finally {
    db.close();
  }
};
