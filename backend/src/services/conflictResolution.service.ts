/**
 * Conflict Resolution Service
 * 
 * Resolve conflitos quando múltiplos usuários editam dados offline
 */

import { firestore } from '../config/firebase.config';
import { 
  DocumentVersion, 
  ConflictResolution, 
  VersionedDocument 
} from '../models/documentVersion.model';
import { logService } from './log.service';

class ConflictResolutionService {
  /**
   * Resolve conflito entre versão local e remota
   */
  async resolveConflict<T>(
    localVersion: DocumentVersion<T>,
    remoteVersion: DocumentVersion<T>,
    companyId: string
  ): Promise<ConflictResolution<T>> {
    // Estratégia: Last-Write-Wins baseado em timestamp
    if (localVersion.timestamp > remoteVersion.timestamp) {
      // Versão local é mais recente
      await this.logConflictResolution(companyId, 'local', localVersion, remoteVersion);
      
      return {
        resolved: true,
        winner: 'local',
        finalData: localVersion.data,
        localVersion,
        remoteVersion,
        conflictType: 'timestamp',
        message: 'Versão local é mais recente e foi mantida'
      };
    } else if (remoteVersion.timestamp > localVersion.timestamp) {
      // Versão remota é mais recente
      await this.logConflictResolution(companyId, 'remote', localVersion, remoteVersion);
      
      return {
        resolved: true,
        winner: 'remote',
        finalData: remoteVersion.data,
        localVersion,
        remoteVersion,
        conflictType: 'timestamp',
        message: 'Versão remota é mais recente e foi mantida'
      };
    } else {
      // Timestamps iguais - tentar merge inteligente
      const mergeResult = await this.attemptMerge(localVersion.data, remoteVersion.data);
      
      if (mergeResult.success) {
        await this.logConflictResolution(companyId, 'merged', localVersion, remoteVersion);
        
        return {
          resolved: true,
          winner: 'merged',
          finalData: mergeResult.data,
          localVersion,
          remoteVersion,
          conflictType: 'array_merge',
          message: 'Versões foram mescladas com sucesso'
        };
      } else {
        // Conflito irreconciliável
        await this.logConflictResolution(companyId, 'local', localVersion, remoteVersion, true);
        
        return {
          resolved: false,
          winner: 'local',
          finalData: localVersion.data,
          localVersion,
          remoteVersion,
          conflictType: 'irreconcilable',
          message: 'Conflito irreconciliável - versão local mantida por padrão'
        };
      }
    }
  }

  /**
   * Tenta fazer merge inteligente de dados
   */
  private async attemptMerge<T>(localData: T, remoteData: T): Promise<{ success: boolean; data: T }> {
    try {
      // Se ambos são objetos, tentar merge de propriedades
      if (typeof localData === 'object' && typeof remoteData === 'object' && localData !== null && remoteData !== null) {
        const merged: any = { ...remoteData };
        
        // Iterar sobre propriedades locais
        for (const key in localData) {
          const localValue = (localData as any)[key];
          const remoteValue = (remoteData as any)[key];
          
          // Se é array, fazer união de elementos únicos
          if (Array.isArray(localValue) && Array.isArray(remoteValue)) {
            merged[key] = this.mergeArrays(localValue, remoteValue);
          } else if (localValue !== remoteValue) {
            // Se valores diferentes, manter o local (last-write-wins)
            merged[key] = localValue;
          }
        }
        
        return { success: true, data: merged as T };
      }
      
      return { success: false, data: localData };
    } catch (error) {
      console.error('Error merging data:', error);
      return { success: false, data: localData };
    }
  }

  /**
   * Faz merge de arrays removendo duplicatas
   */
  private mergeArrays<T>(localArray: T[], remoteArray: T[]): T[] {
    // Criar Set para remover duplicatas
    const merged = new Set<string>();
    
    // Adicionar elementos remotos
    remoteArray.forEach(item => {
      merged.add(JSON.stringify(item));
    });
    
    // Adicionar elementos locais
    localArray.forEach(item => {
      merged.add(JSON.stringify(item));
    });
    
    // Converter de volta para array
    return Array.from(merged).map(item => JSON.parse(item));
  }

  /**
   * Registra resolução de conflito em logs
   */
  private async logConflictResolution<T>(
    companyId: string,
    winner: 'local' | 'remote' | 'merged',
    localVersion: DocumentVersion<T>,
    remoteVersion: DocumentVersion<T>,
    irreconcilable: boolean = false
  ): Promise<void> {
    await logService.create({
      companyId,
      userId: localVersion.userId,
      type: 'critical_change',
      action: 'conflict_resolved',
      details: {
        winner,
        irreconcilable,
        localTimestamp: localVersion.timestamp,
        remoteTimestamp: remoteVersion.timestamp,
        localVersion: localVersion.version,
        remoteVersion: remoteVersion.version,
        previousVersion: remoteVersion.data
      }
    });
  }

  /**
   * Adiciona campos de versionamento a um documento
   */
  addVersionFields<T>(data: T, userId: string): VersionedDocument<T> {
    const now = new Date();
    
    return {
      id: '', // Será preenchido ao salvar
      data,
      version: 1,
      lastModifiedBy: userId,
      lastModifiedAt: now,
      createdAt: now,
      updatedAt: now
    };
  }

  /**
   * Incrementa versão de um documento
   */
  incrementVersion<T>(doc: VersionedDocument<T>, userId: string): VersionedDocument<T> {
    return {
      ...doc,
      version: doc.version + 1,
      lastModifiedBy: userId,
      lastModifiedAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Valida integridade dos dados após resolução
   */
  async validateIntegrity<T>(
    data: T,
    validationRules: ((data: T) => boolean)[]
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    for (const rule of validationRules) {
      try {
        if (!rule(data)) {
          errors.push('Validation rule failed');
        }
      } catch (error) {
        errors.push((error as Error).message);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Notifica usuário sobre conflito resolvido
   */
  async notifyConflictResolved(
    companyId: string,
    userId: string,
    resolution: ConflictResolution<any>
  ): Promise<void> {
    const { notificationService } = await import('./notification.service');
    
    await notificationService.create({
      companyId,
      userId,
      type: 'info',
      priority: resolution.resolved ? 'low' : 'high',
      title: 'Conflito de Sincronização',
      message: resolution.message,
      expiresInHours: 24
    });
  }
}

export const conflictResolutionService = new ConflictResolutionService();
