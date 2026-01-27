import { Trabalho } from '../types';

export class ExportService {
  /**
   * Exporta relatório para CSV (simplificado)
   * Em produção, usar bibliotecas como pdfkit para PDF e exceljs para Excel
   */
  static exportToCSV(trabalhos: Trabalho[]): string {
    const headers = [
      'Data',
      'Tipo',
      'Tonelagem',
      'Valor Recebido (R$)',
      'Total Pago (R$)',
      'Lucro (R$)',
      'Funcionários',
      'Observações',
    ];

    const rows = trabalhos.map((t) => [
      new Date(t.data).toLocaleDateString('pt-BR'),
      t.tipo,
      t.tonelagem.toString(),
      (t.valorRecebidoCentavos / 100).toFixed(2),
      (t.totalPagoCentavos / 100).toFixed(2),
      (t.lucroCentavos / 100).toFixed(2),
      t.funcionarios.map((f) => f.funcionarioNome).join('; '),
      t.observacoes || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    return csvContent;
  }

  /**
   * Exporta relatório para formato de texto estruturado
   * Placeholder para implementação futura com pdfkit
   */
  static exportToPDF(
    trabalhos: Trabalho[],
    totais: {
      faturamentoTotalCentavos: number;
      custosTotaisCentavos: number;
      lucroTotalCentavos: number;
    }
  ): string {
    // Em produção, usar pdfkit para gerar PDF real
    // Por enquanto, retorna texto estruturado
    let content = '=== RELATÓRIO DE TRABALHOS ===\n\n';
    
    content += `Faturamento Total: R$ ${(totais.faturamentoTotalCentavos / 100).toFixed(2)}\n`;
    content += `Custos Totais: R$ ${(totais.custosTotaisCentavos / 100).toFixed(2)}\n`;
    content += `Lucro Total: R$ ${(totais.lucroTotalCentavos / 100).toFixed(2)}\n`;
    content += `Quantidade de Trabalhos: ${trabalhos.length}\n\n`;
    
    content += '=== DETALHAMENTO ===\n\n';
    
    trabalhos.forEach((t, index) => {
      content += `${index + 1}. ${new Date(t.data).toLocaleDateString('pt-BR')} - ${t.tipo}\n`;
      content += `   Tonelagem: ${t.tonelagem}t\n`;
      content += `   Valor Recebido: R$ ${(t.valorRecebidoCentavos / 100).toFixed(2)}\n`;
      content += `   Total Pago: R$ ${(t.totalPagoCentavos / 100).toFixed(2)}\n`;
      content += `   Lucro: R$ ${(t.lucroCentavos / 100).toFixed(2)}\n`;
      content += `   Funcionários: ${t.funcionarios.map((f) => f.funcionarioNome).join(', ')}\n`;
      if (t.observacoes) {
        content += `   Obs: ${t.observacoes}\n`;
      }
      content += '\n';
    });

    return content;
  }

  /**
   * Exporta relatório para formato Excel simplificado (CSV)
   * Placeholder para implementação futura com exceljs
   */
  static exportToExcel(trabalhos: Trabalho[]): string {
    // Em produção, usar exceljs para gerar arquivo Excel real
    // Por enquanto, retorna CSV que pode ser aberto no Excel
    return this.exportToCSV(trabalhos);
  }

  /**
   * Gera nome de arquivo para export
   */
  static generateFileName(tipo: 'csv' | 'pdf' | 'excel', periodo: string): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const extensao = tipo === 'excel' ? 'xlsx' : tipo;
    return `relatorio_${periodo}_${timestamp}.${extensao}`;
  }
}
