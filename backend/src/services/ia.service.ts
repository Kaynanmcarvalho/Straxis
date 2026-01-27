import { openaiService } from './openai.service';
import { geminiService } from './gemini.service';
import admin from 'firebase-admin';
import { retryWithBackoff, isRetryableError } from '../utils/retry.util';
import { notificationService } from './notification.service';
import { logService } from './log.service';

interface IAQueryResult {
  response: string;
  tokensUsed: number;
  estimatedCostCentavos: number;
  provider: 'openai' | 'gemini';
  model: string;
  modelCategory: 'cheap' | 'medium' | 'expensive';
}

class IAService {
  async processQuery(
    message: string,
    companyId: string,
    userId: string
  ): Promise<IAQueryResult> {
    try {
      // Buscar configuração da empresa
      const companyDoc = await admin.firestore()
        .collection('companies')
        .doc(companyId)
        .get();

      if (!companyDoc.exists) {
        throw new Error('Company not found');
      }

      const company = companyDoc.data();
      const config = company?.config || {};

      // Verificar se IA está ativada
      if (!config.iaEnabled) {
        throw new Error('IA is not enabled for this company');
      }

      const provider = config.iaProvider as 'openai' | 'gemini';
      const model = config.iaModel || (provider === 'openai' ? 'gpt-3.5-turbo' : 'gemini-pro');

      // Buscar dados do Firestore para contexto
      const context = await this.buildContext(companyId, config.iaPrompt);

      // Processar com o provider selecionado com retry
      let result;
      try {
        result = await retryWithBackoff(async () => {
          if (provider === 'openai') {
            const apiKey = process.env.OPENAI_API_KEY;
            if (!apiKey) throw new Error('OpenAI API key not configured');
            
            openaiService.initialize(apiKey, model);
            return await openaiService.query(message, context);
          } else {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) throw new Error('Gemini API key not configured');
            
            geminiService.initialize(apiKey, model);
            return await geminiService.query(message, context);
          }
        }, {
          maxAttempts: 3,
          initialDelayMs: 1000,
          onRetry: (attempt, error) => {
            console.log(`[IA] Tentativa ${attempt} falhou:`, error.message);
          }
        });
      } catch (error) {
        // Se todas as tentativas falharam, usar fallback
        throw error;
      }

    // Validar resposta (prevenir alucinação)
    const validatedResponse = await this.validateResponse(result.response, companyId);

    // Obter categoria do modelo
    const modelCategory = provider === 'openai' 
      ? openaiService.getModelCategory(model)
      : geminiService.getModelCategory(model);

    // Registrar uso de IA
    await this.recordUsage({
      companyId,
      userId,
      provider,
      model,
      modelCategory,
      tokensUsed: result.tokensUsed,
      estimatedCostCentavos: result.estimatedCostCentavos
    });

    // Registrar em logs
    await this.logIAUsage({
      companyId,
      userId,
      provider,
      model,
      tokensUsed: result.tokensUsed,
      estimatedCostCentavos: result.estimatedCostCentavos,
      query: message
    });

    // Verificar limite de custo
    await this.checkCostLimit(companyId);

    return {
      response: validatedResponse,
      tokensUsed: result.tokensUsed,
      estimatedCostCentavos: result.estimatedCostCentavos,
      provider,
      model,
      modelCategory
    };
    } catch (error) {
      // Log do erro
      await logService.create({
        companyId,
        userId,
        type: 'ia_usage',
        action: 'failure',
        details: {
          error: (error as Error).message,
          query: message.substring(0, 100)
        }
      });

      // Notificar no painel
      await notificationService.notifyIAFailure(companyId, (error as Error).message);

      // Retornar mensagem de fallback
      const fallbackMessage = await this.getFallbackMessage(companyId);
      
      return {
        response: fallbackMessage,
        tokensUsed: 0,
        estimatedCostCentavos: 0,
        provider: 'openai',
        model: 'fallback',
        modelCategory: 'cheap'
      };
    }
  }

  private async recordUsage(data: {
    companyId: string;
    userId: string;
    provider: 'openai' | 'gemini';
    model: string;
    modelCategory: 'cheap' | 'medium' | 'expensive';
    tokensUsed: number;
    estimatedCostCentavos: number;
  }): Promise<void> {
    await admin.firestore()
      .collection(`companies/${data.companyId}/iaUsage`)
      .add({
        userId: data.userId,
        provider: data.provider,
        model: data.model,
        modelCategory: data.modelCategory,
        tokensUsed: data.tokensUsed,
        estimatedCostCentavos: data.estimatedCostCentavos,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
  }

  async getUsageByCompany(companyId: string, startDate?: Date, endDate?: Date) {
    let query = admin.firestore()
      .collection(`companies/${companyId}/iaUsage`)
      .orderBy('timestamp', 'desc');

    if (startDate) {
      query = query.where('timestamp', '>=', startDate);
    }
    if (endDate) {
      query = query.where('timestamp', '<=', endDate);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getUsageByUser(companyId: string, userId: string, startDate?: Date, endDate?: Date) {
    let query = admin.firestore()
      .collection(`companies/${companyId}/iaUsage`)
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc');

    if (startDate) {
      query = query.where('timestamp', '>=', startDate);
    }
    if (endDate) {
      query = query.where('timestamp', '<=', endDate);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getTotalCostByCompany(companyId: string, month: number, year: number): Promise<number> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const snapshot = await admin.firestore()
      .collection(`companies/${companyId}/iaUsage`)
      .where('timestamp', '>=', startDate)
      .where('timestamp', '<=', endDate)
      .get();

    let totalCostCentavos = 0;
    snapshot.forEach(doc => {
      totalCostCentavos += doc.data().estimatedCostCentavos || 0;
    });

    return totalCostCentavos;
  }

  async getTotalCostByUser(companyId: string, userId: string, month: number, year: number): Promise<number> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const snapshot = await admin.firestore()
      .collection(`companies/${companyId}/iaUsage`)
      .where('userId', '==', userId)
      .where('timestamp', '>=', startDate)
      .where('timestamp', '<=', endDate)
      .get();

    let totalCostCentavos = 0;
    snapshot.forEach(doc => {
      totalCostCentavos += doc.data().estimatedCostCentavos || 0;
    });

    return totalCostCentavos;
  }

  private async buildContext(companyId: string, customPrompt?: string): Promise<string> {
    // Buscar prompt global
    const globalConfigDoc = await admin.firestore()
      .collection('globalConfig')
      .doc('system')
      .get();
    
    const globalPrompt = globalConfigDoc.data()?.iaGlobalPrompt || 
      'Você é um assistente de gestão de operações de carga e descarga.';

    // Buscar dados recentes da empresa
    const trabalhos = await admin.firestore()
      .collection(`companies/${companyId}/trabalhos`)
      .orderBy('data', 'desc')
      .limit(10)
      .get();

    const funcionarios = await admin.firestore()
      .collection(`companies/${companyId}/funcionarios`)
      .where('active', '==', true)
      .get();

    const agendamentos = await admin.firestore()
      .collection(`companies/${companyId}/agendamentos`)
      .where('status', '==', 'pendente')
      .get();

    // Construir contexto
    let context = `${globalPrompt}\n\n`;
    
    if (customPrompt) {
      context += `${customPrompt}\n\n`;
    }

    context += `Dados da empresa:\n`;
    context += `- Total de trabalhos recentes: ${trabalhos.size}\n`;
    context += `- Funcionários ativos: ${funcionarios.size}\n`;
    context += `- Agendamentos pendentes: ${agendamentos.size}\n\n`;

    // Adicionar detalhes dos trabalhos
    if (!trabalhos.empty) {
      context += `Trabalhos recentes:\n`;
      trabalhos.forEach(doc => {
        const t = doc.data();
        context += `- ${t.tipo} em ${new Date(t.data.toDate()).toLocaleDateString()}: ${t.tonelagem}t, R$ ${(t.valorRecebidoCentavos / 100).toFixed(2)}\n`;
      });
    }

    context += `\nIMPORTANTE: Responda APENAS com base nos dados fornecidos acima. Não invente valores ou informações.`;

    return context;
  }

  private async validateResponse(response: string, companyId: string): Promise<string> {
    // Verificar se a resposta contém valores numéricos específicos
    const numberPattern = /R\$\s*[\d.,]+/g;
    const numbers = response.match(numberPattern);

    if (!numbers) {
      return response; // Sem valores numéricos, OK
    }

    // Buscar todos os valores do Firestore para validação
    const trabalhos = await admin.firestore()
      .collection(`companies/${companyId}/trabalhos`)
      .get();

    const validValues = new Set<string>();
    trabalhos.forEach(doc => {
      const t = doc.data();
      validValues.add((t.valorRecebidoCentavos / 100).toFixed(2));
      validValues.add((t.totalPagoCentavos / 100).toFixed(2));
      validValues.add((t.lucroCentavos / 100).toFixed(2));
    });

    // Se a resposta contém valores que não existem no Firestore, retornar mensagem padrão
    for (const num of numbers) {
      const value = num.replace(/[R$\s]/g, '');
      if (!validValues.has(value)) {
        return 'Desculpe, não encontrei informações específicas sobre isso nos registros. Por favor, seja mais específico ou verifique os dados disponíveis.';
      }
    }

    return response;
  }

  async getFallbackMessage(companyId: string): Promise<string> {
    const companyDoc = await admin.firestore()
      .collection('companies')
      .doc(companyId)
      .get();

    const fallbackMessages = companyDoc.data()?.config?.fallbackMessages;
    return fallbackMessages?.iaFailure || 
      'Desculpe, não consegui processar sua solicitação no momento. Tente novamente mais tarde.';
  }

  private async logIAUsage(data: {
    companyId: string;
    userId: string;
    provider: string;
    model: string;
    tokensUsed: number;
    estimatedCostCentavos: number;
    query: string;
  }): Promise<void> {
    await admin.firestore()
      .collection('logs')
      .add({
        companyId: data.companyId,
        userId: data.userId,
        type: 'ia_usage',
        action: 'query_processed',
        details: {
          provider: data.provider,
          model: data.model,
          tokensUsed: data.tokensUsed,
          estimatedCostCentavos: data.estimatedCostCentavos,
          query: data.query.substring(0, 100) // Limitar tamanho do log
        },
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
  }

  private async checkCostLimit(companyId: string): Promise<void> {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Buscar configuração de limite
    const companyDoc = await admin.firestore()
      .collection('companies')
      .doc(companyId)
      .get();

    const config = companyDoc.data()?.config;
    const costLimitCentavos = config?.iaCostLimitCentavos;

    if (!costLimitCentavos) {
      return; // Sem limite configurado
    }

    // Calcular custo total do mês
    const totalCostCentavos = await this.getTotalCostByCompany(companyId, month, year);

    // Se atingiu ou ultrapassou o limite, criar alerta
    if (totalCostCentavos >= costLimitCentavos) {
      await admin.firestore()
        .collection('logs')
        .add({
          companyId,
          userId: null,
          type: 'critical_change',
          action: 'ia_cost_limit_reached',
          details: {
            limitCentavos: costLimitCentavos,
            currentCostCentavos: totalCostCentavos,
            month,
            year
          },
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
    }
  }
}

export const iaService = new IAService();
