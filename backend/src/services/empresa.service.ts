import { db } from '../config/firebase.config';
import { EmpresaModel } from '../models/empresa.model';
import { Company } from '../types';

export class EmpresaService {
  /**
   * Cria uma empresa com estrutura completa no Firestore
   * Inicializa todas as subcoleções necessárias
   */
  static async createWithStructure(empresaData: Partial<Company>): Promise<Company> {
    try {
      // Criar empresa
      const empresa = EmpresaModel.create(empresaData);
      
      // Criar documento da empresa
      const empresaRef = db.collection('companies').doc();
      empresa.id = empresaRef.id;

      // Usar batch para criar empresa e inicializar subcoleções
      const batch = db.batch();

      // Salvar empresa
      batch.set(empresaRef, EmpresaModel.toFirestore(empresa));

      // Inicializar subcoleções com documentos placeholder
      // Isso garante que as subcoleções existam e sejam acessíveis

      // Subcoleção trabalhos
      const trabalhosRef = empresaRef.collection('trabalhos').doc('_placeholder');
      batch.set(trabalhosRef, {
        _placeholder: true,
        createdAt: new Date(),
      });

      // Subcoleção agendamentos
      const agendamentosRef = empresaRef.collection('agendamentos').doc('_placeholder');
      batch.set(agendamentosRef, {
        _placeholder: true,
        createdAt: new Date(),
      });

      // Subcoleção funcionarios
      const funcionariosRef = empresaRef.collection('funcionarios').doc('_placeholder');
      batch.set(funcionariosRef, {
        _placeholder: true,
        createdAt: new Date(),
      });

      // Subcoleção iaUsage
      const iaUsageRef = empresaRef.collection('iaUsage').doc('_placeholder');
      batch.set(iaUsageRef, {
        _placeholder: true,
        createdAt: new Date(),
      });

      // Subcoleção whatsappSessions
      const whatsappSessionsRef = empresaRef.collection('whatsappSessions').doc('_placeholder');
      batch.set(whatsappSessionsRef, {
        _placeholder: true,
        createdAt: new Date(),
      });

      // Subcoleção whatsappMessages
      const whatsappMessagesRef = empresaRef.collection('whatsappMessages').doc('_placeholder');
      batch.set(whatsappMessagesRef, {
        _placeholder: true,
        createdAt: new Date(),
      });

      // Commit batch
      await batch.commit();

      return empresa;
    } catch (error: any) {
      throw new Error(`Erro ao criar empresa com estrutura: ${error.message}`);
    }
  }

  /**
   * Verifica se todas as subcoleções da empresa existem
   */
  static async verifyStructure(companyId: string): Promise<{
    exists: boolean;
    subcollections: {
      trabalhos: boolean;
      agendamentos: boolean;
      funcionarios: boolean;
      iaUsage: boolean;
      whatsappSessions: boolean;
      whatsappMessages: boolean;
    };
  }> {
    try {
      const empresaRef = db.collection('companies').doc(companyId);

      // Verificar cada subcoleção
      const subcollections = {
        trabalhos: false,
        agendamentos: false,
        funcionarios: false,
        iaUsage: false,
        whatsappSessions: false,
        whatsappMessages: false,
      };

      // Verificar trabalhos
      const trabalhosSnapshot = await empresaRef.collection('trabalhos').limit(1).get();
      subcollections.trabalhos = !trabalhosSnapshot.empty;

      // Verificar agendamentos
      const agendamentosSnapshot = await empresaRef.collection('agendamentos').limit(1).get();
      subcollections.agendamentos = !agendamentosSnapshot.empty;

      // Verificar funcionarios
      const funcionariosSnapshot = await empresaRef.collection('funcionarios').limit(1).get();
      subcollections.funcionarios = !funcionariosSnapshot.empty;

      // Verificar iaUsage
      const iaUsageSnapshot = await empresaRef.collection('iaUsage').limit(1).get();
      subcollections.iaUsage = !iaUsageSnapshot.empty;

      // Verificar whatsappSessions
      const whatsappSessionsSnapshot = await empresaRef
        .collection('whatsappSessions')
        .limit(1)
        .get();
      subcollections.whatsappSessions = !whatsappSessionsSnapshot.empty;

      // Verificar whatsappMessages
      const whatsappMessagesSnapshot = await empresaRef
        .collection('whatsappMessages')
        .limit(1)
        .get();
      subcollections.whatsappMessages = !whatsappMessagesSnapshot.empty;

      const allExist = Object.values(subcollections).every((exists) => exists);

      return {
        exists: allExist,
        subcollections,
      };
    } catch (error: any) {
      throw new Error(`Erro ao verificar estrutura da empresa: ${error.message}`);
    }
  }

  /**
   * Calcula a data de término do plano baseado em meses
   */
  static calculatePlanEndDate(startDate: Date, months: number): Date {
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + months);
    return endDate;
  }

  /**
   * Verifica se o plano da empresa está ativo
   */
  static isPlanActive(company: Company): boolean {
    return EmpresaModel.isPlanActive(company);
  }
}
