
import { Task, QuickNote } from '../types';
import { supabase } from './supabase';

const isOnline = () => typeof navigator !== 'undefined' && navigator.onLine;

const DB_NAME = 'EisenhowerDB';
const DB_VERSION = 6; // Bumped for potential schema updates if needed, though logic handles existing
const STORE_TASKS = 'tasks';
const STORE_NOTES = 'quick_notes';

export class DBService {
  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create tasks store if not exists
        if (!db.objectStoreNames.contains(STORE_TASKS)) {
          const store = db.createObjectStore(STORE_TASKS, { keyPath: 'id' });
          store.createIndex('date', 'date', { unique: false });
          store.createIndex('quadrant', 'quadrant', { unique: false });
          store.createIndex('order', 'order', { unique: false });
        } else {
          // If updating existing store in future
          const store = (event.target as IDBOpenDBRequest).transaction?.objectStore(STORE_TASKS);
          if (store && !store.indexNames.contains('order')) {
            store.createIndex('order', 'order', { unique: false });
          }
        }

        // Create quick_notes store if not exists
        if (!db.objectStoreNames.contains(STORE_NOTES)) {
          const store = db.createObjectStore(STORE_NOTES, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  // --- Tasks ---

  async getAllTasks(): Promise<Task[]> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_TASKS, 'readonly');
      const store = transaction.objectStore(STORE_TASKS);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Performance Optimization:
   * Only fetch Active tasks (completed === null) 
   * AND Completed tasks within the last 7 days.
   */
  async getInitialTasks(): Promise<Task[]> {
    const db = await this.dbPromise;
    const today = new Date();
    // 7 days ago
    const sevenDaysAgo = new Date(today.setDate(today.getDate() - 7)).toISOString().split('T')[0];

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_TASKS, 'readonly');
      const store = transaction.objectStore(STORE_TASKS);
      const request = store.openCursor();
      const results: Task[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const task = cursor.value as Task;
          // Keep if NOT completed OR completed recently
          // Note: completed is string YYYY-MM-DD or null
          if (!task.completed || task.completed >= sevenDaysAgo) {
            results.push(task);
          }
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getActiveTasks(): Promise<Task[]> {
    return this.getInitialTasks();
  }

  async addTask(task: Task): Promise<void> {
    const db = await this.dbPromise;
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_TASKS, 'readwrite');
      const store = transaction.objectStore(STORE_TASKS);
      const request = store.add(task);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    if (isOnline()) {
      supabase.from('tasks').upsert(task).then(({ error }) => {
        if (error) console.error('Supabase addTask error:', error);
      });
    }
  }

  async bulkAddTasks(tasks: Task[]): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_TASKS, 'readwrite');
      const store = transaction.objectStore(STORE_TASKS);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);

      tasks.forEach(task => store.add(task));
    });
  }

  async updateTask(task: Task): Promise<void> {
    const db = await this.dbPromise;
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_TASKS, 'readwrite');
      const store = transaction.objectStore(STORE_TASKS);
      const request = store.put(task);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    if (isOnline()) {
      supabase.from('tasks').upsert(task).then(({ error }) => {
        if (error) console.error('Supabase updateTask error:', error);
      });
    }
  }

  async deleteTask(id: string): Promise<void> {
    const db = await this.dbPromise;
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_TASKS, 'readwrite');
      const store = transaction.objectStore(STORE_TASKS);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    if (isOnline()) {
      supabase.from('tasks').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase deleteTask error:', error);
      });
    }
  }

  async clearTasks(): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_TASKS, 'readwrite');
      const store = transaction.objectStore(STORE_TASKS);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // --- Quick Notes ---

  async getAllQuickNotes(): Promise<QuickNote[]> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      if (!db.objectStoreNames.contains(STORE_NOTES)) {
        console.warn('Quick Notes store not found, returning empty.');
        resolve([]);
        return;
      }
      const transaction = db.transaction(STORE_NOTES, 'readonly');
      const store = transaction.objectStore(STORE_NOTES);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async addQuickNote(note: QuickNote): Promise<void> {
    const db = await this.dbPromise;
    await new Promise<void>((resolve, reject) => {
      if (!db.objectStoreNames.contains(STORE_NOTES)) {
        reject(new Error("Quick Notes store does not exist."));
        return;
      }
      const transaction = db.transaction(STORE_NOTES, 'readwrite');
      const store = transaction.objectStore(STORE_NOTES);
      const request = store.add(note);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    if (isOnline()) {
      supabase.from('quick_notes').upsert(note).then(({ error }) => {
        if (error) console.error('Supabase addQuickNote error:', error);
      });
    }
  }

  async updateQuickNote(note: QuickNote): Promise<void> {
    const db = await this.dbPromise;
    await new Promise<void>((resolve, reject) => {
      if (!db.objectStoreNames.contains(STORE_NOTES)) {
        reject(new Error("Quick Notes store does not exist."));
        return;
      }
      const transaction = db.transaction(STORE_NOTES, 'readwrite');
      const store = transaction.objectStore(STORE_NOTES);
      const request = store.put(note);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    if (isOnline()) {
      supabase.from('quick_notes').upsert(note).then(({ error }) => {
        if (error) console.error('Supabase updateQuickNote error:', error);
      });
    }
  }

  async bulkAddQuickNotes(notes: QuickNote[]): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      if (!db.objectStoreNames.contains(STORE_NOTES)) {
        resolve();
        return;
      }
      const transaction = db.transaction(STORE_NOTES, 'readwrite');
      const store = transaction.objectStore(STORE_NOTES);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);

      notes.forEach(note => store.add(note));
    });
  }

  async deleteQuickNote(id: string): Promise<void> {
    const db = await this.dbPromise;
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NOTES, 'readwrite');
      const store = transaction.objectStore(STORE_NOTES);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    if (isOnline()) {
      supabase.from('quick_notes').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase deleteQuickNote error:', error);
      });
    }
  }

  async clearQuickNotes(): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      if (!db.objectStoreNames.contains(STORE_NOTES)) {
        resolve();
        return;
      }
      const transaction = db.transaction(STORE_NOTES, 'readwrite');
      const store = transaction.objectStore(STORE_NOTES);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async resetDatabase(): Promise<void> {
    try {
      await this.clearTasks();
      await this.clearQuickNotes();
    } catch (e) {
      throw e;
    }
  }
}

export const dbService = new DBService();
