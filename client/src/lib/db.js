// src/utils/idb.js
import { openDB } from 'idb';

const DB_NAME = 'salescout-db';
const STORE_NAME = 'userStore';

export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        store.createIndex('key', 'key', { unique: true });
      }
    }
  });
};

export const saveUserData = async (data) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  // Save each key-value pair
  for (const key in data) {
    await store.put({ key, value: data[key] });
  }

  await tx.done;
};

export const getUserData = async (key) => {
  const db = await initDB();
  return db.get(STORE_NAME, key);
};

export const clearUserData = async () => {
  const db = await initDB();
  await db.clear(STORE_NAME);
};

export const updateUserData = async (key, value) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.put({ key, value });
  await tx.done;
};