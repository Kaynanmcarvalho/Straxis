import React from 'react';
import { FileText, Download } from 'lucide-react';
import { RelatorioData } from '../../services/relatorio.service';
import { Button } from '../ui/Button';

interface RelatorioExportProps {
  relatorio: RelatorioData | null;
}

export const RelatorioExport: React.FC<RelatorioExportProps> = ({ relatorio }) => {
  const exportToCSV = () => {
    if (!relatorio) return;

    const headers = [
      'Data',
      'Tipo',
      'Tonelagem',
      'Valor Recebido (R$)',
      'Total Pago (R$)',
      'Lucro (R$)',
    ];

    const rows = relatorio.trabalhos.map((t: any) => [
      new Date(t.data).toLocaleDateString('pt-BR'),
      t.tipo,
      t.tonelagem,
      (t.valorRecebidoCentavos / 100).toFixed(2),
      (t.totalPagoCentavos / 100).toFixed(2),
      (t.lucroCentavos / 100).toFixed(2),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    if (!relatorio) return;
    alert('Exportação para PDF será implementada com biblioteca jsPDF');
  };

  const exportToExcel = () => {
    if (!relatorio) return;
    exportToCSV();
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={exportToCSV}
        disabled={!relatorio}
        variant="ghost"
        className="w-full justify-start"
      >
        <FileText className="w-4 h-4 mr-2" />
        CSV
      </Button>
      <Button
        onClick={exportToPDF}
        disabled={!relatorio}
        variant="ghost"
        className="w-full justify-start"
      >
        <FileText className="w-4 h-4 mr-2" />
        PDF
      </Button>
      <Button
        onClick={exportToExcel}
        disabled={!relatorio}
        variant="ghost"
        className="w-full justify-start"
      >
        <Download className="w-4 h-4 mr-2" />
        Excel
      </Button>
    </div>
  );
};
