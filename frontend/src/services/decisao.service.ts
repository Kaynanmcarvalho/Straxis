/**
 * Serviço de Registro de Decisões - Straxis SaaS
 * Alpha 13.0.0 - MAJOR (Breaking Change)
 * 29/01/2026
 * 
 * CRÍTICO: Auditoria com valor jurídico
 */

import { apiService } from './api.service';
import {
  RegistroDecisao,
  FiltrosDecisao,
  EstatisticasDecisoes,
  TipoDecisao,
  OrigemDecisao,
  CriticidadeDecisao,
  CRITICIDADE_POR_TIPO,
} from '../types/decisao.types';

/**
 * Calcula hash SHA-256 de um objeto (para verificação de integridade)
 */
async function calcularHash(data: any): Promise<string> {
  const jsonString = JSON.stringify(data, Object.keys(data).sort());
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(jsonString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Verifica integridade de um registro (compara hash)
 */
async function verificarIntegridade(registro: RegistroDecisao): Promise<boolean> {
  const { hash, ...dadosSemHash } = registro;
  const hashCalculado = await calcularHash(dadosSemHash);
  return hash === hashCalculado;
}

export const decisaoService = {
  /**
   * Registra uma nova decisão
   * CRÍTICO: companyId é OBRIGATÓRIO
   */
  async registrar(dados: {
    companyId: string;  // OBRIGATÓRIO
    userId: string | null;
    tipo: TipoDecisao;
    origem: OrigemDecisao;
    titulo: string;
    descricao: string;
    entidade: string;
    entidadeId: string;
    acao: string;
    antes?: Record<string, any> | null;
    depois: Record<string, any>;
    motivoIA?: string;
    modeloIA?: string;
    tokensUsados?: number;
    custoEstimadoCentavos?: number;
    confiancaIA?: number;
  }): Promise<RegistroDecisao> {
    // Validação crítica: companyId NUNCA pode ser null
    if (!dados.companyId) {
      throw new Error('ERRO CRÍTICO: companyId é obrigatório para isolamento multiempresa');
    }

    // Determinar criticidade automaticamente
    const criticidade = CRITICIDADE_POR_TIPO[dados.tipo] || CriticidadeDecisao.MEDIA;

    const response = await apiService.post('/decisoes', {
      ...dados,
      criticidade,
    });

    return {
      ...response.data.data,
      timestamp: new Date(response.data.data.timestamp),
    };
  },

  /**
   * Lista decisões com filtros
   * CRÍTICO: companyId é OBRIGATÓRIO nos filtros
   */
  async listar(filtros: FiltrosDecisao): Promise<RegistroDecisao[]> {
    // Validação crítica: companyId NUNCA pode ser null
    if (!filtros.companyId) {
      throw new Error('ERRO CRÍTICO: companyId é obrigatório para isolamento multiempresa');
    }

    const params: any = {
      companyId: filtros.companyId,
    };

    if (filtros.tipos?.length) params.tipos = filtros.tipos.join(',');
    if (filtros.origens?.length) params.origens = filtros.origens.join(',');
    if (filtros.criticidades?.length) params.criticidades = filtros.criticidades.join(',');
    if (filtros.entidades?.length) params.entidades = filtros.entidades.join(',');
    if (filtros.usuarioId) params.usuarioId = filtros.usuarioId;
    if (filtros.dataInicio) params.dataInicio = filtros.dataInicio.toISOString();
    if (filtros.dataFim) params.dataFim = filtros.dataFim.toISOString();
    if (filtros.busca) params.busca = filtros.busca;
    if (filtros.limit) params.limit = filtros.limit;
    if (filtros.offset) params.offset = filtros.offset;

    const response = await apiService.get('/decisoes', { params });

    // Validar se response.data.data existe
    if (!response.data?.data || !Array.isArray(response.data.data)) {
      return [];
    }

    return response.data.data.map((decisao: any) => ({
      ...decisao,
      timestamp: new Date(decisao.timestamp),
    }));
  },

  /**
   * Busca decisão por ID
   */
  async buscarPorId(id: string, companyId: string): Promise<RegistroDecisao | null> {
    if (!companyId) {
      throw new Error('ERRO CRÍTICO: companyId é obrigatório');
    }

    try {
      const response = await apiService.get(`/decisoes/${id}`, {
        params: { companyId },
      });

      return {
        ...response.data.data,
        timestamp: new Date(response.data.data.timestamp),
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Busca decisões de uma entidade específica
   */
  async buscarPorEntidade(
    companyId: string,
    entidade: string,
    entidadeId: string,
    limit: number = 50
  ): Promise<RegistroDecisao[]> {
    if (!companyId) {
      throw new Error('ERRO CRÍTICO: companyId é obrigatório');
    }

    const response = await apiService.get('/decisoes/entidade', {
      params: {
        companyId,
        entidade,
        entidadeId,
        limit,
      },
    });

    return response.data.data.map((decisao: any) => ({
      ...decisao,
      timestamp: new Date(decisao.timestamp),
    }));
  },

  /**
   * Busca decisões de um usuário
   */
  async buscarPorUsuario(
    companyId: string,
    usuarioId: string,
    limit: number = 100
  ): Promise<RegistroDecisao[]> {
    if (!companyId) {
      throw new Error('ERRO CRÍTICO: companyId é obrigatório');
    }

    return this.listar({
      companyId,
      usuarioId,
      limit,
    });
  },

  /**
   * Busca estatísticas de decisões
   */
  async buscarEstatisticas(
    companyId: string,
    dataInicio?: Date,
    dataFim?: Date
  ): Promise<EstatisticasDecisoes> {
    if (!companyId) {
      throw new Error('ERRO CRÍTICO: companyId é obrigatório');
    }

    const params: any = { companyId };
    if (dataInicio) params.dataInicio = dataInicio.toISOString();
    if (dataFim) params.dataFim = dataFim.toISOString();

    const response = await apiService.get('/decisoes/estatisticas', { params });
    return response.data.data;
  },

  /**
   * Verifica integridade de um registro
   */
  async verificarIntegridade(registro: RegistroDecisao): Promise<boolean> {
    return verificarIntegridade(registro);
  },

  /**
   * Verifica integridade de múltiplos registros
   */
  async verificarIntegridadeLote(registros: RegistroDecisao[]): Promise<{
    total: number;
    integros: number;
    corrompidos: number;
    detalhes: Array<{ id: string; integro: boolean }>;
  }> {
    const resultados = await Promise.all(
      registros.map(async (registro) => ({
        id: registro.id,
        integro: await verificarIntegridade(registro),
      }))
    );

    const integros = resultados.filter(r => r.integro).length;
    const corrompidos = resultados.filter(r => !r.integro).length;

    return {
      total: registros.length,
      integros,
      corrompidos,
      detalhes: resultados,
    };
  },

  /**
   * Exporta decisões para auditoria (JSON)
   */
  async exportarParaAuditoria(
    companyId: string,
    dataInicio?: Date,
    dataFim?: Date
  ): Promise<Blob> {
    if (!companyId) {
      throw new Error('ERRO CRÍTICO: companyId é obrigatório');
    }

    const params: any = { companyId };
    if (dataInicio) params.dataInicio = dataInicio.toISOString();
    if (dataFim) params.dataFim = dataFim.toISOString();

    const response = await apiService.get('/decisoes/exportar', {
      params,
      responseType: 'blob',
    });

    return response.data;
  },

  /**
   * Helpers para criar decisões comuns
   */
  helpers: {
    /**
     * Registra criação de trabalho
     */
    async trabalhoCriado(
      companyId: string,
      userId: string,
      trabalhoId: string,
      trabalhoData: any,
      nomeUsuario: string
    ): Promise<RegistroDecisao> {
      return decisaoService.registrar({
        companyId,
        userId,
        tipo: TipoDecisao.TRABALHO_CRIADO,
        origem: OrigemDecisao.HUMANO,
        titulo: 'Trabalho criado',
        descricao: `${nomeUsuario} criou trabalho #${trabalhoId}`,
        entidade: 'trabalho',
        entidadeId: trabalhoId,
        acao: 'criar',
        depois: trabalhoData,
      });
    },

    /**
     * Registra edição de trabalho
     */
    async trabalhoEditado(
      companyId: string,
      userId: string,
      trabalhoId: string,
      antes: any,
      depois: any,
      nomeUsuario: string
    ): Promise<RegistroDecisao> {
      return decisaoService.registrar({
        companyId,
        userId,
        tipo: TipoDecisao.TRABALHO_EDITADO,
        origem: OrigemDecisao.HUMANO,
        titulo: 'Trabalho editado',
        descricao: `${nomeUsuario} editou trabalho #${trabalhoId}`,
        entidade: 'trabalho',
        entidadeId: trabalhoId,
        acao: 'editar',
        antes,
        depois,
      });
    },

    /**
     * Registra exclusão de trabalho
     */
    async trabalhoExcluido(
      companyId: string,
      userId: string,
      trabalhoId: string,
      trabalhoData: any,
      nomeUsuario: string
    ): Promise<RegistroDecisao> {
      return decisaoService.registrar({
        companyId,
        userId,
        tipo: TipoDecisao.TRABALHO_EXCLUIDO,
        origem: OrigemDecisao.HUMANO,
        titulo: 'Trabalho excluído',
        descricao: `${nomeUsuario} excluiu trabalho #${trabalhoId}`,
        entidade: 'trabalho',
        entidadeId: trabalhoId,
        acao: 'excluir',
        antes: trabalhoData,
        depois: { deletedAt: new Date() },
      });
    },

    /**
     * Registra pagamento marcado
     */
    async pagamentoMarcado(
      companyId: string,
      userId: string,
      pagamentoId: string,
      pagamentoData: any,
      nomeUsuario: string
    ): Promise<RegistroDecisao> {
      return decisaoService.registrar({
        companyId,
        userId,
        tipo: TipoDecisao.PAGAMENTO_MARCADO,
        origem: OrigemDecisao.HUMANO,
        titulo: 'Pagamento marcado',
        descricao: `${nomeUsuario} marcou pagamento de R$ ${(pagamentoData.valorCentavos / 100).toFixed(2)}`,
        entidade: 'pagamento',
        entidadeId: pagamentoId,
        acao: 'marcar',
        depois: pagamentoData,
      });
    },

    /**
     * Registra decisão de IA
     */
    async decisaoIA(
      companyId: string,
      tipo: TipoDecisao,
      entidade: string,
      entidadeId: string,
      acao: string,
      dados: any,
      modeloIA: string,
      motivoIA: string,
      tokensUsados: number,
      custoEstimadoCentavos: number,
      confiancaIA: number
    ): Promise<RegistroDecisao> {
      const origem = modeloIA.includes('gpt') 
        ? OrigemDecisao.IA_OPENAI 
        : OrigemDecisao.IA_GEMINI;

      return decisaoService.registrar({
        companyId,
        userId: null,
        tipo,
        origem,
        titulo: `IA: ${tipo}`,
        descricao: motivoIA,
        entidade,
        entidadeId,
        acao,
        depois: dados,
        motivoIA,
        modeloIA,
        tokensUsados,
        custoEstimadoCentavos,
        confiancaIA,
      });
    },
  },
};
