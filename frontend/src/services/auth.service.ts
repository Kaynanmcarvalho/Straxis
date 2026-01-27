import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase.config';
import { User } from '../types/user.types';

export interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  /**
   * Login com email e senha
   */
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      // Autentica no Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Busca dados do usuário no Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        throw new Error('Usuário não encontrado no sistema');
      }

      const userData = userDoc.data();
      
      // Verifica se usuário está ativo
      if (!userData.active) {
        throw new Error('Usuário inativo. Entre em contato com o administrador.');
      }

      const user: User = {
        id: firebaseUser.uid,
        email: userData.email,
        name: userData.name,
        companyId: userData.companyId,
        role: userData.role,
        permissions: userData.permissions || [],
        active: userData.active,
        createdAt: userData.createdAt?.toDate ? userData.createdAt.toDate() : new Date(),
        updatedAt: userData.updatedAt?.toDate ? userData.updatedAt.toDate() : new Date(),
        deletedAt: userData.deletedAt?.toDate ? userData.deletedAt.toDate() : null,
      };

      // Pega o token
      const token = await firebaseUser.getIdToken();

      // Salva no localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userName', user.name);
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('companyId', user.companyId);

      return { user, token };
    } catch (error: any) {
      console.error('Erro no login:', error);
      
      // Mensagens de erro amigáveis
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new Error('Email ou senha incorretos');
      }
      if (error.code === 'auth/too-many-requests') {
        throw new Error('Muitas tentativas. Tente novamente mais tarde.');
      }
      if (error.code === 'auth/user-disabled') {
        throw new Error('Usuário desabilitado');
      }
      
      throw error;
    }
  }

  /**
   * Logout
   */
  async signOut(): Promise<void> {
    await firebaseSignOut(auth);
    
    // Limpa localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('companyId');
  }

  /**
   * Observa mudanças no estado de autenticação
   */
  onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Pega o usuário atual do localStorage
   */
  getCurrentUser(): Partial<User> | null {
    const userId = localStorage.getItem('userId');
    if (!userId) return null;

    return {
      id: userId,
      email: localStorage.getItem('userEmail') || '',
      name: localStorage.getItem('userName') || '',
      role: localStorage.getItem('userRole') as any,
      companyId: localStorage.getItem('companyId') || '',
    };
  }

  /**
   * Verifica se está autenticado
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }
}

export const authService = new AuthService();
