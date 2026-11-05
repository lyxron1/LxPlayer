// 12-Hour Smart Storage & Cache Service for LxPlayer (IndexedDB + LocalStorage)
// Handles large IPTV libraries (11,000+ live channels, 90,000+ VOD) without freezing UI or exceeding memory quotas.

const DB_NAME = 'LxPlayerCacheDB';
const DB_VERSION = 1;
const STORE_NAME = 'iptv_cache';
export const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 Hours = 43,200,000 ms

let dbPromise = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        console.warn('IndexedDB not supported, falling back to localStorage');
        resolve(null);
        return;
      }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => {
        console.warn('IndexedDB open error:', req.error);
        resolve(null);
      };
    });
  }
  return dbPromise;
}

export async function getCachedData(key) {
  try {
    const db = await getDB();
    if (db) {
      return new Promise((resolve) => {
        try {
          const tx = db.transaction(STORE_NAME, 'readonly');
          const store = tx.objectStore(STORE_NAME);
          const req = store.get(key);
          req.onsuccess = () => {
            const entry = req.result;
            if (entry && entry.timestamp) {
              const age = Date.now() - entry.timestamp;
              if (age < CACHE_TTL_MS) {
                resolve(entry.data);
                return;
              }
            }
            resolve(null);
          };
          req.onerror = () => resolve(null);
        } catch {
          resolve(null);
        }
      });
    } else {
      // Fallback
      const raw = localStorage.getItem(`lx_cache_${key}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
        return parsed.data;
      }
    }
  } catch (err) {
    console.warn('Cache read error:', err);
  }
  return null;
}

export async function setCachedData(key, data) {
  try {
    const db = await getDB();
    if (db) {
      return new Promise((resolve) => {
        try {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          store.put({ timestamp: Date.now(), data }, key);
          tx.oncomplete = () => resolve(true);
          tx.onerror = () => resolve(false);
        } catch {
          resolve(false);
        }
      });
    } else {
      try {
        localStorage.setItem(`lx_cache_${key}`, JSON.stringify({ timestamp: Date.now(), data }));
      } catch (e) {
        console.warn('LocalStorage quota exceeded on fallback:', e);
      }
    }
  } catch (err) {
    console.warn('Cache write error:', err);
  }
}

export async function clearAllCache() {
  try {
    const db = await getDB();
    if (db) {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).clear();
    }
    // Also clean localStorage cache keys
    const keys = Object.keys(localStorage);
    for (const k of keys) {
      if (k.startsWith('lx_cache_') || k.startsWith('lx_sync_')) {
        localStorage.removeItem(k);
      }
    }
  } catch (e) {
    console.warn('Clear cache error:', e);
  }
}

export function getLastSyncTime(profileId) {
  try {
    const saved = localStorage.getItem(`lx_sync_${profileId || 'default'}`);
    return saved ? parseInt(saved, 10) : 0;
  } catch {
    return 0;
  }
}

export function setLastSyncTime(profileId) {
  try {
    localStorage.setItem(`lx_sync_${profileId || 'default'}`, Date.now().toString());
  } catch {}
}

export function isCacheValid(profileId) {
  const lastSync = getLastSyncTime(profileId);
  return Date.now() - lastSync < CACHE_TTL_MS;
}
