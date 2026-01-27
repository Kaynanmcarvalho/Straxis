/**
 * Offline Queue Service (Frontend)
 * 
 * Gerencia fila de operações offline no IndexedDB
 */

interface QueuedOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  collection: string;
  documentId: string;
  data?: any;
  timestamp: Date;
  retries: number;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
}

class OfflineQueueService {
  private dbName = 'straxis_offline_queue';
  private storeName = 'operations';
  private db: IDBDatabase | null = null;

  /**
   * Inicializa o IndexedDB
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('status', 'status', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * Adiciona operação à fila
   */
  async queueOperation(
    type: 'create' | 'update' | 'delete',
    collection: string,
    documentId: string,
    data?: any
  ): Promise<string> {
    if (!this.db) await this.init();

    const operation: QueuedOperation = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      collection,
      documentId,
      data,
      timestamp: new Date(),
      retries: 0,
      status: 'pending'
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.add(operation);

      request.onsuccess = () => resolve(operation.id);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Obtém todas as operações pendentes
   */
  async getPendingOperations(): Promise<QueuedOperation[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('status');
      const request = index.getAll('pending');

      request.onsuccess = () => {
        const operations = request.result as QueuedOperation[];
        // Ordenar por timestamp
        operations.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        resolve(operations);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Atualiza status de uma operação
   */
  async updateOperationStatus(
    operationId: string,
    status: QueuedOperation['status']
  ): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(operationId);

      request.onsuccess = () => {
        const operation = request.result;
        if (operation) {
          operation.status = status;
          store.put(operation);
        }
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Remove operação da fila
   */
  async removeOperation(operationId: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(operationId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Sincroniza operações pendentes com o servidor
   */
  async syncWithServer(apiService: any): Promise<{
    synced: number;
    failed: number;
  }> {
    const operations = await this.getPendingOperations();
    let synced = 0;
    let failed = 0;

    for (const operation of operations) {
      try {
        await this.updateOperationStatus(operation.id, 'syncing');

        // Enviar para o servidor
        await apiService.post('/offline-sync/queue', {
          type: operation.type,
          collection: operation.collection,
          documentId: operation.documentId,
          data: operation.data
        });

        await this.updateOperationStatus(operation.id, 'completed');
        await this.removeOperation(operation.id);
        synced++;
      } catch (error) {
        console.error('Error syncing operation:', error);
        await this.updateOperationStatus(operation.id, 'failed');
        failed++;
      }
    }

    // Solicitar sincronização no servidor
    if (synced > 0) {
      try {
        await apiService.post('/offline-sync/sync');
      } catch (error) {
        console.error('Error triggering server sync:', error);
      }
    }

    return { synced, failed };
  }

  /**
   * Limpa operações completadas
   */
  async cleanupCompleted(): Promise<number> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('status');
      const request = index.openCursor(IDBKeyRange.only('completed'));
      let count = 0;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          count++;
          cursor.continue();
        } else {
          resolve(count);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Obtém contagem de operações pendentes
   */
  async getPendingCount(): Promise<number> {
    const operations = await this.getPendingOperations();
    return operations.length;
  }
}

export const offlineQueueService = new OfflineQueueService();
