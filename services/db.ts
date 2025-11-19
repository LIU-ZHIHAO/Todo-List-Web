import { Task, QuickNote } from '../types';

const DB_NAME = 'EisenhowerDB';
const DB_VERSION = 3; // Bumped version for new fields (optional but good practice)
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

  async addTask(task: Task): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_TASKS, 'readwrite');
      const store = transaction.objectStore(STORE_TASKS);
      const request = store.add(task);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
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
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_TASKS, 'readwrite');
      const store = transaction.objectStore(STORE_TASKS);
      const request = store.put(task);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteTask(id: string): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_TASKS, 'readwrite');
      const store = transaction.objectStore(STORE_TASKS);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // --- Quick Notes ---

  async getAllQuickNotes(): Promise<QuickNote[]> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      if (!db.objectStoreNames.contains(STORE_NOTES)) {
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
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NOTES, 'readwrite');
      const store = transaction.objectStore(STORE_NOTES);
      const request = store.add(note);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async bulkAddQuickNotes(notes: QuickNote[]): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
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
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NOTES, 'readwrite');
      const store = transaction.objectStore(STORE_NOTES);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const dbService = new DBService();