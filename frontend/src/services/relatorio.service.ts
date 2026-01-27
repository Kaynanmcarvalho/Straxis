import { apiService } from './api.service';

export interface RelatorioData {
  periodo: string;
  faturamentoTotalCentavos: number;
  custosTotaisCentavos: number;
  lucroTotalCentavos: number;
  quantidadeTrabalhos: number;
  trabalhos: any[];
}

export const relatorioService = {
  /**
   * Relatório diário
   */
  async diario(data?: Date): Promise<RelatorioData> {
    const params = data ? { data: data.toISOString() } : {};
    const response = await apiService.get('/relatorios/diario', { params });
    return response.data.data;
  },

  /**
   * Relatório semanal
   */
  async semanal(data?: Date): Promise<RelatorioData> {
    const params = data ? { data: data.toISOString() } : {};
    const response = await apiService.get('/relatorios/semanal', { params });
    return response.data.data;
  },

  /**
   * Relatório mensal
   */
  async mensal(mes?: number, ano?: number): Promise<RelatorioData> {
    const params: any = {};
    if (mes) params.mes = mes;
    if (ano) params.ano = ano;
    const response = await apiService.get('/relatorios/mensal', { params });
    return response.data.data;
  },

  /**
   * Relatório por funcionário
   */
  async porFuncionario(
    funcionarioId: string,
    dataInicio?: Date,
    dataFim?: Date
  ): Promise<any> {
    const params: any = {};
    if (dataInicio) params.dataInicio = dataInicio.toISOString();
    if (dataFim) params.dataFim = dataFim.toISOString();
    const response = await apiService.get(`/relatorios/funcionario/${funcionarioId}`, {
      params,
    });
    return response.data.data;
  },
};
