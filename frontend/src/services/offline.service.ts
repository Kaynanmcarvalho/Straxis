// IndexedDB para cache local
const DB_NAME = 'straxis-offline';
const DB_VERSION = 1;

interface PendingOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  collection: string;
  data: any;
  timestamp: Date;
}

class OfflineService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store para dados em cache
        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'id' });
          cacheStore.createIndex('collection', 'collection', { unique: false });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Store para operações pendentes
        if (!db.objectStoreNames.contains('pending')) {
          const pendingStore = db.createObjectStore('pending', { keyPath: 'id', autoIncrement: true });
          pendingStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  // Cache de dados
  async cacheData(collection: string, id: string, data: any): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      
      const request = store.put({
        id: `${collection}_${id}`,
        collection,
        data,
        timestamp: new Date()
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getCachedData(collection: string, id: string): Promise<any> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      
      const request = store.get(`${collection}_${id}`);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.data : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAllCachedData(collection: string): Promise<any[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const index = store.index('collection');
      
      const request = index.getAll(collection);

      request.onsuccess = () => {
        const results = request.result.map((item: any) => item.data);
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Operações pendentes
  async addPendingOperation(operation: Omit<PendingOperation, 'id'>): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pending'], 'readwrite');
      const store = transaction.objectStore('pending');
      
      const request = store.add({
        ...operation,
        timestamp: new Date()
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingOperations(): Promise<PendingOperation[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pending'], 'readonly');
      const store = transaction.objectStore('pending');
      
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clearPendingOperation(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pending'], 'readwrite');
      const store = transaction.objectStore('pending');
      
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Status de conexão
  isOnline(): boolean {
    return navigator.onLine;
  }

  // Sincronização
  async syncPendingOperations(): Promise<void> {
    if (!this.isOnline()) {
      console.log('Offline - sincronização adiada');
      return;
    }

    const operations = await this.getPendingOperations();
    
    for (const operation of operations) {
      try {
        await this.executePendingOperation(operation);
        await this.clearPendingOperation(operation.id);
      } catch (error) {
        console.error('Erro ao sincronizar operação:', error);
        // Manter operação na fila para tentar novamente
      }
    }
  }

  private async executePendingOperation(operation: PendingOperation): Promise<void> {
    const url = `/api/${operation.collection}`;
    
    let method: string;
    let body: any;

    switch (operation.type) {
      case 'create':
        method = 'POST';
        body = operation.data;
        break;
      case 'update':
        method = 'PUT';
        body = operation.data;
        break;
      case 'delete':
        method = 'DELETE';
        body = undefined;
        break;
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }
}

export const offlineService = new OfflineService();

// Inicializar ao carregar
offlineService.init();

// Listener para mudanças de conexão
window.addEventListener('online', () => {
  console.log('Conexão restaurada - sincronizando...');
  offlineService.syncPendingOperations();
});

window.addEventListener('offline', () => {
  console.log('Conexão perdida - modo offline ativado');
});
