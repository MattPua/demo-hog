/** Low-level IndexedDB helpers (browser-only). */

export function isIndexedDbAvailable(): boolean {
  return typeof indexedDB !== 'undefined'
}

export function openDatabase(
  name: string,
  version: number,
  upgrade: (db: IDBDatabase) => void,
): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, version)

    request.onerror = () => {
      reject(request.error ?? new Error('Failed to open IndexedDB'))
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onupgradeneeded = () => {
      upgrade(request.result)
    }
  })
}

/** Read a single value from one object store inside a readonly transaction. */
export function readFromStore<T>(
  db: IDBDatabase,
  storeName: string,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly')
    const request = fn(tx.objectStore(storeName))

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => {
      reject(request.error ?? new Error('IndexedDB read failed'))
    }
    tx.onerror = () => {
      reject(tx.error ?? new Error('IndexedDB transaction failed'))
    }
  })
}

/**
 * Run synchronous writes inside a readwrite transaction.
 * Do not await inside `fn` — keep all store calls synchronous.
 */
export function writeInTransaction(
  db: IDBDatabase,
  storeNames: string | string[],
  fn: (tx: IDBTransaction) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeNames, 'readwrite')

    tx.oncomplete = () => resolve()
    tx.onerror = () => {
      reject(tx.error ?? new Error('IndexedDB transaction failed'))
    }
    tx.onabort = () => {
      reject(tx.error ?? new Error('IndexedDB transaction aborted'))
    }

    try {
      fn(tx)
    } catch (err) {
      tx.abort()
      reject(err)
    }
  })
}
