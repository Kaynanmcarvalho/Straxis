import { db } from '../config/firebase.config';
import { Firestore, Query, DocumentData } from 'firebase-admin/firestore';

export class FirestoreService {
  /**
   * Cria um documento em uma coleção
   */
  static async create<T>(
    collectionPath: string,
    data: T,
    docId?: string
  ): Promise<{ id: string; data: T }> {
    try {
      const collection = db.collection(collectionPath);
      
      if (docId) {
        await collection.doc(docId).set(data as DocumentData);
        return { id: docId, data };
      } else {
        const docRef = await collection.add(data as DocumentData);
        return { id: docRef.id, data };
      }
    } catch (error: any) {
      throw new Error(`Erro ao criar documento: ${error.message}`);
    }
  }

  /**
   * Busca um documento por ID
   */
  static async getById<T>(
    collectionPath: string,
    docId: string
  ): Promise<T | null> {
    try {
      const doc = await db.collection(collectionPath).doc(docId).get();
      
      if (!doc.exists) {
        return null;
      }

      return { id: doc.id, ...doc.data() } as T;
    } catch (error: any) {
      throw new Error(`Erro ao buscar documento: ${error.message}`);
    }
  }

  /**
   * Busca documentos com filtros
   * Automaticamente filtra por deletedAt == null
   */
  static async query<T>(
    collectionPath: string,
    filters: { field: string; operator: FirebaseFirestore.WhereFilterOp; value: any }[] = [],
    options: {
      orderBy?: { field: string; direction: 'asc' | 'desc' };
      limit?: number;
      startAfter?: any;
    } = {}
  ): Promise<T[]> {
    try {
      let query: Query = db.collection(collectionPath);

      // Adicionar filtro automático para soft delete
      query = query.where('deletedAt', '==', null);

      // Adicionar filtros customizados
      filters.forEach((filter) => {
        query = query.where(filter.field, filter.operator, filter.value);
      });

      // Ordenação
      if (options.orderBy) {
        query = query.orderBy(options.orderBy.field, options.orderBy.direction);
      }

      // Paginação
      if (options.startAfter) {
        query = query.startAfter(options.startAfter);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const snapshot = await query.get();
      
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
    } catch (error: any) {
      throw new Error(`Erro ao buscar documentos: ${error.message}`);
    }
  }

  /**
   * Atualiza um documento
   */
  static async update<T>(
    collectionPath: string,
    docId: string,
    data: Partial<T>
  ): Promise<void> {
    try {
      await db.collection(collectionPath).doc(docId).update({
        ...data,
        updatedAt: new Date(),
      } as DocumentData);
    } catch (error: any) {
      throw new Error(`Erro ao atualizar documento: ${error.message}`);
    }
  }

  /**
   * Soft delete de um documento
   */
  static async softDelete(
    collectionPath: string,
    docId: string
  ): Promise<void> {
    try {
      await db.collection(collectionPath).doc(docId).update({
        deletedAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error: any) {
      throw new Error(`Erro ao deletar documento: ${error.message}`);
    }
  }

  /**
   * Hard delete de um documento (apenas Admin)
   */
  static async hardDelete(
    collectionPath: string,
    docId: string
  ): Promise<void> {
    try {
      await db.collection(collectionPath).doc(docId).delete();
    } catch (error: any) {
      throw new Error(`Erro ao deletar permanentemente documento: ${error.message}`);
    }
  }

  /**
   * Restaura um documento soft-deleted
   */
  static async restore(
    collectionPath: string,
    docId: string
  ): Promise<void> {
    try {
      await db.collection(collectionPath).doc(docId).update({
        deletedAt: null,
        updatedAt: new Date(),
      });
    } catch (error: any) {
      throw new Error(`Erro ao restaurar documento: ${error.message}`);
    }
  }

  /**
   * Batch write para múltiplas operações
   */
  static async batchWrite(
    operations: {
      type: 'create' | 'update' | 'delete';
      collectionPath: string;
      docId?: string;
      data?: any;
    }[]
  ): Promise<void> {
    try {
      const batch = db.batch();

      operations.forEach((op) => {
        const collection = db.collection(op.collectionPath);

        switch (op.type) {
          case 'create':
            if (op.docId) {
              batch.set(collection.doc(op.docId), op.data);
            } else {
              batch.set(collection.doc(), op.data);
            }
            break;

          case 'update':
            if (!op.docId) throw new Error('docId é obrigatório para update');
            batch.update(collection.doc(op.docId), {
              ...op.data,
              updatedAt: new Date(),
            });
            break;

          case 'delete':
            if (!op.docId) throw new Error('docId é obrigatório para delete');
            batch.delete(collection.doc(op.docId));
            break;
        }
      });

      await batch.commit();
    } catch (error: any) {
      throw new Error(`Erro ao executar batch write: ${error.message}`);
    }
  }

  /**
   * Conta documentos com filtros
   */
  static async count(
    collectionPath: string,
    filters: { field: string; operator: FirebaseFirestore.WhereFilterOp; value: any }[] = []
  ): Promise<number> {
    try {
      let query: Query = db.collection(collectionPath);

      // Adicionar filtro automático para soft delete
      query = query.where('deletedAt', '==', null);

      // Adicionar filtros customizados
      filters.forEach((filter) => {
        query = query.where(filter.field, filter.operator, filter.value);
      });

      const snapshot = await query.count().get();
      return snapshot.data().count;
    } catch (error: any) {
      throw new Error(`Erro ao contar documentos: ${error.message}`);
    }
  }

  /**
   * Busca um documento por ID (alias para getById)
   */
  static async getDoc<T>(
    collectionPath: string,
    docId: string
  ): Promise<T | null> {
    return this.getById<T>(collectionPath, docId);
  }

  /**
   * Cria um documento em uma subcoleção
   */
  static async createSubcollectionDoc<T>(
    parentCollection: string,
    parentDocId: string,
    subcollection: string,
    data: T,
    docId?: string
  ): Promise<string> {
    try {
      const subcollectionRef = db
        .collection(parentCollection)
        .doc(parentDocId)
        .collection(subcollection);
      
      if (docId) {
        await subcollectionRef.doc(docId).set(data as DocumentData);
        return docId;
      } else {
        const docRef = await subcollectionRef.add(data as DocumentData);
        return docRef.id;
      }
    } catch (error: any) {
      throw new Error(`Erro ao criar documento na subcoleção: ${error.message}`);
    }
  }

  /**
   * Atualiza um documento em uma subcoleção
   */
  static async updateSubcollectionDoc<T>(
    parentCollection: string,
    parentDocId: string,
    subcollection: string,
    docId: string,
    data: Partial<T>
  ): Promise<void> {
    try {
      await db
        .collection(parentCollection)
        .doc(parentDocId)
        .collection(subcollection)
        .doc(docId)
        .update({
          ...data,
          updatedAt: new Date(),
        } as DocumentData);
    } catch (error: any) {
      throw new Error(`Erro ao atualizar documento na subcoleção: ${error.message}`);
    }
  }

  /**
   * Busca documentos em uma subcoleção com filtros
   * Opcionalmente filtra por deletedAt == null (padrão: false para subcoleções)
   */
  static async querySubcollection<T>(
    parentCollection: string,
    parentDocId: string,
    subcollection: string,
    filters: { field: string; operator: FirebaseFirestore.WhereFilterOp; value: any }[] = [],
    options: {
      orderBy?: { field: string; direction: 'asc' | 'desc' };
      limit?: number;
      startAfter?: any;
      includeSoftDeleted?: boolean;
    } = {}
  ): Promise<T[]> {
    try {
      let query: Query = db
        .collection(parentCollection)
        .doc(parentDocId)
        .collection(subcollection);

      // Adicionar filtro automático para soft delete apenas se não for explicitamente desabilitado
      if (!options.includeSoftDeleted) {
        // Não adicionar filtro deletedAt para subcoleções que não usam soft delete
        // query = query.where('deletedAt', '==', null);
      }

      // Adicionar filtros customizados
      filters.forEach((filter) => {
        query = query.where(filter.field, filter.operator, filter.value);
      });

      // Ordenação
      if (options.orderBy) {
        query = query.orderBy(options.orderBy.field, options.orderBy.direction);
      }

      // Paginação
      if (options.startAfter) {
        query = query.startAfter(options.startAfter);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const snapshot = await query.get();
      
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
    } catch (error: any) {
      throw new Error(`Erro ao buscar documentos da subcoleção: ${error.message}`);
    }
  }
}
