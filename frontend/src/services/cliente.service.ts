import { db } from '../config/firebase.config';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy,
  limit 
} from 'firebase/firestore';

export interface ClienteSugestao {
  id: string;
  nome: string;
  telefone?: string;
  endereco?: string;
}

export const clienteService = {
  /**
   * Busca clientes por nome (autocomplete)
   * @param searchQuery - Texto de busca (mínimo 2 caracteres)
   * @param companyId - ID da empresa
   * @param maxResults - Número máximo de resultados (padrão: 10)
   */
  async searchClientes(
    searchQuery: string,
    companyId: string,
    maxResults: number = 10
  ): Promise<ClienteSugestao[]> {
    if (!searchQuery || searchQuery.length < 2) {
      return [];
    }

    try {
      // Buscar TODOS os clientes ativos (sem filtro de nome)
      const clientesRef = collection(db, `companies/${companyId}/clientes`);
      const q = query(
        clientesRef,
        where('deletedAt', '==', null),
        limit(100) // Limite razoável para performance
      );
      
      const snapshot = await getDocs(q);
      
      // Filtrar no cliente (case-insensitive)
      const searchLower = searchQuery.toLowerCase();
      const resultados = snapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            nome: data.nome,
            telefone: data.telefone,
            endereco: data.endereco,
          };
        })
        .filter(cliente => 
          cliente.nome.toLowerCase().includes(searchLower)
        )
        .slice(0, maxResults);
      
      return resultados;
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      return [];
    }
  },
};
