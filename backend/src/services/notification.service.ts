/**
 * Notification Service
 * 
 * Gerencia notificações para o painel do usuário
 */

import { firestore } from '../config/firebase.config';

export type NotificationType = 
  | 'ia_failure' 
  | 'whatsapp_disconnected' 
  | 'rate_limit_exceeded'
  | 'service_health'
  | 'info'
  | 'warning'
  | 'error';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Notification {
  id: string;
  companyId: string;
  userId?: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

class NotificationService {
  private readonly COLLECTION = 'notifications';

  /**
   * Cria uma nova notificação
   */
  async create(data: {
    companyId: string;
    userId?: string;
    type: NotificationType;
    priority?: NotificationPriority;
    title: string;
    message: string;
    expiresInHours?: number;
  }): Promise<Notification> {
    const now = new Date();
    const expiresAt = data.expiresInHours 
      ? new Date(now.getTime() + data.expiresInHours * 60 * 60 * 1000)
      : undefined;

    const notification: Omit<Notification, 'id'> = {
      companyId: data.companyId,
      userId: data.userId || null,
      type: data.type,
      priority: data.priority || 'medium',
      title: data.title,
      message: data.message,
      read: false,
      createdAt: now,
      ...(expiresAt ? { expiresAt } : {})
    };

    const docRef = await firestore.collection(this.COLLECTION).add(notification);
    
    return {
      id: docRef.id,
      ...notification
    };
  }

  /**
   * Marca notificação como lida
   */
  async markAsRead(notificationId: string): Promise<void> {
    await firestore
      .collection(this.COLLECTION)
      .doc(notificationId)
      .update({ read: true });
  }

  /**
   * Obtém notificações de uma empresa
   */
  async getByCompany(
    companyId: string,
    options?: {
      unreadOnly?: boolean;
      limit?: number;
    }
  ): Promise<Notification[]> {
    let query = firestore
      .collection(this.COLLECTION)
      .where('companyId', '==', companyId)
      .orderBy('createdAt', 'desc');

    if (options?.unreadOnly) {
      query = query.where('read', '==', false);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const snapshot = await query.get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      expiresAt: doc.data().expiresAt?.toDate()
    })) as Notification[];
  }

  /**
   * Obtém notificações de um usuário específico
   */
  async getByUser(
    userId: string,
    options?: {
      unreadOnly?: boolean;
      limit?: number;
    }
  ): Promise<Notification[]> {
    let query = firestore
      .collection(this.COLLECTION)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc');

    if (options?.unreadOnly) {
      query = query.where('read', '==', false);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const snapshot = await query.get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      expiresAt: doc.data().expiresAt?.toDate()
    })) as Notification[];
  }

  /**
   * Remove notificações expiradas
   */
  async cleanupExpired(): Promise<number> {
    const now = new Date();
    
    const snapshot = await firestore
      .collection(this.COLLECTION)
      .where('expiresAt', '<', now)
      .get();

    const batch = firestore.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    return snapshot.size;
  }

  /**
   * Notifica falha da IA
   */
  async notifyIAFailure(companyId: string, error: string): Promise<void> {
    await this.create({
      companyId,
      type: 'ia_failure',
      priority: 'high',
      title: 'Falha no Assistente de IA',
      message: `O assistente de IA falhou ao processar uma solicitação: ${error}`,
      expiresInHours: 24
    });
  }

  /**
   * Notifica desconexão do WhatsApp
   */
  async notifyWhatsAppDisconnected(companyId: string): Promise<void> {
    await this.create({
      companyId,
      type: 'whatsapp_disconnected',
      priority: 'high',
      title: 'WhatsApp Desconectado',
      message: 'A conexão com o WhatsApp foi perdida. Por favor, reconecte escaneando o QR Code.',
      expiresInHours: 48
    });
  }

  /**
   * Notifica que rate limit foi atingido
   */
  async notifyRateLimitExceeded(
    companyId: string,
    service: 'WhatsApp' | 'IA',
    resetAt: Date
  ): Promise<void> {
    await this.create({
      companyId,
      type: 'rate_limit_exceeded',
      priority: 'medium',
      title: `Limite de ${service} Atingido`,
      message: `O limite de requisições do ${service} foi atingido. O limite será resetado em ${resetAt.toLocaleString('pt-BR')}.`,
      expiresInHours: 2
    });
  }
}

export const notificationService = new NotificationService();
