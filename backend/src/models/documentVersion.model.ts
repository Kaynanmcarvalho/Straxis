/**
 * Document Version Model
 * 
 * Estrutura para versionamento de documentos e resolução de conflitos offline
 */

export interface DocumentVersion<T = any> {
  data: T;
  timestamp: Date;
  userId: string;
  version: number;
  checksum?: string;
}

export interface VersionedDocument<T = any> {
  id: string;
  data: T;
  version: number;
  lastModifiedBy: string;
  lastModifiedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConflictResolution<T = any> {
  resolved: boolean;
  winner: 'local' | 'remote' | 'merged';
  finalData: T;
  localVersion: DocumentVersion<T>;
  remoteVersion: DocumentVersion<T>;
  conflictType: 'timestamp' | 'version' | 'array_merge' | 'irreconcilable';
  message: string;
}

export interface PendingOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  collection: string;
  documentId: string;
  data?: any;
  timestamp: Date;
  userId: string;
  companyId: string;
  retries: number;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
}
