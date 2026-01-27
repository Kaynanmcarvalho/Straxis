import { auth, db } from '../config/firebase.config';
import { UserModel } from '../models/user.model';
import { User } from '../types';

export class AuthService {
  /**
   * Verifica e decodifica o token Firebase
   */
  static async verifyToken(token: string): Promise<{ uid: string; email: string }> {
    try {
      const decodedToken = await auth.verifyIdToken(token);
      return {
        uid: decodedToken.uid,
        email: decodedToken.email || '',
      };
    } catch (error) {
      throw new Error('Token inválido ou expirado');
    }
  }

  /**
   * Busca dados do usuário no Firestore
   */
  static async getUserData(uid: string): Promise<User | null> {
    try {
      const userDoc = await db.collection('users').doc(uid).get();
      
      if (!userDoc.exists) {
        return null;
      }

      return UserModel.fromFirestore(uid, userDoc.data());
    } catch (error) {
      throw new Error('Erro ao buscar dados do usuário');
    }
  }

  /**
   * Extrai companyId e role do usuário
   */
  static async getUserContext(uid: string): Promise<{
    userId: string;
    companyId: string;
    role: string;
    user: User;
  }> {
    const user = await this.getUserData(uid);

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    if (!user.active) {
      throw new Error('Usuário inativo');
    }

    return {
      userId: user.id,
      companyId: user.companyId,
      role: user.role,
      user,
    };
  }

  /**
   * Cria um novo usuário no Firebase Auth e Firestore
   */
  static async createUser(
    email: string,
    password: string,
    userData: Partial<User>
  ): Promise<User> {
    try {
      // Criar usuário no Firebase Auth
      const userRecord = await auth.createUser({
        email,
        password,
        displayName: userData.name,
      });

      // Criar documento no Firestore
      const user = UserModel.create({
        ...userData,
        id: userRecord.uid,
        email,
      });

      await db.collection('users').doc(userRecord.uid).set(UserModel.toFirestore(user));

      return user;
    } catch (error: any) {
      throw new Error(`Erro ao criar usuário: ${error.message}`);
    }
  }

  /**
   * Atualiza dados do usuário
   */
  static async updateUser(uid: string, updates: Partial<User>): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };

      await db.collection('users').doc(uid).update(updateData);

      // Atualizar no Firebase Auth se necessário
      if (updates.email || updates.name) {
        const authUpdates: any = {};
        if (updates.email) authUpdates.email = updates.email;
        if (updates.name) authUpdates.displayName = updates.name;
        await auth.updateUser(uid, authUpdates);
      }
    } catch (error: any) {
      throw new Error(`Erro ao atualizar usuário: ${error.message}`);
    }
  }

  /**
   * Soft delete de usuário
   */
  static async deleteUser(uid: string): Promise<void> {
    try {
      await db.collection('users').doc(uid).update({
        deletedAt: new Date(),
        active: false,
        updatedAt: new Date(),
      });
    } catch (error: any) {
      throw new Error(`Erro ao deletar usuário: ${error.message}`);
    }
  }

  /**
   * Hard delete de usuário (apenas Admin)
   */
  static async hardDeleteUser(uid: string): Promise<void> {
    try {
      // Deletar do Firestore
      await db.collection('users').doc(uid).delete();
      
      // Deletar do Firebase Auth
      await auth.deleteUser(uid);
    } catch (error: any) {
      throw new Error(`Erro ao deletar permanentemente usuário: ${error.message}`);
    }
  }
}
