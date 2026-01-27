/**
 * Offline Sync Service
 * 
 * Gerencia sincronização de operações offline
 */

import { firestore } from '../config/firebase.config';
import { PendingOperation } from '../models/documentVersion.model';
import { conflictResolutionService } from './conflictResolution.service';
import { logService } from './log.service';

class OfflineSyncService {
  private readonly COLLECTION = 'pendingOperations';

  /**
   * Adiciona operação à fila de sincronização
   */
  async queueOperation(operation: Omit<PendingOperation, 'id' | 'retries' | 'status'>): Promise<string> {
    const pendingOp: Omit<PendingOperation, 'id'> = {
      ...operation,
      retries: 0,
      status: 'pending'
    };

    const docRef = await firestore.collection(this.COLLECTION).add(pendingOp);
    
    return docRef.id;
  }

  /**
   * Sincroniza todas as operações pendentes de uma empresa
   */
  async syncPendingOperations(companyId: string, userId: string): Promise<{
    synced: number;
    failed: number;
    conflicts: number;
  }> {
    const stats = {
      synced: 0,
      failed: 0,
      conflicts: 0
    };

    // Buscar operações pendentes em ordem cronológica
    const snapshot = await firestore
      .collection(this.COLLECTION)
      .where('companyId', '==', companyId)
      .where('status', 'in', ['pending', 'failed'])
      .orderBy('timestamp', 'asc')
      .get();

    for (const doc of snapshot.docs) {
      const operation = { id: doc.id, ...doc.data() } as PendingOperation;
      
      try {
        // Marcar como sincronizando
        await this.updateOperationStatus(operation.id, 'syncing');

        // Executar operação
        const result = await this.executeOperation(operation);

        if (result.success) {
          stats.synced++;
          await this.updateOperationStatus(operation.id, 'completed');
        } else if (result.conflict) {
          stats.conflicts++;
          // Notificar usuário sobre conflito
          await conflictResolutionService.notifyConflictResolved(
            companyId,
            userId,
            result.resolution!
          );
          await this.updateOperationStatus(operation.id, 'completed');
        } else {
          stats.failed++;
          await this.updateOperationStatus(operation.id, 'failed');
          await this.incrementRetries(operation.id);
        }
      } catch (error) {
        console.error('Error syncing operation:', error);
        stats.failed++;
        await this.updateOperationStatus(operation.id, 'failed');
        await this.incrementRetries(operation.id);
      }
    }

    // Registrar em logs
    await logService.create({
      companyId,
      userId,
      type: 'critical_change',
      action: 'offline_sync_completed',
      details: stats
    });

    return stats;
  }

  /**
   * Executa uma operação pendente
   */
  private async executeOperation(operation: PendingOperation): Promise<{
    success: boolean;
    conflict?: boolean;
    resolution?: any;
  }> {
    const collectionPath = `companies/${operation.companyId}/${operation.collection}`;

    try {
      switch (operation.type) {
        case 'create':
          await firestore.collection(collectionPath).doc(operation.documentId).set({
            ...operation.data,
            createdAt: operation.timestamp,
            updatedAt: new Date()
          });
          return { success: true };

        case 'update':
          // Verificar se há conflito
          const docRef = firestore.collection(collectionPath).doc(operation.documentId);
          const docSnap = await docRef.get();

          if (!docSnap.exists) {
            return { success: false };
          }

          const remoteData = docSnap.data();
          const remoteTimestamp = remoteData?.updatedAt?.toDate() || new Date(0);
          
          // Se remoto foi modificado após a operação local, há conflito
          if (remoteTimestamp > operation.timestamp) {
            const resolution = await conflictResolutionService.resolveConflict(
              {
                data: operation.data,
                timestamp: operation.timestamp,
                userId: operation.userId,
                version: operation.data?.version || 1
              },
              {
                data: remoteData,
                timestamp: remoteTimestamp,
                userId: remoteData?.lastModifiedBy || 'unknown',
                version: remoteData?.version || 1
              },
              operation.companyId
            );

            // Aplicar resolução
            await docRef.update({
              ...resolution.finalData,
              version: (remoteData?.version || 1) + 1,
              lastModifiedBy: operation.userId,
              lastModifiedAt: new Date(),
              updatedAt: new Date()
            });

            return { success: true, conflict: true, resolution };
          }

          // Sem conflito, aplicar update
          await docRef.update({
            ...operation.data,
            version: (remoteData?.version || 1) + 1,
            lastModifiedBy: operation.userId,
            lastModifiedAt: new Date(),
            updatedAt: new Date()
          });

          return { success: true };

        case 'delete':
          await firestore.collection(collectionPath).doc(operation.documentId).update({
            deletedAt: operation.timestamp,
            lastModifiedBy: operation.userId,
            updatedAt: new Date()
          });
          return { success: true };

        default:
          return { success: false };
      }
    } catch (error) {
      console.error('Error executing operation:', error);
      return { success: false };
    }
  }

  /**
   * Atualiza status de uma operação
   */
  private async updateOperationStatus(operationId: string, status: PendingOperation['status']): Promise<void> {
    await firestore.collection(this.COLLECTION).doc(operationId).update({ status });
  }

  /**
   * Incrementa contador de tentativas
   */
  private async incrementRetries(operationId: string): Promise<void> {
    const docRef = firestore.collection(this.COLLECTION).doc(operationId);
    const doc = await docRef.get();
    const retries = (doc.data()?.retries || 0) + 1;
    
    await docRef.update({ retries });

    // Se excedeu 3 tentativas, marcar como falha permanente
    if (retries >= 3) {
      await docRef.update({ status: 'failed' });
    }
  }

  /**
   * Limpa operações completadas antigas
   */
  async cleanupCompletedOperations(daysOld: number = 7): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const snapshot = await firestore
      .collection(this.COLLECTION)
      .where('status', '==', 'completed')
      .where('timestamp', '<', cutoffDate)
      .get();

    const batch = firestore.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    return snapshot.size;
  }

  /**
   * Obtém operações pendentes de um usuário
   */
  async getPendingOperations(companyId: string, userId: string): Promise<PendingOperation[]> {
    const snapshot = await firestore
      .collection(this.COLLECTION)
      .where('companyId', '==', companyId)
      .where('userId', '==', userId)
      .where('status', 'in', ['pending', 'failed'])
      .orderBy('timestamp', 'asc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as PendingOperation[];
  }
}

export const offlineSyncService = new OfflineSyncService();
